# Generated by Django 5.0.6 on 2025-03-22 20:50

import django.db.models.deletion
import worker.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('worker', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Worker',
            fields=[
                ('id', models.PositiveIntegerField(default=worker.models.Worker.random_id, editable=False, primary_key=True, serialize=False)),
                ('rol', models.CharField(choices=[('owner', 'Owner'), ('regular', 'Regular')])),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.DeleteModel(
            name='Client',
        ),
    ]
