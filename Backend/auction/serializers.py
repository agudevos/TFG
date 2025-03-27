from rest_framework import serializers
from .models import Auction
from django.db.models import Q

class AuctionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Auction
        fields = '__all__'
    

    def validate_end_date(self, value):
        """
        Comprobar que no hayan otras pujas activas para el mismo servicio a al vez
        """

        auctions = Auction.objects.filter(
            Q(
                # Inicio del nuevo objeto dentro de un intervalo existente
                Q(starting_date__lte=self.starting_date) & 
                Q(end_date__gte=self.starting_date)
            ) | Q(
                # Fin del nuevo objeto dentro de un intervalo existente
                Q(starting_date__lte=value) & 
                Q(end_date__gte=value)
            ) | Q(
                # Nuevo objeto completamente dentro de un intervalo existente
                Q(starting_date__gte=self.starting_date) & 
                Q(end_date__lte=value)
            )
        )

        if auctions.exists():
            raise serializers.ValidationError("There is an active auction for this service that overlaps with this one")
        
        return value

