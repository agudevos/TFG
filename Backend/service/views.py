from django.shortcuts import get_object_or_404, render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from service.models import Service
from .serializers import ServiceSerializer

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
