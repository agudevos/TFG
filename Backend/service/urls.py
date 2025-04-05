from django.urls import path
from . import views

urlpatterns = [
    path('services/create/', views.ServiceCreateView.as_view(), name='service_list'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service_detail'),
    path('services/establishment/<int:fk>/', views.ServiceListByEstablishmentView.as_view(), name='service_list_establishment'),

    # ServicePriceAssignment endpoints
    path('services/service-prices/', views.ServicePriceAssignmentListView.as_view(), name='service-price-list'),
    path('services/service-prices/<int:pk>/', views.ServicePriceAssignmentDetailView.as_view(), name='service-price-detail'),
    path('services/service-prices/by-service/<int:service_id>/', views.ServicePriceByServiceView.as_view(), name='service-price-by-service'),
    path('services/service-prices/for-date/', views.ServicePriceForDateView.as_view(), name='service-price-for-date'),
]