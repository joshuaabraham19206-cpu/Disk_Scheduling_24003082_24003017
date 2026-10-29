import React, { useState } from 'react';
import { ListOrdered, ArrowRight, Download, Check } from 'lucide-react';

export default function DecisionTraceTable({
  steps = [],
  currentStepIndex = 0,
  onStepSelect,
  algorithm = 'Algorithm'
}) {
  const [downloaded, setDownloaded] = useState(false);

  // Export decision trace table to CSV
  const handleExportCSV = () => {
    if (!steps || steps.length === 0) return;

    const headers = ['Step', 'From_Track', 'To_Track', 'Seek_Distance', 'Cumulative_Seek', 'Is_Wraparound', 'Decision_Rationale'];
    const rows = steps.map(s => [
      s.step,
      s.from,
      s.to,
      s.distance,
      s.cumulative_distance,
      s.is_wraparound ? 'YES' : 'NO',
      `"${(s.reason || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${algorithm.toLowerCase()}_decision_trace.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="card decision-trace-card">
      <div className="card-header">
        <div className="card-title-group">
          <ListOrdered className="card-icon" size={20} />
          <div>
            <h3 className="card-title">Step-by-Step Decision Trace Log</h3>
            <p className="card-subtitle">
              Detailed arithmetic and selection rationales for {algorithm} • Click any row to jump head
            </p>
          </div>
        </div>

        <button 
          onClick={handleExportCSV} 
          className="btn-secondary"
          title="Download trace table as CSV file"
        >
          {downloaded ? <Check size={15} className="text-success" /> : <Download size={15} />}
          <span>{downloaded ? 'Exported!' : 'Export CSV'}</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="trace-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Transition</th>
              <th>Distance</th>
              <th>Cumulative</th>
              <th>Type</th>
              <th>Algorithmic Selection Reason</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, idx) => {
              const isSelected = (idx + 1) === currentStepIndex;
              return (
                <tr
                  key={`trace-step-${s.step}`}
                  onClick={() => onStepSelect && onStepSelect(idx + 1)}
                  className={`trace-row ${isSelected ? 'active-trace-row' : ''}`}
                >
                  <td>
                    <span className="step-num-badge">#{s.step}</span>
                  </td>
                  <td>
                    <div className="transition-cell">
                      <span className="from-track">{s.from}</span>
                      <ArrowRight size={13} className="arrow-icon" />
                      <span className="to-track">{s.to}</span>
                    </div>
                  </td>
                  <td className="cell-distance">
                    <strong>{s.distance}</strong> <small>cyl</small>
                  </td>
                  <td className="cell-cumulative">
                    <strong>{s.cumulative_distance}</strong> <small>cyl</small>
                  </td>
                  <td>
                    {s.is_wraparound ? (
                      <span className="tag-wraparound">⚡ Circular Jump</span>
                    ) : (
                      <span className="tag-service">Normal Seek</span>
                    )}
                  </td>
                  <td className="cell-reason">
                    <span className="reason-string">{s.reason}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
