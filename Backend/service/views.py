from datetime import datetime, time
import os
from django.shortcuts import get_object_or_404
from dotenv import load_dotenv
from openai import OpenAI
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from reservation.serializers import ReservationSerializer
from reservation.models import Reservation
from user.models import CustomUser
from worker.models import Worker
from client.models import Client
from schedule.serializers import SlotAssignmentSerializer
from schedule.models import SlotAssignment
from service.models import Service, ServicePriceAssignment
from .serializers import ServicePriceAssignmentSerializer, ServiceSerializer

from .recomendation import generate_service_price_recomendation

from django.db.models import Q
from collections import Counter
import math

load_dotenv()
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

@permission_classes([IsAuthenticated])
class ServiceCreateView(APIView):
    def post(self, request):
        categories = set(Service.objects.values_list('category', flat=True))
        prompt = f"""
           Eres un experto en juegos y servicios que se pueden encontrar en un establecimiento de ocio.
           Tu tarea es asignar una categoría al servicio que se te proporciona, basándote en su nombre y descripción.
           El servicio se describe de la siguiente manera:
           Nombre: {request.data.get('name')}
           Descripción: {request.data.get('description')}

           Categorías ya definidas:
              {', '.join(categories)}
              Si el servicio no encaja en ninguna de las categorías existentes, crea una nueva categoría. Recuerda que las categorías deben ser concisas es decir 
              en general no deben tener más de 3 palabras, no es una descripción del servicio, simplemente una forma de clasificar los servicios que se 
              puedan encontrar.
              

            Aqui tienes varios ejemplos de como se asignan las categorías en base a los nombres y descripciones de los servicios:
            {{
                "model": "service.service",
                "pk": 457504,
                "fields": {{
                    "name": "Televisión Sony Bravia 50 pulgadas",
                    "description": "Ideal para presentaciones o documentales. Conecta tu dispositivo y aprovecha sus aplicaciones.",
                    "category": "televisión, smart TV, LED",
                    "max_reservation": 28,
                    "max_people": 0,
                    "deposit": 18,
                    "establishment": 901234
                }}
            }},
            {{
                "model": "service.service",
                "pk": 457582,
                "fields": {{
                    "name": "Mesa de billar profesional",
                    "description": "Mesa de billar americana de tamaño reglamentario perfecta para torneos entre amigos con tacos incluidos.",
                    "category": "billar",
                    "max_people": 4,
                    "max_reservation": 120,
                    "deposit": 25,
                    "establishment": 123890
                }}
            }},
            {{
                "model": "service.service",
                "pk": 457586,
                "fields": {{
                    "name": "Karaoke profesional con pantalla",
                    "description": "Sistema completo de karaoke con miles de canciones en español e inglés y dos micrófonos inalámbricos.",
                    "category": "karaoke",
                    "max_reservation": 180,
                    "max_people": 15,
                    "deposit": 30,
                    "establishment": 345678
                }}
            }},
            {{
                "model": "service.service",
                "pk": 457587,
                "fields": {{
                    "name": "Mesa de air hockey LED",
                    "description": "Mesa de hockey de aire con efectos LED y marcador electrónico para partidas rápidas y emocionantes.",
                    "category": "air hockey",
                    "max_reservation": 60,
                    "max_people": 2,
                    "deposit": 22,
                    "establishment": 345678
                }}
            }},
            {{
                "model": "service.service",
                "pk": 457588,
                "fields": {{
                    "name": "Máquina recreativa arcade retro",
                    "description": "Máquina con más de 1000 juegos clásicos de los 80s y 90s perfecta para la nostalgia gamer.",
                    "category": "arcade",
                    "max_reservation": 120,
                    "max_people": 2,
                    "deposit": 25,
                    "establishment": 456789
                }}
            }},
            Responde únicamente con la categoría asignada, sin comillas ni ningún otro texto."""
        
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # o "gpt-4o-mini"
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": "Asigna una categoría al servicio proporcionado."},
            ],
            temperature=0.7,
        )
        
        raw_content = response.choices[0].message.content
        print("RAW CONTENT:", raw_content)
        # 2. Limpiar el bloque ```json ... ```
        cleaned = raw_content.strip("`")  # quita los backticks
        cleaned = cleaned.replace("json", "", 1).strip()  # quita la palabra "json" si está al inicio

        request.data['category'] = cleaned
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            service = serializer.save()
            return Response(serializer.data, status=201)
        print(serializer.errors)
        return Response(serializer.errors, status=400)
    
