from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.auth.tokens import default_token_generator
from django.utils.translation import gettext_lazy as _
from django.core.mail import send_mail
from .managermodel import CustomUserManager
from random import randint
from django.core.validators import RegexValidator

from .validators import UnicodeUsernameValidator


class CustomUser(AbstractBaseUser, PermissionsMixin):
    def random_id():
        return randint(100000, 999999)

    def gen_verification_token(self):
        return default_token_generator.make_token(self)

    ROL_CHOICES = (
        ('admin', 'Admin'),
        ('client', 'Client'),
        ('worker', 'Worker'),
    )

    username_validator = UnicodeUsernameValidator()

    username = models.CharField(
        max_length=150,
        unique=True,
        help_text=_(
            "Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only."
        ),
        primary_key=True,
        validators=[username_validator],
        error_messages={
            "unique": _("A user with that username already exists."),
        },
    )
    email = models.EmailField(unique=True, default="a@gmail.com")
    name = models.CharField(max_length=75, default="a")
    surname = models.CharField(max_length=75, default="a")
    phone_number = models.PositiveIntegerField(default=123456789, validators=[RegexValidator(r'^[0-9]{6}', message="El número de teléfono debe contener solo dígitos y una longitud de 6 dígitos.")])
    birthday = models.DateField(default="2000-01-01")
    date_joined = models.DateTimeField(_("date joined"), default=timezone.now)
    rol = models.CharField(max_length=100, choices=ROL_CHOICES, default='client')
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True,
        verbose_name='groups',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True,
        verbose_name='user permissions',
    )

    objects = CustomUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.username
