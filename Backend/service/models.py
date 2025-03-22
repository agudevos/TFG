from django.db import models
from random import randint
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from establishment.models import Establishment

class Service(models.Model):

    def random_id():
        return randint(100000, 999999)
    
    id = models.PositiveIntegerField(primary_key=True, default=random_id, editable=False)
    name = models.CharField(max_length=75)
    description = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    reservable = models.BooleanField(default=True, blank=True, null=True)
    price = models.PositiveIntegerField()
    maxReservation = models.PositiveIntegerField()
    
    establishment = models.ForeignKey(Establishment, on_delete=models.CASCADE)

