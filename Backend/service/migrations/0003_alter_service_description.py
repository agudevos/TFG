# Generated by Django 5.0.6 on 2025-04-06 19:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('service', '0002_servicepriceassignment'),
    ]

    operations = [
        migrations.AlterField(
            model_name='service',
            name='description',
            field=models.CharField(max_length=150),
        ),
    ]
