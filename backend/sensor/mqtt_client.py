"""
MQTT client that subscribes to sensor data topics and saves readings to DB.
"""
import json
import threading
import time
import paho.mqtt.client as mqtt
from django.conf import settings

_mqtt_connected = False
_last_message_time = None

def get_mqtt_status():
    """Return current MQTT connection status."""
    return {
        'connected': _mqtt_connected,
        'broker_host': settings.MQTT_BROKER_HOST,
        'broker_port': settings.MQTT_BROKER_PORT,
        'topic': settings.MQTT_TOPIC,
        'last_message_time': _last_message_time,
    }

def _on_connect(client, userdata, flags, rc):
    global _mqtt_connected
    if rc == 0:
        print(f"[MQTT] Connected to broker at {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}")
        _mqtt_connected = True
        client.subscribe(settings.MQTT_TOPIC)
        print(f"[MQTT] Subscribed to topic: {settings.MQTT_TOPIC}")
    else:
        print(f"[MQTT] Connection failed with code {rc}")
        _mqtt_connected = False

def _on_disconnect(client, userdata, rc):
    global _mqtt_connected
    _mqtt_connected = False
    print(f"[MQTT] Disconnected (rc={rc}). Will attempt to reconnect...")

def _on_message(client, userdata, msg):
    """Process incoming MQTT sensor data message."""
    global _last_message_time
    import django
    django.setup()
    from sensor.models import SensorNode, SensorReading
    from sensor import ml_model

    try:
        payload = json.loads(msg.payload.decode('utf-8'))
        print(f"[MQTT] Received: {payload}")

        node_id = payload.get('node_id')
        if node_id is None:
            print("[MQTT] Error: message missing 'node_id'")
            return

        temperature = float(payload.get('temperature', 0))
        humidity = float(payload.get('humidity', 0))
        gas = float(payload.get('gas', 0))

        node, created = SensorNode.objects.get_or_create(
            node_id=node_id,
            defaults={
                'name': payload.get('node_name', f'Node {node_id}'),
                'location': payload.get('location', 'Unknown'),
            }
        )

        if created:
            print(f"[MQTT] New node registered: {node}")

        status = ml_model.predict(temperature, humidity, gas)

        reading = SensorReading.objects.create(
            node=node,
            temperature=temperature,
            humidity=humidity,
            gas=gas,
            status=status,
        )

        _last_message_time = reading.timestamp.isoformat()

        if status == 'anomaly':
            print(f"[MQTT] ⚠ ANOMALY DETECTED on {node.name}: T={temperature}, H={humidity}, G={gas}")
        else:
            print(f"[MQTT] ✓ Normal reading from {node.name}: T={temperature}, H={humidity}, G={gas}")

        if not ml_model.is_trained():
            total_readings = SensorReading.objects.count()
            if total_readings >= 50:
                print("[MQTT] Enough data collected. Auto-training ML model...")
                ml_model.train_model()

    except json.JSONDecodeError:
        print(f"[MQTT] Error: Invalid JSON payload: {msg.payload}")
    except Exception as e:
        print(f"[MQTT] Error processing message: {e}")

def start_mqtt_loop():
    """
    Start the MQTT client loop. This is a blocking call.
    Use in a management command or background thread.
    """
    client = mqtt.Client(client_id=settings.MQTT_CLIENT_ID)
    client.on_connect = _on_connect
    client.on_disconnect = _on_disconnect
    client.on_message = _on_message

    print(f"[MQTT] Connecting to {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}...")

    while True:
        try:
            client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, keepalive=60)
            client.loop_forever()
        except ConnectionRefusedError:
            print("[MQTT] Broker not available. Retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            print(f"[MQTT] Error: {e}. Retrying in 5 seconds...")
            time.sleep(5)
