from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from user.models import CustomUser
from client.models import Client
from service.models import Service
from establishment.models import Establishment
from worker.models import Worker
from .models import Reservation

class ReservationViewsTestCase(TestCase):
    def setUp(self):
        self.client_api = APIClient()

        # Crear usuario cliente
        self.user_client = CustomUser.objects.create_user(
            username='client1',
            password='pass',
            rol='client',
            email='client1@example.com',
            name='Client',
            surname='One'
        )
        self.client_obj = Client.objects.create(
            user=self.user_client,
            gender='male',
            zip_code=12345,
            credits=1000,
            preferences='pref1'
        )

        # Crear usuario worker y establecimiento
        self.user_owner = CustomUser.objects.create_user(
            username='owner1',
            password='pass',
            rol='worker',
            email='owner1@example.com',
            name='Owner',
            surname='One'
        )
        self.owner_worker = Worker.objects.create(
            user=self.user_owner,
            rol='owner'
        )
        self.establishment = Establishment.objects.create(
            name='Test Establishment',
            description='Descripción de prueba',
            location='Fake Street 123',
            platforms='web',
            subscription='free',
            customer_id='CUST12345',
            owner=self.owner_worker
        )
        # Crear servicio
        self.service = Service.objects.create(
            name='Test Service',
            description='Service description',
            category='Category1',
            max_people=10,
            max_reservation=5,
            deposit=100,
            establishment=self.establishment
        )

        # Fechas para reservas
        self.start = timezone.now() + timedelta(days=1)
        self.end = self.start + timedelta(hours=2)

        # Crear reserva
        self.reservation = Reservation.objects.create(
            starting_date=self.start,
            end_date=self.end,
            client=self.client_obj,
            service=self.service
        )

    def authenticate(self, user):
        self.client_api.force_authenticate(user=user)

    def test_list_reservations_authenticated(self):
        self.authenticate(self.user_client)
        url = reverse('reservation-list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)

    def test_list_reservations_unauthenticated(self):
        url = reverse('reservation-list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_reservations_by_client(self):
        self.authenticate(self.user_client)
        url = reverse('reservation-list-by-client')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(r['client'] == self.client_obj.id for r in response.data))

    def test_list_reservations_by_service(self):
        self.authenticate(self.user_client)
        url = reverse('reservation-list-by-service', args=[self.service.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(r['service'] == self.service.id for r in response.data))

    def test_create_reservation_authenticated(self):
        self.authenticate(self.user_client)
        url = reverse('reservation-create')
        data = {
            "starting_date": (timezone.now() + timedelta(days=2)).isoformat(),
            "end_date": (timezone.now() + timedelta(days=2, hours=2)).isoformat(),
            "service": self.service.id
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['service'], self.service.id)

    def test_create_reservation_unauthenticated(self):
        url = reverse('reservation-create')
        data = {
            "starting_date": (timezone.now() + timedelta(days=2)).isoformat(),
            "end_date": (timezone.now() + timedelta(days=2, hours=2)).isoformat(),
            "service": self.service.id
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_reservation_detail_authenticated(self):
        self.authenticate(self.user_client)
        url = reverse('reservation-detail', args=[self.reservation.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.reservation.id)

    def test_reservation_detail_unauthenticated(self):
        url = reverse('reservation-detail', args=[self.reservation.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_reservation_authenticated(self):
        self.authenticate(self.user_client)
        url = reverse('reservation-delete', args=[self.reservation.id])
        response = self.client_api.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Reservation.objects.filter(id=self.reservation.id).exists())

    def test_delete_reservation_unauthenticated(self):
        url = reverse('reservation-delete', args=[self.reservation.id])
        response = self.client_api.delete(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)