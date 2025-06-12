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

    public void sendRawData(String data) throws JsonProcessingException {
        MqttPayloadData mqttPayloadData = objectMapper.readValue(data, MqttPayloadData.class);
        System.out.println("/topic" + mqttPayloadData.getBatteryId() + "/raw-data");
        messagingTemplate.convertAndSend("/topic/" + mqttPayloadData.getBatteryId() + "/raw-data", data);
    }

    public void sendSocPrediction(String data) throws JsonProcessingException {
        MqttPayloadData mqttPayloadData = objectMapper.readValue(data, MqttPayloadData.class);
        ResponseEntity<String> response = flaskClient.getPredictedSoc(mqttPayloadData);
        System.out.println(response.getBody());
        messagingTemplate.convertAndSend("/topic/" + mqttPayloadData.getBatteryId() + "/predict-soc", Objects.requireNonNull(response.getBody()));
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
        sendSohFuturePrediction(response.getBody(), mqttPayloadData.getBatteryId());
        messagingTemplate.convertAndSend("/topic/" + mqttPayloadData.getBatteryId() + "/predict-soh", Objects.requireNonNull(response.getBody()));
    }

    public void sendSohFuturePrediction(String data, String batteryId) throws JsonProcessingException {
        FuturePredictionRequestBody futurePredictionRequestBody = objectMapper.readValue(data, FuturePredictionRequestBody.class);
        ResponseEntity<String> response = flaskClient.getFutureSohPrediction(futurePredictionRequestBody);
        System.out.println(response.getBody());
        messagingTemplate.convertAndSend("/topic/" + batteryId + "/predict-soh-future", Objects.requireNonNull(response.getBody()));
    }
}
