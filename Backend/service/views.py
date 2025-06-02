from collections import defaultdict
from datetime import datetime, time
import os
from django.shortcuts import get_object_or_404, render
from dotenv import load_dotenv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from user.models import CustomUser
from worker.models import Worker
from schedule.serializers import SlotAssignmentSerializer
from schedule.models import SlotAssignment
from service.models import Service, ServicePriceAssignment
from .serializers import ServicePriceAssignmentSerializer, ServiceSerializer

from .recomendation import generate_service_price_recomendation

from django.db.models import Q


@permission_classes([IsAuthenticated])
class ServiceCreateView(APIView):
    def post(self, request):
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
        start_time = item['time_slot_details']['start_time']
        end_time = item['time_slot_details']['end_time']
        price = float(item['price'])
        category = item['service_details']['category']
    
        if not start_time or not end_time or not price:
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
        load_dotenv()

        # Acceder a las variables
        OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
        
        ids = ServicePriceAssignment.objects.filter(bookable = True)
        prices = ServicePriceAssignmentSerializer(ids, many=True)
        data_list = []
        for item in prices.data:
            dict={}
            dict['id'] = item['id']
            dict['price'] = float(item['price'])
            dict['category'] = item['service_details']['category']
            dict['max_reservation'] = item['service_details']['max_reservation']
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
            