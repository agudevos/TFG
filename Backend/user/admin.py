from django.contrib import admin
from django.contrib.auth.admin import UserAdmin  
from django.contrib.auth.models import User 
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'rol', 'is_active', 'is_staff', 'is_verified']
    search_fields = ['username', 'rol']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('rol',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('email', 'rol',)}),
    )
admin.site.register(CustomUser, CustomUserAdmin)
