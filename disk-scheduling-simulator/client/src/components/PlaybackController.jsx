import React, { useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Gauge
} from 'lucide-react';

export default function PlaybackController({
  currentStep,
  setCurrentStep,
  totalSteps,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  activeStepData,
  algorithm
}) {
  // Automatic step interval
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.floor(1000 / speed);
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalSteps) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed, totalSteps, setCurrentStep, setIsPlaying]);

  const handleFirst = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleTogglePlay = () => {
    if (currentStep >= totalSteps && !isPlaying) {
      setCurrentStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const handleLast = () => {
    setIsPlaying(false);
    setCurrentStep(totalSteps);
  };

  return (
    <div className="card playback-controller-card">
      <div className="playback-top-row">
        <div className="playback-status-info">
          <span className="step-counter-label">
            Step <strong>{currentStep}</strong> of <strong>{totalSteps}</strong>
          </span>
          {activeStepData && (
            <span className="cumulative-badge">
              Cumulative Seek: <strong>{activeStepData.cumulative_distance} tracks</strong>
            </span>
          )}
        </div>

        {/* Speed Controls */}
        <div className="speed-selector-group">
          <Gauge size={14} className="speed-icon" />
          <span className="speed-label">Speed:</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`btn-speed-pill ${speed === s ? 'active' : ''}`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Scrub Slider */}
      <div className="playback-slider-row">
        <input
          type="range"
          min="0"
          max={totalSteps}
          value={currentStep}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentStep(Number(e.target.value));
          }}
          className="playback-scrub-slider"
        />
      </div>

      {/* Control Buttons */}
      <div className="playback-buttons-row">
        <button 
          onClick={handleFirst} 
          disabled={currentStep === 0}
          className="btn-control-icon" 
          title="Jump to Start (Initial Head)"
        >
          <SkipBack size={18} />
        </button>

        <button 
          onClick={handlePrev} 
          disabled={currentStep === 0}
          className="btn-control-icon" 
          title="Previous Step"
        >
          <ChevronLeft size={20} />
        </button>

        <button 
          onClick={handleTogglePlay} 
          className="btn-play-primary" 
          title={isPlaying ? 'Pause Playback' : 'Play Stepper'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          <span>{isPlaying ? 'Pause' : 'Play'}</span>
        </button>

        <button 
          onClick={handleNext} 
          disabled={currentStep >= totalSteps}
          className="btn-control-icon" 
          title="Next Step"
        >
          <ChevronRight size={20} />
        </button>

        <button 
          onClick={handleLast} 
          disabled={currentStep >= totalSteps}
          className="btn-control-icon" 
          title="Jump to End"
        >
          <SkipForward size={18} />
        </button>
      </div>
    </div>
  );
}
