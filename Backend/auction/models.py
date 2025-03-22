from django.db import models
from random import randint
from django.core.validators import MinLengthValidator, MaxLengthValidator, RegexValidator
from establishment.models import Establishment

class Auction(models.Model):

    def random_id():
        return randint(100000, 999999)
    
    id = models.PositiveIntegerField(primary_key=True, default=random_id, editable=False)

    startingDate = models.DateTimeField()
    endDate = models.DateTimeField()
    startingbid = models.IntegerField()

    establishment = models.ForeignKey(Establishment, on_delete=models.CASCADE)