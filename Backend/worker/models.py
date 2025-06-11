from django.db import models
from random import randint
from user.models import CustomUser
from django.core.validators import RegexValidator

class Worker(models.Model):

    def random_id():
        return randint(100000, 999999)
    
    WORKER_ROL = (
        ("owner", "Owner"),
        ("regular", "Regular")
    )
    rol = models.CharField(choices=WORKER_ROL)

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)