from django.urls import path
from . import views

urlpatterns = [path('services/create/', views.ServiceCreateView.as_view(), name='establishment_list'),]