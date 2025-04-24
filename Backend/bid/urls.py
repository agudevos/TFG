from django.urls import path
from . import views

urlpatterns = [
    path('bids/', views.BidListView.as_view(), name='bid_list'),
    path('bids/auction/<int:fk>/', views.BidListByAuctionView.as_view(), name='bid_by_auction_list'), 
    path('bids/create/', views.BidCreateView.as_view(), name='bid_create'),
    path('bids/<int:pk>/', views.BidDetailView.as_view(), name='bid_detail'),
    path('bids/<int:pk>/update/', views.BidUpdateView.as_view(), name='bid_update'),
    path('bids/<int:pk>/delete/', views.BidDeleteView.as_view(), name='bid_delete'),
]
