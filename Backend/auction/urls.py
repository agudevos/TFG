from django.urls import path
from . import views

urlpatterns = [
    path('auctions/', views.auction_list, name='auction_list'),
    path('auctions/create/', views.auction_create, name='auction_create'),
    path('auctions/<int:pk>/', views.auction_detail, name='auction_detail'),
    path('auctions/<int:pk>/update/', views.auction_update, name='auction_update'),
    path('auctions/<int:pk>/delete/', views.auction_delete, name='auction_delete'),
]
