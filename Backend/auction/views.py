# views.py
from django.shortcuts import render, redirect, get_object_or_404
from .models import Auction
from .serializers import AuctionSerializer

def auction_list(request):
    auctions = Auction.objects.all()
    return render(request, 'auction/auction_list.html', {'auctions': auctions})

def auction_detail(request, pk):
    auction = get_object_or_404(Auction, pk=pk)
    return render(request, 'auction/auction_detail.html', {'auction': auction})

def auction_create(request):
    if request.method == 'POST':
        serializer = AuctionSerializer(request.POST)
        if serializer.is_valid():
            auction = serializer.save()
            return redirect('auction_detail', pk=auction.pk)
    else:
        serializer = AuctionSerializer()
    return render(request, 'auction/auction_serializer.html', {'serializer': serializer})

def auction_update(request, pk):
    auction = get_object_or_404(Auction, pk=pk)
    if request.method == 'POST':
        serializer = AuctionSerializer(request.POST, instance=auction)
        if serializer.is_valid():
            auction = serializer.save()
            return redirect('auction_detail', pk=auction.pk)
    else:
        serializer = AuctionSerializer(instance=auction)
    return render(request, 'auction/auction_serializer.html', {'serializer': serializer})

def auction_delete(request, pk):
    auction = get_object_or_404(Auction, pk=pk)
    if request.method == 'POST':
        auction.delete()
        return redirect('auction_list')
    return render(request, 'auction/auction_confirm_delete.html', {'auction': auction})

