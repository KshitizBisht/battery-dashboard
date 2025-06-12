import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import './StateMonitor.css';

const BatteryIcon = ({ percentage, label, color }) => {
  return (
    <div className="battery-container">
      <div className="battery-label">{label}</div>
      <div className="battery">
        {/* Battery terminal */}
        <div className="battery-terminal"></div>
        
        {/* Battery body */}
        <div className="battery-body">
          {/* Battery liquid fill with animation */}
          <div 
            className="battery-fill"
            style={{
              height: `${percentage}%`,
              backgroundColor: color,
            }}
          >
            {/* Liquid wave effect */}
            <div className="liquid-wave"></div>
          </div>
          
          {/* Percentage text inside battery */}
          <div className="battery-percentage">{percentage.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  );
};

const StateMonitor = () => {
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [stateData, setStateData] = useState({
    soh: 0,
    soc: 0,
  });

  const clientRef = useRef(null);
  const socIntervalRef = useRef(null);

  // WebSocket connection for SOH
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('Connected to Websocket');
        setConnectionStatus('Connected');
        
        stompClient.subscribe('/topic/predict-soh', (response) => {
          try {
            const data = JSON.parse(response.body);
            console.log('Received SOH data:', data);
            
            // Convert decimal value to percentage
            const sohPercentage = parseFloat(data.predicted_soh) * 100;
            
            setStateData(prev => ({
              ...prev,
              soh: sohPercentage,
            }));
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

  // SOC simulation with random algorithm
  useEffect(() => {
    // Function to generate realistic SOC values
    const simulateSOC = () => {
      setStateData(prev => {
        // Simulate different battery behaviors
        const isCharging = Math.random() > 0.7;
        const isDischarging = Math.random() > 0.8;
        const isStable = !isCharging && !isDischarging;
        
        let newSOC = prev.soc;
        
        if (isCharging) {
          // Charge faster when battery is low, slower when nearly full
          const chargeRate = prev.soc < 20 ? 1.5 : prev.soc < 80 ? 1 : 0.3;
          newSOC = Math.min(100, prev.soc + chargeRate);
        } 
        else if (isDischarging) {
          // Discharge faster under "load"
          const dischargeRate = Math.random() > 0.9 ? 2 : 0.8;
          newSOC = Math.max(0, prev.soc - dischargeRate);
        }
        else if (isStable) {
          // Minor fluctuations during stable state
          newSOC = prev.soc + (Math.random() * 0.4 - 0.2);
        }
        
        // Add some randomness to the simulation
        const fluctuation = Math.random() * 0.3 - 0.15;
        newSOC = Math.max(0, Math.min(100, newSOC + fluctuation));
        
        return {...prev, soc: parseFloat(newSOC.toFixed(1))};
      });
    };

    // Start simulation
    socIntervalRef.current = setInterval(simulateSOC, 1000);
    
    // Initial value
    setStateData(prev => ({...prev, soc: 75}));
    
    return () => {
      if (socIntervalRef.current) {
        clearInterval(socIntervalRef.current);
      }
    };
  }, []);

  // Determine colors based on values
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
        <BatteryIcon 
          percentage={stateData.soc} 
          label="State of Charge (SOC)" 
          color={socColor}
        />
        
        <BatteryIcon 
          percentage={stateData.soh} 
          label="State of Health (SOH)" 
          color={sohColor}
        />
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
    </div>
  );
};

export default StateMonitor;