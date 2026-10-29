import React from 'react';
import {
  Trophy,
  TrendingDown,
  Award,
  BarChart2,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { ALGO_COLORS } from './SeekTrajectoryGraph';

const ALGO_METADATA = {
  'FCFS': {
    selectionRule: 'Arrival order (FIFO)',
    benefit: 'Completely fair; zero starvation risk; easy to implement',
    concern: 'May produce excessive head thrashing across disk',
    starvationRisk: 'None'
  },
  'SSTF': {
    selectionRule: 'Nearest pending track to current head',
    benefit: 'Minimizes immediate seek overhead; high throughput',
    concern: 'Severe starvation risk for distant cylinder requests',
    starvationRisk: 'High'
  },
  'SCAN': {
    selectionRule: 'Elevator sweep to boundary, then reverse',
    benefit: 'Structured traversal; upper bound on waiting time',
    concern: 'Boundary traversal can add seek cost; unfair to middle tracks',
    starvationRisk: 'Low'
  },
  'C-SCAN': {
    selectionRule: 'One-way sweep with rapid return jump',
    benefit: 'Uniform waiting time distribution across all tracks',
    concern: 'Return wraparound jump adds movement',
    starvationRisk: 'Low'
  },
  'LOOK': {
    selectionRule: 'Sweep in direction, reverse at last request',
    benefit: 'Avoids wasteful trips to empty disk boundaries',
    concern: 'Performance depends on request distribution',
    starvationRisk: 'Low'
  },
  'C-LOOK': {
    selectionRule: 'Circular service between outermost pending tracks',
    benefit: 'Avoids boundary trips and provides uniform directional latency',
    concern: 'Jump accounting must be explicitly standardized',
    starvationRisk: 'Low'
  }
};

export default function ComparisonDashboard({
  allResults,
  onSelectAlgorithm
}) {
  if (!allResults) return null;

  // Build sorted array by total_movement (ascending: lower is better)
  const ranking = Object.entries(allResults)
    .map(([name, data]) => ({
      name,
      ...data,
      metadata: ALGO_METADATA[name] || {}
    }))
    .sort((a, b) => a.total_movement - b.total_movement);

  const fcfsResult = allResults['FCFS'];
  const fcfsTotal = fcfsResult?.total_movement || 1;
  const bestAlgo = ranking[0];
  const maxTotal = Math.max(...ranking.map(r => r.total_movement), 1);

  return (
    <div className="comparison-dashboard">
      {/* Top Highlight Podium */}
      <div className="podium-grid">
        {/* Winner Card */}
        <div className="card winner-card">
          <div className="winner-header">
            <div className="winner-trophy-badge">
              <Trophy size={24} />
            </div>
            <div>
              <span className="winner-label">Most Efficient Algorithm</span>
              <h3 className="winner-title">{bestAlgo.name}</h3>
            </div>
          </div>

          <div className="winner-metrics">
            <div className="winner-metric-item">
              <span className="metric-label">Total Head Movement</span>
              <strong className="metric-val">{bestAlgo.total_movement} <small>cylinders</small></strong>
            </div>
            <div className="winner-metric-item">
              <span className="metric-label">Avg Seek / Request</span>
              <strong className="metric-val">{bestAlgo.average_movement} <small>cyl/req</small></strong>
            </div>
            <div className="winner-metric-item">
              <span className="metric-label">Reduction vs FCFS</span>
              <strong className="metric-val text-success">
                {fcfsTotal > 0 ? `-${(((fcfsTotal - bestAlgo.total_movement) / fcfsTotal) * 100).toFixed(1)}%` : '0%'}
              </strong>
            </div>
          </div>

          <p className="winner-note">
            Selected because it minimizes total cylinder traversal distance for this specific queue distribution.
          </p>
        </div>

        {/* FCFS Baseline Card */}
        <div className="card baseline-card">
          <div className="card-header-clean">
            <span className="baseline-tag">Baseline Reference</span>
            <h4>First-Come, First-Served (FCFS)</h4>
          </div>
          <div className="baseline-metrics">
            <div className="baseline-metric-item">
              <span>Total Movement:</span>
              <strong>{fcfsResult?.total_movement ?? 'N/A'} cyl</strong>
            </div>
            <div className="baseline-metric-item">
              <span>Avg Movement:</span>
              <strong>{fcfsResult?.average_movement ?? 'N/A'} cyl/req</strong>
            </div>
            <div className="baseline-metric-item">
              <span>Arrival Preservation:</span>
              <strong className="text-primary">100% (FIFO)</strong>
            </div>
          </div>
          <p className="baseline-desc">
            Provides a non-reordering benchmark. Any policy with &lt; {fcfsTotal} movement optimizes physical head travel.
          </p>
        </div>
      </div>

      {/* Bar Chart Comparison */}
      <div className="card comparison-chart-card">
        <div className="card-header">
          <div className="card-title-group">
            <BarChart2 className="card-icon" size={20} />
            <div>
              <h3 className="card-title">Comparative Total Seek Distance (Cylinders)</h3>
              <p className="card-subtitle">Lower values represent superior seek efficiency and reduced arm mechanical wear</p>
            </div>
          </div>
        </div>

        <div className="horizontal-bars-container">
          {ranking.map((algo, idx) => {
            const pct = Math.max(8, (algo.total_movement / maxTotal) * 100);
            const color = ALGO_COLORS[algo.name]?.color || '#3b82f6';
            const isWinner = idx === 0;

            return (
              <div
                key={algo.name}
                className="algo-bar-row"
                onClick={() => onSelectAlgorithm && onSelectAlgorithm(algo.name)}
                title={`Click to inspect ${algo.name} in step-by-step playback`}
              >
                <div className="algo-bar-label-col">
                  <span className="algo-bar-rank">#{idx + 1}</span>
                  <strong className="algo-bar-name" style={{ color }}>{algo.name}</strong>
                  {isWinner && <Award size={14} className="trophy-inline" />}
                </div>

                <div className="algo-bar-track-col">
                  <div
                    className="algo-bar-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color
                    }}
                  >
                    <span className="algo-bar-inner-text">
                      {algo.total_movement} cyl
                    </span>
                  </div>
                </div>

                <div className="algo-bar-stats-col">
                  <span className="algo-bar-avg">{algo.average_movement} avg/req</span>
                  <button className="btn-inspect-link">
                    <span>Inspect</span>
                    <ArrowUpRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comprehensive Literature Comparison Table */}
      <div className="card comparison-table-card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Traditional Algorithm Synthesis & Trade-Off Matrix</h3>
            <p className="card-subtitle">
              Based on Literature Review comparative evaluation procedure
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Algorithm</th>
                <th>Selection Rule</th>
                <th>Total Seek</th>
                <th>Avg Seek / Req</th>
                <th>Starvation Risk</th>
                <th>Trade-Off Summary</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((item, idx) => {
                const color = ALGO_COLORS[item.name]?.color || '#3b82f6';
                return (
                  <tr key={item.name} className={idx === 0 ? 'highlight-row' : ''}>
                    <td>
                      <span className={`rank-badge ${idx === 0 ? 'rank-1' : ''}`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color }}>{item.name}</strong>
                    </td>
                    <td className="cell-rule">{item.metadata.selectionRule}</td>
                    <td className="cell-metric">
                      <strong>{item.total_movement}</strong> <small>cyl</small>
                    </td>
                    <td className="cell-metric">
                      <strong>{item.average_movement}</strong> <small>cyl</small>
                    </td>
                    <td>
                      <span className={`starvation-pill ${item.metadata.starvationRisk === 'High' ? 'pill-high' : item.metadata.starvationRisk === 'None' ? 'pill-none' : 'pill-low'}`}>
                        {item.metadata.starvationRisk}
                      </span>
                    </td>
                    <td className="cell-concern">
                      <span className="concern-text">{item.metadata.concern}</span>
                    </td>
                    <td>
                      <button
                        onClick={() => onSelectAlgorithm && onSelectAlgorithm(item.name)}
                        className="btn-inspect-sm"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
