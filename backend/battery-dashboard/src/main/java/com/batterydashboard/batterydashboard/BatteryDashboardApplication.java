package com.batterydashboard.batterydashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.integration.config.EnableIntegration;

@SpringBootApplication
@EnableIntegration
@EnableFeignClients
public class BatteryDashboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(BatteryDashboardApplication.class, args);
    }

}
