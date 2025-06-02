from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from user.models import CustomUser
from .models import Client
from .serializers import ClientSerializer

@permission_classes([IsAuthenticated])
class ClientListView(APIView):
    def get(self, request):
        clients = Client.objects.all()
        serializer = ClientSerializer(clients, many=True)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class ClientCreateView(APIView):
    def post(self, request):
        serializer = ClientSerializer(data=request.data)
        if serializer.is_valid():
            client = serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class ClientDetailView(APIView):
    def get(self, request):
        user = CustomUser.objects.get(username=request.user)
        if user.rol == "client":
            client = Client.objects.get(user=user)
            client = get_object_or_404(Client, pk=client.id)
            serializer = ClientSerializer(client)
        else:
            return Response("Inicia sesión como cliente para ver tus datos", status=403)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class ClientUpdateView(APIView):
    def put(self, request, pk):
        client = get_object_or_404(Client, pk=pk)
        serializer = ClientSerializer(client, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class ClientDeleteView(APIView):
    def delete(self, request, pk):
        client = get_object_or_404(Client, pk=pk)
        client.delete()
        return Response(status=204)
