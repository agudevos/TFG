# Generated by Django 5.0.6 on 2024-05-15 20:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auction', '0001_initial'),
        ('bar', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='auction',
            name='bar',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='bar.bar'),
        ),
    ]