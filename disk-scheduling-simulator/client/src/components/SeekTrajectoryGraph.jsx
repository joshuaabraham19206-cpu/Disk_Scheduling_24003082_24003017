import React, { useState, useMemo } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const ALGO_COLORS = {
  'FCFS': { color: '#2563eb', bg: '#eff6ff', name: 'FCFS' },
  'SSTF': { color: '#059669', bg: '#ecfdf5', name: 'SSTF' },
  'SCAN': { color: '#d97706', bg: '#fffbeb', name: 'SCAN' },
  'C-SCAN': { color: '#7c3aed', bg: '#f5f3ff', name: 'C-SCAN' },
  'LOOK': { color: '#0284c7', bg: '#f0f9ff', name: 'LOOK' },
  'C-LOOK': { color: '#e11d48', bg: '#fff1f2', name: 'C-LOOK' }
};

export default function SeekTrajectoryGraph({
  algorithmMode, // 'COMPARISON' or specific 'FCFS', 'SSTF', etc.
  allResults,
  singleResult,
  currentStepIndex = 0,
  maxTracks = 200,
  onStepClick
}) {
  const [visibleAlgos, setVisibleAlgos] = useState({
    'FCFS': true,
    'SSTF': true,
    'SCAN': true,
    'C-SCAN': true,
    'LOOK': true,
    'C-LOOK': true
  });
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isComparison = algorithmMode === 'COMPARISON';

  // Toggle algorithm visibility in comparison mode
  const toggleAlgo = (name) => {
    setVisibleAlgos(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Compute maximum steps across all algorithms to size Y axis
  const maxSteps = useMemo(() => {
    if (!isComparison) {
      return singleResult?.sequence?.length || 10;
    }
    let max = 0;
    if (allResults) {
      Object.values(allResults).forEach(res => {
        if (res?.sequence?.length > max) max = res.sequence.length;
      });
    }
    return Math.max(max, 10);
  }, [isComparison, singleResult, allResults]);

  // SVG coordinate dimensions
  const width = 840;
  const height = 480;
  const padding = { top: 40, right: 40, bottom: 50, left: 60 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Scale functions
  const scaleX = (track) => {
    const val = Number(track) || 0;
    return padding.left + (val / (maxTracks - 1)) * plotWidth;
  };

  const scaleY = (stepIdx) => {
    return padding.top + (stepIdx / (maxSteps - 1 || 1)) * plotHeight;
  };

  // Generate X-axis ticks (e.g. 0, 20, 40, ... maxTracks)
  const xTicks = useMemo(() => {
    const ticks = [];
    const step = maxTracks > 500 ? 100 : maxTracks > 200 ? 50 : 20;
    for (let t = 0; t < maxTracks; t += step) {
      ticks.push(t);
    }
    if (!ticks.includes(maxTracks - 1)) {
      ticks.push(maxTracks - 1);
    }
    return ticks;
  }, [maxTracks]);

  // Generate Y-axis ticks (step indices)
  const yTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i < maxSteps; i += Math.max(1, Math.floor(maxSteps / 10))) {
      ticks.push(i);
    }
    return ticks;
  }, [maxSteps]);

  return (
    <div className="card graph-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            {isComparison ? 'Multi-Algorithm Trajectory Overlay' : `${singleResult?.algorithm || ''} Seek Path Trajectory`}
          </h3>
          <p className="card-subtitle">
            Visual head movement over time • Cylinder Track (X-axis) vs Service Step Sequence (Y-axis)
          </p>
        </div>

        {/* Visibility Toggles in Comparison Mode */}
        {isComparison && (
          <div className="algo-legend-toggles">
            {Object.entries(ALGO_COLORS).map(([name, conf]) => {
              const active = visibleAlgos[name];
              return (
                <button
                  key={name}
                  onClick={() => toggleAlgo(name)}
                  className={`algo-pill-toggle ${active ? 'active' : 'inactive'}`}
                  style={{
                    borderColor: active ? conf.color : '#cbd5e1',
                    color: active ? conf.color : '#64748b',
                    backgroundColor: active ? conf.bg : '#f8fafc'
                  }}
                >
                  <span 
                    className="legend-color-dot" 
                    style={{ backgroundColor: active ? conf.color : '#94a3b8' }} 
                  />
                  <span>{name}</span>
                  {active ? <Eye size={12} /> : <EyeOff size={12} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="svg-container">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="seek-trajectory-svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Soft grid pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
            </pattern>
            {/* Glow filter */}
            <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} fill="#ffffff" />
          <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} fill="url(#gridPattern)" />

          {/* X Grid Lines & Labels */}
          {xTicks.map(t => {
            const x = scaleX(t);
            return (
              <g key={`xtick-${t}`}>
                <line 
                  x1={x} 
                  y1={padding.top} 
                  x2={x} 
                  y2={padding.top + plotHeight} 
                  stroke="#e2e8f0" 
                  strokeDasharray="2,2" 
                />
                <text 
                  x={x} 
                  y={padding.top + plotHeight + 20} 
                  fontSize="11" 
                  fill="#64748b" 
                  textAnchor="middle" 
                  fontFamily="var(--font-mono)"
                >
                  {t}
                </text>
              </g>
            );
          })}

          {/* Y Grid Lines & Labels */}
          {yTicks.map(s => {
            const y = scaleY(s);
            return (
              <g key={`ytick-${s}`}>
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={padding.left + plotWidth} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeDasharray="2,2" 
                />
                <text 
                  x={padding.left - 12} 
                  y={y + 4} 
                  fontSize="11" 
                  fill="#64748b" 
                  textAnchor="end" 
                  fontFamily="var(--font-mono)"
                >
                  {s === 0 ? 'Init' : `S${s}`}
                </text>
              </g>
            );
          })}

          {/* Outer Border */}
          <rect 
            x={padding.left} 
            y={padding.top} 
            width={plotWidth} 
            height={plotHeight} 
            fill="none" 
            stroke="#cbd5e1" 
            strokeWidth="1.5" 
          />

          {/* Axis Titles */}
          <text 
            x={padding.left + plotWidth / 2} 
            y={height - 10} 
            fontSize="12" 
            fontWeight="600" 
            fill="#334155" 
            textAnchor="middle"
          >
            Disk Cylinder / Track Number (0 to {maxTracks - 1}) →
          </text>

          <text 
            x={15} 
            y={padding.top + plotHeight / 2} 
            fontSize="12" 
            fontWeight="600" 
            fill="#334155" 
            textAnchor="middle"
            transform={`rotate(-90 15 ${padding.top + plotHeight / 2})`}
          >
            Service Step Order (Time) ↓
          </text>

          {/* In Comparison Mode: Render all active algorithms */}
          {isComparison && allResults && Object.entries(allResults).map(([algoName, res]) => {
            if (!visibleAlgos[algoName] || !res?.sequence || res.sequence.length === 0) return null;
            const color = ALGO_COLORS[algoName]?.color || '#3b82f6';
            const seq = res.sequence;

            const pathD = seq.map((track, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(track)} ${scaleY(i)}`).join(' ');

            return (
              <g key={`comp-algo-${algoName}`} className="comp-algo-group">
                {/* Path Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />

                {/* Track Node Dots */}
                {seq.map((track, i) => (
                  <circle
                    key={`dot-${algoName}-${i}`}
                    cx={scaleX(track)}
                    cy={scaleY(i)}
                    r="3.5"
                    fill="#ffffff"
                    stroke={color}
                    strokeWidth="2"
                    className="graph-node-dot"
                    onMouseEnter={() => setHoveredPoint({
                      algo: algoName,
                      step: i,
                      track,
                      cumulative: res.steps[i - 1]?.cumulative_distance ?? 0,
                      dist: res.steps[i - 1]?.distance ?? 0,
                      reason: res.steps[i - 1]?.reason || 'Initial Head Position',
                      x: scaleX(track),
                      y: scaleY(i)
                    })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            );
          })}

          {/* In Single Mode: Render detailed trajectory */}
          {!isComparison && singleResult?.sequence && (
            <g className="single-algo-group">
              {/* Segments: distinguishes normal seeks vs wraparound jumps */}
              {singleResult.steps?.map((step, idx) => {
                const x1 = scaleX(step.from);
                const y1 = scaleY(idx);
                const x2 = scaleX(step.to);
                const y2 = scaleY(idx + 1);

                return (
                  <line
                    key={`seg-${idx}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={step.is_wraparound ? '#ef4444' : (ALGO_COLORS[singleResult.algorithm]?.color || '#3b82f6')}
                    strokeWidth={step.is_wraparound ? '2' : '3'}
                    strokeDasharray={step.is_wraparound ? '4,4' : 'none'}
                    strokeLinecap="round"
                    className="trajectory-segment"
                  />
                );
              })}

              {/* Step Circles */}
              {singleResult.sequence.map((track, i) => {
                const isCurrent = i === currentStepIndex;
                const isWraparound = i > 0 && singleResult.steps[i - 1]?.is_wraparound;
                const algoColor = ALGO_COLORS[singleResult.algorithm]?.color || '#3b82f6';
                const nodeColor = isWraparound ? '#ef4444' : algoColor;

                return (
                  <g 
                    key={`node-${i}`} 
                    onClick={() => onStepClick && onStepClick(i)} 
                    style={{ cursor: 'pointer' }}
                  >
                    {isCurrent && (
                      <circle
                        cx={scaleX(track)}
                        cy={scaleY(i)}
                        r="12"
                        fill={nodeColor}
                        opacity="0.25"
                        filter="url(#activeGlow)"
                      />
                    )}
                    <circle
                      cx={scaleX(track)}
                      cy={scaleY(i)}
                      r={isCurrent ? '7' : '4.5'}
                      fill={isCurrent ? nodeColor : '#ffffff'}
                      stroke={nodeColor}
                      strokeWidth={isCurrent ? '3' : '2'}
                      onMouseEnter={() => setHoveredPoint({
                        algo: singleResult.algorithm,
                        step: i,
                        track,
                        dist: i > 0 ? singleResult.steps[i - 1]?.distance : 0,
                        cumulative: i > 0 ? singleResult.steps[i - 1]?.cumulative_distance : 0,
                        reason: i > 0 ? singleResult.steps[i - 1]?.reason : 'Initial Head',
                        x: scaleX(track),
                        y: scaleY(i)
                      })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    <text
                      x={scaleX(track)}
                      y={scaleY(i) - 9}
                      fontSize="10"
                      fontWeight={isCurrent ? '700' : '500'}
                      fill={isCurrent ? nodeColor : '#475569'}
                      textAnchor="middle"
                      fontFamily="var(--font-mono)"
                    >
                      {track}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Hover Tooltip Overlay */}
          {hoveredPoint && (
            <g transform={`translate(${Math.min(hoveredPoint.x, width - 200)}, ${Math.max(hoveredPoint.y - 70, 45)})`}>
              <rect
                x="0"
                y="0"
                width="190"
                height="62"
                rx="6"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
              />
              <text x="10" y="18" fontSize="11" fontWeight="700" fill="#0f172a">
                {hoveredPoint.algo} • Step {hoveredPoint.step}
              </text>
              <text x="10" y="34" fontSize="10.5" fill="#475569" fontFamily="var(--font-mono)">
                Cylinder Track: {hoveredPoint.track} {hoveredPoint.step > 0 ? `(Seek: ${hoveredPoint.dist})` : ''}
              </text>
              <text x="10" y="49" fontSize="9.5" fill="#64748b" fontFamily="var(--font-mono)">
                Total Seek: {hoveredPoint.cumulative} cylinders
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
