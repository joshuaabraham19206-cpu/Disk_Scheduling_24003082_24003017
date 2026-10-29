import React from 'react';
import { X, BookOpen, CheckCircle, AlertTriangle, Layers, Cpu } from 'lucide-react';

export default function LiteratureNotesModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <BookOpen className="text-primary" size={24} />
            <div>
              <h2 className="modal-title">Disk Scheduling Literature Review & Analysis</h2>

            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Key Insight Alert */}
          <div className="theory-alert-box">
            <h4 className="theory-alert-title">
              <Layers size={18} />
              Core Principle: Workload-Dependent Trade-Offs
            </h4>
            <p className="theory-alert-text">
              "No single disk scheduling algorithm is optimal for every request pattern. An effective evaluation should consider more than total head movement and must explicitly state the assumptions used by the simulator."
            </p>
          </div>

          <div className="theory-section">
            <h3 className="section-heading">Algorithm Comparison & Characteristics</h3>
            <div className="theory-cards-grid">
              <div className="theory-card">
                <div className="theory-card-badge fcfs-pill">FCFS</div>
                <h4 className="theory-card-title">First-Come, First-Served</h4>
                <p className="theory-card-text">
                  Services requests strictly in arrival order (FIFO). Completely fair with zero starvation risk, but may cause extreme head oscillation across the disk platter for scattered request queues.
                </p>
              </div>

              <div className="theory-card">
                <div className="theory-card-badge sstf-pill">SSTF</div>
                <h4 className="theory-card-title">Shortest Seek Time First</h4>
                <p className="theory-card-text">
                  Greedily selects the pending track closest to the current head position. Substantially reduces immediate movement, but distant outliers can suffer indefinite postponement (starvation).
                </p>
              </div>

              <div className="theory-card">
                <div className="theory-card-badge scan-pill">SCAN</div>
                <h4 className="theory-card-title">Elevator Algorithm</h4>
                <p className="theory-card-text">
                  Sweeps across the disk servicing requests encountered along the way, reverses at boundary track (0 or Max-1). Eliminates starvation while providing high throughput.
                </p>
              </div>

              <div className="theory-card">
                <div className="theory-card-badge cscan-pill">C-SCAN</div>
                <h4 className="theory-card-title">Circular SCAN</h4>
                <p className="theory-card-text">
                  Provides uniform directional service by sweeping in one direction only. Upon reaching the edge, performs a rapid reset jump to the opposite boundary without servicing requests during the jump.
                </p>
              </div>

              <div className="theory-card">
                <div className="theory-card-badge look-pill">LOOK</div>
                <h4 className="theory-card-title">LOOK Optimization</h4>
                <p className="theory-card-text">
                  Refines SCAN by reversing immediately at the furthest pending request in the current direction, avoiding unnecessary trips through empty boundary tracks.
                </p>
              </div>

              <div className="theory-card">
                <div className="theory-card-badge clook-pill">C-LOOK</div>
                <h4 className="theory-card-title">Circular LOOK</h4>
                <p className="theory-card-text">
                  Combines C-SCAN's uniform directional service with LOOK's boundary optimization: jumps directly from the outermost pending request to the lowest pending request on the opposite side.
                </p>
              </div>
            </div>
          </div>

          <div className="theory-section">
            <h3 className="section-heading">Mechanical HDD vs Solid-State Drive (SSD)</h3>
            <div className="hdd-ssd-comparison">
              <div className="comp-column">
                <h4>Mechanical Hard Disk Drives (HDDs)</h4>
                <ul>
                  <li>Physical read/write head travels mechanically across concentric platter tracks.</li>
                  <li>Seek time dominates access latency (~3–10ms per seek).</li>
                  <li>Track-distance minimization directly saves mechanical wear and response latency.</li>
                </ul>
              </div>
              <div className="comp-column">
                <h4>Solid-State Drives (SSDs)</h4>
                <ul>
                  <li>No moving parts; NAND flash memory cells accessed via electrical controller.</li>
                  <li>Head movement is not a direct physical metric for SSDs.</li>
                  <li>Flash wear-leveling and block garbage collection dictate SSD I/O policies.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <span className="text-muted text-sm">
            Disk Scheduling Simulator • Literature Review Research Project
          </span>
          <button onClick={onClose} className="btn-primary">
            Close Theory Notes
          </button>
        </div>
      </div>
    </div>
  );
}
