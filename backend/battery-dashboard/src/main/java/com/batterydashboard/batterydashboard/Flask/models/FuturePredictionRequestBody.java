package com.batterydashboard.batterydashboard.Flask.models;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FuturePredictionRequestBody {
    private String predicted_soh;
}
