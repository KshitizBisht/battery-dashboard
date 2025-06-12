import React, { useState } from 'react';
import './DashboardHeader.css';

const DashboardHeader = ({ onVehicleChange }) => {
  const [selectedVehicle, setSelectedVehicle] = useState('JLR-EV-001');
  const userProfile = "ADMIN"

  const vehicleOptions = [
    { id: 'JLR-EV-B0005', name: 'Jaguar I-PACE 2023' },
    { id: 'JLR-EV-B0006', name: 'Range Rover EV 2024' },
    { id: 'JLR-EV-B0007', name: 'Jaguar F-Type EV' },
  ];


  const handleVehicleChange = (e) => {
    const vehicleId = e.target.value;
    setSelectedVehicle(vehicleId);
    onVehicleChange(vehicleId);
  };

  return (
    <header className="dashboard-header">
      <div className="header-content">
        <div className="header-left">
          <h1>
            <span className="ev-highlight">JLR</span> Battery Monitoring Dashboard
          </h1>
          <p className="subtitle">Real-time performance analytics & health monitoring</p>
        </div>
        <div className="header-right">
          <div className="selection-group">
            <div className="selection-item">
              <label htmlFor="vehicle-select" className="selection-label">Vehicle:</label>
              <select
                id="vehicle-select"
                className="selection-dropdown"
                value={selectedVehicle}
                onChange={handleVehicleChange}
              >
                {vehicleOptions.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="status-indicator">
            <span className="status-dot active"></span>
            <span>Connected</span>
          </div>

          <div className="user-info">
            <div className="avatar">TS</div>
            <div className="user-details">
              <span className="user-name">Tony Stark</span>
              <span className="user-role">Profile: {userProfile}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;