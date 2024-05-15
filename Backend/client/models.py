from django.db import models
from random import randint
from user.models import CustomUser

class Client(models.Models):

    def random_id():
        return randint(100000, 999999)
    
    GENDER_CHOICE = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    )

    id = models.PositiveIntegerField(primary_key=True, default=random_id, editable=False)

    name = models.CharField(max_length=75)
    surname = models.CharField(max_length=75)
    birthday = models.DateField()
    gender = models.CharField(max_length=50, choices=GENDER_CHOICE)
    description = models.CharField(max_length=100)
    credits = models.IntegerField(max_length=100)
    preferences = models.CharField(max_length=100)
    

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)