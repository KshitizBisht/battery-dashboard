import React from 'react';
import './DashboardHeader.css';

const DashboardHeader = () => {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <h1>EV Battery Monitoring Dashboard</h1>
          <p className="subtitle">Battery performance analytics</p>
        </div>
        <div className="header-right">
          <div className="status-indicator">
            <span className="status-dot active"></span>
            <span>Connected</span>
          </div>
          <div className="vehicle-info">
            <span>Vehicle ID: 123</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;