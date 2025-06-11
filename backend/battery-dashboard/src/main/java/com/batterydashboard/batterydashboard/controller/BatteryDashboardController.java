package com.batterydashboard.batterydashboard.controller;

import com.batterydashboard.batterydashboard.service.BatteryHistoryService;
import com.batterydashboard.batterydashboard.service.BatteryRangeService;
import com.batterydashboard.batterydashboard.service.BatterySoCService;
import com.batterydashboard.batterydashboard.service.BatteryTemperatureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class BatteryDashboardController {

  @Autowired
  public BatterySoCService batterySoCService;

  @Autowired
  public BatteryHistoryService batteryHistoryService;

  @Autowired
  public BatteryRangeService batteryRangeService;

  @Autowired
  public BatteryTemperatureService batteryTemperatureService;

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

  @GetMapping("api/battery/temperature")
  public Map<String, Object> getLatestTemperature(@RequestParam String carID) {
    return batteryTemperatureService.getLatestTemperature(carID);
  }


}
