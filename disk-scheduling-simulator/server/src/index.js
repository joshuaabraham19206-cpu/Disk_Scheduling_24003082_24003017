import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { executeCEngine, checkCEngineAvailable } from './cRunner.js';
import { runJsEngine } from './jsEngine.js';
import { PRESET_WORKLOADS } from './presets.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static React client if built
const clientDist = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const cAvailable = checkCEngineAvailable();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cEngineAvailable: cAvailable,
    engineName: cAvailable ? 'Native C Binary (Compiled Clang x86_64)' : 'JavaScript High-Accuracy Mirror Engine',
    algorithmsSupported: ['FCFS', 'SSTF', 'SCAN', 'C-SCAN', 'LOOK', 'C-LOOK']
  });
});

// Presets endpoint
app.get('/api/presets', (req, res) => {
  res.json(PRESET_WORKLOADS);
});

// Simulation endpoint
app.post('/api/simulate', async (req, res) => {
  try {
    let {
      algorithm = 'ALL',
      requests = [],
      initialHead = 53,
      direction = 1,
      maxTracks = 200,
      scanBoundary = true,
      countWraparound = true,
      deduplicate = false
    } = req.body;

    // 1. Validate inputs thoroughly
    maxTracks = parseInt(maxTracks, 10);
    if (isNaN(maxTracks) || maxTracks < 2) {
      return res.status(400).json({
        error: 'Invalid Disk Track Range',
        message: 'Maximum tracks (disk size) must be an integer of at least 2 tracks (e.g. 200 for tracks 0 to 199).'
      });
    }

    initialHead = parseInt(initialHead, 10);
    if (isNaN(initialHead) || initialHead < 0 || initialHead >= maxTracks) {
      return res.status(400).json({
        error: 'Invalid Initial Head Position',
        message: `Initial head position must be between cylinder 0 and ${maxTracks - 1}. Received: ${req.body.initialHead}`
      });
    }

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        error: 'Empty Request Queue',
        message: 'Please provide at least one valid disk track request in the queue.'
      });
    }

    // Parse and validate individual track requests
    const parsedRequests = [];
    for (let i = 0; i < requests.length; i++) {
      const val = parseInt(requests[i], 10);
      if (isNaN(val) || val < 0 || val >= maxTracks) {
        return res.status(400).json({
          error: 'Out-of-Bounds Request Cylinder',
          message: `Request #${i + 1} with value "${requests[i]}" is outside the disk cylinder bounds [0, ${maxTracks - 1}].`
        });
      }
      parsedRequests.push(val);
    }

    // Deduplication if enabled
    let finalRequests = parsedRequests;
    if (deduplicate) {
      finalRequests = [...new Set(parsedRequests)];
    }

    direction = parseInt(direction, 10) >= 0 ? 1 : -1;
    scanBoundary = Boolean(scanBoundary);
    countWraparound = Boolean(countWraparound);

    const params = {
      algorithm,
      requests: finalRequests,
      initialHead,
      direction,
      maxTracks,
      scanBoundary,
      countWraparound
    };

    // 2. Execute via Native C Engine or JS Engine fallback
    const cAvailable = checkCEngineAvailable();
    if (cAvailable) {
      try {
        const cResult = await executeCEngine(params);
        return res.json({
          success: true,
          source: 'c_engine',
          engine: 'Native C Binary (Compiled Clang x86_64)',
          input: {
            ...params,
            originalRequestCount: parsedRequests.length,
            servicedRequestCount: finalRequests.length,
            deduplicated: deduplicate
          },
          data: cResult
        });
      } catch (cErr) {
        console.warn('Native C engine execution encountered error, falling back to JS engine:', cErr.message);
      }
    }

    // Fallback to JS mirror engine
    const startMs = performance.now();
    const jsResult = runJsEngine(params);
    const durationMs = parseFloat((performance.now() - startMs).toFixed(2));

    return res.json({
      success: true,
      source: 'js_mirror',
      engine: 'High-Accuracy JavaScript Mirror Engine',
      executionTimeMs: durationMs,
      input: {
        ...params,
        originalRequestCount: parsedRequests.length,
        servicedRequestCount: finalRequests.length,
        deduplicated: deduplicate
      },
      data: jsResult
    });
  } catch (err) {
    console.error('Simulation error:', err);
    res.status(500).json({
      error: 'Simulation Engine Error',
      message: err.message
    });
  }
});

// SPA wildcard fallback
if (fs.existsSync(clientDist)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[Disk Scheduling Simulator Server] running on http://localhost:${PORT}`);
  console.log(`[Engine Status] Native C Binary Available: ${checkCEngineAvailable()}`);
});
