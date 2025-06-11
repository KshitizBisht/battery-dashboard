package com.batterydashboard.batterydashboard.controller;

import com.batterydashboard.batterydashboard.service.BatteryHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class BatteryDashboardController {

  public BatteryHistoryService batteryHistoryService;

  @GetMapping("/api/battery/history")
  public List<Map<String, Object>> getBatteryHistory(@RequestParam String startDate, @RequestParam String endDate){
    return batteryHistoryService.getBatteryHistory(startDate, endDate);
  }

}
