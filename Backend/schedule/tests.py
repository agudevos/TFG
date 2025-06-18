from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import time, date, timedelta

from .models import (
    TimeSlot, WeeklySchedule, SpecificSchedule, SlotAssignment
)
from user.models import CustomUser

class ScheduleViewsTestCase(TestCase):
    def setUp(self):
        self.client_api = APIClient()
        # Usuario autenticado
        self.user = CustomUser.objects.create_user(
            username='testuser',
            password='pass',
            rol='worker',
            email='testuser@example.com',
            name='Test',
            surname='User'
        )
        self.client_api.force_authenticate(user=self.user)

        # Crear un TimeSlot
        self.timeslot = TimeSlot.objects.create(
            name="Mañana",
            start_time=time(8, 0),
            end_time=time(12, 0),
            color="#ff0000"
        )
        self.timeslot2 = TimeSlot.objects.create(
            name="Tarde",
            start_time=time(16, 0),
            end_time=time(20, 0),
            color="#00ff00"
        )

        # Crear un WeeklySchedule (martes)
        self.weekly_schedule = WeeklySchedule.objects.create(
            name="Horario Martes",
            weekday=1,  # Martes
            active=True
        )

        # Asignar el timeslot al horario semanal
        self.slot_assignment = SlotAssignment.objects.create(
            time_slot=self.timeslot,
            order=1,
            weekly_schedule=self.weekly_schedule
        )

        # Crear un SpecificSchedule para una fecha concreta
        self.specific_date = (timezone.now() + timedelta(days=(7 - timezone.now().weekday()))).date()  # próximo lunes
        self.specific_schedule = SpecificSchedule.objects.create(
            name="Horario Especial",
            date=self.specific_date,
            active=True
        )
        self.specific_slot_assignment = SlotAssignment.objects.create(
            time_slot=self.timeslot2,
            order=1,
            specific_schedule=self.specific_schedule
        )

    def test_timeslot_list(self):
        url = reverse('time-slots-list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_timeslot_detail(self):
        url = reverse('time-slots-detail', args=[self.timeslot.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.timeslot.name)

    def test_create_timeslot(self):
        url = reverse('time-slots-list')
        data = {
            "name": "Noche",
            "start_time": "22:00:00",
            "end_time": "23:59:00",
            "color": "#0000ff"
        }
        response = self.client_api.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], "Noche")

    def test_weekly_schedule_list(self):
        url = reverse('weekly-schedules-list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_weekly_schedule_detail(self):
        url = reverse('weekly-schedules-detail', args=[self.weekly_schedule.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.weekly_schedule.name)

    def test_create_weekly_schedule(self):
        url = reverse('weekly-schedules-list')
        data = {
            "name": "Horario Miercoles",
            "weekday": 2,
            "active": True
        }
        response = self.client_api.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], "Horario Miercoles")

    def test_specific_schedule_list(self):
        url = reverse('specific-schedules-list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_specific_schedule_detail(self):
        url = reverse('specific-schedules-detail', args=[self.specific_schedule.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.specific_schedule.name)

    def test_create_specific_schedule(self):
        url = reverse('specific-schedules-list')
        data = {
            "name": "Horario Especial 2",
            "date": (self.specific_date + timedelta(days=1)).isoformat(),
            "active": True
        }
        response = self.client_api.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], "Horario Especial 2")

    def test_slot_assignment_list(self):
        url = reverse('slot-assignment-list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_create_slot_assignment_weekly(self):
        url = reverse('slot-assignment-list')
        data = {
            "time_slot": self.timeslot2.id,
            "weekly_schedule": self.weekly_schedule.id,
            "order": 2,
            "notes": "Extra"
        }
        response = self.client_api.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['weekly_schedule'], self.weekly_schedule.id)

    def test_create_slot_assignment_specific(self):
        url = reverse('slot-assignment-list')
        data = {
            "time_slot": self.timeslot.id,
            "specific_schedule": self.specific_schedule.id,
            "order": 2,
            "notes": "Especial"
        }
        response = self.client_api.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['specific_schedule'], self.specific_schedule.id)

    def test_slot_assignment_detail(self):
        url = reverse('slot-assignment-detail', args=[self.slot_assignment.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.slot_assignment.id)

    def test_get_schedule_for_date_weekly(self):
        # Fecha sin horario específico, debe devolver el weekly
        today = timezone.now().date()
        days_ahead = (1 - today.weekday()) % 7  # 0 = lunes
        test_date = today + timedelta(days=days_ahead)
        url = reverse('schedule-for-date', args=[test_date.isoformat()])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('time_slots', response.data)
        self.assertEqual(response.data['schedule_name'], self.weekly_schedule.name)

    def test_get_schedule_for_date_specific(self):
            # Fecha con horario específico, debe devolver el específico
            url = reverse('schedule-for-date', args=[self.specific_date.isoformat()])
            response = self.client_api.get(url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('time_slots', response.data)
            self.assertTrue(self.specific_schedule.name in response.data['schedule_name'])