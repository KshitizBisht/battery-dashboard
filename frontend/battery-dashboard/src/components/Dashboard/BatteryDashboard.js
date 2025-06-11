import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import BatteryMetrics from '../Metrics/BatteryMetrics';
import './BatteryDashboard.css';
import StateMonitor from '../State/StateMonitor';

const BatteryDashboard = () => {
  const [batteryData, setBatteryData] = useState({
    voltage: 402.3,
    current: 142.6,
    temperature: 34.2,
    soc: 68,
    soh: 92.3,
    status: 'normal',
    history: []
  });
  
  const [alerts, setAlerts] = useState([]);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newVoltage = 400 + Math.random() * 20;
      const newTemp = 30 + Math.random() * 10;
      const newSOC = Math.max(0, Math.min(100, batteryData.soc - 0.1));
      
      const newData = {
        voltage: parseFloat(newVoltage.toFixed(1)),
        current: 140 + Math.random() * 20,
        temperature: parseFloat(newTemp.toFixed(1)),
        soc: parseFloat(newSOC.toFixed(1)),
        soh: batteryData.soh - (Math.random() * 0.01),
        status: newTemp > 45 ? 'warning' : 'normal',
        timestamp: new Date().toISOString()
      };
      
      // Check for alerts
      if (newTemp > 45 && !alerts.some(a => a.type === 'temperature')) {
        setAlerts([
          ...alerts,
          {
            id: Date.now(),
            type: 'temperature',
            message: `High temperature: ${newTemp}°C`,
            severity: 'high',
            timestamp: new Date().toISOString()
          }
        ]);
      }
      
      if (newVoltage < 380 && !alerts.some(a => a.type === 'voltage')) {
        setAlerts([
          ...alerts,
          {
            id: Date.now(),
            type: 'voltage',
            message: `Low voltage: ${newVoltage}V`,
            severity: 'medium',
            timestamp: new Date().toISOString()
          }
        ]);
      }
      
      setBatteryData(prev => ({
        ...newData,
        history: [...prev.history.slice(-29), newData] // Keep last 30 data points
      }));
      
    }, 2000); // Update every 2 seconds
    
    return () => clearInterval(interval);
  }, [batteryData.soh, alerts]);

  const dismissAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="battery-dashboard">
      <DashboardHeader />
      <StateMonitor
            soc={batteryData.soc}
            soh={batteryData.soh}
          />
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