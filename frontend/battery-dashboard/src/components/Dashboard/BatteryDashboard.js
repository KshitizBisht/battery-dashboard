import React, { useState, useEffect } from 'react';
import DashboardHeader from './DashboardHeader';
import BatteryMetrics from '../Metrics/BatteryMetrics';
import './BatteryDashboard.css';
import StateMonitor from '../State/StateMonitor';
import axios from 'axios';


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
    const fetchSoC = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/battery/soc', {
          params: { carID: 'EV123' }
        });
        setBatteryData(prev => ({
          ...prev,
          soc: response.data.soc
        }));
      } catch (error) {
        console.error('Error fetching SoC:', error);
      }
    };

    const fetchRange = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/battery/range', {
          params: { carID: 'EV123' }
        });
        setBatteryData(prev => ({
          ...prev,
          voltage: response.data.voltage,
          current: response.data.current
        }));
      } catch (error) {
        console.error('Error fetching range data:', error);
      }
    };

    const fetchTemperature = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/battery/temperature', {
          params: { carID: 'EV123' }
        });
        setBatteryData(prev => ({
          ...prev,
          temperature: response.data.temperature
        }));
      } catch (error) {
        console.error('Error fetching temperature:', error);
      }
    };

    const fetchSOH = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/battery/soh', {
          params: { carID: 'EV123' }
        });
        setBatteryData(prev => ({
          ...prev,
          soh: response.data.soh
        }));
      } catch (error) {
        console.error('Error fetching SOH:', error);
      }
    };

    // Initial fetch
    fetchSoC();
    //fetchRange();
    //fetchTemperature();
    //fetchSOH();

    // Set interval to refresh data every 5 seconds
    const interval = setInterval(() => {
      fetchSoC();
      fetchRange();
      fetchTemperature();
      //fetchSOH();
    }, 5000);

    return () => clearInterval(interval);
  }, []);



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