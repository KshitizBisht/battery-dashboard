package com.batterydashboard.batterydashboard.service;

import com.batterydashboard.batterydashboard.Flask.FlaskClient;
import com.batterydashboard.batterydashboard.Flask.models.PredictionPayload;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SimpMessagingTemplate messagingTemplate;
    private final FlaskClient flaskClient;
    private final ObjectMapper objectMapper;

    public void sendRawData(String data) {
        messagingTemplate.convertAndSend("/topic/raw-data", data);
    }

    public void sendSocPrediction(String data) throws JsonProcessingException {
        PredictionPayload requestPayload = objectMapper.readValue(data, PredictionPayload.class);
        ResponseEntity<String> response = flaskClient.getPredictedSoc(requestPayload);
        System.out.println(response.getBody());
        messagingTemplate.convertAndSend("/topic/predict-soc", Objects.requireNonNull(response.getBody()));
    }

    public void sendSohPrediction(String data) throws JsonProcessingException {
        PredictionPayload requestPayload = objectMapper.readValue(data, PredictionPayload.class);
        ResponseEntity<String> response = flaskClient.getPredictedSoh(requestPayload);
        System.out.println(response.getBody());
        messagingTemplate.convertAndSend("/topic/predict-soh", Objects.requireNonNull(response.getBody()));
    }
}
