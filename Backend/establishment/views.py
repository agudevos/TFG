from datetime import datetime
from django.shortcuts import render, redirect, get_object_or_404
import pandas as pd
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from auction.serializers import AuctionSerializer
from auction.models import Auction
from worker.models import Worker
from user.models import CustomUser
from .models import Establishment
from .serializers import EstablishmentSerializer

@permission_classes([IsAuthenticated])
class EstablishmentListView(APIView):
    def get(self, request):
        user=CustomUser.objects.get(username=request.user)
        if (user.rol == "worker"):
            worker= Worker.objects.get(user=user)
            if (worker.rol == "owner"):
                establishments = Establishment.objects.filter(owner=worker)
                serializer = EstablishmentSerializer(establishments, many=True)
        else:
            establishments = Establishment.objects.all()
            serializer = EstablishmentSerializer(establishments, many=True)
        return Response(serializer.data)
@permission_classes([IsAuthenticated])
class EstablishmentCreateView(APIView):
    def post(self, request):
        user=CustomUser.objects.get(username=request.user)
        if (user.rol == "worker"):
            worker= Worker.objects.get(user=user)
            request.data["owner"] = worker.id
            if (worker.rol == "owner"):
                serializer = EstablishmentSerializer(data=request.data)
                if serializer.is_valid():
                    establishment = serializer.save()
                    return Response(serializer.data, status=201)
            else:
                return Response("Inicia sesión como dueño para registrar un establecimiento", status=403)
        else:
            return Response("Inicia sesión como dueño para registrar un establecimiento", status=403)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class EstablishmentDetailView(APIView):
    def get(self, request, pk):
        establishment = get_object_or_404(Establishment, pk=pk)
        serializer = EstablishmentSerializer(establishment)
        return Response(serializer.data)
    
@permission_classes([IsAuthenticated])
class EstablishmentStadisticsView(APIView):
    def get(self, request, pk):
        user=CustomUser.objects.get(username=request.user)
        if (user.rol == "worker"):
            auction_stats = self.generate_auction_stats(pk)
            print(auction_stats)
            return Response(auction_stats, status=200)
        else:
            return Response("Inicia sesión como trabajador para mirar las estadísticas de un establecimiento", status=403)
    def generate_auction_stats(self, pk):
        ahora = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
        # SQL con parámetros para evitar inyección SQL
        query = """
        SELECT 
            a.id,
            a.starting_bid,
            b.quantity,
            b.platform
        FROM 
            auction_auction a
        JOIN 
            service_service s ON s.id = a.service_id
        JOIN 
            bid_bid b ON b.auction_id = a.id
        WHERE 
            b.winner = true AND a.end_date < %s AND s.establishment_id = %s
        ORDER BY 
                a.end_date DESC
        """
        
        # Ejecuta la consulta con parámetros seguros
        data = Auction.objects.raw(query, [ahora, pk])

        data_list = [{
                'id': item.id,
                'starting_bid': item.starting_bid,
                'quantity': item.quantity,
                'platform': item.platform
        } for item in data]
        
        data_frame = pd.DataFrame(data_list)

        # Verificar si hay datos
        if data_frame.empty:
            return {
                'general': {
                    'starting_bid_media': 0,
                    'quantity_media': 0,
                    'total_subastas': 0
                },
                'por_plataforma': []
            }
        
        # Estadísticas generales
        estadisticas_generales = {
            'starting_bid_media': data_frame['starting_bid'].mean(),
            'quantity_media': data_frame['quantity'].mean(),
            'total_subastas': len(data_frame)
        }
        
        # Estadísticas agrupadas por plataforma
        estadisticas_plataforma = data_frame.groupby('platform').agg({
            'id': 'count',
            'starting_bid': 'mean',
            'quantity': 'mean'
        }).reset_index()
        
        # Formatear el resultado por plataforma
        estadisticas_por_plataforma = []
        for _, row in estadisticas_plataforma.iterrows():
            estadisticas_por_plataforma.append({
                'platform': row['platform'],
                'cantidad_subastas': int(row['id']),
                'starting_bid_media': row['starting_bid'],
                'quantity_media': row['quantity']
            })
        
        # Resultado final
        resultado = {
            'general': estadisticas_generales,
            'por_plataforma': estadisticas_por_plataforma
        }
        
        return resultado


@permission_classes([IsAuthenticated])
class EstablishmentUpdateView(APIView):
    def put(self, request, pk):
        user=CustomUser.objects.get(username=request.user)
        if (user.rol == "worker"):
            worker= Worker.objects.get(user=user)
            establishment = get_object_or_404(Establishment, pk=pk)
            if (worker.rol == "owner" and establishment.owner == worker):
                serializer = EstablishmentSerializer(establishment, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data)
            else:
                return Response("Inicia sesión como dueño para registrar un establecimiento", status=403)
        else:
            return Response("Inicia sesión como dueño para registrar un establecimiento", status=403)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class EstablishmentDeleteView(APIView):
    def delete(self, request, pk):
        establishment = get_object_or_404(Establishment, pk=pk)
        establishment.delete()
        return Response(status=204)
