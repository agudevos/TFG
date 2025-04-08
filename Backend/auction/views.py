import os
from urllib.request import Request
from django.shortcuts import render, redirect, get_object_or_404
from dotenv import load_dotenv
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from auction.recomendation import generate_starting_bid_recommendation
from service.models import Service
from service.views import ServicePriceForDateView
from .models import Auction
from .serializers import AuctionSerializer
from .scraping import obtener_programacion
import pandas as pd

@permission_classes([IsAuthenticated])
class AuctionListView(APIView):
    def get(self, request):
        auctions = Auction.objects.all()
        serializer = AuctionSerializer(auctions, many=True)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class AuctionCreateView(APIView):
    def post(self, request):
        serializer = AuctionSerializer(data=request.data)
        if serializer.is_valid():
            auction = serializer.save()
            return Response(serializer.data, status=201)
        print(serializer.errors)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class AuctionDetailView(APIView):
    def get(self, request, pk):
        auction = get_object_or_404(Auction, pk=pk)
        serializer = AuctionSerializer(auction)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class AuctionUpdateView(APIView):
    def put(self, request, pk):
        auction = get_object_or_404(Auction, pk=pk)
        serializer = AuctionSerializer(auction, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class AuctionDeleteView(APIView):
    def delete(self, request, pk):
        auction = get_object_or_404(Auction, pk=pk)
        auction.delete()
        return Response(status=204)
    
@permission_classes([IsAuthenticated])
class AuctionEventsView(APIView):
    def get(self, request, pk):
        auction = get_object_or_404(Auction, pk=pk)
        eventos = obtener_programacion(auction.service.establishment.platforms, auction.end_date)
        return Response(eventos)
    
@permission_classes([IsAuthenticated])
class AuctionPriceRecomendation(APIView):
    
    def get(self, request, date, service_id):
        load_dotenv()

        # Acceder a las variables
        OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
        
        data = Auction.objects.raw(f"""
            SELECT 
                a.id,
                a.starting_bid,
                a.end_date,
                a.time_frame,
                s.category,
                b.quantity
            FROM 
                auction_auction a
            JOIN 
                service_service s ON s.id = a.service_id
            JOIN 
                bid_bid b ON b.auction_id = a.id
            WHERE 
                b.winner = true
            ORDER BY 
                a.end_date DESC
            LIMIT 100
            """
            )
        data_list = [{
                'id': item.id,
                'starting_bid': item.starting_bid,
                'end_date': item.end_date,
                'time_frame': item.time_frame,
                'category': item.category,
                'quantity': item.quantity
        } for item in data]

        service = get_object_or_404(Service, pk=service_id)
        view = ServicePriceForDateView()
        response = ServicePriceForDateView.get(view, request, date=date,service_id=service_id).data
        if response:
            estimated_value = response[0]['price']
        else:
            estimated_value=0

        print(estimated_value)

        result = generate_starting_bid_recommendation(
                api_key=OPENAI_API_KEY,
                historical_data_list=data_list,
                service_category=service.category,
                estimated_value=float(estimated_value),
                end_date=date
            )
        
        
        return Response(result)
