from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

from client.models import Client
from .models import Bid
from .serializers import BidSerializer
from datetime import datetime

@permission_classes([IsAuthenticated])
class BidListView(APIView):
    def get(self, request):
        bids = Bid.objects.all()
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)
    
@permission_classes([IsAuthenticated])
class BidListByAuctionView(APIView):
    def get(self, request, fk):
        bids = Bid.objects.filter(auction = fk)
        serializer = BidSerializer(bids, many=True)
        summary = {}
        for bid in bids:
            key = (bid.event, bid.platform)
            if key not in summary:
                summary[key] = {
                    "event": bid.event,
                    "platform": bid.platform,
                    "total_quantity": 0
                }
            summary[key]["total_quantity"] += bid.quantity

        # Convertir el diccionario a lista
        result = list(summary.values())
        return Response(result)

@permission_classes([IsAuthenticated])
class BidCreateView(APIView):
    def post(self, request):
        if (request.user.rol == "client"):
            client = Client.objects.get(user=request.user)
            request.data['client'] = client.id
            request.data['send_date'] = datetime.now()
            serializer = BidSerializer(data=request.data)
            if serializer.is_valid():
                print(datetime.now())
                bid = serializer.save()
                return Response(serializer.data, status=201)
            print(serializer.errors)
            return Response({"error": serializer.errors}, status=400)
        return Response(
                    {
                        "message": "Por favor inicie sesión como el cliente para realizar una puja"
                    },
                    status=403,
                )

@permission_classes([IsAuthenticated])
class BidDetailView(APIView):
    def get(self, request, pk):
        bid = get_object_or_404(Bid, pk=pk)
        serializer = BidSerializer(bid)
        return Response(serializer.data)

@permission_classes([IsAuthenticated])
class BidUpdateView(APIView):
    def put(self, request, pk):
        bid = get_object_or_404(Bid, pk=pk)
        serializer = BidSerializer(bid, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

@permission_classes([IsAuthenticated])
class BidDeleteView(APIView):
    def delete(self, request, pk):
        bid = get_object_or_404(Bid, pk=pk)
        bid.delete()
        return Response(status=204)
