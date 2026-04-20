from rest_framework import serializers
from .models import SensorNode, SensorReading

class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = ['id', 'temperature', 'humidity', 'gas', 'status', 'timestamp']

class SensorNodeSerializer(serializers.ModelSerializer):
    """Node with its latest reading embedded."""
    temperature = serializers.SerializerMethodField()
    humidity = serializers.SerializerMethodField()
    gas = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    timestamp = serializers.SerializerMethodField()
    history = serializers.SerializerMethodField()

    class Meta:
        model = SensorNode
        fields = [
            'id', 'node_id', 'name', 'location',
            'temperature', 'humidity', 'gas', 'status', 'timestamp',
            'history',
        ]

    def _get_latest(self, obj):
        """Cache the latest reading lookup."""
        if not hasattr(obj, '_latest_reading'):
            obj._latest_reading = obj.readings.first()  # ordered by -timestamp
        return obj._latest_reading

    def get_temperature(self, obj):
        latest = self._get_latest(obj)
        return latest.temperature if latest else 0

    def get_humidity(self, obj):
        latest = self._get_latest(obj)
        return latest.humidity if latest else 0

    def get_gas(self, obj):
        latest = self._get_latest(obj)
        return latest.gas if latest else 0

    def get_status(self, obj):
        latest = self._get_latest(obj)
        return latest.status if latest else 'normal'

    def get_timestamp(self, obj):
        latest = self._get_latest(obj)
        return latest.timestamp.isoformat() if latest else None

    def get_history(self, obj):

        readings = obj.readings.all()[:30]
        return SensorReadingSerializer(reversed(list(readings)), many=True).data

class LogSerializer(serializers.ModelSerializer):
    """Flat log entry with node info."""
    node_id = serializers.IntegerField(source='node.node_id')
    node_name = serializers.CharField(source='node.name')
    location = serializers.CharField(source='node.location')

    class Meta:
        model = SensorReading
        fields = [
            'id', 'node_id', 'node_name', 'location',
            'temperature', 'humidity', 'gas', 'status', 'timestamp',
        ]
