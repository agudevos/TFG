from django.urls import path
from . import views

urlpatterns = [
    path('establishments/', views.EstablishmentListView.as_view(), name='establishment_list'),
    path('establishments/create/', views.EstablishmentCreateView.as_view(), name='establishment_create'),
    path('establishments/<int:pk>/', views.EstablishmentDetailView.as_view(), name='establishment_detail'),
    path('establishments/<int:pk>/update/', views.EstablishmentUpdateView.as_view(), name='establishment_update'),
    path('establishments/<int:pk>/delete/', views.EstablishmentDeleteView.as_view(), name='establishment_delete'),
    path('establishments/stadistics/<int:pk>/', views.EstablishmentStadisticsView.as_view(), name='stadistics')
]
