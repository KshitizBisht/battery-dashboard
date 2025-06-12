package com.batterydashboard.batterydashboard.Flask.models;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class PredictionRequestBody {
    private float capacity;
    private float voltage_measured;
    private float current_measured;
    private float temperature_measured;
    private float current_load;
    private float voltage_load;
    private float time;
}
