from django.urls import path
from . import views

urlpatterns = [
    path('services/create/', views.ServiceCreateView.as_view(), name='service_list'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service_detail'),
    path('services/events/<int:pk>/', views.ServiceEventsView.as_view(), name='service_events')
]