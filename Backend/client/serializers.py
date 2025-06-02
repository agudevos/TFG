from rest_framework import serializers
from .models import Client


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client.user.field.related_model
        fields = ['name', 'surname', 'email'] 

class ClientSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    class Meta:
        model = Client
        fields = ['id', 'credits', 'preferences', 'user', 'user_details']
        read_only_fields = ['id', 'user']