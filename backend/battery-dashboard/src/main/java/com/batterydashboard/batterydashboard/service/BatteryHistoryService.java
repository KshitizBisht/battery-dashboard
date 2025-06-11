package com.batterydashboard.batterydashboard.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BatteryHistoryService {

  private final List<Map<String, Object>> mockData = List.of(
          Map.of("timestamp", "2025-06-11", "health", 92, "soc", 80),
          Map.of("timestamp", "2025-06-10", "health", 93, "soc", 85),
          Map.of("timestamp", "2025-06-09", "health", 95, "soc", 90)
  );

  public List<Map<String, Object>> getBatteryHistory(String startDate, String endDate) {
    LocalDate start = LocalDate.parse(startDate);
    LocalDate end = LocalDate.parse(endDate);

    return mockData.stream()
            .filter(entry -> {
              LocalDate date = LocalDate.parse((String) entry.get("timestamp"));
              return (date.isEqual(start) || date.isAfter(start)) &&
                      (date.isEqual(end) || date.isBefore(end));
            })
            .collect(Collectors.toList());
  }
}
