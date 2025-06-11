package com.batterydashboard.batterydashboard.service;

import com.batterydashboard.batterydashboard.Flask.FlaskClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SimpMessagingTemplate messagingTemplate;
    private final FlaskClient flaskClient;

    public void sendRawData(String data) {
        messagingTemplate.convertAndSend("topic/raw-data", data);
    }

    public void sendPredictionData(String data) {
        ResponseEntity<String> response = flaskClient.getPredictedSoh();
        messagingTemplate.convertAndSend("topic/predict-data", response.getBody());
    }
}
