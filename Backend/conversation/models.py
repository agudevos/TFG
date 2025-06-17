from django.db import models

from user.models import CustomUser

class ConversationSession(models.Model):
    """Modelo para almacenar una sesión de extracción de datos de servicio"""
    session_id = models.CharField(max_length=36, unique=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_completed = models.BooleanField(default=False)
    
    def __str__(self):
        return f"Sesión {self.session_id} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"

class ConversationMessages(models.Model):
    """Modelo para almacenar los mensajes de una conversación"""
    session = models.ForeignKey(ConversationSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=[('user', 'Usuario'), ('assistant', 'Asistente')])
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"Mensaje de {self.role} en {self.timestamp.strftime('%d/%m/%Y %H:%M')}"