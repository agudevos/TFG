# Generated by Django 5.0.6 on 2025-04-05 22:18

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('schedule', '0002_remove_timeslot_bookable_remove_timeslot_price'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='slotassignment',
            unique_together={('weekly_schedule', 'time_slot')},
        ),
    ]
