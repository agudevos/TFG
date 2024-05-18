from django.db import models
from random import randint
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from auction.models import Auction
from client.models import Client
from datetime import datetime

class Bid(models.Model):

    def random_id():
        return randint(100000, 999999)
    
    id = models.PositiveIntegerField(primary_key=True, default=random_id, editable=False)

    sendDate = models.DateTimeField(default=datetime.now())
    event = models.CharField(max_length=100)
    platform = models.CharField(max_length=100)
    quantity = models.IntegerField()
    winner = models.BooleanField(default=False)

    auction = models.ForeignKey(Auction, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)