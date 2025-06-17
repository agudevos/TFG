from datetime import timedelta
from django.utils import timezone
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from auction.models import Auction
from bid.models import Bid
from client.models import Client
from user.models import CustomUser
from worker.models import Worker
from .models import Establishment

class EstablishmentViewsTestCase(TestCase):
    def setUp(self):
        self.client_api = APIClient()
        # Dueño (owner)
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
        # Otro trabajador regular
        self.worker_user = CustomUser.objects.create_user(
            username='worker1',
            password='pass',
            rol='worker',
            email='worker1@example.com',
            name='Worker',
            surname='Regular'
        )
        self.worker = Worker.objects.create(
            user=self.worker_user,
            rol='regular'
        )
        # Clientes para las pujas
        self.client_user1 = CustomUser.objects.create_user(
            username='client1',
            password='pass',
            rol='client',
            email='client1@example.com',
            name='Client',
            surname='One'
        )
        self.client_obj1 = Client.objects.create(
            user=self.client_user1,
            gender='male',
            zip_code=12345,
            credits=1000,
            preferences='pref1'
        )
        self.client_user2 = CustomUser.objects.create_user(
            username='client2',
            password='pass',
            rol='client',
            email='client2@example.com',
            name='Client',
            surname='Two'
        )
        self.client_obj2 = Client.objects.create(
            user=self.client_user2,
            gender='female',
            zip_code=54321,
            credits=800,
            preferences='pref2'
        )
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
        # Servicio asociado al establecimiento
        from service.models import Service
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
        # Subasta 1
        self.auction1 = Auction.objects.create(
            starting_date=now - timedelta(days=2, minutes=30),
            end_date=now - timedelta(days=2),
            starting_bid=100,
            time_frame=10,
            service=self.service
        )
        # Subasta 2
        self.auction2 = Auction.objects.create(
            starting_date=now - timedelta(days=10, hours=2),
            end_date=now - timedelta(days=10),
            starting_bid=150,
            time_frame=12,
            service=self.service
        )
        # Subasta 3
        self.auction3 = Auction.objects.create(
            starting_date=now - timedelta(days=3, hours=1),
            end_date=now - timedelta(days=3),
            starting_bid=200,
            time_frame=8,
            service=self.service
        )
        # Pujas para subasta 1
        self.bid1_1 = Bid.objects.create(
            send_date=now,
            event='event1',
            platform='web',
            quantity=120,
            winner=False,
            auction=self.auction1,
            client=self.client_obj1
        )
        self.bid1_2 = Bid.objects.create(
            send_date=now,
            event='event1',
            platform='web',
            quantity=140,
            winner=True,
            auction=self.auction1,
            client=self.client_obj2
        )
        # Pujas para subasta 2
        self.bid2_1 = Bid.objects.create(
            send_date=now,
            event='event2',
            platform='mobile',
            quantity=160,
            winner=True,
            auction=self.auction2,
            client=self.client_obj1
        )
        self.bid2_2 = Bid.objects.create(
            send_date=now,
            event='event2',
            platform='mobile',
            quantity=155,
            winner=False,
            auction=self.auction2,
            client=self.client_obj2
        )
        # Pujas para subasta 3
        self.bid3_1 = Bid.objects.create(
            send_date=now,
            event='event3',
            platform='web',
            quantity=210,
            winner=True,
            auction=self.auction3,
            client=self.client_obj2
        )
        self.bid3_2 = Bid.objects.create(
            send_date=now,
            event='event3',
            platform='web',
            quantity=205,
            winner=False,
            auction=self.auction3,
            client=self.client_obj1
        )

    def authenticate(self, user):
        self.client_api.force_authenticate(user=user)

    def test_list_establishments_authenticated_owner(self):
        self.authenticate(self.owner_user)
        url = reverse('establishment_list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Solo los establecimientos del owner
        self.assertTrue(all(e['owner'] == self.owner_worker.id for e in response.data))

    def test_list_establishments_authenticated_regular_worker(self):
        self.authenticate(self.worker_user)
        url = reverse('establishment_list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Puede ver todos los establecimientos
        self.assertTrue(any(e['id'] == self.establishment.id for e in response.data))

    def test_list_establishments_unauthenticated(self):
        url = reverse('establishment_list')
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_establishment_owner(self):
        self.authenticate(self.owner_user)
        url = reverse('establishment_create')
        data = {
            "name": "Nuevo Establecimiento",
            "description": "Desc",
            "location": "Calle Nueva",
            "platforms": "web",
            "subscription": "free",
            "customer_id": "CUST99999"
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], "Nuevo Establecimiento")

    def test_create_establishment_regular_worker(self):
        self.authenticate(self.worker_user)
        url = reverse('establishment_create')
        data = {
            "name": "No permitido",
            "description": "Desc",
            "location": "Calle Nueva",
            "platforms": "web",
            "subscription": "free",
            "customer_id": "CUST88888"
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_establishment_unauthenticated(self):
        url = reverse('establishment_create')
        data = {
            "name": "No permitido",
            "description": "Desc",
            "location": "Calle Nueva",
            "platforms": "web",
            "subscription": "free",
            "customer_id": "CUST77777"
        }
        response = self.client_api.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_detail_establishment_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('establishment_detail', args=[self.establishment.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.establishment.id)

    def test_detail_establishment_unauthenticated(self):
        url = reverse('establishment_detail', args=[self.establishment.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_establishment_owner(self):
        self.authenticate(self.owner_user)
        url = reverse('establishment_update', args=[self.establishment.id])
        data = {
            "description": "Nueva descripción"
        }
        response = self.client_api.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.establishment.refresh_from_db()
        self.assertEqual(self.establishment.description, "Nueva descripción")

    def test_update_establishment_regular_worker(self):
        self.authenticate(self.worker_user)
        url = reverse('establishment_update', args=[self.establishment.id])
        data = {
            "description": "No permitido"
        }
        response = self.client_api.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_establishment_unauthenticated(self):
        url = reverse('establishment_update', args=[self.establishment.id])
        data = {
            "description": "No permitido"
        }
        response = self.client_api.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_establishment_authenticated(self):
        self.authenticate(self.owner_user)
        url = reverse('establishment_delete', args=[self.establishment.id])
        response = self.client_api.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Establishment.objects.filter(id=self.establishment.id).exists())

    def test_delete_establishment_unauthenticated(self):
        url = reverse('establishment_delete', args=[self.establishment.id])
        response = self.client_api.delete(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_stadistics_authenticated_worker(self):
        self.authenticate(self.owner_user)
        url = reverse('stadistics', args=[self.establishment.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        # Comprobar que existen las claves principales
        self.assertIn('general', data)
        self.assertIn('por_plataforma', data)

        # Comprobar que las estadísticas generales tienen sentido
        general = data['general']
        self.assertIn('starting_bid_media', general)
        self.assertIn('quantity_media', general)
        self.assertIn('total_subastas', general)
        self.assertGreaterEqual(general['starting_bid_media'], 0)
        self.assertGreaterEqual(general['quantity_media'], 0)
        self.assertEqual(general['total_subastas'], 3)  # Hay 3 subastas con puja ganadora

        # Comprobar que hay datos por plataforma y que los nombres de plataforma son correctos
        plataformas = {b.platform for b in [self.bid1_2, self.bid2_1, self.bid3_1]}
        plataformas_respuesta = {p['platform'] for p in data['por_plataforma']}
        self.assertTrue(plataformas.issubset(plataformas_respuesta))

        # Comprobar que los valores medios por plataforma son coherentes
        for plataforma in data['por_plataforma']:
            self.assertIn('platform', plataforma)
            self.assertIn('cantidad_subastas', plataforma)
            self.assertIn('starting_bid_media', plataforma)
            self.assertIn('quantity_media', plataforma)
            self.assertGreaterEqual(plataforma['cantidad_subastas'], 1)
            self.assertGreaterEqual(plataforma['starting_bid_media'], 0)
            self.assertGreaterEqual(plataforma['quantity_media'], 0)

    def test_stadistics_unauthenticated(self):
        url = reverse('stadistics', args=[self.establishment.id])
        response = self.client_api.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)