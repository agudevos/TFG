from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from client.models import Client
from user.models import CustomUser
from .models import Reservation
from .serializers import ReservationSerializer, ReservationCreateSerializer
from datetime import datetime

@permission_classes([IsAuthenticated])
class ReservationListView(APIView):
    def get(self, request):
        reservations = Reservation.objects.all().select_related('client', 'service').order_by('-starting_date')
        
        # Filtros opcionales
        client_id = request.query_params.get('client_id')
        service_id = request.query_params.get('service_id')
        
        if client_id:
            reservations = reservations.filter(client_id=client_id)
        if service_id:
            reservations = reservations.filter(service_id=service_id)
        
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class ReservationListByClientView(APIView):
    def get(self, request):
        user = CustomUser.objects.get(username=request.user)
        if user.rol == "client":
            client = Client.objects.get(user=user)
            reservations = Reservation.objects.filter(client=client.id).select_related('client', 'service').order_by('-starting_date')
            serializer = ReservationSerializer(reservations, many=True)
        else:
            return Response("Inicia sesión como cliente para ver tus reservas", status=403)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class ReservationListByServiceView(APIView):
    def get(self, request, fk):
        reservations = Reservation.objects.filter(service=fk).select_related('client', 'service').order_by('-starting_date')
        serializer = ReservationSerializer(reservations, many=True)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class ReservationCreateView(APIView):
    def post(self, request):
        user=CustomUser.objects.get(username=request.user)
        if (user.rol == "client"):
            client= Client.objects.get(user=user)
            request.data["client"] = client.id
            serializer = ReservationCreateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
                
        else:
            return Response("Inicia sesión como cliente para registrar una reserva", status=403)
        print("AQUI", serializer.errors)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class ReservationDetailView(APIView):
    def get(self, request, pk):
        reservation = get_object_or_404(Reservation, pk=pk)
        serializer = ReservationSerializer(reservation)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class ReservationUpdateView(APIView):
    def put(self, request, pk):
        reservation = get_object_or_404(Reservation, pk=pk)
        serializer = ReservationCreateSerializer(reservation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            response_serializer = ReservationSerializer(reservation)
            return Response(response_serializer.data)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class ReservationDeleteView(APIView):
    def delete(self, request, pk):
        user = CustomUser.objects.get(username=request.user)
        if user.rol == "client":
            client = Client.objects.get(user=user)
            reservation = get_object_or_404(Reservation, pk=pk)
            if reservation.client != client:
                return Response("No tienes permiso para eliminar esta reserva", status=403)
            reservation.delete()
        else:
            return Response("Inicia sesión como cliente para eliminar una reserva", status=403)
        return Response(status=204)