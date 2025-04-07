from datetime import datetime
from django.shortcuts import get_object_or_404, render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from schedule.models import SlotAssignment
from service.models import Service, ServicePriceAssignment
from .serializers import ServicePriceAssignmentSerializer, ServiceSerializer

from django.db.models import Q


@permission_classes([IsAuthenticated])
class ServiceCreateView(APIView):
    def post(self, request):
        serializer = ServiceSerializer(data=request.data)
        if serializer.is_valid():
            service = serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
@permission_classes([IsAuthenticated])
class ServiceDetailView(APIView):
    def get(self, request, pk):
        service = get_object_or_404(Service, pk=pk)
        serializer = ServiceSerializer(service)
        return Response(serializer.data)
    
@permission_classes([IsAuthenticated])
class ServiceListByEstablishmentView(APIView):
    def get(self, request, fk):
        services = Service.objects.filter(establishment = fk)
        serializer = ServiceSerializer(services, many=True)
        return Response(serializer.data)
    

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
    def get(self, date, service_id):
        
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
        if service_id:
            query &= Q(service_id=service_id)
            
        # Obtener los precios de servicios
        service_prices = ServicePriceAssignment.objects.filter(query)
        serializer = ServicePriceAssignmentSerializer(service_prices, many=True)
        
        return Response(serializer.data)
