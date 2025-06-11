package com.batterydashboard.batterydashboard.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class BatteryTemperatureService {

  private final List<Map<String, Object>> mockTemperatureData = List.of(
          Map.of("vehicleId", "EV123", "timestamp", "2025-06-11", "temperature", 32.5),
          Map.of("vehicleId", "EV123", "timestamp", "2025-06-10", "temperature", 30.8),
          Map.of("vehicleId", "EV456", "timestamp", "2025-06-11", "temperature", 28.4)
  );

  public List<Map<String, Object>> getTemperatureHistory(String vehicleId) {
    return mockTemperatureData.stream()
            .filter(entry -> entry.get("vehicleId").equals(vehicleId))
            .toList();
  }

  public Map<String, Object> getLatestTemperature(String vehicleId) {
    return mockTemperatureData.stream()
            .filter(entry -> entry.get("vehicleId").equals(vehicleId))
            .findFirst()
            .orElse(null);
  }
}
