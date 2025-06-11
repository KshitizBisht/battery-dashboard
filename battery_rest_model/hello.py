from flask import Flask, request, jsonify
app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello_world():
   return 'Hello World'

@app.route('/predict-soh', methods=['POST'])
def predict_soh():
   print(request.get_json())
   return jsonify({"soh":90})

@app.route('/predict-soc', methods=['POST'])
def predict_soc():
   print(request.get_json())
   return jsonify({"soc":40})

if __name__ == '__main__':
   app.run()