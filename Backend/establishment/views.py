from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Establishment
from .serializers import EstablishmentSerializer

@permission_classes([IsAuthenticated])
class EstablishmentListView(APIView):
    def get(self, request):
        establishments = Establishment.objects.all()
        serializer = EstablishmentSerializer(establishments, many=True)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class EstablishmentCreateView(APIView):
    def post(self, request):
        serializer = EstablishmentSerializer(data=request.data)
        if serializer.is_valid():
            establishment = serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class EstablishmentDetailView(APIView):
    def get(self, request, pk):
        establishment = get_object_or_404(Establishment, pk=pk)
        serializer = EstablishmentSerializer(establishment)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class EstablishmentUpdateView(APIView):
    def put(self, request, pk):
        establishment = get_object_or_404(Establishment, pk=pk)
        serializer = EstablishmentSerializer(establishment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class EstablishmentDeleteView(APIView):
    def delete(self, request, pk):
        establishment = get_object_or_404(Establishment, pk=pk)
        establishment.delete()
        return Response(status=204)
