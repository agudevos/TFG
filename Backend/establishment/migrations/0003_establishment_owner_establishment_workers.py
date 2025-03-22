# Generated by Django 5.0.6 on 2025-03-22 21:06

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('establishment', '0002_initial'),
        ('worker', '0002_worker_delete_client'),
    ]

    operations = [
        migrations.AddField(
            model_name='establishment',
            name='owner',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='worker.worker'),
        ),
        migrations.AddField(
            model_name='establishment',
            name='workers',
            field=models.ManyToManyField(blank=True, related_name='establishment_workers', to='worker.worker', verbose_name='workers'),
        ),
    ]
