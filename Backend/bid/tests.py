from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from datetime import timedelta
from django.utils import timezone

from establishment.models import Establishment
from worker.models import Worker
from .models import Bid
from user.models import CustomUser
from auction.models import Auction
from client.models import Client
from service.models import Service

# Backend/bid/test_tests.py


User = get_user_model()

class BidViewsTestCase(TestCase):
    def setUp(self):
        self.client_api = APIClient()
        # Usuarios
        self.user_client = CustomUser.objects.create_user(
            username='client1',
            password='pass',
            rol='client',
            email='client1@example.com',
            name='Client',
            surname='One'
        )
        self.user_other = CustomUser.objects.create_user(
            username='other',
            password='pass',
            rol='client',
            email='other@example.com',
            name='Other',
            surname='User'
        )
        # Clientes
        self.client1 = Client.objects.create(
            user=self.user_client,
            gender='male',
            zip_code=12345,
            credits=1000,
            preferences='pref1'
        )
        self.client2 = Client.objects.create(
            user=self.user_other,
            gender='female',
            zip_code=54321,
            credits=500,
            preferences='pref2'
        )
        # Dueño del establecimiento
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
        # Establecimiento
        # Establecimiento
        self.establishment = Establishment.objects.create(
            name='Test Establishment',
            description='Descripción de prueba',
            location='Fake Street 123',
            platforms='web',
            subscription='free',
            customer_id='CUST12345',
            owner=self.owner_worker
        )
        # Servicio
        self.service = Service.objects.create(
            name='Test Service',
            description='Service description',
            category='Category1',
            max_people=10,
            max_reservation=5,
            deposit=100,
            establishment=self.establishment
        )
        # Subastas
        now = timezone.now()
        self.auction = Auction.objects.create(
            starting_date=now - timedelta(days=1),
            end_date=now + timedelta(days=1),
            starting_bid=100,
            time_frame=10,
            service=self.service
        )
        self.auction_ended = Auction.objects.create(
            starting_date=now - timedelta(days=3),
            end_date=now - timedelta(days=1),
            starting_bid=100,
            time_frame=10,
            service=self.service
        )
        # Bids
        self.bid1 = Bid.objects.create(
            send_date=timezone.now(),
            event='event1',
            platform='platform1',
            quantity=150,
            winner=False,
            auction=self.auction,
            client=self.client1
        )
        self.bid2 = Bid.objects.create(
            send_date=timezone.now(),
            event='event1',
            platform='platform1',
            quantity=200,
            winner=False,
            auction=self.auction,
            client=self.client2
        )
        self.bid3 = Bid.objects.create(
            send_date=timezone.now(),
            event='event2',
            platform='platform2',
            quantity=300,
            winner=False,
            auction=self.auction,
            client=self.client1
        )

    def authenticate(self, user):
        self.client_api.force_authenticate(user=user)

    def test_bid_list_view_authenticated(self):
        self.authenticate(self.user_client)
        url = reverse('bid_list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_bid_list_view_unauthenticated(self):
        url = reverse('bid_list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_bid_list_by_auction_view_grouping(self):
        self.authenticate(self.user_client)
        url = reverse('bid_by_auction_list', args=[self.auction.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected = [
            {'event': 'event1', 'platform': 'platform1', 'total_quantity': 350},
            {'event': 'event2', 'platform': 'platform2', 'total_quantity': 300}
        ]
        for item in expected:
            self.assertIn(item, response.data)
        self.assertEqual(len(response.data), 2)

    def test_bid_list_by_auction_view_no_bids(self):
        self.authenticate(self.user_client)
        url = reverse('bid_by_auction_list', args=[self.auction_ended.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_bid_list_by_auction_view_unauthenticated(self):
        url = reverse('bid_by_auction_list', args=[self.auction.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_bid_detail_view_authenticated(self):
        self.authenticate(self.user_client)
        url = reverse('bid_detail', args=[self.bid1.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.bid1.id)

    def test_bid_detail_view_unauthenticated(self):
        url = reverse('bid_detail', args=[self.bid1.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_bid_create_view_authenticated(self):
        self.authenticate(self.user_client)
        url = reverse('bid_create')
        data = {
            'event': 'event3',
            'platform': 'platform3',
            'quantity': 500,
            'winner': False,
            'auction': self.auction.id
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['event'], 'event3')
        self.assertEqual(response.data['platform'], 'platform3')

    def test_bid_create_view_unauthenticated(self):
        url = reverse('bid_create')
        data = {
            'event': 'event5',
            'platform': 'platform5',
            'quantity': 500,
            'winner': False,
            'auction': self.auction.id
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)