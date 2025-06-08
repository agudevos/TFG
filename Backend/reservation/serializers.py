from rest_framework import serializers
from .models import Reservation, Service
from client.serializers import ClientSerializer
from django.db.models import Q

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    client_details = ClientSerializer(source='client', read_only=True)
    service_details = ServiceSerializer(source='service', read_only=True)
    
    class Meta:
        model = Reservation
        fields = ['id', 'starting_date', 'end_date', 'client', 'service', 'client_details', 'service_details']
        read_only_fields = ['id']
    
    def validate(self, data):
        """
        Validar que la fecha de inicio sea anterior a la fecha de fin
        """
        if data['starting_date'] >= data['end_date']:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin")
        
        """
        Comprobar que no hayan otras pujas activas para el mismo servicio a la vez
        """

        auctions = Reservation.objects.filter(
            Q(
                # Inicio del nuevo objeto dentro de un intervalo existente
                Q(starting_date__lte=data['starting_date']) & 
                Q(end_date__gte=data['starting_date'])
            ) | Q(
                # Fin del nuevo objeto dentro de un intervalo existente
                Q(starting_date__lte=data['end_date']) & 
                Q(end_date__gte=data['end_date'])
            ) | Q(
                # Nuevo objeto completamente dentro de un intervalo existente
                Q(starting_date__gte=data['starting_date']) & 
                Q(end_date__lte=data['end_date'])
            )
        )

        if auctions.exists():
            raise serializers.ValidationError("There is an active auction for this service that overlaps with this one")
        
        return data


class ReservationCreateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para crear reservas (sin detalles anidados)
    """
    class Meta:
        model = Reservation
        fields = ['starting_date', 'end_date', 'client', 'service']
    
    def validate(self, data):
        if data['starting_date'] >= data['end_date']:
            raise serializers.ValidationError("La fecha de inicio debe ser anterior a la fecha de fin")
        return data