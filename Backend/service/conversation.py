# import os
# import json
# import openai
# from dotenv import load_dotenv
# from pydantic import BaseModel
# from typing import Dict, Any, Optional
# from rest_framework.views import APIView

# # Cargar variables de entorno (API key)
# load_dotenv()

# # Configuración de la API de OpenAI
# client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# # Modelos de datos
# class UserMessage(BaseModel):
#     message: str
#     session_id: Optional[str] = None

# class ServiceData(BaseModel):
#     message: str
#     name: str = ""
#     descripcion: str = ""
#     category: str = ""
#     max_reservation: str = ""
#     deposit: str = ""
#     finished: bool = False

# # Almacenamiento de sesiones (en memoria - para producción considera usar Redis o una base de datos)
# sessions = {}

# class ServiceExtractor:
#     def __init__(self):
#         self.conversation_history = []
#         self.service_data = {
#             "message": "",
#             "name": "",
#             "descripcion": "",
#             "category": "",
#             "max_reservation": "",
#             "deposit": "",
#             "finished": False
#         }
        
#         # Mensaje inicial del sistema
#         self.system_message = """
#         Eres un asistente diseñado para extraer información relevante sobre un servicio que el usuario quiere crear.
#         Tu objetivo es completar los siguientes campos:
#         - name: nombre del servicio
#         - descripcion: descripción breve del servicio
#         - category: categoría que clasifica al servicio
#         - max_reservation: tiempo máximo de reserva (en horas, días o meses según corresponda)
#         - deposit: fianza o depósito requerido para la reserva (valor numérico entero)
        
#         Si no tienes suficiente información para completar un campo específico, déjalo vacío.
#         Una vez que hayas completado todos los campos, establece "finished" como true.
        
#         En cada interacción, debes devolver un JSON con todos los campos actualizados.
#         Tu objetivo es ser amigable, claro y eficiente para obtener toda la información necesaria.
#         """
        
#         # Añadir el mensaje del sistema al historial
#         self.conversation_history.append({"role": "system", "content": self.system_message})
        
#         # Mensaje inicial para el usuario
#         initial_prompt = """
#         Por favor, cuéntame sobre el servicio que quieres crear. 
#         Necesito información sobre:
#         - Descripción general del servicio
#         - Tiempo máximo de reserva
#         - Fianza requerida para la reserva
        
#         Puedes proporcionarme toda la información de una vez o podemos ir paso a paso.
#         """
        
#         # Crear el formato JSON inicial
#         initial_response = {
#             "message": initial_prompt.strip(),
#             "name": "",
#             "descripcion": "",
#             "category": "",
#             "max_reservation": "",
#             "deposit": "",
#             "finished": False
#         }
        
#         self.conversation_history.append({"role": "assistant", "content": json.dumps(initial_response, ensure_ascii=False)})
#         self.service_data = initial_response
    
#     def update_conversation(self, user_input: str) -> Dict[str, Any]:
#         """
#         Actualiza la conversación con el input del usuario y obtiene respuesta de la API de OpenAI
#         """
#         # Añadir mensaje del usuario al historial
#         self.conversation_history.append({"role": "user", "content": user_input})
        
#         # Construir prompt de contexto que incluya el estado actual de los datos
#         context_prompt = f"""
#         Estado actual de la información:
#         - Nombre: {self.service_data['name'] or 'No definido'}
#         - Descripción: {self.service_data['descripcion'] or 'No definida'}
#         - Categoría: {self.service_data['category'] or 'No definida'}
#         - Tiempo máximo de reserva: {self.service_data['max_reservation'] or 'No definido'}
#         - Fianza: {self.service_data['deposit'] or 'No definida'}
        
#         Recuerda que debes extraer información sobre estos campos a partir de lo que dice el usuario.
#         Utiliza la información proporcionada para determinar los valores apropiados.
        
