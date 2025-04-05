from django.contrib import admin
from .models import (
    TimeSlot, WeeklySchedule, GroupSchedule, 
    SpecificSchedule, SlotAssignment
)


class SlotAssignmentInline(admin.TabularInline):
    model = SlotAssignment
    extra = 1
    fields = ['time_slot', 'order', 'notes']
    

@admin.register(TimeSlot)
class TimeSlotAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_time', 'end_time', 'color']
    search_fields = ['name']


@admin.register(WeeklySchedule)
class WeeklyScheduleAdmin(admin.ModelAdmin):
    list_display = ['name', 'get_weekday_display', 'active']
    list_filter = ['weekday', 'active']
    search_fields = ['name']
    inlines = [SlotAssignmentInline]
    

@admin.register(GroupSchedule)
class GroupScheduleAdmin(admin.ModelAdmin):
    list_display = ['name', 'start_date', 'end_date', 'weekdays', 'priority', 'active']
    list_filter = ['active', 'start_date', 'end_date']
    search_fields = ['name']
    inlines = [SlotAssignmentInline]
    

@admin.register(SpecificSchedule)
class SpecificScheduleAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'active']
    list_filter = ['active', 'date']
    search_fields = ['name', 'date']
    date_hierarchy = 'date'
    inlines = [SlotAssignmentInline]