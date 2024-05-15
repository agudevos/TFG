from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'password', 'email']

    def create(self, validated_data):  # Fix the typo here
        password = validated_data.pop('password', None)
        instance = super().create(validated_data)

        if password is not None:
            instance.set_password(password)
            instance.save()
        return instance

    def update(self, instance, validated_data):
        groups_data = validated_data.pop('groups', None)  # Replace 'groups' with your many-to-many field name
        user_permissions_data = validated_data.pop('user_permissions', None)  # Replace 'user_permissions' with your many-to-many field name
        password = validated_data.pop('password', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password is not None:
            instance.set_password(password)
        if groups_data is not None:  # New code starts here
            instance.groups.set(groups_data)  # Replace 'groups' with your many-to-many field name
        
        if user_permissions_data is not None:  # New code starts here
            instance.user_permissions.set(user_permissions_data)  # Replace 'user_permissions' with your many-to-many field name

        instance.save()
        return instance