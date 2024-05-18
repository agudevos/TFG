from django.urls import path
from . import views

urlpatterns = [
    path('bars/', views.BarListView.as_view(), name='bar_list'),
    path('bars/create/', views.BarCreateView.as_view(), name='bar_create'),
    path('bars/<int:pk>/', views.BarDetailView.as_view(), name='bar_detail'),
    path('bars/<int:pk>/update/', views.BarUpdateView.as_view(), name='bar_update'),
    path('bars/<int:pk>/delete/', views.BarDeleteView.as_view(), name='bar_delete'),
]
