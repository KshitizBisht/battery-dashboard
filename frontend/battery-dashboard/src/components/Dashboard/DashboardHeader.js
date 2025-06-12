import React from 'react';
import './DashboardHeader.css';

const DashboardHeader = () => {
  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <h1>
            <span className="ev-highlight">EV</span> Battery Monitoring Dashboard
          </h1>
          <p className="subtitle">Real-time performance analytics & health monitoring</p>
        </div>
        <div className="header-right">
          <div className="status-indicator">
            <span className="status-dot active"></span>
            <span>Connected</span>
          </div>
          <div className="vehicle-info">
            <span className="vehicle-id">Vehicle ID: EV-2023-001</span>
            <span className="last-update">Last update: Just now</span>
          </div>
          <div className="user-info">
            <div className="avatar">AD</div>
            <div className="user-details">
              <span className="user-name">Ola User</span>
              <span className="user-role">Profile - ADMIN</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;