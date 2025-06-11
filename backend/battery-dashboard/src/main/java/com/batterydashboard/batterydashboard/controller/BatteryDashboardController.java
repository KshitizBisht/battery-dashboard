package com.batterydashboard.batterydashboard.controller;

import com.batterydashboard.batterydashboard.service.BatteryHistoryService;
import com.batterydashboard.batterydashboard.service.BatteryRangeService;
import com.batterydashboard.batterydashboard.service.BatterySoCService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class BatteryDashboardController {


  public BatterySoCService batterySoCService;
  public BatteryHistoryService batteryHistoryService;
  public BatteryRangeService batteryRangeService;

  @GetMapping("/api/battery/soc")
  public Map<String, Object> getBatterySoC(@RequestParam String carID){
    return batterySoCService.getLatestSoC(carID);
  }

  @GetMapping("/api/battery/history")
  public List<Map<String, Object>> getBatteryHistory(@RequestParam String startDate, @RequestParam String endDate){
    return batteryHistoryService.getBatteryHistory(startDate, endDate);
  }

  @GetMapping("/api/battery/range")
  public Map<String, Object> getBatteryRange(@RequestParam String carID){
    return batteryRangeService.getLatestRange(carID);
  }

}