@permission_classes([IsAuthenticated])
class ServiceDetailView(APIView):
    def get(self, request, pk):
        service = get_object_or_404(Service, pk=pk)
        serializer = ServiceSerializer(service)
        return Response(serializer.data)
    
@permission_classes([IsAuthenticated])
class ServiceUpdateView(APIView):
    def put(self, request, pk):
        service = get_object_or_404(Service, pk=pk)
        serializer = ServiceSerializer(service, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
@permission_classes([IsAuthenticated])
class ServiceDeleteView(APIView):
    def delete(self, request, pk):
        user=CustomUser.objects.get(username=request.user)
        if (user.rol == "worker"):
            worker= Worker.objects.get(user=user)
            service = get_object_or_404(Service, pk=pk)
            if (worker.rol == "owner" and service.establishment.owner == worker):
                service.delete()
            else:
                return Response("Inicia sesión como dueño para eliminar un servicio", status=403)
        else:
            return Response("Inicia sesión como dueño para eliminar un servicio", status=403)
        return Response(status=204)

    
@permission_classes([IsAuthenticated])
class ServiceListByEstablishmentView(APIView):
    def get(self, request, fk):
        services = Service.objects.filter(establishment = fk)
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

def to_time(val):
    if isinstance(val, time):
        return val
    return datetime.strptime(val, "%H:%M:%S").time()

def split_slot(slot, overlap):
    """
    slot: dict con 'start_time' y 'end_time'
    overlap: dict con 'start_time' y 'end_time'
    Devuelve lista de slots (dict) no solapados con overlap.
    """
    s_start = slot["start_time"]
    s_end = slot["end_time"]
    o_start = overlap["start_time"]
    o_end = overlap["end_time"]
    result = []
    # Antes del solapamiento
    if s_start < o_start:
        new_slot = slot.copy()
        new_slot["end_time"] = o_start
        result.append(new_slot)
    # Después del solapamiento
    if o_end < s_end:
        new_slot = slot.copy()
        new_slot["start_time"] = o_end
        result.append(new_slot)

    return result


@permission_classes([IsAuthenticated])
class ServiceListForYou(APIView):
    """
    Lista de servicios más afines al usuario autenticado.
    """
    def get(self, request):
        user = CustomUser.objects.get(username=request.user)
        if user.rol == "client":
            client= Client.objects.get(user=user)
            reservations = Reservation.objects.filter(client=client)
            if not reservations:
                serializer = ServiceSerializer(reservations, many=True)
                return Response(serializer.data)
            reservation_serializer = ReservationSerializer(reservations, many=True)
            reserved_services = [reservation["service_details"] for reservation in reservation_serializer.data]
            # Contar las categorías más repetidas
            category_list = [service["category"] for service in reserved_services]
            most_common_categories = [cat for cat, _ in Counter(category_list).most_common(3)]
            # Obtener mediana de max_people de los servicios reservados
            avg_max_people = sum(service["max_people"] for service in reserved_services) / len(reserved_services)
            floor_max_people = math.floor(avg_max_people-1)
            ceiling_max_people = math.ceil(avg_max_people+1)
            # Filtrar servicios por las categorías más comunes (excluyendo los ya reservados)
            services = Service.objects.filter(category__in=most_common_categories, max_people__lte = ceiling_max_people, max_people__gte = floor_max_people)
        else:
            return Response("Inicia sesión como cliente para ver los servicios", status=403)

        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)