#         Tu respuesta debe ser un JSON con el siguiente formato exacto:
#         {{
#             "message": "tu mensaje para el usuario",
#             "name": "nombre del servicio basado en la información",
#             "descripcion": "descripción del servicio",
#             "category": "categoría del servicio",
#             "max_reservation": "tiempo máximo de reserva (valor numérico)",
#             "deposit": "fianza requerida (valor numérico)",
#             "finished": false
#         }}
        
#         Si has completado todos los campos con valores válidos, cambia "finished" a true.
#         """
        
#         self.conversation_history.append({"role": "system", "content": context_prompt})
        
#         # Realizar la llamada a la API de OpenAI
#         try:
#             response = client.chat.completions.create(
#                 model="gpt-4-turbo", # Puedes cambiar a otro modelo según disponibilidad
#                 messages=self.conversation_history,
#                 temperature=0.7,
#                 max_tokens=1000,
#                 response_format={"type": "json_object"}
#             )
            
#             # Extraer la respuesta
#             response_content = response.choices[0].message.content
#             response_data = json.loads(response_content)
            
#             # Actualizar el historial con la respuesta del asistente (JSON completo)
#             self.conversation_history.append({"role": "assistant", "content": json.dumps(response_data, ensure_ascii=False)})
            
#             # Actualizar los datos del servicio
#             self.service_data = response_data
            
#             return self.service_data
            
#         except Exception as e:
#             error_message = f"Error al procesar la solicitud: {str(e)}"
#             self.service_data["message"] = error_message
#             return self.service_data
    
#     def get_final_data(self) -> Dict[str, Any]:
#         """
#         Devuelve los datos extraídos en formato final
#         """
#         if self.service_data["finished"]:
#             # Convertir max_reservation y deposit a enteros si es posible
#             try:
#                 if self.service_data["max_reservation"]:
#                     self.service_data["max_reservation"] = int(self.service_data["max_reservation"])
#                 if self.service_data["deposit"]:
#                     self.service_data["deposit"] = int(self.service_data["deposit"])
#             except ValueError:
#                 # Si hay algún problema con la conversión, mantener como está
#                 pass
                
#         return self.service_data

# # Obtener o crear una sesión
# def get_session(session_id: str):
#     if session_id not in sessions:
#         sessions[session_id] = ServiceExtractor()
#     return sessions[session_id]

# class SessionList(APIView):
#      def start_session(self, request):
#         """
#         Iniciar una nueva sesión
#         """
#         # Generar un ID de sesión único
#         import uuid
#         session_id = str(uuid.uuid4())
        
#         # Crear nueva sesión
#         session = ServiceExtractor()
#         sessions[session_id] = session
        
#         # Retornar el mensaje inicial y el ID de sesión
#         response = session.service_data.copy()
#         response["session_id"] = session_id
        
#         return response


# class SessionDetail(APIView):
#     def put(self, request):
#         """
#         Endpoint para la conversación con el extractor de servicios
        
#         - **message**: El mensaje del usuario
#         - **session_id**: Identificador de sesión (opcional)
        
#         Retorna un objeto ServiceData con la respuesta y la información extraída
#         """
#         user_message = request.query_params.get("user_message")
#         # Obtener o crear una ID de sesión
#         session_id = user_message.session_id or "default"
        
#         # Obtener o crear la sesión
#         session = ServiceExtractor.get_session(session_id)
        
#         # Procesar el mensaje del usuario
#         response = session.update_conversation(user_message.message)
        
#         return response


#     def get(session_id: str):
#         """
#         Obtener los datos actuales de una sesión
#         """
#         if session_id not in sessions:
#             raise HTTPException(status_code=404, detail="Sesión no encontrada")
        
#         return sessions[session_id].service_data


   

#     @app.delete("/api/session/{session_id}")
#     def delete_session(session_id: str):
#         """
#         Eliminar una sesión
#         """
#         if session_id in sessions:
#             del sessions[session_id]
        
#         return {"message": "Sesión eliminada"}

# # Punto de entrada para ejecutar la aplicación
# if __name__ == "__main__":
#     uvicorn.run("service_extractor_api:app", host="0.0.0.0", port=8000, reload=True)