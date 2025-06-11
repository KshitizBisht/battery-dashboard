package com.batterydashboard.batterydashboard.Flask;

import com.batterydashboard.batterydashboard.Flask.models.PredictionPayload;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "flaskPredictionClient", url = "http://127.0.0.1:5000")
public interface FlaskClient {

    @PostMapping("/predict-soh")
    public ResponseEntity<String> getPredictedSoh(@RequestBody PredictionPayload predictionPayload);

    @PostMapping("/predict-soc")
    public ResponseEntity<String> getPredictedSoc(@RequestBody PredictionPayload predictionPayload);
}
