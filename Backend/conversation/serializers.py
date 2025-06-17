from rest_framework import serializers
from .models import ConversationSession, ConversationMessages

class ConversationMessagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConversationMessages
        fields = ['id', 'role', 'content', 'timestamp']
        read_only_fields = ['id', 'timestamp']

class ConversationSessionSerializer(serializers.ModelSerializer):
    messages = ConversationMessagesSerializer(many=True, read_only=True)
    
    class Meta:
        model = ConversationSession
        fields = ['id', 'session_id', 'created_at', 'updated_at', 'is_completed', 'messages']
        read_only_fields = ['id', 'session_id', 'created_at', 'updated_at']

class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(required=True)
    session_id = serializers.CharField(required=False, allow_blank=True)

class ChatResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
    name = serializers.CharField(allow_blank=True)
    descripcion = serializers.CharField(allow_blank=True)
    category = serializers.CharField(allow_blank=True)
    max_reservation = serializers.CharField(allow_blank=True)
    deposit = serializers.CharField(allow_blank=True)
    finished = serializers.BooleanField(default=False)
    session_id = serializers.CharField(required=False)