from django.urls import path
from . import views

urlpatterns = [
    path('bids/', views.bid_list, name='bid_list'),
    path('bids/create/', views.bid_create, name='bid_create'),
    path('bids/<int:pk>/', views.bid_detail, name='bid_detail'),
    path('bids/<int:pk>/update/', views.bid_update, name='bid_update'),
    path('bids/<int:pk>/delete/', views.bid_delete, name='bid_delete'),
]
