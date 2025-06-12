import json
from flask import Flask, request, jsonify
import numpy as np
from joblib import load
from keras.models import load_model
from sklearn.linear_model import LinearRegression
from datetime import datetime
import pandas as pd


app = Flask(__name__)

model = load_model('../models/soh_model.keras')
sc = load('../models/scaler1.save')

attrib = ['capacity', 'voltage_measured', 'current_measured',
          'temperature_measured', 'current_load', 'voltage_load', 'time']


# Global log (or use a database/file)


@app.route('/', methods=['GET'])
def hello_world():
   return 'Hello World'

@app.route('/predict-soh', methods=['POST'])
def predict_soh():
    global soh_log
    data = request.get_json()
    mapped_payload = ['capacity','voltage_measured','current_measured','temperature_measured',
                    'current_load','voltage_load','time']

    # Prepare input for model
    input_data = np.array([[data[feature] for feature in mapped_payload]])
    data_scaled = sc.transform(input_data)
    soh_pred = model.predict(data_scaled)
    
    input_data = np.array([[data[feature] for feature in mapped_payload]])
    data_scaled = sc.transform(input_data)
    soh_pred = model.predict(data_scaled)
    
    soh_value = round(float(soh_pred[0][0]), 4)


    # Log the prediction
    soh_log.loc[len(soh_log)] = {
        "batteryId": "B0005",
        "timestamp": datetime.now().isoformat(),
        "predicted_soh": soh_value
    }

    print(f"Predicted SoH: {soh_value}")
    # prediction_payload = json.dumps({
    #          "predicted_soh": round(float(soh_pred[0][0]), 4)
    #      })
    return jsonify({"predicted_soh": soh_value})

soh_log = pd.DataFrame(columns=["batteryId", "timestamp", "predicted_soh"])

@app.route('/predict-soh-future', methods=['POST'])
def pred_soh_future():
    global soh_log

    data = request.get_json()
    battery_id = "B0005"
    df = soh_log[soh_log["batteryId"] == battery_id]

    # Handle insufficient data
    if len(df) == 0:
        return jsonify({
            "batteryId": battery_id,
            "current_soh": "pending",
            "predicted_soh_50_cycles": "pending"
        }), 200
    elif len(df) == 1:
        return jsonify({
            "batteryId": battery_id,
            "current_soh": float(df["predicted_soh"].iloc[-1]),
            "predicted_soh_50_cycles": "pending"
        }), 200

    # # Estimate degradation rate
    # recent_soh = df["predicted_soh"].values[-1]
    # previous_soh = df["predicted_soh"].values[-2]
    # degradation_rate = (previous_soh - recent_soh) / 1  # per cycle

    # Sort by timestamp to ensure correct order
    df_sorted = df.sort_values(by="timestamp")

    # Linear regression to estimate degradation rate
    X = np.arange(len(df_sorted)).reshape(-1, 1) # Cycle index
    y = df_sorted["predicted_soh"].values
    reg = LinearRegression()
    reg.fit(X, y)

    degradation_rate = -reg.coef_[0] # Negative slope
    current_soh = y[-1]
    if degradation_rate < 0:
        future_soh = current_soh + (degradation_rate * 100)
    else:
        future_soh = current_soh

    return jsonify({
        # "batteryId": battery_id,
        # "current_soh": recent_soh,
        "predicted_soh_50_cycles": round(future_soh, 4)
    })

if __name__ == '__main__':
    app.run()