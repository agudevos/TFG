from django.urls import path
from . import views
urlpatterns = [
    # URLs para reservas
    path('reservations/', views.ReservationListView.as_view(), name='reservation-list'),
    path('reservations/create/', views.ReservationCreateView.as_view(), name='reservation-create'),
    path('reservations/<int:pk>/', views.ReservationDetailView.as_view(), name='reservation-detail'),
    path('reservations/<int:pk>/update/', views.ReservationUpdateView.as_view(), name='reservation-update'),
    path('reservations/<int:pk>/delete/', views.ReservationDeleteView.as_view(), name='reservation-delete'),
    
    # URLs para filtrar por relaciones
    path('reservations/client/', views.ReservationListByClientView.as_view(), name='reservation-list-by-client'),
    path('reservations/service/<int:fk>/', views.ReservationListByServiceView.as_view(), name='reservation-list-by-service'),
]