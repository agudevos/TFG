import os
import json
import uuid
from dotenv import load_dotenv
import openai
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import ConversationSession, ConversationMessages
from service.models import Service
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from service.serializers import ServiceSerializer
from .serializers import (
    ConversationSessionSerializer,
    ChatRequestSerializer 
)

load_dotenv()
# Configuración de la API de OpenAI
client = openai.OpenAI(api_key=os.environ.get('OPENAI_API_KEY'))

@permission_classes([IsAuthenticated])
class ConversationServiceExtractor(APIView):
    """
    API para extraer información de servicios usando OpenAI
    """
    def post(self, request, format=None):
        serializer = ChatRequestSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user_message = serializer.validated_data['message']
        session_id = serializer.validated_data.get('session_id', '')
        
        # Si no hay session_id, crear una nueva sesión
        if not session_id:
            session_id = str(uuid.uuid4())
            session = ConversationSession.objects.create(
                session_id=session_id,
                user=request.user if request.user.is_authenticated else None
            )
            # Crear mensaje inicial para una nueva sesión
            initial_response = self._create_initial_response(session)
            return Response(initial_response, status=status.HTTP_201_CREATED)
        
        # Obtener la sesión existente
        try:
            session = ConversationSession.objects.get(session_id=session_id)
        except ConversationSession.DoesNotExist:
            return Response(
                {"error": "Sesión no encontrada"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Añadir el mensaje del usuario a la conversación
        ConversationMessages.objects.create(
            session=session,
            role='user',
            content=user_message
        )
        
        # Obtener la conversación completa para contexto
        conversation_history = self._get_conversation_history(session)
        
        # Obtener la respuesta de OpenAI
        response = self._get_openai_response(conversation_history, session)
        
        
        return Response(response, status=status.HTTP_200_OK)
    def _create_initial_response(self, session):
        """Crea la respuesta inicial para una nueva sesión"""
        initial_prompt = """
        Por favor, cuéntame sobre el servicio que quieres crear. 
        Necesito información sobre:
        - Descripción general del servicio
        - Tiempo máximo de reserva
        - Fianza requerida para la reserva
        
        Puedes proporcionarme toda la información de una vez o podemos ir paso a paso.
        """
        
        initial_response = {
            "message": initial_prompt.strip(),
            "name": "",
            "description": "",
            "category": "",
            "max_reservation": "",
            "deposit": "",
            "finished": False,
            "session_id": session.session_id
        }
        
        # Guardar el mensaje inicial del asistente
        ConversationMessages.objects.create(
            session=session,
            role='assistant',
            content=json.dumps(initial_response, ensure_ascii=False)
        )
        
        return initial_response
        
    def _get_conversation_history(self, session):
        """Obtiene el historial de conversación para enviarlo a OpenAI"""
        # Mensaje del sistema
        system_message = """
        Eres un asistente diseñado para extraer información relevante sobre un servicio que el usuario quiere crear.
        Tu objetivo es completar los siguientes campos:
        - name: nombre del servicio
        - description: descripción breve del servicio
        - category: categoría que clasifica al servicio puedes establecer hasta 3 categorias, todo en minusculas y separado por comas.
        - max_reservation: tiempo máximo de reserva en minutos, en caso de que el usuario no quiera establecer un tiempo máximo de reserva asignale el valor 0
        - deposit: fianza o depósito requerido para la reserva (valor numérico entero)
        
        Pregunta toda la información necesaria al usuario, sin embargo, no debe darte la información de forma literal. De una descripción suficiente 
        debes ser capaz de sacar name, description y category. Si la descripcion del servicio no es suficiente para la abstraccion de informacion,
        pidele de forma amigable que te aporte algo mas de contexto.

        Si has asignado ya un valor a un atributo, lo puedes modificar si los nuevos mensajes del usuario te dan mas contexto permitiendote generar mejores datos.
        Recuerda hacer el nombre y la descripcion lo mas atractiva posible, saca provecho de donde no lo haya sin inventarte datos.

        Si no tienes suficiente información para completar un campo específico, déjalo vacío.
        Una vez que hayas completado todos los campos, establece "finished" como true.
        
        En cada interacción, debes devolver un JSON con todos los campos actualizados.
        Tu objetivo es ser amigable, claro y eficiente para obtener toda la información necesaria.
        """
        
        # Iniciar con el mensaje del sistema
        conversation_history = [{"role": "system", "content": system_message}]
        
        # Obtener todos los mensajes de la sesión
        messages = ConversationMessages.objects.filter(session=session).order_by('timestamp')
        
        for message in messages:
            conversation_history.append({"role": message.role, "content": message.content})
        
        return conversation_history

    def _get_openai_response(self, conversation_history, session):
        """Obtiene una respuesta de OpenAI basada en la conversación"""
        try:
            # Añadir contexto adicional para OpenAI
            latest_data = self._extract_latest_data(session)
            context_prompt = f"""
            Estado actual de la información:
            - Nombre: {latest_data.get('name', '') or 'No definido'}
            - Descripción: {latest_data.get('description', '') or 'No definida'}
            - Categoría: {latest_data.get('category', '') or 'No definida'}
            - Tiempo máximo de reserva: {latest_data.get('max_reservation', '') or 'No definido'}
            - Fianza: {latest_data.get('deposit', '') or 'No definida'}
            
            Recuerda que debes extraer información sobre estos campos a partir de lo que dice el usuario.
            Utiliza la información proporcionada para determinar los valores apropiados.
            
            Tu respuesta debe ser un JSON con el siguiente formato exacto:
            {{
                "message": "tu mensaje para el usuario",
                "name": "nombre del servicio basado en la información",
                "description": "descripción del servicio",
                "category": "categoría del servicio",
                "max_reservation": "tiempo máximo de reserva (valor numérico)",
                "deposit": "fianza requerida (valor numérico)",
                "finished": false
            }}
            
            Si has completado todos los campos con valores válidos, cambia "finished" a true.
            """
            
            conversation_history.append({"role": "system", "content": context_prompt})
            
            # Llamada a la API de OpenAI
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=conversation_history,
                temperature=0.7,
                max_tokens=1000,
                response_format={"type": "json_object"}
            )
            
            # Extraer y procesar la respuesta
            response_content = response.choices[0].message.content
            response_data = json.loads(response_content)
            
            # Añadir la respuesta a la conversación
            ConversationMessages.objects.create(
                session=session,
                role='assistant',
                content=json.dumps(response_data, ensure_ascii=False)
            )
            
            return response_data
            
        except Exception as e:
            error_message = f"Error al procesar la solicitud: {str(e)}"
            error_response = {
                "message": error_message,
                "name": "",
                "description": "",
                "category": "",
                "max_reservation": "",
                "deposit": "",
                "finished": False
            }
            return error_response

    def _extract_latest_data(self, session):
        """Extrae los datos más recientes de la conversación"""
        try:
            # Obtener el último mensaje del asistente
            last_assistant_message = ConversationMessages.objects.filter(
                session=session,
                role='assistant'
            ).order_by('-timestamp').first()
            
            if last_assistant_message:
                return json.loads(last_assistant_message.content)
            return {}
        except:
            return {}
    
    

class SessionViewSet(APIView):
    """
    API endpoint para ver sesiones
    """
    
    def get(self):
        # Filtrar por usuario si está autenticado
        if self.request.user.is_authenticated:
            return ConversationSession.objects.filter(user=self.request.user)
        return ConversationSession.objects.none()