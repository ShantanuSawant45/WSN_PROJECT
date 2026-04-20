from django.contrib import admin
from .models import SensorNode, SensorReading

@admin.register(SensorNode)
class SensorNodeAdmin(admin.ModelAdmin):
    list_display = ['node_id', 'name', 'location', 'created_at']

@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = ['node', 'temperature', 'humidity', 'gas', 'status', 'timestamp']
    list_filter = ['status', 'node']
    ordering = ['-timestamp']
