from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Auction
from .serializers import AuctionSerializer

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
