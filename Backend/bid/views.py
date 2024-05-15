from django.shortcuts import render, redirect, get_object_or_404
from .models import Bid
from .serializers import BidSerializer

def bid_list(request):
    bids = Bid.objects.all()
    return render(request, 'bid/bid_list.html', {'bids': bids})

def bid_detail(request, pk):
    bid = get_object_or_404(Bid, pk=pk)
    return render(request, 'bid/bid_detail.html', {'bid': bid})

def bid_create(request):
    if request.method == 'POST':
        serializer = BidSerializer(request.POST)
        if serializer.is_valid():
            bid = serializer.save()
            return redirect('bid_detail', pk=bid.pk)
    else:
        serializer = BidSerializer()
    return render(request, 'bid/bid_serializer.html', {'serializer': serializer})

def bid_update(request, pk):
    bid = get_object_or_404(Bid, pk=pk)
    if request.method == 'POST':
        serializer = BidSerializer(request.POST, instance=bid)
        if serializer.is_valid():
            bid = serializer.save()
            return redirect('bid_detail', pk=bid.pk)
    else:
        serializer = BidSerializer(instance=bid)
    return render(request, 'bid/bid_serializer.html', {'serializer': serializer})

def bid_delete(request, pk):
    bid = get_object_or_404(Bid, pk=pk)
    if request.method == 'POST':
        bid.delete()
        return redirect('bid_list')
    return render(request, 'bid/bid_confirm_delete.html', {'bid': bid})
