# Generated by Django 5.0.6 on 2025-04-05 18:13

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bid', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bid',
            name='send_date',
            field=models.DateTimeField(blank=True, default=datetime.datetime(2025, 4, 5, 18, 13, 5, 36723)),
        ),
    ]
