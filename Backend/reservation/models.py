from django.db import models
from random import randint
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from service.models import Service
from client.models import Client

class Reservation(models.Model):

    def random_id():
        return randint(100000, 999999)

    starting_date = models.DateTimeField()
    end_date = models.DateTimeField()

    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)