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
    status: 'Connecting...'
  });

  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const clientRef = useRef(null);


  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws')
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => {
        console.log(str)
      },
      onConnect: () => {
        console.log('Connected to Websocket')
        stompClient.subscribe('/topic/raw-data', (response) => {
          console.log('Received Message: ', response.body);
          try {
            const data = JSON.parse(response.body);
            console.log('Received WebSocket data:', data);
            setBatteryData(prev => ({
              ...prev,
              voltage: data.voltage,
              current: data.current,
              temperature: data.temperature
            }));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        })
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
    })
    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  return (
    <div className="battery-dashboard">

      <DashboardHeader />
      <StateMonitor/>
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