import json
from flask import Flask, request, jsonify
import numpy as np
from joblib import load
from keras.models import load_model

app = Flask(__name__)

model = load_model('../models/soh_model.keras')
sc = load('../models/scaler1.save')

attrib = ['capacity', 'voltage_measured', 'current_measured',
          'temperature_measured', 'current_load', 'voltage_load', 'time']

@app.route('/', methods=['GET'])
def hello_world():
   return 'Hello World'

@app.route('/predict-soh', methods=['POST'])
def predict_soh():
   data = request.get_json()
   mapped_payload = ['capacity','voltage_measured','current_measured','temperature_measured',
                    'current_load','voltage_load','time']
   input_data = np.array([[data[feature] for feature in mapped_payload]])
   data_scaled = sc.transform(input_data)
   soh_pred = model.predict(data_scaled)
   print(f"Predicted SoH: {soh_pred[0][0]:.4f}")
   prediction_payload = json.dumps({
            "predicted_soh": round(float(soh_pred[0][0]), 4)
        })
   return prediction_payload

# @app.route('/predict-soc', methods=['POST'])
# def predict_soc():
#    # print(request.get_json())
#    return jsonify({"soc":40})

if __name__ == '__main__':
   app.run()