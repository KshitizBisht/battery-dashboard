package com.batterydashboard.batterydashboard.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class BatteryRangeService {

  private final List<Map<String, Object>> mockRangeData = List.of(
          Map.of("vehicleId", "EV123", "timestamp", "2025-06-11", "range", 320),
          Map.of("vehicleId", "EV123", "timestamp", "2025-06-10", "range", 310)
  );

  public List<Map<String, Object>> getRangeHistory() {
    return mockRangeData;
  }

  public Map<String, Object> getLatestRange(String vehicleId) {
    return mockRangeData.stream()
            .filter(entry -> entry.get("vehicleId").equals(vehicleId))
            .findFirst()
            .orElse(null);
  }
}

