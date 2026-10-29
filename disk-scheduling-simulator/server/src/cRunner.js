import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const C_EXE_PATH = path.resolve(__dirname, '../c-engine/disk_scheduler.exe');

export function checkCEngineAvailable() {
  return fs.existsSync(C_EXE_PATH);
}

export function executeCEngine({
  algorithm = '--all',
  initialHead = 53,
  direction = 1,
  maxTracks = 200,
  scanBoundary = true,
  countWraparound = true,
  requests = []
}) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(C_EXE_PATH)) {
      return reject(new Error(`Native C executable not found at ${C_EXE_PATH}. Please compile first.`));
    }

    const algoArg = algorithm === 'ALL' || algorithm === 'all' ? '--all' : algorithm;
    const dirArg = String(direction);
    const maxTracksArg = String(maxTracks);
    const boundaryArg = scanBoundary ? '1' : '0';
    const wraparoundArg = countWraparound ? '1' : '0';
    const headArg = String(initialHead);

    const args = [
      algoArg,
      headArg,
      dirArg,
      maxTracksArg,
      boundaryArg,
      wraparoundArg,
      ...requests.map(r => String(r))
    ];

    const startTime = performance.now();

    execFile(C_EXE_PATH, args, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      const execDurationMs = (performance.now() - startTime).toFixed(2);

      if (error) {
        return reject(new Error(`C Engine Execution Error: ${error.message} - ${stderr}`));
      }

      try {
        const parsed = JSON.parse(stdout.trim());
        parsed.executionTimeMs = parseFloat(execDurationMs);
        parsed.engine = 'Native C Executable (Clang x86_64)';
        parsed.executedVia = 'c_binary';
        resolve(parsed);
      } catch (parseErr) {
        reject(new Error(`Failed to parse C engine JSON output: ${parseErr.message}\nRaw: ${stdout}`));
      }
    });
  });
}
