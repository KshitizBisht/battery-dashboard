package com.batterydashboard.batterydashboard.Flask.models;

import lombok.Data;

import java.time.Instant;

@Data

public class MqttPayloadData {

    private String batteryId;
    private Instant timestamp;
    private float voltage;
    private float current;
    private float temperature;
    private float loadCurrent;
    private float loadVoltage;
    private float time;
    private String soc; // changed from float to String
    private Capacity capacity;

    public static class Capacity {
        private float nominal;
        private float estimatedRemaining;
    }
}
