from django.urls import path
from . import views

urlpatterns = [
    path('bars/', views.bar_list, name='bar_list'),
    path('bars/create/', views.bar_create, name='bar_create'),
    path('bars/<int:pk>/', views.bar_detail, name='bar_detail'),
    path('bars/<int:pk>/update/', views.bar_update, name='bar_update'),
    path('bars/<int:pk>/delete/', views.bar_delete, name='bar_delete'),
]
