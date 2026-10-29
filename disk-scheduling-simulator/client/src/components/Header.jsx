import React from 'react';
import { Disc, Cpu, BookOpen, Download, RefreshCw } from 'lucide-react';

export default function Header({ engineName, cAvailable, onReset, onOpenTheory, onExportJSON }) {
  return (
    <header className="header-container">
      <div className="header-brand">
        <div className="header-logo-badge">
          <Disc className="header-icon" size={28} />
        </div>
        <div>
          <div className="header-title-row">
            <h1 className="header-title">Disk Scheduling Simulator</h1>
            <span className="version-pill">v2.0 Native C</span>
          </div>
          <p className="header-subtitle">
            Operating Systems Storage Head Scheduling & Trajectory Analyzer • Literature Review Edition
          </p>
        </div>
      </div>

      <div className="header-actions">
        <div className={`engine-badge ${cAvailable ? 'engine-badge-native' : 'engine-badge-fallback'}`}>
          <Cpu size={15} />
          <span className="engine-status-dot"></span>
          <span className="engine-name">{engineName || 'Native C Engine'}</span>
        </div>

        <button 
          onClick={onOpenTheory} 
          className="btn-secondary"
          title="Open Theoretical Review and Algorithm Analysis"
        >
          <BookOpen size={16} />
          <span>Algorithm Theory</span>
        </button>

        <button 
          onClick={onExportJSON} 
          className="btn-secondary"
          title="Export current simulation data to JSON"
        >
          <Download size={16} />
          <span>Export JSON</span>
        </button>

        <button 
          onClick={onReset} 
          className="btn-secondary btn-icon-only"
          title="Reset to default Silberschatz benchmark"
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  );
}
