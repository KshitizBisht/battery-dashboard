import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './StateMonitor.css';
import MiniMap from "../Map/MiniMap";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const BATTERY_FULLCHARGE_RANGE_MILES = 300;

const BatteryIcon = ({ percentage, label, color }) => {
  const percentageValue = typeof percentage === 'number' ? percentage : 0;

  return (
    <div className="battery-container">
      <div className="battery-label"><p
        style={{
          padding: 10
        }}
      >{label}</p></div>
      <div className="battery">
        <div className="battery-terminal"></div>
        <div className="battery-body">
          <div
            className="battery-fill"
            style={{
              height: `${percentageValue}%`,
              backgroundColor: color,
            }}
          >
            <div className="liquid-wave"></div>
          </div>
          <div className="battery-percentage">{percentageValue.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

const StateMonitor = ({ vehicleId }) => {
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [soh, setSoh] = useState(0);
  const [predictedSoh50, setPredictedSoh50] = useState(0);
  const [soc, setSoc] = useState(100);
  const [sohHistory, setSohHistory] = useState([]);
  const [predictedSohHistory, setPredictedSohHistory] = useState([]);
  const lastStoredTime = useRef(Date.now());
  const clientRef = useRef(null);
  const socIntervalRef = useRef(null);
  const vehicleTopic = vehicleId.split('-')[2];

  useEffect(() => {
    setSoc(100);
    setSoh(0);
    setPredictedSoh50(0);
    setSohHistory([]);
    setPredictedSohHistory([]);

    if (socIntervalRef.current) {
      clearInterval(socIntervalRef.current);
    }

    socIntervalRef.current = setInterval(() => {
      setSoc(prevSoc => {
        const drivingCondition = Math.random();
        let dischargeRate = 0.3;

        if (drivingCondition < 0.2) {
          dischargeRate = 0.7;
        } else if (drivingCondition < 0.4) {
          dischargeRate = 0.5;
        } else if (drivingCondition < 0.6) {
          dischargeRate = 0.4;
        } else if (drivingCondition < 0.8) {
          dischargeRate = 0.35;
        }

        dischargeRate += (Math.random() * 0.9);

        return Math.max(0, prevSoc - dischargeRate);
      });
    }, 1000);

    return () => {
      if (socIntervalRef.current) {
        clearInterval(socIntervalRef.current);
      }
    };
  }, [vehicleId]);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to Websocket');
        setConnectionStatus('Connected');

        // Subscribe to SOH predictions
        const sohTopic = `/topic/${vehicleTopic}/predict-soh`;
        console.log(`Subscribing to SOH topic: ${sohTopic}`);
        stompClient.subscribe(sohTopic, (response) => {
          try {
            const data = JSON.parse(response.body);
            console.log(data)
            const sohPercentage = parseFloat(data.predicted_soh) * 100;
            const now = Date.now();

            if (now - lastStoredTime.current > 10000) {
              setSohHistory(prev => {
                const newHistory = [...prev, { timestamp: now, value: sohPercentage }];
                return newHistory.filter(point => now - point.timestamp <= 30 * 60 * 1000);
              });
              lastStoredTime.current = now;
            }

            setSoh(sohPercentage);
          } catch (error) {
            console.error('Error parsing SOH message:', error);
          }
        });

        const predictedSohTopic = `/topic/${vehicleTopic}/predict-soh-future`;
        console.log(`Subscribing to predicted SOH topic: ${predictedSohTopic}`);
        stompClient.subscribe(predictedSohTopic, (response) => {
          try {
            const data = JSON.parse(response.body);
            const predictedSohValue = parseFloat(data.predicted_soh_50_cycles) * 100;
            const now = Date.now();

            setPredictedSoh50(predictedSohValue);

            setPredictedSohHistory(prev => {
              const newHistory = [...prev, { timestamp: now, value: predictedSohValue }];
              return newHistory.filter(point => now - point.timestamp <= 30 * 60 * 1000);
            });
          } catch (error) {
            console.error('Error parsing predicted SOH message:', error);
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
  }, [vehicleId, vehicleTopic]);

  const socColor = soc < 20 ? '#e74c3c' :
    soc < 40 ? '#f39c12' : '#2ecc71';

  const sohColor = soh < 80 ? '#e74c3c' :
    soh < 90 ? '#f39c12' : '#3498db';

  const predictedSohColor = predictedSoh50 < 70 ? '#e74c3c' :
    predictedSoh50 < 80 ? '#f39c12' : '#3498db';

  return (
    <div className="state-monitor">
      <div className="connection-status">
        Battery Status: {connectionStatus}
      </div>

      <div className="battery-grid">
        <BatteryIcon percentage={soc} label="State of Charge (SOC)" color={socColor} />
        <BatteryIcon percentage={soh} label="State of Health (SOH)" color={sohColor} />
        <BatteryIcon percentage={predictedSoh50} label="Predicted SOH (100 cycles)" color={predictedSohColor} />
      </div>

      <div className="battery-status">
        <div className="status-card">
          <div className="status-label">SOC Status:</div>
          <div className="status-value">
            {soc < 20 ? "CRITICAL - Needs charging" :
              soc < 40 ? "LOW - Charge soon" :
                "NORMAL - Sufficient charge"}
          </div>
        </div>

        <div className="status-card">
          <div className="status-label">SOH Status:</div>
          <div className="status-value">
            {soh < 80 ? "POOR - Consider replacement" :
              soh < 90 ? "FAIR - Monitor degradation" :
                "GOOD - Healthy battery"}
          </div>
        </div>

        <div className="status-card">
          <div className="status-label">100-Cycle Prediction:</div>
          <div className="status-value">
            {predictedSoh50 < 70 ? "POOR - Significant degradation expected" :
              predictedSoh50 < 80 ? "FAIR - Moderate degradation expected" :
                "GOOD - Minimal degradation expected"}
          </div>
        </div>
      </div>

      <div className="map-section">
        <h3>Travel Range</h3>
        <MiniMap className="map" radius_metres={(soc / 100) * milesToMetres(BATTERY_FULLCHARGE_RANGE_MILES)} />
      </div>
    </div>
  );
};

function milesToMetres(miles) {
  return (miles * 1609.34).toFixed(2);
}

export default StateMonitor;