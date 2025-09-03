from django.db import models
from random import randint
from user.models import CustomUser
from django.core.validators import RegexValidator

class Client(models.Model):

    def random_id():
        return randint(100000, 999999)
    
    GENDER_CHOICE = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    )

    gender = models.CharField(max_length=50, choices=GENDER_CHOICE)
    zip_code = models.PositiveIntegerField(default=12345, validators=[RegexValidator(r'^[0-9]{5}$', message="El código postal debe contener 5 dígitos numéricos.")])
    credits = models.IntegerField()
    preferences = models.CharField(max_length=100)
    

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)