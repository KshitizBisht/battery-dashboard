package com.batterydashboard.batterydashboard.Flask;

import com.batterydashboard.batterydashboard.Flask.models.FuturePredictionRequestBody;
import com.batterydashboard.batterydashboard.Flask.models.MqttPayloadData;
import com.batterydashboard.batterydashboard.Flask.models.PredictionRequestBody;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "flaskPredictionClient", url = "http://127.0.0.1:5000")
public interface FlaskClient {

    @PostMapping("/predict-soh")
    public ResponseEntity<String> getPredictedSoh(@RequestBody PredictionRequestBody predictionRequestBody);

    @PostMapping("/predict-soc")
    public ResponseEntity<String> getPredictedSoc(@RequestBody MqttPayloadData mqttPayloadData);

    @PostMapping("/predict-soh-future")
    public ResponseEntity<String> getFutureSohPrediction(@RequestBody FuturePredictionRequestBody futurePredictionRequestBody);
}
