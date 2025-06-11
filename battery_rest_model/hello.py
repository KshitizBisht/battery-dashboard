from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/', methods=['GET'])
def hello_world():
   return 'Hello World'

@app.route('/predict-soh', methods=['GET'])
def predict_soh():
   return jsonify({"soh":90})

if __name__ == '__main__':
   app.run()