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
from .models import Auction
from bid.models import Bid
from dateutil.parser import parse

class AuctionViewsTestCase(TestCase):
    def setUp(self):
        self.client_api = APIClient()
        # Usuario worker y cliente
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
        self.establishment = Establishment.objects.create(
            name='Test Establishment',
            description='Descripción de prueba',
            location='Fake Street 123',
            platforms='movistar+',
            subscription='free',
            customer_id='CUST12345',
            owner=self.owner_worker
        )
        self.service = Service.objects.create(
            name='Test Service',
            description='Service description',
            category='Category1',
            max_people=10,
            max_reservation=5,
            deposit=100,
            establishment=self.establishment
        )
        now = timezone.now()
        self.auction = Auction.objects.create(
            starting_date=now - timedelta(days=1),
            end_date=now + timedelta(days=1),
            starting_bid=100,
            time_frame=10,
            service=self.service
        )
        self.auction2 = Auction.objects.create(
            starting_date=now - timedelta(days=2),
            end_date=now - timedelta(days=1),
            starting_bid=200,
            time_frame=12,
            service=self.service
        )
        self.bid = Bid.objects.create(
            send_date=now,
            event='event1',
            platform='web',
            quantity=120,
            winner=True,
            auction=self.auction,
            client=self.client_obj
        )

    def authenticate(self, user):
        self.client_api.force_authenticate(user=user)

    def test_auction_list_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('auction_list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)

    def test_auction_list_unauthenticated(self):
        url = reverse('auction_list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_auction_create_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('auction_create')
        data = {
            "starting_date": (timezone.now() + timedelta(days=2)).isoformat(),
            "end_date": (timezone.now() + timedelta(days=3)).isoformat(),
            "starting_bid": 300,
            "time_frame": 8,
            "service": self.service.id
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['starting_bid'], 300)

    def test_auction_create_unauthenticated(self):
        url = reverse('auction_create')
        data = {
            "starting_date": (timezone.now() + timedelta(days=2)).isoformat(),
            "end_date": (timezone.now() + timedelta(days=3)).isoformat(),
            "starting_bid": 300,
            "time_frame": 8,
            "service": self.service.id
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_auction_detail_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('auction_detail', args=[self.auction.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.auction.id)

    def test_auction_detail_unauthenticated(self):
        url = reverse('auction_detail', args=[self.auction.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_auction_delete_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('auction_delete', args=[self.auction2.id])
        response = self.client_api.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Auction.objects.filter(id=self.auction2.id).exists())

    def test_auction_delete_unauthenticated(self):
        url = reverse('auction_delete', args=[self.auction2.id])
        response = self.client_api.delete(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_auction_events_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('service_events', args=[self.auction.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)

    def test_auction_events_unauthenticated(self):
        url = reverse('service_events', args=[self.auction.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_auction_list_by_service_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('service_events', args=[self.service.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(all(a['service'] == self.service.id for a in response.data))

    def test_auction_list_by_service_unauthenticated(self):
        url = reverse('service_events', args=[self.service.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_auction_active_list_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('auction_active')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for auction in response.data:
            end_date = parse(auction['end_date'])
            self.assertLessEqual(
                timezone.now(),
                end_date
            )

    def test_auction_active_list_unauthenticated(self):
        url = reverse('auction_active')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_auction_bid_list_authenticated_client(self):
        self.authenticate(self.client_user)
        url = reverse('auction_bid')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for auction in response.data:
            self.assertIn('id', auction)

    def test_auction_bid_list_authenticated_worker(self):
        self.authenticate(self.owner_user)
        url = reverse('auction_bid')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_auction_bid_list_unauthenticated(self):
        url = reverse('auction_bid')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)