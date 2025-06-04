from django.urls import path
from . import views

urlpatterns = [
    path('auctions/', views.AuctionListView.as_view(), name='auction_list'),
    path('auctions/active/', views.AuctionActiveListView.as_view(), name='auction_active'),
    path('auctions/bid/', views.AuctionBidListView.as_view(), name='auction_bid'),
    path('auctions/create/', views.AuctionCreateView.as_view(), name='auction_create'),
    path('auctions/<int:pk>/', views.AuctionDetailView.as_view(), name='auction_detail'),
    path('auctions/<int:pk>/update/', views.AuctionUpdateView.as_view(), name='auction_update'),
    path('auctions/<int:pk>/delete/', views.AuctionDeleteView.as_view(), name='auction_delete'),
    path('auctions/events/<int:pk>/', views.AuctionEventsView.as_view(), name='service_events'),
    path('auctions/service/<int:fk>/', views.AuctionListByServiceView.as_view(), name='service_events'),
    path('auctions/price-recomendation/<str:date>/<int:service_id>/', views.AuctionPriceRecomendation.as_view(), name='price_recomendation'),
]
