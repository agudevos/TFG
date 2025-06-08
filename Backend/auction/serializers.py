from rest_framework import serializers
from .models import Auction
from django.db.models import Q
from service.serializers import ServiceSerializer

class AuctionSerializer(serializers.ModelSerializer):
    service_details = ServiceSerializer(source='service', read_only=True)
    class Meta:
        model = Auction
        fields = ['id', 'service', 'starting_date', 'end_date', 'starting_bid', 'time_frame', 'service_details']
        read_only_fields = ['id']
    

    def validate(self, data):
        """
        Comprobar que no hayan otras pujas activas para el mismo servicio a la vez
        """

        auctions = Auction.objects.filter(
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

