import paho.mqtt.client as mqtt
import json
import numpy as np
from joblib import load
from keras.models import load_model

# MQTT settings
MQTT_BROKER = "mqtt.joshuawebster.co.uk"  # or your local broker
MQTT_PORT = 1883
MQTT_TOPIC = "battery/B0006/data"

# Load the pre-trained Keras model
model = load_model('../models/soh_model.keras')
sc = load('../models/scaler1.save')

# Define the attributes expected by the model
attrib = ['capacity', 'voltage_measured', 'current_measured',
          'temperature_measured', 'current_load', 'voltage_load', 'time']

# Callback when connected to the broker
def on_connect(client, userdata, flags, rc):
    client.username_pw_set("IOT", "")

    if rc == 0:
        print("✅ Connected to MQTT broker")
        client.subscribe(MQTT_TOPIC, qos=1)
        print(f"Subscribed to topic: {MQTT_TOPIC}")
    else:
        print(f"❌ Failed to connect, return code {rc}")


# Callback when a message is received
def on_message(client, userdata, message):
    try:
        payload = json.loads(message.payload.decode("utf-8"))
        print(f"Received payload: {payload}")

        # Map MQTT fields to model input format
        mapped_payload = {
             'capacity': 1.0,  # or a default/estimated value
             'voltage_measured': payload['voltage'],
             'current_measured': payload['current'],
             'temperature_measured': payload['temperature'],
            'current_load': payload['loadCurrent'],
             'voltage_load': payload['loadVoltage'],
             'time': payload['time']
        }

        # Convert to array in correct order
        data = np.array([[mapped_payload[attr] for attr in attrib]])

        # # Extract features in the correct order
        # data = np.array([[payload[attr] for attr in attrib]])

        # Scale the data so the model converges faster
        data_scaled = sc.transform(data)

        # Predict SoH
        soh_pred = model.predict(data_scaled)
        print(f"Predicted SoH: {soh_pred[0][0]:.4f}")

        # Prepare prediction payload
        prediction_payload = json.dumps({
            "batteryId": payload["batteryId"],
            "timestamp": payload["timestamp"],
            "predicted_soh": round(float(soh_pred[0][0]), 4)
        })

        # Publish to another topic
        client.publish("battery/soh", prediction_payload)
        print(f"Published SoH prediction: {prediction_payload}")

    except Exception as e:
        print(f"Error processing message: {e}")

# Setup MQTT client
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

client.connect(MQTT_BROKER, MQTT_PORT)
print("Connecting to MQTT broker...")
client.loop_forever()

