import React from 'react';
import './Metrics.css';

const BatteryMetrics = ({ voltage, current, temperature, soc, soh }) => {
  return (
    <div className="metrics-container">
      <div className="section-title">Battery Metrics</div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Voltage</div>
          <div className="metric-value">{voltage} <span className="metric-unit">V</span></div>
          <div className={`metric-status ${voltage < 380 ? 'warning' : 'normal'}`}>
            {voltage < 380 ? 'Low' : 'Normal'}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Current</div>
          <div className="metric-value">{current.toFixed(1)} <span className="metric-unit">A</span></div>
          <div className="metric-status normal">Normal</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Temperature</div>
          <div className="metric-value">{temperature} <span className="metric-unit">°C</span></div>
          <div className={`metric-status ${temperature > 45 ? 'warning' : 'normal'}`}>
            {temperature > 45 ? 'High' : 'Normal'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryMetrics;