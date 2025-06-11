package com.batterydashboard.batterydashboard.Flask.models;

import lombok.Data;

import java.time.Instant;

@Data
public class PredictionPayload {

    private String batteryId;
    private Instant timestamp;
    private float voltage;
    private float current;
    private float temperature;
    private float loadCurrent;
    private float loadVoltage;
    private float time;
}
