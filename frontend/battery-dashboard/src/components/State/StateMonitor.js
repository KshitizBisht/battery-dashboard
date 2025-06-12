import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './StateMonitor.css';
import MiniMap from "../Map/MiniMap";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const BATTERY_FULLCHARGE_RANGE_MILES = 300

const SohChart = ({ data }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
      <div className="soh-chart">
        <h3>SOH History (Last 30 Minutes)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="timestamp" tickFormatter={formatTime} minTickGap={20} />
            <YAxis domain={[80, 100]} />
            <Tooltip
                formatter={(value) => [`${value}%`, 'SOH']}
                labelFormatter={formatTime}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  border: 'none'
                }}
            />
            <Line
                type="monotone"
                dataKey="value"
                stroke="#3498db"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#2980b9' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
  );
};

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

const StateMonitor = () => {
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [stateData, setStateData] = useState({ soh: 0, soc: 0 });
  const [sohHistory, setSohHistory] = useState([]);
  const lastStoredTime = useRef(Date.now());
  const clientRef = useRef(null);
  const socIntervalRef = useRef(null);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to Websocket');
        setConnectionStatus('Connected');

        stompClient.subscribe('/topic/B0007/predict-soh', (response) => {
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
      if (clientRef.current?.connected) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  useEffect(() => {
    const simulateSOC = () => {
      setStateData(prev => {
        const isCharging = Math.random() > 0.7;
        const isDischarging = Math.random() > 0.8;
        const isStable = !isCharging && !isDischarging;

        let newSOC = prev.soc;

        if (isCharging) {
          const chargeRate = prev.soc < 20 ? 1.5 : prev.soc < 80 ? 1 : 0.3;
          newSOC = Math.min(100, prev.soc + chargeRate);
        } else if (isDischarging) {
          const dischargeRate = Math.random() > 0.9 ? 2 : 0.8;
          newSOC = Math.max(0, prev.soc - dischargeRate);
        } else if (isStable) {
          newSOC = prev.soc + (Math.random() * 0.4 - 0.2);
        }

        const fluctuation = Math.random() * 0.3 - 0.15;
        newSOC = Math.max(0, Math.min(100, newSOC + fluctuation));

        return { ...prev, soc: parseFloat(newSOC.toFixed(1)) };
      });
    };

    socIntervalRef.current = setInterval(simulateSOC, 1000);
    setStateData(prev => ({ ...prev, soc: 75 }));

    return () => {
      if (socIntervalRef.current) {
        clearInterval(socIntervalRef.current);
      }
    };
  }, []);

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

        <SohChart data={sohHistory} />

        <div className="map-section">
          <h3>Coverage Radius Based on SOC</h3>
          <MiniMap radius_metres={(stateData.soc / 100) * milesToMetres(BATTERY_FULLCHARGE_RANGE_MILES) } />
        </div>
      </div>
  );
};

function metresToMiles(metres) {
    return (metres / 1609.34).toFixed(2) ;
}

function milesToMetres(miles) {
  return (miles * 1609.34).toFixed(2) ;
}

export default StateMonitor;
