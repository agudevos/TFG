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
from datetime import datetime
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
            initial_response = self._create_initial_response(request, session)
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
        conversation_history = self._get_conversation_history(request, session)
        
        # Obtener la respuesta de OpenAI
        response = self._get_openai_response(request, conversation_history, session)
        
        
        return Response(response, status=status.HTTP_200_OK)
    def _create_initial_response(self, request, session):
        """Crea la respuesta inicial para una nueva sesión"""

        if (request.user.rol == "worker"):
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
                "max_people": "",
                "deposit": "",
                "finished": False,
                "session_id": session.session_id
            }
        
        elif (request.user.rol == "client"):
            initial_prompt = """
            Por favor, cuéntame sobre el plan que tienes en mente. 
            Sería útil que me aportes información sobre:
            - Que día y tramo horario tienes en mente, para comprobar disponibilidades
            - Precio máximo que estás dispuesto a pagar
            - Qué tipo de plan quieres realizar, solo, con amigos, juegos de mesa, billar..
            
            Puedes proporcionarme toda la información de una vez o podemos ir paso a paso.
            """
            
            initial_response = {
                "message": initial_prompt.strip(),
                "date": "",
                "start_time": "",
                "end_time": "",
                "category": "",
                "max_people": "",
                "price": "",
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
        
    def _get_conversation_history(self, request, session):
        """Obtiene el historial de conversación para enviarlo a OpenAI"""
        # Mensaje del sistema

        if (request.user.rol == "worker"):
            system_message = """
            Eres un asistente diseñado para extraer información relevante sobre un servicio que el usuario quiere crear.
            Tu objetivo es completar los siguientes campos:
            - name: nombre del servicio (debe tener entre 0 y 74 caracteres)
            - description: descripción breve del servicio (debe tener entre 0 y 354 caracteres)
            - category: categoría que clasifica al servicio puedes establecer hasta 3 categorias, todo en minusculas y separado por comas (debe tener entre 0 y 99 caracteres).
            - max_reservation: tiempo máximo de reserva en minutos, en caso de que el usuario no quiera establecer un tiempo máximo de reserva asignale el valor 0
            - max_people: número máximo de personas que pueden reservar el servicio (valor numérico entero)
            - deposit: fianza o depósito requerido para la reserva (valor numérico entero)
            
            Pregunta toda la información necesaria al usuario, sin embargo, no debe darte la información de forma literal. De una descripción suficiente 
            debes ser capaz de sacar name, description y category. Si la descripcion del servicio no es suficiente para la abstraccion de informacion,
            pidele de forma amigable que te aporte algo mas de contexto.

            Si has asignado ya un valor a un atributo, lo puedes modificar si los nuevos mensajes del usuario te dan mas contexto permitiendote generar mejores datos.
            Recuerda hacer el nombre y la descripcion lo mas atractiva posible, no tienes que copiar lo que haya dicho el usuario literalmente, 
            adornalo con emoticonos y palabras llamativas, saca provecho de donde no lo haya sin inventarte datos.

            Si no tienes suficiente información para completar un campo específico, déjalo vacío.
            Una vez que hayas completado todos los campos, establece "finished" como true.
            
            En cada interacción, debes devolver un JSON con todos los campos actualizados.
            Tu objetivo es ser amigable utilizando el mismo tono que el usuario pero manteniendo la formalidad y sin usar malas palabras,
              claro y eficiente para obtener toda la información necesaria.
            """
        if (request.user.rol == "client"):

            categorias = Service.objects.values_list('category', flat=True)
            print(f"CATEGORIAS {categorias}")

            system_message = f"""
            Eres un planning assistant, especializado en identificar las necesidades del usuario y las opciones de mercado para darle sugerencias
            sobre que servicio se adapta mejor a sus necesidades. No tienes que hacer ninguna sugerencia como tal, tienes que ser capaz de, de forma sutil,
            extraer toda la información siguiente:
            - date: que día quiere realizar la actividad el usuario (en formato YYYY-MM-DD)
            - start_time: a que hora quiere empezar la actividad
            - end_time: a que hora quiere terminar la acitividad
            - category: categorías de la actividad a realizar o reservar, en grupo o individual, juegos de mesa, juegos de bar multimedia..
            - max_people: número máximo de personas que van a participar
            - price: precio máximo que el usuario está dispuesto a pagar

            No es necesario rellenar todos los campos, pero al menos 3 campos deben ser rellenados para tener sugerencias más fiables. Debes conseguir esta información
            mediante preguntas sutiles al usuario. Las categorías disponibles actuales son: {categorias} debes guiar al usuario mediante preguntas 
            sutiles para que elija una de las categorias disponibles. si decides que el usuario está refiriendo a más de una categoria recuerda ponerlas
            todas en una sola cadena y separadas por comas.

            Si has asignado ya un valor a un atributo, lo puedes modificar si los nuevos mensajes del usuario te dan mas contexto permitiendote generar mejores datos.
            Sin embargo si no has recibido información suficiente para rellenar el campo, dejalo vacío. Si el cliente no especifica fecha asume date como la fecha de hoy

            Una vez que hayas completado todos los campos, establece "finished" como true.
            
            En cada interacción, debes devolver un JSON con todos los campos actualizados.
            Tu objetivo es ser amigable utilizando el mismo tono que el usuario pero manteniendo la formalidad y sin usar malas palabras,
            claro y eficiente para obtener toda la información necesaria.
            """

        # Iniciar con el mensaje del sistema
        conversation_history = [{"role": "system", "content": system_message}]
        
        # Obtener todos los mensajes de la sesión
        messages = ConversationMessages.objects.filter(session=session).order_by('timestamp')
        
        for message in messages:
            conversation_history.append({"role": message.role, "content": message.content})
        
        return conversation_history 

    def _get_openai_response(self, request, conversation_history, session):
        """Obtiene una respuesta de OpenAI basada en la conversación"""
        try:
            if (request.user.rol == "worker"):
                # Añadir contexto adicional para OpenAI
                latest_data = self._extract_latest_data(session)
                context_prompt = f"""
                Estado actual de la información:
                - Nombre: {latest_data.get('name', '') or 'No definido'}
                - Descripción: {latest_data.get('description', '') or 'No definida'}
                - Categoría: {latest_data.get('category', '') or 'No definida'}
                - Tiempo máximo de reserva: {latest_data.get('max_reservation', '') or 'No definido'}
                - Personas: {latest_data.get('max_people', '') or 'No definida'}
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
                    "max_people": "número máximo de personas que pueden reservar (valor numérico)",
                    "deposit": "fianza requerida (valor numérico)",
                    "finished": false
                }}
                
                Si has completado todos los campos con valores válidos, cambia "finished" a true.
                """
            if (request.user.rol == "client"):
                latest_data = self._extract_latest_data(session)
                moment_helper = datetime.now()
                context_prompt = f"""
                Estado actual de la información:
                - Date: {latest_data.get('date', '') or 'No definido'}
                - Start Time: {latest_data.get('start_time', '') or 'No definida'}
                - End Time: {latest_data.get('end_time', '') or 'No definida'}
                - Categoría: {latest_data.get('category', '') or 'No definido'}
                - Personas: {latest_data.get('max_people', '') or 'No definida'}
                - Precio: {latest_data.get('price', '') or 'No definida'}
                
                Recuerda que debes extraer información sobre estos campos a partir de lo que dice el usuario.
                Utiliza la información proporcionada para determinar los valores apropiados.
                
                Únicamente en caso de que el usuario haga alguna referencia a la fecha o hora actual aquí tienes dicho dato: {moment_helper.strftime('%Y-%m-%d %H:%M:%S')}, si
                quieren reservar para hoy o para el momento actual, utiliza este dato como referencia para establecer "Date" como la fecha de hoy y "Start Time"
                como la hora actual.

                Tu respuesta debe ser un JSON con el siguiente formato exacto:
                {{
                    "message": "tu mensaje para el usuario",
                    "date": "que día quiere realizar la actividad el usuario (en formato YYYY-MM-DD)",
                    "start_time": "a que hora quiere empezar la actividad (en formato HH:MM)",
                    "end_time": "a que hora quiere terminar la acitividad (en formato HH:MM)",
                    "category": "categorías de la actividad a realizar o reservar, en grupo o individual, juegos de mesa, juegos de bar multimedia",
                    "max_people": "número máximo de personas que pueden participar (valor numérico)",
                    "price": "precio máximo que el usuario está dispuesto a pagar (valor numérico)",
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
                "max_people": "",
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
