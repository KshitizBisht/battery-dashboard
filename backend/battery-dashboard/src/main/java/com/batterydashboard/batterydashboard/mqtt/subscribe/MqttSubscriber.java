package com.batterydashboard.batterydashboard.mqtt.subscribe;

import com.batterydashboard.batterydashboard.service.DashboardService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;
import org.springframework.stereotype.Component;

@Configuration
@Component
@RequiredArgsConstructor
public class MqttSubscriber {

    private final DashboardService dashboardService;
    private static final String CLIENT_ID = "spring-client-" + System.currentTimeMillis();

    @Value("${mqtt.topic.subscribe}")
    private String topic;

    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MqttPahoMessageDrivenChannelAdapter inboundAdapter(
            MqttPahoClientFactory factory) {

        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(CLIENT_ID, factory, topic);

        adapter.setQos(1);
        adapter.setOutputChannel(mqttInputChannel());
        adapter.addTopic("battery/B0006/data");
        return adapter;
    }

    @Bean
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public MessageHandler messageHandler() {
        return (Message<?> message) -> {
            String topic = (String) message.getHeaders().get("mqtt_receivedTopic");
            String payload = message.getPayload().toString();

            System.out.println("\n--- MQTT MESSAGE RECEIVED ---");
            System.out.println("Topic: " + topic);
            System.out.println("Payload: " + payload);
            System.out.println("Headers: " + message.getHeaders());
            dashboardService.sendRawData(payload);
            try {
//                dashboardService.sendSocPrediction(payload);
                dashboardService.sendSohPrediction(payload);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        };
    }
}