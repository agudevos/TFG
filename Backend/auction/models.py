from django.db import models
from random import randint
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from service.models import Service

class Auction(models.Model):

    def random_id():
        return randint(100000, 999999)

    starting_date = models.DateTimeField()
    end_date = models.DateTimeField()
    starting_bid = models.IntegerField()
    time_frame = models.IntegerField()

    service = models.ForeignKey(Service, on_delete=models.CASCADE)