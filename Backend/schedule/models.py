from django.db import models
from django.utils.translation import gettext_lazy as _


class TimeSlot(models.Model):
    """Model for time periods (morning, afternoon, etc.)"""
    name = models.CharField(max_length=100)
    start_time = models.TimeField()
    end_time = models.TimeField()
    color = models.CharField(max_length=20, default="#3498db")

    def __str__(self):
        return f"{self.name} ({self.start_time} - {self.end_time})"
    
    class Meta:
        verbose_name = "Time Slot"
        verbose_name_plural = "Time Slots"


class BaseSchedule(models.Model):
    """Abstract base model for schedule rules"""
    WEEKDAYS = [
        (0, _("Monday")),
        (1, _("Tuesday")),
        (2, _("Wednesday")),
        (3, _("Thursday")),
        (4, _("Friday")),
        (5, _("Saturday")),
        (6, _("Sunday")),
    ]
    
    name = models.CharField(max_length=200)
    time_slots = models.ManyToManyField(TimeSlot, through='SlotAssignment')
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        abstract = True


class SlotAssignment(models.Model):
    """Model to assign time slots to schedules with specific order"""
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    order = models.PositiveSmallIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    
    # These fields will be defined in subclasses
    weekly_schedule = models.ForeignKey('WeeklySchedule', on_delete=models.CASCADE, null=True, blank=True)
    group_schedule = models.ForeignKey('GroupSchedule', on_delete=models.CASCADE, null=True, blank=True)
    specific_schedule = models.ForeignKey('SpecificSchedule', on_delete=models.CASCADE, null=True, blank=True)
    
    class Meta:
        ordering = ['order']
        unique_together = ['weekly_schedule', 'time_slot']


class WeeklySchedule(BaseSchedule):
    """Base schedule for a weekday (base level)"""
    weekday = models.PositiveSmallIntegerField(choices=BaseSchedule.WEEKDAYS)
    
    class Meta:
        verbose_name = "Weekly Schedule"
        verbose_name_plural = "Weekly Schedules"
        unique_together = ['weekday']
        
    def __str__(self):
        return f"{self.name} - {self.get_weekday_display()}"


class GroupSchedule(BaseSchedule):
    """Schedule for a group of days (intermediate level)"""
    start_date = models.DateField()
    end_date = models.DateField()
    weekdays = models.CharField(max_length=13, help_text="Format: '0,1,5' for Monday, Tuesday and Saturday")
    priority = models.PositiveSmallIntegerField(default=10, help_text="Higher number = higher priority")
    
    class Meta:
        verbose_name = "Group Schedule"
        verbose_name_plural = "Group Schedules"
        ordering = ['-priority']
        
    def get_weekdays_list(self):
        """Converts the weekdays string to a list of integers"""
        if not self.weekdays:
            return []
        return [int(d) for d in self.weekdays.split(',') if d.strip().isdigit()]
    
    def applies_to_date(self, date):
        """Checks if this group applies to a specific date"""
        return (
            self.start_date <= date <= self.end_date and
            date.weekday() in self.get_weekdays_list()
        )


class SpecificSchedule(BaseSchedule):
    """Schedule for a specific date (highest priority level)"""
    date = models.DateField(unique=True)
    
    class Meta:
        verbose_name = "Specific Schedule"
        verbose_name_plural = "Specific Schedules"
        ordering = ['date']
        
    def __str__(self):
        return f"{self.name} - {self.date.strftime('%d/%m/%Y')}"