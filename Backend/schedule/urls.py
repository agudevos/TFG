from django.urls import path
from . import views

urlpatterns = [
    # Schedule by date
    path('schedules/schedule-for-date/<str:date>/', views.GetScheduleForDateView.as_view(), name='schedule-for-date'),
    
    # Time slots
    path('schedules/time-slots/', views.TimeSlotListView.as_view(), name='time-slots-list'),
    path('schedules/time-slots/<int:pk>/', views.TimeSlotDetailView.as_view(), name='time-slots-detail'),
    
    # Weekly schedules
    path('schedules/weekly-schedules/', views.WeeklyScheduleListView.as_view(), name='weekly-schedules-list'),
    path('schedules/weekly-schedules/<int:pk>/', views.WeeklyScheduleDetailView.as_view(), name='weekly-schedules-detail'),
    
    # Group schedules
    path('schedules/group-schedules/', views.GroupScheduleListView.as_view(), name='group-schedules-list'),
    path('schedules/group-schedules/<int:pk>/', views.GroupScheduleDetailView.as_view(), name='group-schedules-detail'),
    
    # Specific schedules
    path('schedules/specific-schedules/', views.SpecificScheduleListView.as_view(), name='specific-schedules-list'),
    path('schedules/specific-schedules/<int:pk>/', views.SpecificScheduleDetailView.as_view(), name='specific-schedules-detail'),
    path('schedules/specific-schedules/create-from/', views.CreateSpecificScheduleFromView.as_view(), name='specific-schedules-create-from'),
]