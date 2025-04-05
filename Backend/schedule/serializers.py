from rest_framework import serializers
from .models import (
    TimeSlot, WeeklySchedule, GroupSchedule, 
    SpecificSchedule, SlotAssignment
)


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'

class SlotAssignmentSerializer(serializers.ModelSerializer):
    time_slot_details = TimeSlotSerializer(source='time_slot', read_only=True)
    
    class Meta:
        model = SlotAssignment
        fields = [
            'id', 
            'time_slot', 
            'time_slot_details',
            'weekly_schedule', 
            'group_schedule', 
            'specific_schedule', 
            'order', 
            'notes'
        ]
        
    def validate(self, data):
        """
        Validate that only one schedule type is set
        """
        schedule_fields = ['weekly_schedule', 'group_schedule', 'specific_schedule']
        schedule_values = [data.get(field) for field in schedule_fields]
        
        # Check that exactly one schedule is provided
        if sum(1 for value in schedule_values if value is not None) != 1:
            raise serializers.ValidationError(
                "Exactly one of weekly_schedule, group_schedule, or specific_schedule must be provided"
            )
        
        return data


class WeeklyScheduleSerializer(serializers.ModelSerializer):
    assignments = SlotAssignmentSerializer(
        source='slotassignment_set', 
        many=True, 
        read_only=True
    )
    weekday_name = serializers.CharField(source='get_weekday_display', read_only=True)
    
    class Meta:
        model = WeeklySchedule
        fields = ['id', 'name', 'weekday', 'weekday_name', 'active', 'assignments']


class GroupScheduleSerializer(serializers.ModelSerializer):
    assignments = SlotAssignmentSerializer(
        source='slotassignment_set', 
        many=True, 
        read_only=True
    )
    
    class Meta:
        model = GroupSchedule
        fields = [
            'id', 'name', 'start_date', 'end_date', 
            'weekdays', 'priority', 'active', 'assignments'
        ]


class SpecificScheduleSerializer(serializers.ModelSerializer):
    assignments = SlotAssignmentSerializer(
        source='slotassignment_set', 
        many=True, 
        read_only=True
    )
    
    class Meta:
        model = SpecificSchedule
        fields = ['id', 'name', 'date', 'active', 'assignments']