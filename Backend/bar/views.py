from django.shortcuts import render, redirect, get_object_or_404
from .models import Bar
from .serializers import BarSerializer
from rest_framework.response import Response

def bar_list(request):
    bars = Bar.objects.all()
    return render(request, 'bar/bar_list.html', {'bars': bars})

def bar_detail(request, pk):
    bar = get_object_or_404(Bar, pk=pk)
    return render(request, 'bar/bar_detail.html', {'bar': bar})

def bar_create(request):
    if request.method == 'POST':
        serializer = BarSerializer(request.POST)
        if serializer.is_valid():
            bar = serializer.save()
            return redirect('bar_detail', pk=bar.pk)
    else:
        serializer = BarSerializer()
    return Response(serializer.data)

def bar_update(request, pk):
    bar = get_object_or_404(Bar, pk=pk)
    if request.method == 'POST':
        serializer = BarSerializer(request.POST, instance=bar)
        if serializer.is_valid():
            bar = serializer.save()
            return redirect('bar_detail', pk=bar.pk)
    else:
        serializer = BarSerializer(instance=bar)
    return render(request, 'bar/bar_serializer.html', {'serializer': serializer})

def bar_delete(request, pk):
    bar = get_object_or_404(Bar, pk=pk)
    if request.method == 'POST':
        bar.delete()
        return redirect('bar_list')
    return render(request, 'bar/bar_confirm_delete.html', {'bar': bar})
