import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import SeekTrajectoryGraph, { ALGO_COLORS } from './components/SeekTrajectoryGraph';
import DiskPlatterVisualizer from './components/DiskPlatterVisualizer';
import PlaybackController from './components/PlaybackController';
import ComparisonDashboard from './components/ComparisonDashboard';
import DecisionTraceTable from './components/DecisionTraceTable';
import LiteratureNotesModal from './components/LiteratureNotesModal';
import { 
  BarChart2, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import './App.css';

const DEFAULT_REQUESTS = [98, 183, 37, 122, 14, 124, 65, 67];
const DEFAULT_HEAD = 53;
const DEFAULT_TRACKS = 200;

export default function App() {
  // State
  const [requests, setRequests] = useState(DEFAULT_REQUESTS);
  const [initialHead, setInitialHead] = useState(DEFAULT_HEAD);
  const [direction, setDirection] = useState(1);
  const [maxTracks, setMaxTracks] = useState(DEFAULT_TRACKS);
  const [scanBoundary, setScanBoundary] = useState(true);
  const [countWraparound, setCountWraparound] = useState(true);
  const [deduplicate, setDeduplicate] = useState(false);

  // Simulation output
  const [allResults, setAllResults] = useState(null);
  const [activeAlgo, setActiveAlgo] = useState('COMPARISON'); // 'COMPARISON' or 'FCFS', etc.
  const [loading, setLoading] = useState(false);
  const [engineInfo, setEngineInfo] = useState({ name: 'Native C Engine', cAvailable: true });
  const [presets, setPresets] = useState([]);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Modals & notifications
  const [showTheory, setShowTheory] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch health check & presets on initial load
  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setEngineInfo({
          name: data.engineName,
          cAvailable: data.cEngineAvailable
        });
      })
      .catch(err => {
        console.warn('API health check fallback:', err);
      });

    fetch('/api/presets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPresets(data);
        }
      })
      .catch(err => {
        console.warn('Could not load presets:', err);
      });
  }, []);

  // Run Simulation API call
  const runSimulation = useCallback(async () => {
    if (requests.length === 0) return;
    setLoading(true);
    setIsPlaying(false);

    try {
      const payload = {
        algorithm: 'ALL',
        requests,
        initialHead,
        direction,
        maxTracks,
        scanBoundary,
        countWraparound,
        deduplicate
      };

      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to simulate');
      }

      setAllResults(data.data.results);
      setCurrentStep(0);
      showToast(`Simulation completed successfully via ${data.engine}!`, 'success');
    } catch (err) {
      console.error('Simulation error:', err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [requests, initialHead, direction, maxTracks, scanBoundary, countWraparound, deduplicate]);

  // Run on initial mount
  useEffect(() => {
    runSimulation();
  }, [runSimulation]);

  // Current single algorithm result
  const currentSingleResult = allResults && activeAlgo !== 'COMPARISON' ? allResults[activeAlgo] : null;
  const totalSteps = currentSingleResult?.sequence ? currentSingleResult.sequence.length - 1 : 0;

  // Active step details for playback
  const activeTrack = currentSingleResult?.sequence ? currentSingleResult.sequence[currentStep] ?? initialHead : initialHead;
  const previousTrack = currentStep > 0 && currentSingleResult?.sequence ? currentSingleResult.sequence[currentStep - 1] : initialHead;
  const activeStepData = currentStep > 0 && currentSingleResult?.steps ? currentSingleResult.steps[currentStep - 1] : null;

  // Reset to default
  const handleReset = () => {
    setRequests(DEFAULT_REQUESTS);
    setInitialHead(DEFAULT_HEAD);
    setMaxTracks(DEFAULT_TRACKS);
    setDirection(1);
    setScanBoundary(true);
    setCountWraparound(true);
    setDeduplicate(false);
    setActiveAlgo('COMPARISON');
    showToast('Reset to Silberschatz classic benchmark defaults.', 'info');
  };

  // Export full simulation result as JSON
  const handleExportJSON = () => {
    if (!allResults) return;
    const exportData = {
      project: 'Disk Scheduling Simulator',
      engine: engineInfo.name,
      timestamp: new Date().toISOString(),
      parameters: {
        initialHead,
        direction: direction >= 0 ? 'HIGH' : 'LOW',
        maxTracks,
        requests,
        scanBoundary,
        countWraparound,
        deduplicate
      },
      results: allResults
    };

    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `disk_scheduling_results_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Simulation data exported to JSON.', 'success');
  };

  return (
    <div className="app-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`toast-notification toast-${toastMessage.type} animate-fade-in`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toastMessage.msg}</span>
        </div>
      )}

      {/* Header */}
      <Header
        engineName={engineInfo.name}
        cAvailable={engineInfo.cAvailable}
        onReset={handleReset}
        onOpenTheory={() => setShowTheory(true)}
        onExportJSON={handleExportJSON}
      />

      <main className="main-content-container">
        {/* Input & Parameters Card */}
        <ControlPanel
          requests={requests}
          setRequests={setRequests}
          initialHead={initialHead}
          setInitialHead={setInitialHead}
          direction={direction}
          setDirection={setDirection}
          maxTracks={maxTracks}
          setMaxTracks={setMaxTracks}
          scanBoundary={scanBoundary}
          setScanBoundary={setScanBoundary}
          countWraparound={countWraparound}
          setCountWraparound={setCountWraparound}
          deduplicate={deduplicate}
          setDeduplicate={setDeduplicate}
          onRunSimulation={runSimulation}
          loading={loading}
          presets={presets}
          onSelectPreset={() => runSimulation()}
        />

        {/* Algorithm View Mode Tabs */}
        <div className="algo-navigation-bar">
          <div className="nav-tabs-group">
            <button
              onClick={() => {
                setActiveAlgo('COMPARISON');
                setIsPlaying(false);
              }}
              className={`nav-tab-btn ${activeAlgo === 'COMPARISON' ? 'tab-active' : ''}`}
            >
              <BarChart2 size={16} />
              <span>All Algorithms Comparison</span>
            </button>

            {['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK'].map((algoKey) => {
              const conf = ALGO_COLORS[algoKey];
              const isCurrent = activeAlgo === algoKey;
              const seekTotal = allResults ? allResults[algoKey]?.total_movement : null;

              return (
                <button
                  key={algoKey}
                  onClick={() => {
                    setActiveAlgo(algoKey);
                    setCurrentStep(0);
                    setIsPlaying(false);
                  }}
                  className={`nav-tab-btn ${isCurrent ? 'tab-active' : ''}`}
                  style={{
                    color: isCurrent ? conf.color : 'inherit',
                    borderBottomColor: isCurrent ? conf.color : 'transparent'
                  }}
                >
                  <span 
                    className="tab-color-dot" 
                    style={{ backgroundColor: conf.color }} 
                  />
                  <span>{algoKey}</span>
                  {seekTotal !== null && (
                    <span className="tab-seek-chip" style={{ backgroundColor: conf.bg, color: conf.color }}>
                      {seekTotal} cyl
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content depending on active mode */}
        {activeAlgo === 'COMPARISON' ? (
          <div className="comparison-view-container animate-fade-in">
            {/* Trajectory Overlay Graph */}
            <SeekTrajectoryGraph
              algorithmMode="COMPARISON"
              allResults={allResults}
              maxTracks={maxTracks}
            />

            {/* Comparison Metrics, Leaderboard & Synthesis Table */}
            <ComparisonDashboard
              allResults={allResults}
              onSelectAlgorithm={(algoName) => {
                setActiveAlgo(algoName);
                setCurrentStep(0);
                setIsPlaying(false);
              }}
            />
          </div>
        ) : (
          <div className="single-algo-view-container animate-fade-in">
            {/* Top Interactive Row: Platter & Trajectory side-by-side */}
            <div className="visualizer-grid-row">
              {/* HDD Platter Animation */}
              <div className="grid-col-platter">
                <DiskPlatterVisualizer
                  currentTrack={activeTrack}
                  previousTrack={previousTrack}
                  maxTracks={maxTracks}
                  algorithm={activeAlgo}
                  stepNumber={currentStep}
                  totalSteps={totalSteps}
                  isWraparound={Boolean(activeStepData?.is_wraparound)}
                  reason={activeStepData?.reason}
                />
              </div>

              {/* Seek Trajectory SVG Graph */}
              <div className="grid-col-graph">
                <SeekTrajectoryGraph
                  algorithmMode={activeAlgo}
                  singleResult={currentSingleResult}
                  currentStepIndex={currentStep}
                  maxTracks={maxTracks}
                  onStepClick={(sIdx) => {
                    setIsPlaying(false);
                    setCurrentStep(sIdx);
                  }}
                />
              </div>
            </div>

            {/* Step-by-Step Playback Controller */}
            <PlaybackController
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              totalSteps={totalSteps}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              speed={speed}
              setSpeed={setSpeed}
              activeStepData={activeStepData}
              algorithm={activeAlgo}
            />

            {/* Decision Trace Table */}
            <DecisionTraceTable
              steps={currentSingleResult?.steps || []}
              currentStepIndex={currentStep}
              onStepSelect={(sIdx) => {
                setIsPlaying(false);
                setCurrentStep(sIdx);
              }}
              algorithm={activeAlgo}
            />
          </div>
        )}
      </main>

      {/* Literature Notes Modal */}
      <LiteratureNotesModal
        isOpen={showTheory}
        onClose={() => setShowTheory(false)}
      />
    </div>
  );
}
