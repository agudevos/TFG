# views.py
from django.shortcuts import render, redirect, get_object_or_404
from .models import Client
from .serializers import ClientSerializer

def client_list(request):
    clients = Client.objects.all()
    return render(request, 'client/client_list.html', {'clients': clients})

def client_detail(request, pk):
    client = get_object_or_404(Client, pk=pk)
    return render(request, 'client/client_detail.html', {'client': client})

def client_create(request):
    if request.method == 'POST':
        serializer = ClientSerializer(request.POST)
        if serializer.is_valid():
            client = serializer.save()
            return redirect('client_detail', pk=client.pk)
    else:
        serializer = ClientSerializer()
    return render(request, 'client/client_serializer.html', {'serializer': serializer})

def client_update(request, pk):
    client = get_object_or_404(Client, pk=pk)
    if request.method == 'POST':
        serializer = ClientSerializer(request.POST, instance=client)
        if serializer.is_valid():
            client = serializer.save()
            return redirect('client_detail', pk=client.pk)
    else:
        serializer = ClientSerializer(instance=client)
    return render(request, 'client/client_serializer.html', {'serializer': serializer})

def client_delete(request, pk):
    client = get_object_or_404(Client, pk=pk)
    if request.method == 'POST':
        client.delete()
        return redirect('client_list')
    return render(request, 'client/client_confirm_delete.html', {'client': client})

