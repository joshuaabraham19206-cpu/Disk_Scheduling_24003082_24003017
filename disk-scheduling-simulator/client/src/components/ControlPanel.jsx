import React, { useState } from 'react';
import { 
  Play, 
  Settings2, 
  Shuffle, 
  Plus, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertCircle,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ControlPanel({
  requests,
  setRequests,
  initialHead,
  setInitialHead,
  direction,
  setDirection,
  maxTracks,
  setMaxTracks,
  scanBoundary,
  setScanBoundary,
  countWraparound,
  setCountWraparound,
  deduplicate,
  setDeduplicate,
  onRunSimulation,
  loading,
  presets,
  onSelectPreset
}) {
  const [rawInput, setRawInput] = useState(requests.join(', '));
  const [newTrackVal, setNewTrackVal] = useState('');
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Handle raw string input change
  const handleRawInputChange = (e) => {
    const val = e.target.value;
    setRawInput(val);
    setValidationError('');

    // Parse tokens
    const tokens = val.split(/[,\s]+/).map(t => t.trim()).filter(Boolean);
    const parsed = [];
    for (const t of tokens) {
      const num = Number(t);
      if (isNaN(num)) {
        setValidationError(`"${t}" is not a valid cylinder number.`);
        return;
      }
      if (num < 0 || num >= maxTracks) {
        setValidationError(`Track ${num} is out of cylinder bounds [0, ${maxTracks - 1}].`);
        return;
      }
      parsed.push(num);
    }
    setRequests(parsed);
  };

  // Add individual track chip
  const handleAddTrack = (e) => {
    e.preventDefault();
    const num = Number(newTrackVal.trim());
    if (isNaN(num) || newTrackVal.trim() === '') {
      setValidationError('Please enter a valid cylinder track number.');
      return;
    }
    if (num < 0 || num >= maxTracks) {
      setValidationError(`Track ${num} must be between 0 and ${maxTracks - 1}.`);
      return;
    }
    const updated = [...requests, num];
    setRequests(updated);
    setRawInput(updated.join(', '));
    setNewTrackVal('');
    setValidationError('');
  };

  // Remove individual track chip
  const handleRemoveTrack = (index) => {
    const updated = requests.filter((_, i) => i !== index);
    setRequests(updated);
    setRawInput(updated.join(', '));
  };

  // Generate random workload
  const handleGenerateRandom = () => {
    const count = 8;
    const rand = [];
    for (let i = 0; i < count; i++) {
      rand.push(Math.floor(Math.random() * (maxTracks - 1)));
    }
    setRequests(rand);
    setRawInput(rand.join(', '));
    setValidationError('');
  };

  // Handle Preset selection
  const handlePresetChange = (preset) => {
    setRequests(preset.requests);
    setRawInput(preset.requests.join(', '));
    setInitialHead(preset.initialHead);
    setDirection(preset.direction);
    setMaxTracks(preset.maxTracks);
    if (preset.scanBoundary !== undefined) setScanBoundary(preset.scanBoundary);
    if (preset.countWraparound !== undefined) setCountWraparound(preset.countWraparound);
    setValidationError('');
    if (onSelectPreset) onSelectPreset(preset);
  };

  return (
    <div className="card control-panel-card">
      <div className="card-header">
        <div className="card-title-group">
          <Settings2 className="card-icon" size={20} />
          <h2 className="card-title">Simulation Parameters & Workload</h2>
        </div>

        {/* Presets Row */}
        <div className="presets-pill-group">
          <span className="presets-label">Presets:</span>
          {presets.map(p => (
            <button
              key={p.id}
              onClick={() => handlePresetChange(p)}
              className="btn-preset-pill"
              title={p.description}
            >
              {p.title.split(' ')[0]}
            </button>
          ))}
          <button
            onClick={handleGenerateRandom}
            className="btn-preset-pill btn-random"
            title="Generate random request workload"
          >
            <Shuffle size={13} />
            <span>Random</span>
          </button>
        </div>
      </div>

      <div className="control-grid">
        {/* Request Queue Input */}
        <div className="control-group col-span-full">
          <div className="label-row">
            <label className="input-label" htmlFor="queueInput">
              Disk Request Queue (Cylinders)
            </label>
            <span className="helper-hint">Comma or space separated track numbers</span>
          </div>

          <div className="queue-input-wrapper">
            <input
              id="queueInput"
              type="text"
              className={`input-field ${validationError ? 'input-error' : ''}`}
              value={rawInput}
              onChange={handleRawInputChange}
              placeholder="e.g. 98, 183, 37, 122, 14, 124, 65, 67"
            />
          </div>

          {/* Track Chips Preview */}
          <div className="track-chips-container">
            <span className="chips-title">Current Queue ({requests.length}):</span>
            <div className="chips-list">
              {requests.map((track, idx) => (
                <span key={`${track}-${idx}`} className="track-chip">
                  <span className="chip-index">{idx + 1}.</span>
                  <strong className="chip-value">{track}</strong>
                  <button 
                    onClick={() => handleRemoveTrack(idx)}
                    className="chip-remove"
                    title={`Remove track ${track}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {/* Quick Add Inline */}
              <form onSubmit={handleAddTrack} className="inline-add-form">
                <input
                  type="number"
                  min="0"
                  max={maxTracks - 1}
                  value={newTrackVal}
                  onChange={(e) => setNewTrackVal(e.target.value)}
                  placeholder="Track #"
                  className="inline-add-input"
                />
                <button type="submit" className="inline-add-btn" title="Add track">
                  <Plus size={14} />
                </button>
              </form>
            </div>
          </div>

          {validationError && (
            <div className="validation-error-banner animate-fade-in">
              <AlertCircle size={16} />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Initial Head Position */}
        <div className="control-group">
          <div className="label-row">
            <label className="input-label" htmlFor="initialHeadInput">
              Initial Head Position
            </label>
            <span className="badge-head">Track {initialHead}</span>
          </div>
          <div className="slider-input-combo">
            <input
              id="initialHeadInput"
              type="number"
              min="0"
              max={maxTracks - 1}
              value={initialHead}
              onChange={(e) => setInitialHead(Math.max(0, Math.min(maxTracks - 1, Number(e.target.value))))}
              className="input-field input-number"
            />
            <input
              type="range"
              min="0"
              max={maxTracks - 1}
              value={initialHead}
              onChange={(e) => setInitialHead(Number(e.target.value))}
              className="range-slider"
            />
          </div>
        </div>

        {/* Total Disk Tracks / Range */}
        <div className="control-group">
          <div className="label-row">
            <label className="input-label" htmlFor="maxTracksInput">
              Disk Capacity / Tracks
            </label>
            <span className="helper-hint">0 to {maxTracks - 1}</span>
          </div>
          <input
            id="maxTracksInput"
            type="number"
            min="20"
            max="10000"
            value={maxTracks}
            onChange={(e) => setMaxTracks(Math.max(10, Number(e.target.value)))}
            className="input-field"
          />
        </div>

        {/* Initial Sweep Direction */}
        <div className="control-group">
          <label className="input-label">Initial Head Direction</label>
          <div className="direction-toggle-group">
            <button
              type="button"
              onClick={() => setDirection(1)}
              className={`direction-btn ${direction >= 0 ? 'active-high' : ''}`}
            >
              <ArrowUpRight size={16} />
              <span>HIGH (Towards {maxTracks - 1})</span>
            </button>
            <button
              type="button"
              onClick={() => setDirection(-1)}
              className={`direction-btn ${direction < 0 ? 'active-low' : ''}`}
            >
              <ArrowDownLeft size={16} />
              <span>LOW (Towards 0)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Literature Review Assumptions (Collapsible) */}
      <div className="assumptions-section">
        <button
          type="button"
          onClick={() => setShowAssumptions(!showAssumptions)}
          className="assumptions-toggle-btn"
        >
          <div className="assumptions-toggle-left">
            <Sliders size={15} />
            <span>Literature Review Evaluation Conventions & Modeling Assumptions</span>
          </div>
          {showAssumptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAssumptions && (
          <div className="assumptions-content animate-fade-in">
            <p className="assumptions-desc">
              As emphasized in Abraham (2026, Sec. 5.1 & 7.3), different literature studies use varying conventions. You can explicitly configure these assumptions below:
            </p>

            <div className="assumptions-options-grid">
              <label className="checkbox-card">
                <input
                  type="checkbox"
                  checked={scanBoundary}
                  onChange={(e) => setScanBoundary(e.target.checked)}
                />
                <div className="checkbox-card-body">
                  <span className="checkbox-title">SCAN / C-SCAN Boundary Traversal</span>
                  <span className="checkbox-subtitle">
                    Travel all the way to physical disk edge (0 or {maxTracks - 1}) before reversing. If unchecked, reverses at furthest request (LOOK behavior).
                  </span>
                </div>
              </label>

              <label className="checkbox-card">
                <input
                  type="checkbox"
                  checked={countWraparound}
                  onChange={(e) => setCountWraparound(e.target.checked)}
                />
                <div className="checkbox-card-body">
                  <span className="checkbox-title">Count Wraparound Return Jump in Seek</span>
                  <span className="checkbox-subtitle">
                    Include the non-servicing reset jump ({maxTracks - 1} → 0) in total seek distance. If unchecked, jump is shown but not added to seek movement total.
                  </span>
                </div>
              </label>

              <label className="checkbox-card">
                <input
                  type="checkbox"
                  checked={deduplicate}
                  onChange={(e) => setDeduplicate(e.target.checked)}
                />
                <div className="checkbox-card-body">
                  <span className="checkbox-title">Deduplicate Identical Queue Cylinders</span>
                  <span className="checkbox-subtitle">
                    Service duplicate cylinder requests in a single head pass rather than multiple sequential seeks.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="card-footer">
        <div className="summary-status">
          <span>Ready to simulate {requests.length} requests</span>
          <span className="status-separator">•</span>
          <span>Head: Track {initialHead}</span>
          <span className="status-separator">•</span>
          <span>Sweep: {direction >= 0 ? 'HIGH' : 'LOW'}</span>
        </div>

        <button
          onClick={onRunSimulation}
          disabled={loading || requests.length === 0 || !!validationError}
          className="btn-primary"
        >
          <Play size={18} />
          <span>{loading ? 'Simulating via C Engine...' : 'Run Simulation'}</span>
        </button>
      </div>
    </div>
  );
}