@authentication_classes([])  # Desactiva la autenticación
@permission_classes([AllowAny])
class ServiceListRecomendations(APIView):
    def get(self, request):
        date = request.query_params.get('date') if request.query_params.get('date') != "" else ""
        
        

        services_dict = {}
        if date != None:
            service_id = int(request.query_params.get('service')) if request.query_params.get('service') != None else 0
            view = ServicePriceForDateView()
            response = ServicePriceForDateView.get(view, request, date=date,service_id=service_id).data
            for item in response:
                check = self.check_filter(request, item)
                if item["time_slot_details"]["schedule_type"] == "specific":
                    break

                if check:
                    

                    service_id = item["service"]
                    
                    # Si es el primer item de este servicio, inicializar los detalles del servicio
                    if service_id not in services_dict:
                        services_dict[service_id] = {
                            "service": service_id,
                            "service_details": item["service_details"],
                            "slots": []
                        }
                    
                    # Añadir el time_slot a la lista de slots de este servicio
                    slot = {
                        "id": item["id"],
                        "price": float(item["price"]) if isinstance(item["price"], str) else item["price"],
                        "name": item["time_slot_details"]["name"],
                        "start_time": item["time_slot_details"]["start_time"],
                        "end_time": item["time_slot_details"]["end_time"],
                        "color": item["time_slot_details"]["color"],
                        "schedule_type": item["time_slot_details"]["schedule_type"],
                    }
                    slots = services_dict[service_id]["slots"]
                    solapado = False
                    for existing in slots[:]:
                        # Comprobar solapamiento
                        s_start = slot["start_time"]
                        s_end = slot["end_time"]
                        e_start = existing["start_time"]
                        e_end = existing["end_time"]
                        if not (s_end <= e_start or s_start >= e_end):
                            solapado = True
                            # Partir el slot a añadir en los huecos que no solapan
                            slots.remove(existing)
                            nuevos = split_slot(existing, slot)
                            for n in nuevos:
                                slots.append(n)

                            if slot["id"] not in [x["id"] for x in slots]:
                                slots.append(slot)
                    if not solapado:
                        slots.append(slot)
                else: 
                    continue
        for s in services_dict.values():
            s["slots"].sort(key=lambda x: x["start_time"])  

        print("SERVICES DICT:", services_dict.values())
        return Response(list(services_dict.values()))

    def check_filter(self, request, item):
        hora_inicio = request.query_params.get('start_time') if request.query_params.get('start_time') != "" else ""
        hora_fin = request.query_params.get('end_time') if request.query_params.get('end_time') != "" else ""
        precio = float(request.query_params.get('price')) if request.query_params.get('price') != None else ""
        categoria = request.query_params.get('category') if request.query_params.get('category') != "" else ""
        max_personas = int(request.query_params.get('max_people')) if request.query_params.get('max_people') != None else 0
        start_time = item['time_slot_details']['start_time']
        end_time = item['time_slot_details']['end_time']
        price = float(item['price'])
        category = item['service_details']['category']
        max_people = item['service_details']['max_people']
    
        if not start_time or not end_time or not price or not max_people:
            cumple_filtro = False
            
        
        # Aplicar filtros
        cumple_filtro = True
        
        if hora_inicio:
            hora_inicio_obj = datetime.strptime(hora_inicio, "%H:%M").time()
            if not (start_time <= hora_inicio_obj and end_time > hora_inicio_obj):
                cumple_filtro = False
                
        if hora_fin:
            hora_fin_obj = datetime.strptime(hora_fin, "%H:%M").time()
            if not (start_time < hora_fin_obj and end_time >= hora_fin_obj):
                cumple_filtro = False

        if precio:
            if price > precio:
                cumple_filtro = False

        if max_people:
            if max_people < max_personas:
                cumple_filtro = False

        if categoria:
            splited = categoria.split(",")
            if not any(x in category for x in splited):
                cumple_filtro = False


        return cumple_filtro

