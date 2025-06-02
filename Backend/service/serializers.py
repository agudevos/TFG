from rest_framework import serializers
from .models import Service, ServicePriceAssignment

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'

class ServicePriceAssignmentSerializer(serializers.ModelSerializer):
    service_details = ServiceSerializer(source='service', read_only=True)
    time_slot_details = serializers.SerializerMethodField()
    
    class Meta:
        model = ServicePriceAssignment
        fields = [
            'id', 
            'price', 
            'bookable',
            'service',
            'service_details',
            'time_slot',
            'time_slot_details'
        ]
    
    def get_time_slot_details(self, obj):
        """
        Obtener detalles del TimeSlot a través de la relación SlotAssignment
        """
        if obj.time_slot and hasattr(obj.time_slot, 'time_slot'):
            time_slot = obj.time_slot.time_slot
            return {
                'id': time_slot.id,
                'name': time_slot.name,
                'start_time': time_slot.start_time,
                'end_time': time_slot.end_time,
                'color': time_slot.color,
                'schedule_type': self._get_schedule_type(obj.time_slot)
            }
        return None
    
    def _get_schedule_type(self, slot_assignment):
        """
        Determinar a qué tipo de horario está asignado el SlotAssignment
        """
        if slot_assignment.weekly_schedule:
            return {
                'type': 'weekly',
                'id': slot_assignment.weekly_schedule.id,
                'name': slot_assignment.weekly_schedule.name,
                'weekday': slot_assignment.weekly_schedule.weekday
            }
        elif slot_assignment.specific_schedule:
            return {
                'type': 'specific',
                'id': slot_assignment.specific_schedule.id,
                'name': slot_assignment.specific_schedule.name,
                'date': slot_assignment.specific_schedule.date
            }
        elif slot_assignment.group_schedule:
            return {
                'type': 'group',
                'id': slot_assignment.group_schedule.id,
                'name': slot_assignment.group_schedule.name
            }
        return None
    
    def validate(self, data):
        """
        Validar que la combinación de servicio y time_slot es única
        """
        service = data.get('service')
        time_slot = data.get('time_slot')
        
        # Si estamos actualizando un objeto existente, excluirlo de la validación de unicidad
        instance = self.instance
        if instance is not None:
            # Verificar si hay otra asignación con el mismo servicio y time_slot que no sea esta instancia
            if ServicePriceAssignment.objects.exclude(pk=instance.pk).filter(
                service=service, time_slot=time_slot
            ).exists():
                raise serializers.ValidationError(
                    "Ya existe una asignación de precio para este servicio y horario."
                )
        else:
            # Verificar si ya existe una asignación con el mismo servicio y time_slot
            if ServicePriceAssignment.objects.filter(
                service=service, time_slot=time_slot
            ).exists():
                raise serializers.ValidationError(
                    "Ya existe una asignación de precio para este servicio y horario."
                )
        
        return data