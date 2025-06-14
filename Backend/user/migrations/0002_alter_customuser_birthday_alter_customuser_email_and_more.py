# Generated by Django 5.0.6 on 2025-04-05 18:13

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='birthday',
            field=models.DateField(default='01/01/200'),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='email',
            field=models.EmailField(default='a@gmail.com', max_length=254, unique=True),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='name',
            field=models.CharField(default='a', max_length=75),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='phone_number',
            field=models.PositiveIntegerField(default=123456789, validators=[django.core.validators.RegexValidator('^[0-9]{6}', message='El número de teléfono debe contener solo dígitos y una longitud de 6 dígitos.')]),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='surname',
            field=models.CharField(default='a', max_length=75),
        ),
    ]
