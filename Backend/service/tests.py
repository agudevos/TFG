from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta, time, date

from user.models import CustomUser
from worker.models import Worker
from establishment.models import Establishment
from schedule.models import SlotAssignment, WeeklySchedule, SpecificSchedule, TimeSlot
from client.models import Client
from service.models import Service, ServicePriceAssignment

class ServiceViewsTestCase(TestCase):
    def setUp(self):
        self.client_api = APIClient()
        # Crear usuario dueño y worker
        self.owner_user = CustomUser.objects.create_user(
            username='owner1',
            password='pass',
            rol='worker',
            email='owner1@example.com',
            name='Owner',
            surname='One'
        )
        self.owner_worker = Worker.objects.create(
            user=self.owner_user,
            rol='owner'
        )
        # Crear establecimiento
        self.establishment = Establishment.objects.create(
            name='Test Establishment',
            description='Descripción de prueba',
            location='Fake Street 123',
            platforms='web',
            subscription='free',
            customer_id='CUST12345',
            owner=self.owner_worker
        )
        # Crear cliente
        self.client_user = CustomUser.objects.create_user(
            username='client1',
            password='pass',
            rol='client',
            email='client1@example.com',
            name='Client',
            surname='One'
        )
        self.client_obj = Client.objects.create(
            user=self.client_user,
            gender='male',
            zip_code=12345,
            credits=1000,
            preferences='pref1'
        )
        # Crear servicio
        self.service = Service.objects.create(
            name='Billar',
            description='Mesa de billar profesional',
            category='billar',
            max_people=4,
            max_reservation=120,
            deposit=25,
            establishment=self.establishment
        )
        # Crear horarios y slots
        self.timeslot = TimeSlot.objects.create(
            name="Mañana",
            start_time=time(8, 0),
            end_time=time(12, 0),
            color="#ff0000"
        )
        self.weekly_schedule = WeeklySchedule.objects.create(
            name="Horario Lunes",
            weekday=0,  # Lunes
            active=True
        )
        self.slot_assignment = SlotAssignment.objects.create(
            time_slot=self.timeslot,
            order=1,
            weekly_schedule=self.weekly_schedule
        )
        # Horario específico para una fecha concreta
        self.specific_date = (timezone.now() + timedelta(days=(7 - timezone.now().weekday()))).date()
        self.specific_schedule = SpecificSchedule.objects.create(
            name="Horario Especial",
            date=self.specific_date,
            active=True
        )
        self.specific_slot_assignment = SlotAssignment.objects.create(
            time_slot=self.timeslot,
            order=1,
            specific_schedule=self.specific_schedule
        )
        # Crear asignación de precio
        self.price_assignment = ServicePriceAssignment.objects.create(
            price=10.50,
            bookable=True,
            service=self.service,
            time_slot=self.slot_assignment
        )

    def authenticate(self, user):
        self.client_api.force_authenticate(user=user)

    def test_service_create_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('service_list')
        data = {
            "name": "Karaoke",
            "description": "Sistema de karaoke profesional",
            "category": "",
            "max_people": 10,
            "max_reservation": 60,
            "deposit": 30,
            "establishment": self.establishment.id
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], "karaoke")
        self.assertEqual(response.data['establishment'], self.establishment.id)

    def test_service_create_unauthenticated(self):
        url = reverse('service_list')
        data = {
            "name": "Karaoke",
            "description": "Sistema de karaoke profesional",
            "max_people": 10,
            "max_reservation": 60,
            "deposit": 30,
            "establishment": self.establishment.id
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_service_detail(self):
        self.authenticate(self.owner_user)
        url = reverse('service_detail', args=[self.service.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.service.id)
        self.assertEqual(response.data['name'], self.service.name)

    def test_service_update(self):
        self.authenticate(self.owner_user)
        url = reverse('service_update', args=[self.service.id])
        data = {
            "description": "Mesa de billar americana actualizada"
        }
        response = self.client_api.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.service.refresh_from_db()
        self.assertEqual(self.service.description, "Mesa de billar americana actualizada")

    def test_service_delete_owner(self):
        self.authenticate(self.owner_user)
        url = reverse('service_delete', args=[self.service.id])
        response = self.client_api.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Service.objects.filter(id=self.service.id).exists())

    def test_service_list_by_establishment(self):
        self.authenticate(self.owner_user)
        url = reverse('service_list_establishment', args=[self.establishment.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(s['id'] == self.service.id for s in response.data))

    def test_service_fyp_authenticated(self):
        self.authenticate(self.client_user)
        url = reverse('service-fyp-list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Si el cliente no tiene reservas, debe devolver una lista vacía
        self.assertIsInstance(response.data, list)

    def test_service_fyp_unauthenticated(self):
        url = reverse('service-fyp-list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_service_price_assignment_list(self):
        self.authenticate(self.owner_user)
        url = reverse('service-price-list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(a['id'] == self.price_assignment.id for a in response.data))

    def test_service_price_assignment_create(self):
        self.authenticate(self.owner_user)
        url = reverse('service-price-list')
        data = {
            "price": 15.00,
            "bookable": True,
            "service": self.service.id,
            "time_slot": self.specific_slot_assignment.id
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(float(response.data['price']), 15.00)
        self.assertEqual(response.data['service'], self.service.id)
        self.assertEqual(response.data['time_slot'], self.specific_slot_assignment.id)

    def test_service_price_assignment_unique_constraint(self):
        self.authenticate(self.owner_user)
        url = reverse('service-price-list')
        data = {
            "price": 20.00,
            "bookable": True,
            "service": self.service.id,
            "time_slot": self.slot_assignment.id  # Ya existe para este servicio y slot
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Ya existe una asignación de precio", str(response.data))

    def test_service_price_assignment_detail(self):
        self.authenticate(self.owner_user)
        url = reverse('service-price-detail', args=[self.price_assignment.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.price_assignment.id)

    def test_service_price_assignment_update(self):
        self.authenticate(self.owner_user)
        url = reverse('service-price-detail', args=[self.price_assignment.id])
        data = {
            "price": 12.00,
            "bookable": False,
            "service": self.service.id,
            "time_slot": self.slot_assignment.id
        }
        response = self.client_api.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.price_assignment.refresh_from_db()
        self.assertEqual(float(self.price_assignment.price), 12.00)
        self.assertFalse(self.price_assignment.bookable)

    def test_service_price_assignment_delete(self):
        self.authenticate(self.owner_user)
        url = reverse('service-price-detail', args=[self.price_assignment.id])
        response = self.client_api.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ServicePriceAssignment.objects.filter(id=self.price_assignment.id).exists())

    def test_service_price_by_service(self):
        self.authenticate(self.owner_user)
        url = reverse('service-price-by-service', args=[self.service.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(a['service'] == self.service.id for a in response.data))

    def test_service_price_for_date_weekly(self):
        self.authenticate(self.owner_user)
        # Usar un lunes, que es el día para el que hay WeeklySchedule
        today = timezone.now().date()
        days_ahead = (0 - today.weekday()) % 7  # 0 = lunes
        test_date = today + timedelta(days=days_ahead)
        url = reverse('service-price-for-date', args=[test_date.isoformat(), self.service.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Debe devolver al menos una asignación de precio para ese día
        self.assertTrue(any(a['service'] == self.service.id for a in response.data))

    def test_service_price_for_date_specific(self):
        self.authenticate(self.owner_user)
        url = reverse('service-price-for-date', args=[self.specific_date.isoformat(), self.service.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Si hay asignación específica, debe aparecer
        # NOTA: Si no hay, la respuesta puede ser vacía, pero no debe dar error
        self.assertIsInstance(response.data, list)