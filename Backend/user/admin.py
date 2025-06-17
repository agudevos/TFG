from django.contrib import admin
from django.contrib.auth.admin import UserAdmin  
from django.contrib.auth.models import User 
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'rol', 'is_staff', 'is_verified']
    search_fields = ['username', 'rol']
    # Redefine completamente los fieldsets
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información Personal', {
            'fields': ('name', 'surname', 'email', 'phone_number', 'birthday', 'rol')
        }),
        ('Permisos', {
            'fields': ('is_active', 'is_staff', 'is_verified', 'groups', 'user_permissions')
        }),
        ('Fechas Importantes', {
            'fields': ('date_joined',)
        }),
    )

    # Personaliza también los add_fieldsets
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 
                       'name', 'surname', 'email', 
                       'phone_number', 'birthday', 'rol', 
                       'is_staff', 'is_active', 'is_verified')
        }),
    )
admin.site.register(CustomUser, CustomUserAdmin)
