import React, { useState, useEffect, useRef } from 'react';
import DashboardHeader from './DashboardHeader';
import BatteryMetrics from '../Metrics/BatteryMetrics';
import './BatteryDashboard.css';
import StateMonitor from '../State/StateMonitor';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const BatteryDashboard = () => {
  const [batteryData, setBatteryData] = useState({
    voltage: 0,
    current: 0,
    temperature: 0,
    soc: 0,
    status: 'Connecting...'
  });

  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [selectedVehicle, setSelectedVehicle] = useState('JLR-EV-B0005');
  const clientRef = useRef(null);

  const handleVehicleChange = (vehicleId) => {
    setSelectedVehicle(vehicleId);
    setConnectionStatus('Switching vehicles...');

    setBatteryData({
      voltage: 0,
      current: 0,
      temperature: 0,
      soc: 0,
      status: 'Loading...'
    });

    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.deactivate();
    }
  };

  useEffect(() => {
    if (!selectedVehicle) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to Websocket');
        setConnectionStatus('Connected');
        const vehicleTopic = selectedVehicle.split('-')[2];
        const topic = `/topic/${vehicleTopic}/raw-data`;
        console.log(`Subscribing to topic: ${topic}`);

        stompClient.subscribe(topic, (response) => {
          try {
            const data = JSON.parse(response.body);
            setBatteryData(prev => ({
              ...prev,
              voltage: data.voltage,
              current: data.current,
              temperature: data.temperature,
              soc: data.soc,
              status: 'Connected'
            }));

          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame.headers.message);
        setConnectionStatus(`Error: ${frame.headers.message}`);
      },
      onWebSocketError: (event) => {
        console.error('WebSocket error:', event);
        setConnectionStatus('Connection error');
      },
      onDisconnect: () => {
        setConnectionStatus('Disconnected');
      }
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.deactivate();
      }
    };
  }, [selectedVehicle]);

  return (
    <div className="battery-dashboard">
      <DashboardHeader onVehicleChange={handleVehicleChange} />

      <div className="vehicle-indicator">
        <span className="vehicle-badge">Active Vehicle:</span>
        <span className="vehicle-id">{selectedVehicle}</span>
        <span className="connection-status">Status: {connectionStatus}</span>
      </div>

      <StateMonitor vehicleId={selectedVehicle} soc={batteryData.soc} />

      <div className="dashboard-grid">
        <div className="metrics-section">
          <BatteryMetrics
            voltage={batteryData.voltage}
            current={batteryData.current}
            temperature={batteryData.temperature}
          />
        </div>
      </div>
    </div>
  );
};

export default BatteryDashboard;
