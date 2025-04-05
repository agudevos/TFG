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
        fields = ['id', 'time_slot', 'time_slot_details', 'order', 'notes']


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