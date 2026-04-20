"""
Django management command to start the MQTT subscriber.
Usage: python manage.py start_mqtt
"""
from django.core.management.base import BaseCommand
from sensor.mqtt_client import start_mqtt_loop
from sensor import ml_model

class Command(BaseCommand):
    help = 'Start the MQTT subscriber to receive sensor data from ESP8266 nodes'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('[WSN] Starting MQTT subscriber...'))

        if ml_model.load_model():
            self.stdout.write(self.style.SUCCESS('[WSN] ML model loaded from disk'))
        else:
            self.stdout.write(self.style.WARNING(
                '[WSN] No trained ML model found. Will auto-train after 50 readings.'
            ))

        try:
            start_mqtt_loop()
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('\n[WSN] MQTT subscriber stopped.'))
