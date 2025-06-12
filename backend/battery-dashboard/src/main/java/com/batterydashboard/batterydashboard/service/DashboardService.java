package com.batterydashboard.batterydashboard.service;

import com.batterydashboard.batterydashboard.Flask.FlaskClient;
import com.batterydashboard.batterydashboard.Flask.models.FuturePredictionRequestBody;
import com.batterydashboard.batterydashboard.Flask.models.MqttPayloadData;
import com.batterydashboard.batterydashboard.Flask.models.PredictionRequestBody;
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
        MqttPayloadData mqttPayloadData = objectMapper.readValue(data, MqttPayloadData.class);
        ResponseEntity<String> response = flaskClient.getPredictedSoc(mqttPayloadData);
        System.out.println(response.getBody());
        messagingTemplate.convertAndSend("/topic/predict-soc", Objects.requireNonNull(response.getBody()));
    }

    public void sendSohPrediction(String data) throws JsonProcessingException {
        MqttPayloadData mqttPayloadData = objectMapper.readValue(data, MqttPayloadData.class);
        PredictionRequestBody predictionRequestBody = PredictionRequestBody.builder()
                .voltage_measured(mqttPayloadData.getLoadVoltage())
                .temperature_measured(mqttPayloadData.getTemperature())
                .current_measured(mqttPayloadData.getCurrent())
                .capacity(mqttPayloadData.getCapacity().getEstimatedRemaining())
                .current_load(mqttPayloadData.getLoadCurrent())
                .voltage_load(mqttPayloadData.getLoadVoltage())
                .time(mqttPayloadData.getTime())
                .build();
        ResponseEntity<String> response = flaskClient.getPredictedSoh(predictionRequestBody);
        System.out.println(response.getBody());
        sendSohFuturePrediction(response.getBody());
        messagingTemplate.convertAndSend("/topic/predict-soh", Objects.requireNonNull(response.getBody()));
    }

    public void sendSohFuturePrediction(String data) throws JsonProcessingException {
        FuturePredictionRequestBody futurePredictionRequestBody = objectMapper.readValue(data, FuturePredictionRequestBody.class);
        ResponseEntity<String> response = flaskClient.getFutureSohPrediction(futurePredictionRequestBody);
        System.out.println(response.getBody());
        messagingTemplate.convertAndSend("/topic/predict-soh-future", Objects.requireNonNull(response.getBody()));
    }
}
