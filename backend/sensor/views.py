from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import SensorNode, SensorReading
from .serializers import SensorNodeSerializer, LogSerializer
from . import ml_model
from . import mqtt_client

@api_view(['GET'])
def node_list(request):
    """
    GET /api/nodes/
    Returns all sensor nodes with their latest reading and history (last 30).
    """
    nodes = SensorNode.objects.prefetch_related('readings').all()
    serializer = SensorNodeSerializer(nodes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def node_detail(request, node_id):
    """
    GET /api/nodes/<node_id>/
    Returns a single node with its latest reading and history.
    """
    try:
        node = SensorNode.objects.prefetch_related('readings').get(node_id=node_id)
    except SensorNode.DoesNotExist:
        return Response({'error': 'Node not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = SensorNodeSerializer(node)
    return Response(serializer.data)

@api_view(['GET'])
def logs(request):
    """
    GET /api/logs/
    Returns the last 200 sensor readings across all nodes.
    """
    readings = SensorReading.objects.select_related('node').all()[:200]
    serializer = LogSerializer(readings, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def system_status(request):
    """
    GET /api/status/
    Returns MQTT connection status, ML model status, and last update time.
    """
    mqtt_status = mqtt_client.get_mqtt_status()
    model_info = ml_model.get_model_info()

    last_reading = SensorReading.objects.first()
    last_update = last_reading.timestamp.isoformat() if last_reading else None

    total_nodes = SensorNode.objects.count()
    total_readings = SensorReading.objects.count()

    return Response({
        'mqtt': mqtt_status,
        'ml_model': model_info,
        'last_update': last_update,
        'total_nodes': total_nodes,
        'total_readings': total_readings,
        'server_time': timezone.now().isoformat(),
    })

@api_view(['POST'])
def train_model(request):
    """
    POST /api/train/
    Manually trigger ML model training.
    """
    success = ml_model.train_model()
    if success:
        return Response({'message': 'Model trained successfully', 'model_info': ml_model.get_model_info()})
    else:
        total = SensorReading.objects.count()
        return Response(
            {'error': f'Not enough data to train. Have {total} readings, need at least 50.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
