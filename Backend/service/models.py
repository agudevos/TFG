from django.db import models
from random import randint
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from establishment.models import Establishment
from schedule.models import SlotAssignment

class Service(models.Model):

    def random_id():
        return randint(100000, 999999)
    
    id = models.PositiveIntegerField(primary_key=True, default=random_id, editable=False)
    name = models.CharField(max_length=75)
    description = models.CharField(max_length=350)
    category = models.CharField(max_length=100)
    max_people = models.PositiveIntegerField()
    max_reservation = models.PositiveIntegerField()
    deposit = models.PositiveIntegerField()
    
    establishment = models.ForeignKey(Establishment, on_delete=models.CASCADE)

class ServicePriceAssignment(models.Model):
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    bookable = models.BooleanField(default=False)

    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    time_slot = models.ForeignKey(SlotAssignment, on_delete=models.CASCADE)

    unique_together = ['time_slot', 'service']