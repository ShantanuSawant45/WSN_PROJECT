from django.db import models

class SensorNode(models.Model):
    """Represents a physical sensor node (ESP8266/NodeMCU)."""
    node_id = models.IntegerField(unique=True, help_text="Unique sensor node identifier")
    name = models.CharField(max_length=100, default="Unknown Node")
    location = models.CharField(max_length=200, default="Unknown Location")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['node_id']

    def __str__(self):
        return f"{self.name} (ID: {self.node_id})"

class SensorReading(models.Model):
    """Individual sensor reading from a node."""
    STATUS_CHOICES = [
        ('normal', 'Normal'),
        ('anomaly', 'Anomaly'),
    ]

    node = models.ForeignKey(SensorNode, on_delete=models.CASCADE, related_name='readings')
    temperature = models.FloatField(help_text="Temperature in °C")
    humidity = models.FloatField(help_text="Humidity in %")
    gas = models.FloatField(help_text="Gas level in ppm")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='normal')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['node', '-timestamp']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.node.name} | {self.temperature}°C | {self.status} | {self.timestamp:%H:%M:%S}"
