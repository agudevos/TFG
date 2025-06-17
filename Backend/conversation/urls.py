from django.urls import path
from . import views

urlpatterns = [
    path('conversations/sessions/', views.SessionViewSet.as_view(), name="sessions"),
    path('conversations/service/', views.ConversationServiceExtractor.as_view(), name="service-chats")
]