import React from 'react';
import { HardDrive, Activity, Compass, ArrowRight } from 'lucide-react';

export default function DiskPlatterVisualizer({
  currentTrack = 0,
  previousTrack = 0,
  maxTracks = 200,
  algorithm = 'FCFS',
  stepNumber = 0,
  totalSteps = 0,
  isWraparound = false,
  reason = ''
}) {
  // Normalize track position between 0 (outer cylinder) and 1 (inner cylinder)
  const normalizedPos = Math.max(0, Math.min(1, currentTrack / (maxTracks - 1 || 1)));

  // Actuator arm pivot angle: 12 degrees to 46 degrees across platter radius
  const minAngle = 12;
  const maxAngle = 48;
  const armAngle = minAngle + normalizedPos * (maxAngle - minAngle);

  // Platter track radius
  const trackRadius = 40 + normalizedPos * 90;

  const seekDist = Math.abs(currentTrack - previousTrack);

  return (
    <div className="card platter-visualizer-card">
      <div className="card-header">
        <div className="card-title-group">
          <HardDrive className="card-icon" size={20} />
          <div>
            <h3 className="card-title">Physical HDD Platter & Actuator Arm</h3>
            <p className="card-subtitle">Real-time mechanical head position across disk cylinders</p>
          </div>
        </div>

        <div className="platter-status-chip">
          <span className="live-dot animate-pulse"></span>
          <span>Cylinder {currentTrack} / {maxTracks - 1}</span>
        </div>
      </div>

      <div className="platter-content-layout">
        {/* SVG Mechanical HDD Representation */}
        <div className="platter-svg-wrapper">
          <svg viewBox="0 0 320 280" className="platter-svg">
            <defs>
              {/* Radial gradient for metallic disk surface */}
              <radialGradient id="platterGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="45%" stopColor="#f8fafc" />
                <stop offset="75%" stopColor="#cbd5e1" />
                <stop offset="95%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#64748b" />
              </radialGradient>

              {/* Spindle metallic gradient */}
              <radialGradient id="spindleGrad" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#475569" />
              </radialGradient>

              {/* Actuator arm metallic gradient */}
              <linearGradient id="armGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>

              {/* Head glow */}
              <filter id="headGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Disk Drive Enclosure Base */}
            <rect x="15" y="15" width="290" height="250" rx="16" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="2" />

            {/* Screw Mounts */}
            <circle cx="28" cy="28" r="4" fill="#cbd5e1" stroke="#94a3b8" />
            <circle cx="292" cy="28" r="4" fill="#cbd5e1" stroke="#94a3b8" />
            <circle cx="28" cy="252" r="4" fill="#cbd5e1" stroke="#94a3b8" />
            <circle cx="292" cy="252" r="4" fill="#cbd5e1" stroke="#94a3b8" />

            {/* Circular Platter */}
            <g transform="translate(130, 140)">
              {/* Outer Platter Edge */}
              <circle cx="0" cy="0" r="115" fill="url(#platterGradient)" stroke="#94a3b8" strokeWidth="2" />

              {/* Concentric Cylinder Tracks */}
              {[30, 50, 70, 90, 110].map((r, idx) => (
                <circle 
                  key={`track-${idx}`} 
                  cx="0" 
                  cy="0" 
                  r={r} 
                  fill="none" 
                  stroke="#cbd5e1" 
                  strokeWidth="0.8" 
                  strokeDasharray="4,4" 
                />
              ))}

              {/* Active Cylinder Track Ring */}
              <circle
                cx="0"
                cy="0"
                r={trackRadius}
                fill="none"
                stroke={isWraparound ? '#ef4444' : '#3b82f6'}
                strokeWidth="2.5"
                strokeDasharray={isWraparound ? '6,3' : 'none'}
                opacity="0.9"
              />

              {/* Spindle Center Hub */}
              <circle cx="0" cy="0" r="24" fill="url(#spindleGrad)" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="12" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
              <circle cx="0" cy="0" r="4" fill="#334155" />
            </g>

            {/* Actuator Pivot Assembly (Bottom Right) */}
            <g transform="translate(265, 215)">
              {/* Actuator Base Magnet */}
              <path d="M -30 -30 Q 10 -40 20 -10 L 10 20 Q -20 20 -30 -30 Z" fill="#94a3b8" opacity="0.6" />
              
              {/* Pivot Bearing */}
              <circle cx="0" cy="0" r="18" fill="url(#spindleGrad)" stroke="#475569" strokeWidth="2" />
              <circle cx="0" cy="0" r="7" fill="#334155" />

              {/* Actuator Arm smoothly pivoting */}
              <g 
                transform={`rotate(${-armAngle})`} 
                style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              >
                {/* Arm shaft */}
                <polygon 
                  points="-4,-4 -155,-8 -170,0 -155,8 -4,4" 
                  fill="url(#armGrad)" 
                  stroke="#475569" 
                  strokeWidth="1" 
                />

                {/* Read/Write Slider Head at Arm Tip */}
                <rect 
                  x="-175" 
                  y="-5" 
                  width="14" 
                  height="10" 
                  rx="2" 
                  fill="#0f172a" 
                  stroke="#ffffff" 
                  strokeWidth="1" 
                />

                {/* Head Sensor Glow Dot */}
                <circle 
                  cx="-170" 
                  cy="0" 
                  r="4" 
                  fill={isWraparound ? '#ef4444' : '#3b82f6'} 
                  filter="url(#headGlow)" 
                />
              </g>
            </g>

            {/* Legend Tag */}
            <text x="25" y="40" fontSize="11" fontWeight="700" fill="#334155">
              HDD Physical Model
            </text>
            <text x="25" y="55" fontSize="9.5" fill="#64748b" fontFamily="var(--font-mono)">
              Tracks 0 (outer) → {maxTracks - 1} (inner)
            </text>
          </svg>
        </div>

        {/* Live Metrics Column */}
        <div className="platter-metrics-panel">
          <div className="platter-stat-box highlight-primary">
            <span className="stat-label">Current Cylinder</span>
            <div className="stat-value-row">
              <span className="stat-track-number">{currentTrack}</span>
              <span className="stat-track-max">/ {maxTracks - 1}</span>
            </div>
            <div className="stat-progress-bar">
              <div 
                className="stat-progress-fill" 
                style={{ width: `${(currentTrack / (maxTracks - 1)) * 100}%` }}
              />
            </div>
          </div>

          <div className="platter-stat-box">
            <span className="stat-label">Last Seek Distance</span>
            <div className="stat-seek-row">
              {stepNumber > 0 ? (
                <>
                  <span className="seek-from-to">
                    {previousTrack} <ArrowRight size={13} /> {currentTrack}
                  </span>
                  <span className={`seek-delta-badge ${isWraparound ? 'badge-wraparound' : ''}`}>
                    {isWraparound ? `⚡ ${seekDist} (Jump)` : `+${seekDist} tracks`}
                  </span>
                </>
              ) : (
                <span className="text-muted">Initial Head Position</span>
              )}
            </div>
          </div>

          <div className="platter-step-reason-box">
            <div className="reason-header">
              <Activity size={14} className="reason-icon" />
              <span className="reason-title">Current Step Rationale:</span>
            </div>
            <p className="reason-text">
              {reason || `Initial head positioned at track ${currentTrack}. Ready for simulation.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
