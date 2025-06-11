package com.batterydashboard.batterydashboard.mqtt.config;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;

import java.net.InetSocketAddress;
import java.net.Proxy;

@Configuration
public class MqttConfig {

    @Value("${mqtt.password}")
    private String password;

    @Value("${mqtt.username}")
    private String username;

    @Value("${mqtt.broker.url}")
    private String url;

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();

        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[] {url}); // Public broker URL

        options.setUserName(username);
        options.setPassword(password.toCharArray());

        // Optional keep-alive (seconds)
        options.setKeepAliveInterval(60);

        factory.setConnectionOptions(options);
        return factory;
    }
}