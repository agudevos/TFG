from django.urls import path
from . import views

urlpatterns = [
    path('services/create/', views.ServiceCreateView.as_view(), name='service_list'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service_detail'),
    path('services/<int:pk>/delete/', views.ServiceDeleteView.as_view(), name='service_delete'),
    path('services/establishment/<int:fk>/', views.ServiceListByEstablishmentView.as_view(), name='service_list_establishment'),
    path('services/recomendations/', views.ServiceListRecomendations.as_view(), name='service-list-recomendations'),

    # ServicePriceAssignment endpoints
    path('services/service-prices/', views.ServicePriceAssignmentListView.as_view(), name='service-price-list'),
    path('services/service-prices/<int:pk>/', views.ServicePriceAssignmentDetailView.as_view(), name='service-price-detail'),
    path('services/service-prices/by-service/<int:service_id>/', views.ServicePriceByServiceView.as_view(), name='service-price-by-service'),
    path('services/service-date-prices/<str:date>/<int:service_id>/', views.ServicePriceForDateView.as_view(), name='service-price-for-date'),
    path('services/price-recomendation/<int:assing_id>/<int:service_id>/', views.ServicePriceRecomendation.as_view(), name='price_recomendation'),

    # Conversation endpoints
]