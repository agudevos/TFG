from django.db import models
from random import randint
from user.models import CustomUser
from django.core.validators import RegexValidator

class Client(models.Model):

    def random_id():
        return randint(100000, 999999)
    
    WORKER_ROL = (
        ("owner", "Owner"),
        ("regular", "Regular")
    )

    id = models.PositiveIntegerField(primary_key=True, default=random_id, editable=False)
    rol = models.CharField(choices=WORKER_ROL)