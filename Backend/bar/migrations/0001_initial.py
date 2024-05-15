# Generated by Django 5.0.6 on 2024-05-15 20:21

import bar.models
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Bar',
            fields=[
                ('id', models.PositiveIntegerField(default=bar.models.Bar.random_id, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=75)),
                ('description', models.CharField(max_length=100)),
                ('location', models.CharField(max_length=100)),
                ('platforms', models.CharField(max_length=100)),
                ('preferences', models.CharField(choices=[('standard', 'Standard'), ('premium', 'Premium'), ('free', 'Free')], default='free', max_length=50, null=True)),
            ],
        ),
    ]
