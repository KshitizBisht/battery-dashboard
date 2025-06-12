import React from 'react';
import './Metrics.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faThermometerHalf, faChargingStation } from '@fortawesome/free-solid-svg-icons';

const BatteryMetrics = ({ voltage, current, temperature}) => {
  return (
    <div className="metrics-container">
      <div className="section-title">Battery Metrics</div>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Voltage</div>
          <FontAwesomeIcon icon={faChargingStation} className="metric-icon" />
          <div className="metric-value">{voltage.toFixed(2)} <span className="metric-unit">V</span></div>
          <div className={`metric-status ${voltage.toFixed(2) < 3.2 ? 'warning' : 'normal'}`}>
            {voltage < 380 ? 'Low' : 'Normal'}
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Current</div>
          <FontAwesomeIcon icon={faBolt} className="metric-icon" />
          <div className="metric-value">{current.toFixed(1)} <span className="metric-unit">A</span></div>
          <div className="metric-status normal">Normal</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-label">Temperature</div>
          <FontAwesomeIcon icon={faThermometerHalf} className="metric-icon" />
          <div className="metric-value">{temperature.toFixed(2)} <span className="metric-unit">°C</span></div>
          <div className={`metric-status ${temperature.toFixed(2) > 45 ? 'warning' : 'normal'}`}>
            {temperature > 45 ? 'High' : 'Normal'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatteryMetrics;