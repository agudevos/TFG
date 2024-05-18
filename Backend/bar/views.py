from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Bar
from .serializers import BarSerializer

@permission_classes([IsAuthenticated])
class BarListView(APIView):
    def get(self, request):
        bars = Bar.objects.all()
        serializer = BarSerializer(bars, many=True)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class BarCreateView(APIView):
    def post(self, request):
        serializer = BarSerializer(data=request.data)
        if serializer.is_valid():
            bar = serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class BarDetailView(APIView):
    def get(self, request, pk):
        bar = get_object_or_404(Bar, pk=pk)
        serializer = BarSerializer(bar)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class BarUpdateView(APIView):
    def put(self, request, pk):
        bar = get_object_or_404(Bar, pk=pk)
        serializer = BarSerializer(bar, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class BarDeleteView(APIView):
    def delete(self, request, pk):
        bar = get_object_or_404(Bar, pk=pk)
        bar.delete()
        return Response(status=204)
