from django.db import models
from random import randint
from worker.models import Worker
from user.models import CustomUser

class Establishment(models.Model):

    def random_id():
        return randint(100000, 999999)
    
    SUBSCRIPTION_CHOICE = (
        ('standard', 'Standard'),
        ('premium', 'Premium'),
        ('free', 'Free')
    )

    id = models.PositiveIntegerField(primary_key=True, default=random_id, editable=False)

    name = models.CharField(max_length=75)
    description = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    platforms = models.CharField(max_length=100)
    preferences = models.CharField(max_length=50, choices=SUBSCRIPTION_CHOICE, default='free', null = True)

    owner = models.ForeignKey(Worker, on_delete=models.CASCADE)
    workers = models.ManyToManyField(
        Worker,
        related_name='establishment_workers',
        blank=True,
        verbose_name='workers',
    )

