from . import views
from django.urls import path

urlpatterns = [
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/create/', views.UserCreateView.as_view(), name='user_create'),
    path('users/verify/<str:username>/<str:token>/', views.UserVerifyView.as_view(), name='user_verify'),
    path('users/update/<str:username>/', views.UserUpdateView.as_view(), name='user_update'),  # Change here
    path('users/delete/<str:username>/', views.UserDeleteView.as_view(), name='user_delete'),  # Change here
]