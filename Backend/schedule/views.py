from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.shortcuts import get_object_or_404
from .models import WeeklySchedule, GroupSchedule, SpecificSchedule, TimeSlot, SlotAssignment
from .serializers import (
    SlotAssignmentSerializer, WeeklyScheduleSerializer, GroupScheduleSerializer, 
    SpecificScheduleSerializer, TimeSlotSerializer
)


@permission_classes([IsAuthenticated])
class GetScheduleForDateView(APIView):
    """Gets the applicable schedule for a specific date with overlap handling"""
    def get(self, request, date):
        
        if not date:
            return Response(
                {"error": "The 'date' parameter is required (format: YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get specific schedule if it exists
        specific_schedule = None
        try:
            specific_schedule = SpecificSchedule.objects.get(date=date, active=True)
        except SpecificSchedule.DoesNotExist:
            pass
        
        # Get weekly schedule
        weekday = date.weekday()
        weekly_schedule = None
        try:
            weekly_schedule = WeeklySchedule.objects.get(weekday=weekday, active=True)
        except WeeklySchedule.DoesNotExist:
            if not specific_schedule:
                return Response(
                    {"message": "No schedule defined for this date"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Build a dictionary to manage time slots by time range
        slots_by_time = {}
        
        # First add slots from the weekly schedule (lower priority)
        if weekly_schedule:
            for assignment in weekly_schedule.slotassignment_set.all():
                time_slot = assignment.time_slot
                minutes_start = time_slot.start_time.hour * 60 + time_slot.start_time.minute
                minutes_end = time_slot.end_time.hour * 60 + time_slot.end_time.minute
                
                for minute in range(minutes_start, minutes_end):
                    slots_by_time[minute] = {
                        'time_slot': time_slot,
                        'assignment': assignment,
                        'type': 'weekly',
                        'schedule': weekly_schedule
                    }
        
        # Then add slots from the specific schedule (higher priority, overwrites)
        if specific_schedule:
            for assignment in specific_schedule.slotassignment_set.all():
                time_slot = assignment.time_slot
                minutes_start = time_slot.start_time.hour * 60 + time_slot.start_time.minute
                minutes_end = time_slot.end_time.hour * 60 + time_slot.end_time.minute
                
                for minute in range(minutes_start, minutes_end):
                    slots_by_time[minute] = {
                        'time_slot': time_slot,
                        'assignment': assignment,
                        'type': 'specific',
                        'schedule': specific_schedule
                    }
        
        # Identify continuous blocks of time slots
        blocks = []
        current_block = None
        previous_slot = None
        
        # Iterate through all minutes of the day (0 to 1439 = 24h * 60min)
        for minute in range(0, 24 * 60):
            if minute in slots_by_time:
                slot_info = slots_by_time[minute]
                if previous_slot is None or previous_slot['time_slot'].id != slot_info['time_slot'].id:
                    # If the slot changes, close the previous block and open a new one
                    if current_block is not None:
                        current_block['minute_end'] = minute
                        current_block['end_time'] = f"{current_block['minute_end'] // 60:02d}:{current_block['minute_end'] % 60:02d}"
                        blocks.append(current_block)
                    
                    # Start new block
                    current_block = {
                        'name': slot_info['time_slot'].name,
                        'minute_start': minute,
                        'minute_end': None,
                        'start_time': f"{minute // 60:02d}:{minute % 60:02d}",
                        'end_time': None,
                        'color': slot_info['time_slot'].color,
                        'notes': slot_info['assignment'].notes or '',
                        'schedule_type': slot_info['type'],
                        'schedule': slot_info['schedule']
                    }
                previous_slot = slot_info
            else:
                # If there's no slot for this minute, close the current block if it exists
                if current_block is not None:
                    current_block['minute_end'] = minute
                    current_block['end_time'] = f"{current_block['minute_end'] // 60:02d}:{current_block['minute_end'] % 60:02d}"
                    blocks.append(current_block)
                    current_block = None
                    previous_slot = None
        
        # Close the last block if it's still open
        if current_block is not None:
            current_block['minute_end'] = 24 * 60
            current_block['end_time'] = "24:00"
            blocks.append(current_block)
            
        # Prepare the final response
        time_slots_data = []
        for block in blocks:
            time_slots_data.append({
                'name': block['name'],
                'start_time': block['start_time'],
                'end_time': block['end_time'],
                'color': block['color'],
                'notes': block['notes']
            })
        
        # Get the schedule name (combining specific and weekly if needed)
        schedule_name = ""
        if specific_schedule:
            schedule_name = specific_schedule.name
            if weekly_schedule:
                schedule_name += f" (base: {weekly_schedule.name})"
        elif weekly_schedule:
            schedule_name = weekly_schedule.name
                
        response_data = {
            'date': date.strftime('%Y-%m-%d'),
            'weekday': date.strftime('%A'),
            'schedule_name': schedule_name,
            'time_slots': time_slots_data
        }
        
        return Response(response_data)


@permission_classes([IsAuthenticated])
class TimeSlotListView(APIView):
    def get(self, request):
        time_slots = TimeSlot.objects.all()
        serializer = TimeSlotSerializer(time_slots, many=True)
        return Response(serializer.data)
        
    def post(self, request):
        serializer = TimeSlotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class TimeSlotDetailView(APIView):
    def get(self, request, pk):
        time_slot = get_object_or_404(TimeSlot, pk=pk)
        serializer = TimeSlotSerializer(time_slot)
        return Response(serializer.data)
        
    def put(self, request, pk):
        time_slot = get_object_or_404(TimeSlot, pk=pk)
        serializer = TimeSlotSerializer(time_slot, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        time_slot = get_object_or_404(TimeSlot, pk=pk)
        time_slot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@permission_classes([IsAuthenticated])
class WeeklyScheduleListView(APIView):
    def get(self, request):
        schedules = WeeklySchedule.objects.all()
        serializer = WeeklyScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
        
    def post(self, request):
        serializer = WeeklyScheduleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class WeeklyScheduleDetailView(APIView):
    def get(self, request, pk):
        schedule = get_object_or_404(WeeklySchedule, pk=pk)
        serializer = WeeklyScheduleSerializer(schedule)
        return Response(serializer.data)
        
    def put(self, request, pk):
        schedule = get_object_or_404(WeeklySchedule, pk=pk)
        serializer = WeeklyScheduleSerializer(schedule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        schedule = get_object_or_404(WeeklySchedule, pk=pk)
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@permission_classes([IsAuthenticated])
class GroupScheduleListView(APIView):
    def get(self, request):
        schedules = GroupSchedule.objects.all()
        serializer = GroupScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
        
    def post(self, request):
        serializer = GroupScheduleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class GroupScheduleDetailView(APIView):
    def get(self, request, pk):
        schedule = get_object_or_404(GroupSchedule, pk=pk)
        serializer = GroupScheduleSerializer(schedule)
        return Response(serializer.data)
        
    def put(self, request, pk):
        schedule = get_object_or_404(GroupSchedule, pk=pk)
        serializer = GroupScheduleSerializer(schedule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        schedule = get_object_or_404(GroupSchedule, pk=pk)
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@permission_classes([IsAuthenticated])
class SpecificScheduleListView(APIView):
    def get(self, request):
        schedules = SpecificSchedule.objects.all()
        serializer = SpecificScheduleSerializer(schedules, many=True)
        return Response(serializer.data)
        
    def post(self, request):
        serializer = SpecificScheduleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class SpecificScheduleDetailView(APIView):
    def get(self, request, pk):
        schedule = get_object_or_404(SpecificSchedule, pk=pk)
        serializer = SpecificScheduleSerializer(schedule)
        return Response(serializer.data)
        
    def put(self, request, pk):
        schedule = get_object_or_404(SpecificSchedule, pk=pk)
        serializer = SpecificScheduleSerializer(schedule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        schedule = get_object_or_404(SpecificSchedule, pk=pk)
        schedule.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@permission_classes([IsAuthenticated])
class CreateSpecificScheduleFromView(APIView):
    """Creates a specific schedule based on an existing schedule"""
    def post(self, request):
        date_str = request.data.get('date')
        template_id = request.data.get('template_id')
        template_type = request.data.get('template_type', 'weekly')  # weekly or group
        
        if not date_str or not template_id:
            return Response(
                {"error": "Parameters 'date' and 'template_id' are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Get the template based on type
        if template_type == 'weekly':
            try:
                template = WeeklySchedule.objects.get(id=template_id)
            except WeeklySchedule.DoesNotExist:
                return Response(
                    {"error": "Weekly schedule template not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            try:
                template = GroupSchedule.objects.get(id=template_id)
            except GroupSchedule.DoesNotExist:
                return Response(
                    {"error": "Group schedule template not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Check if a schedule already exists for this date
        if SpecificSchedule.objects.filter(date=date).exists():
            return Response(
                {"error": "A specific schedule already exists for this date"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Create the new specific schedule
        new_schedule = SpecificSchedule.objects.create(
            name=f"Schedule for {date.strftime('%d/%m/%Y')} (based on {template.name})",
            date=date
        )
        
        # Copy the time slots from the template
        for assignment in template.slotassignment_set.all():
            SlotAssignment.objects.create(
                specific_schedule=new_schedule,
                time_slot=assignment.time_slot,
                order=assignment.order,
                notes=assignment.notes
            )
            
        return Response({
            "message": "Specific schedule created successfully",
            "id": new_schedule.id,
            "name": new_schedule.name
        })

@permission_classes([IsAuthenticated])
class SlotAssignmentListView(APIView):
    """
    List all slot assignments or create a new one
    """
    def get(self, request, format=None):
        # Optional filtering by schedule type and id
        weekly_id = request.query_params.get('weekly_schedule')
        group_id = request.query_params.get('group_schedule')
        specific_id = request.query_params.get('specific_schedule')
        
        assignments = SlotAssignment.objects.all()
        
        if weekly_id:
            assignments = assignments.filter(weekly_schedule_id=weekly_id)
        elif group_id:
            assignments = assignments.filter(group_schedule_id=group_id)
        elif specific_id:
            assignments = assignments.filter(specific_schedule_id=specific_id)
            
        serializer = SlotAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = SlotAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            # Check if the time slot exists
            time_slot_id = serializer.validated_data.get('time_slot').id
            if not TimeSlot.objects.filter(id=time_slot_id).exists():
                return Response(
                    {"error": "Time slot does not exist"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Check if the selected schedule exists
            if serializer.validated_data.get('weekly_schedule'):
                schedule_id = serializer.validated_data.get('weekly_schedule').id
                if not WeeklySchedule.objects.filter(id=schedule_id).exists():
                    return Response(
                        {"error": "Weekly schedule does not exist"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif serializer.validated_data.get('group_schedule'):
                schedule_id = serializer.validated_data.get('group_schedule').id
                if not GroupSchedule.objects.filter(id=schedule_id).exists():
                    return Response(
                        {"error": "Group schedule does not exist"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif serializer.validated_data.get('specific_schedule'):
                schedule_id = serializer.validated_data.get('specific_schedule').id
                if not SpecificSchedule.objects.filter(id=schedule_id).exists():
                    return Response(
                        {"error": "Specific schedule does not exist"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Create the slot assignment
            slot_assignment = serializer.save()
            return Response(
                SlotAssignmentSerializer(slot_assignment).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
class SlotAssignmentDetailView(APIView):
    """
    Retrieve, update or delete a slot assignment
    """
    def get_object(self, pk):
        return get_object_or_404(SlotAssignment, pk=pk)
    
    def get(self, request, pk, format=None):
        assignment = self.get_object(pk)
        serializer = SlotAssignmentSerializer(assignment)
        return Response(serializer.data)
    
    def put(self, request, pk, format=None):
        assignment = self.get_object(pk)
        serializer = SlotAssignmentSerializer(assignment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, format=None):
        assignment = self.get_object(pk)
        assignment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)