@permission_classes([IsAuthenticated])
class ServicePriceAssignmentListView(APIView):
    """
    Lista todas las asignaciones de precios de servicios o crea una nueva
    """
    def get(self, request, format=None):
        # Filtros opcionales
        service_id = request.query_params.get('service')
        slot_id = request.query_params.get('time_slot')
        schedule_type = request.query_params.get('schedule_type')
        schedule_id = request.query_params.get('schedule_id')
        
        assignments = ServicePriceAssignment.objects.all()
        
        # Aplicar filtros si se proporcionan
        if service_id:
            assignments = assignments.filter(service_id=service_id)
        
        if slot_id:
            assignments = assignments.filter(time_slot_id=slot_id)
        
        # Filtrar por tipo de horario
        if schedule_type and schedule_id:
            filter_kwargs = {}
            if schedule_type == 'weekly':
                filter_kwargs['time_slot__weekly_schedule_id'] = schedule_id
            elif schedule_type == 'specific':
                filter_kwargs['time_slot__specific_schedule_id'] = schedule_id
            elif schedule_type == 'group':
                filter_kwargs['time_slot__group_schedule_id'] = schedule_id
            
            if filter_kwargs:
                assignments = assignments.filter(**filter_kwargs)
        
        serializer = ServicePriceAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    
    def post(self, request, format=None):
        serializer = ServicePriceAssignmentSerializer(data=request.data)
        if serializer.is_valid():
            # Verificar que el servicio existe
            service_id = serializer.validated_data.get('service').id
            if not Service.objects.filter(id=service_id).exists():
                return Response(
                    {"error": "El servicio no existe"},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            # Verificar que el time_slot existe
            time_slot_id = serializer.validated_data.get('time_slot').id
            if not SlotAssignment.objects.filter(id=time_slot_id).exists():
                return Response(
                    {"error": "La asignación de horario no existe"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear la asignación de precio
            service_price = serializer.save()
            return Response(
                ServicePriceAssignmentSerializer(service_price).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@permission_classes([IsAuthenticated])
class ServicePriceAssignmentDetailView(APIView):
    """
    Recupera, actualiza o elimina una asignación de precio de servicio
    """
    def get_object(self, pk):
        return get_object_or_404(ServicePriceAssignment, pk=pk)
    
    def get(self, request, pk, format=None):
        service_price = self.get_object(pk)
        serializer = ServicePriceAssignmentSerializer(service_price)
        return Response(serializer.data)
    
    def put(self, request, pk, format=None):
        service_price = self.get_object(pk)
        serializer = ServicePriceAssignmentSerializer(service_price, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk, format=None):
        service_price = self.get_object(pk)
        service_price.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@permission_classes([IsAuthenticated])
class ServicePriceByServiceView(APIView):
    """
    Obtiene todas las asignaciones de precios para un servicio específico
    """
    def get(self, request, service_id, format=None):
        # Verificar que el servicio existe
        service = get_object_or_404(Service, pk=service_id)
        
        service_prices = ServicePriceAssignment.objects.filter(service=service)
        serializer = ServicePriceAssignmentSerializer(service_prices, many=True)
        return Response(serializer.data)
    
    
    
@permission_classes([IsAuthenticated])
class ServicePriceForDateView(APIView):
    """
    Obtiene los precios de servicios disponibles para una fecha específica
    """
    def get(self, request, date, service_id):
        
        if not date:
            return Response(
                {"error": "Se requiere el parámetro 'date' (formato: YYYY-MM-DD)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            print(date)
            return Response(
                {"error": "Formato de fecha inválido. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Obtener horarios específicos para esta fecha
        specific_slots = SlotAssignment.objects.filter(
            specific_schedule__date=date_obj,
            specific_schedule__active=True
        )
        
        # Obtener horarios semanales para el día de la semana correspondiente
        weekday = date_obj.weekday()
        weekly_slots = SlotAssignment.objects.filter(
            weekly_schedule__weekday=weekday,
            weekly_schedule__active=True
        )
        
        # Construir la consulta para los precios de servicios
        query = Q(time_slot__in=specific_slots) | Q(time_slot__in=weekly_slots)
        
        # Filtrar por servicio si se proporciona
        if service_id != 0:
            query &= Q(service_id=service_id)
            
        # Obtener los precios de servicios
        service_prices = ServicePriceAssignment.objects.filter(query, bookable= True)
        serializer = ServicePriceAssignmentSerializer(service_prices, many=True)
        
        return Response(serializer.data)
    
@permission_classes([IsAuthenticated])
class ServicePriceRecomendation(APIView):
    """
    Genera recomendaciones de precios para tramos horarios
    """

    def get(self, request, assing_id, service_id):
        ids = ServicePriceAssignment.objects.filter(bookable = True)
        prices = ServicePriceAssignmentSerializer(ids, many=True)
        data_list = []
        for item in prices.data:
            dict={}
            dict['id'] = item['id']
            dict['price'] = float(item['price'])
            dict['category'] = item['service_details']['category']
            dict['max_reservation'] = item['service_details']['max_reservation']
            dict['max_people'] = item['service_details']['max_people']
            dict['start_time'] = item['time_slot_details']['start_time']
            dict['end_time'] =  item['time_slot_details']['end_time']
            dict['type'] = item['time_slot_details']['schedule_type']['type']
            if (item['time_slot_details']['schedule_type']['type'] == 'weekly'):
                dict['weekday'] = item['time_slot_details']['schedule_type']['weekday']
            else:
                dict['date']= item['time_slot_details']['schedule_type']['date']
            data_list.append(dict)
        
        assign_object = get_object_or_404(SlotAssignment, pk=assing_id)
        assing_data = SlotAssignmentSerializer(assign_object)
        print("ASSIGN DATA:",assing_data.data)
        service_object = get_object_or_404(Service, pk=service_id)
        service_data = ServiceSerializer(service_object)
        print("SERVICE DATA:",service_data.data)
        print(data_list)
        result = generate_service_price_recomendation(
                api_key=OPENAI_API_KEY,
                historical_data_list=data_list,
                service=service_data.data,
                slot=assing_data.data,
            )
        
        
        return Response(result)
            