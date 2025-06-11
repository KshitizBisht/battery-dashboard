package com.batterydashboard.batterydashboard.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class BatterySoCService {

  private final List<Map<String, Object>> mockSoCData = List.of(
          Map.of("vehicleId", "EV123", "timestamp", "2025-06-11", "soc", 82),
          Map.of("vehicleId", "EV123", "timestamp", "2025-06-10", "soc", 78)
  );

  public List<Map<String, Object>> getSoCHistory(String vehicleId) {
    return mockSoCData.stream()
            .filter(entry -> entry.get("vehicleId").equals(vehicleId))
            .toList();
  }

  public Map<String, Object> getLatestSoC(String vehicleId) {
    return mockSoCData.stream()
            .filter(entry -> entry.get("vehicleId").equals(vehicleId))
            .findFirst()
            .orElse(null);
  }
}
