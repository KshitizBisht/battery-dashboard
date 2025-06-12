import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './StateMonitor.css';
import MiniMap from "../Map/MiniMap";

const BATTERY_FULLCHARGE_RANGE_MILES = 300;

const BatteryIcon = ({ percentage, label, color }) => {
  return (
      <div className="battery-container">
        <div className="battery-label">{label}</div>
        <div className="battery">
          <div className="battery-terminal"></div>
          <div className="battery-body">
            <div
                className="battery-fill"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: color,
                }}
            >
              <div className="liquid-wave"></div>
            </div>
            <div className="battery-percentage">{percentage.toFixed(1)}%</div>
          </div>
        </div>
      </div>
  );
};

const StateMonitor = ({vehicleId, soc}) => {
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [stateData, setStateData] = useState({ soh: 0, soc: soc || 0 });
  const [sohHistory, setSohHistory] = useState([]);
  const lastStoredTime = useRef(Date.now());
  const clientRef = useRef(null);
  const vehicleTopic = vehicleId.split('-')[2];
  console.log("===================" + {soc}.soc)

  useEffect(() => {
    setStateData({ soh: 0, soc: {soc}.soc });
    setSohHistory([]);
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to Websocket');
        setConnectionStatus('Connected');
        const sohTopic = `/topic/${vehicleTopic}/predict-soh`;
        console.log(`Subscribing to SOH topic: ${sohTopic}`);
        stompClient.subscribe(sohTopic, (response) => {
          try {
            const data = JSON.parse(response.body);
            const sohPercentage = parseFloat(data.predicted_soh) * 100;
            const now = Date.now();

            if (now - lastStoredTime.current > 10000) {
              setSohHistory(prev => {
                const newHistory = [...prev, { timestamp: now, value: sohPercentage }];
                return newHistory.filter(point => now - point.timestamp <= 30 * 60 * 1000);
              });
              lastStoredTime.current = now;
            }

            setStateData(prev => ({ ...prev, soh: sohPercentage }));
          } catch (error) {
            console.error('Error parsing SOH message:', error);
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

  const socColor = stateData.soc < 20 ? '#e74c3c' :
      stateData.soc < 40 ? '#f39c12' : '#2ecc71';

  const sohColor = stateData.soh < 80 ? '#e74c3c' :
      stateData.soh < 90 ? '#f39c12' : '#3498db';

  return (
      <div className="state-monitor">
        <div className="connection-status">
          Battery Status: {connectionStatus}
        </div>

        <div className="battery-grid">
          <BatteryIcon percentage={stateData.soc} label="State of Charge (SOC)" color={socColor} />
          <BatteryIcon percentage={stateData.soh} label="State of Health (SOH)" color={sohColor} />
        </div>

        <div className="battery-status">
          <div className="status-card">
            <div className="status-label">SOC Status:</div>
            <div className="status-value">
              {stateData.soc < 20 ? "CRITICAL - Needs charging" :
                  stateData.soc < 40 ? "LOW - Charge soon" :
                      "NORMAL - Sufficient charge"}
            </div>
          </div>

          <div className="status-card">
            <div className="status-label">SOH Status:</div>
            <div className="status-value">
              {stateData.soh < 80 ? "POOR - Consider replacement" :
                  stateData.soh < 90 ? "FAIR - Monitor degradation" :
                      "GOOD - Healthy battery"}
            </div>
          </div>
        </div>

        <div className="map-section">
          <h3>Coverage Radius Based on SOC</h3>
          <MiniMap className = "map" radius_metres={(stateData.soc / 100) * milesToMetres(BATTERY_FULLCHARGE_RANGE_MILES)} />
        </div>
      </div>
  );
};

function milesToMetres(miles) {
  return (miles * 1609.34).toFixed(2);
}

export default StateMonitor;
