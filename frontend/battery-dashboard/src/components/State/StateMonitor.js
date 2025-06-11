import './StateMonitor.css'

const StateMonitor = ({ soc, soh }) => {
  return (
    <div className="state-container">
      <div className="state-card">
        <div className="state-label">State of Charge</div>
        <div className="state-value">{soc} <span className="state-unit">%</span></div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${soc}%`,
              backgroundColor: soh < 50 ? '#e74c3c' : soh < 40 ? '#f39c12' : '#2ecc71'
            }}
          ></div>
        </div>
      </div>

      <div className="state-card">
        <div className="state-label">State of Health</div>
        <div className="state-value">{soh.toFixed(1)} <span className="state-unit">%</span></div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${soh}%`,
              backgroundColor: soh < 80 ? '#e74c3c' : soh < 90 ? '#f39c12' : '#2ecc71'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StateMonitor;