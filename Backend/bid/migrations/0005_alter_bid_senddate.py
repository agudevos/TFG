# Generated by Django 5.0.6 on 2025-03-22 21:06

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('bid', '0004_alter_bid_senddate'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bid',
            name='sendDate',
            field=models.DateTimeField(default=datetime.datetime(2025, 3, 22, 22, 6, 57, 964128)),
        ),
    ]
