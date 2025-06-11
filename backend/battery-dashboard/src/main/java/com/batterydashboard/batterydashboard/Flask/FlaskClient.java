package com.batterydashboard.batterydashboard.Flask;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "flaskPredictionClient", url = "http://127.0.0.1:5000")
public interface FlaskClient {

    @GetMapping("/predict-soh")
    public ResponseEntity<String> getPredictedSoh();
}
