// JavaScript Mirror Engine with identical algorithm behavior for fallback & cross-verification

export function runJsEngine({
  algorithm = 'ALL',
  initialHead = 53,
  direction = 1,
  maxTracks = 200,
  scanBoundary = true,
  countWraparound = true,
  requests = []
}) {
  const reqList = [...requests];

  function runFCFS() {
    const sequence = [initialHead];
    const steps = [];
    let current = initialHead;
    let total = 0;

    for (let i = 0; i < reqList.length; i++) {
      const target = reqList[i];
      const dist = Math.abs(target - current);
      total += dist;
      steps.push({
        step: i + 1,
        from: current,
        to: target,
        distance: dist,
        cumulative_distance: total,
        is_wraparound: false,
        reason: `FIFO: Request #${i + 1} (track ${target}) serviced in arrival order`
      });
      sequence.push(target);
      current = target;
    }

    return {
      algorithm: 'FCFS',
      initial_head: initialHead,
      direction,
      max_tracks: maxTracks,
      scan_boundary: scanBoundary,
      count_wraparound: countWraparound,
      total_movement: total,
      average_movement: reqList.length ? parseFloat((total / reqList.length).toFixed(2)) : 0,
      sequence,
      steps
    };
  }

  function runSSTF() {
    const sequence = [initialHead];
    const steps = [];
    let current = initialHead;
    let total = 0;
    const remaining = [...reqList];
    let stepCount = 0;

    while (remaining.length > 0) {
      stepCount++;
      let bestIdx = 0;
      let minDist = Math.abs(remaining[0] - current);

      for (let i = 1; i < remaining.length; i++) {
        const d = Math.abs(remaining[i] - current);
        if (d < minDist || (d === minDist && remaining[i] < remaining[bestIdx])) {
          minDist = d;
          bestIdx = i;
        }
      }

      const target = remaining.splice(bestIdx, 1)[0];
      total += minDist;
      steps.push({
        step: stepCount,
        from: current,
        to: target,
        distance: minDist,
        cumulative_distance: total,
        is_wraparound: false,
        reason: `SSTF: Selected track ${target} with shortest seek time (distance: ${minDist} tracks from head ${current})`
      });
      sequence.push(target);
      current = target;
    }

    return {
      algorithm: 'SSTF',
      initial_head: initialHead,
      direction,
      max_tracks: maxTracks,
      scan_boundary: scanBoundary,
      count_wraparound: countWraparound,
      total_movement: total,
      average_movement: reqList.length ? parseFloat((total / reqList.length).toFixed(2)) : 0,
      sequence,
      steps
    };
  }

  function runSCAN() {
    const sequence = [initialHead];
    const steps = [];
    let current = initialHead;
    let total = 0;
    let stepCount = 0;

    const left = reqList.filter(r => r < initialHead).sort((a, b) => a - b);
    const right = reqList.filter(r => r >= initialHead).sort((a, b) => a - b);

    if (direction >= 0) { // UP
      for (const target of right) {
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `SCAN: Sweeping high -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }

      if (scanBoundary && left.length > 0 && current !== maxTracks - 1) {
        stepCount++;
        const dist = Math.abs((maxTracks - 1) - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: maxTracks - 1,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `SCAN: Reached disk upper boundary (cylinder ${maxTracks - 1}); reversing direction to LOW`
        });
        sequence.push(maxTracks - 1);
        current = maxTracks - 1;
      }

      for (let i = left.length - 1; i >= 0; i--) {
        const target = left[i];
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `SCAN: Sweeping low -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }
    } else { // DOWN
      for (let i = left.length - 1; i >= 0; i--) {
        const target = left[i];
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `SCAN: Sweeping low -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }

      if (scanBoundary && right.length > 0 && current !== 0) {
        stepCount++;
        const dist = Math.abs(0 - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: 0,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `SCAN: Reached disk lower boundary (cylinder 0); reversing direction to HIGH`
        });
        sequence.push(0);
        current = 0;
      }

      for (const target of right) {
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `SCAN: Sweeping high -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }
    }

    return {
      algorithm: 'SCAN',
      initial_head: initialHead,
      direction,
      max_tracks: maxTracks,
      scan_boundary: scanBoundary,
      count_wraparound: countWraparound,
      total_movement: total,
      average_movement: reqList.length ? parseFloat((total / reqList.length).toFixed(2)) : 0,
      sequence,
      steps
    };
  }

  function runCSCAN() {
    const sequence = [initialHead];
    const steps = [];
    let current = initialHead;
    let total = 0;
    let stepCount = 0;

    const left = reqList.filter(r => r < initialHead).sort((a, b) => a - b);
    const right = reqList.filter(r => r >= initialHead).sort((a, b) => a - b);

    if (direction >= 0) {
      for (const target of right) {
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `C-SCAN: Forward sweep (high) -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }

      if (left.length > 0) {
        if (current !== maxTracks - 1) {
          stepCount++;
          const dist = Math.abs((maxTracks - 1) - current);
          total += dist;
          steps.push({
            step: stepCount,
            from: current,
            to: maxTracks - 1,
            distance: dist,
            cumulative_distance: total,
            is_wraparound: false,
            reason: `C-SCAN: Reached disk upper boundary (cylinder ${maxTracks - 1})`
          });
          sequence.push(maxTracks - 1);
          current = maxTracks - 1;
        }

        stepCount++;
        const jumpDist = Math.abs(0 - current);
        if (countWraparound) total += jumpDist;
        steps.push({
          step: stepCount,
          from: current,
          to: 0,
          distance: jumpDist,
          cumulative_distance: total,
          is_wraparound: true,
          reason: `C-SCAN: Circular jump to opposite boundary (cylinder 0)${countWraparound ? ' [counted in seek]' : ' [wraparound excluded from seek]'}`
        });
        sequence.push(0);
        current = 0;

        for (const target of left) {
          stepCount++;
          const dist = Math.abs(target - current);
          total += dist;
          steps.push({
            step: stepCount,
            from: current,
            to: target,
            distance: dist,
            cumulative_distance: total,
            is_wraparound: false,
            reason: `C-SCAN: Forward sweep after wrap -> serviced track ${target}`
          });
          sequence.push(target);
          current = target;
        }
      }
    } else {
      for (let i = left.length - 1; i >= 0; i--) {
        const target = left[i];
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `C-SCAN: Forward sweep (low) -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }

      if (right.length > 0) {
        if (current !== 0) {
          stepCount++;
          const dist = Math.abs(0 - current);
          total += dist;
          steps.push({
            step: stepCount,
            from: current,
            to: 0,
            distance: dist,
            cumulative_distance: total,
            is_wraparound: false,
            reason: `C-SCAN: Reached disk lower boundary (cylinder 0)`
          });
          sequence.push(0);
          current = 0;
        }

        stepCount++;
        const jumpDist = Math.abs((maxTracks - 1) - current);
        if (countWraparound) total += jumpDist;
        steps.push({
          step: stepCount,
          from: current,
          to: maxTracks - 1,
          distance: jumpDist,
          cumulative_distance: total,
          is_wraparound: true,
          reason: `C-SCAN: Circular jump to opposite boundary (cylinder ${maxTracks - 1})${countWraparound ? ' [counted in seek]' : ' [wraparound excluded from seek]'}`
        });
        sequence.push(maxTracks - 1);
        current = maxTracks - 1;

        for (let i = right.length - 1; i >= 0; i--) {
          const target = right[i];
          stepCount++;
          const dist = Math.abs(target - current);
          total += dist;
          steps.push({
            step: stepCount,
            from: current,
            to: target,
            distance: dist,
            cumulative_distance: total,
            is_wraparound: false,
            reason: `C-SCAN: Forward sweep after wrap -> serviced track ${target}`
          });
          sequence.push(target);
          current = target;
        }
      }
    }

    return {
      algorithm: 'C-SCAN',
      initial_head: initialHead,
      direction,
      max_tracks: maxTracks,
      scan_boundary: scanBoundary,
      count_wraparound: countWraparound,
      total_movement: total,
      average_movement: reqList.length ? parseFloat((total / reqList.length).toFixed(2)) : 0,
      sequence,
      steps
    };
  }

  function runLOOK() {
    const sequence = [initialHead];
    const steps = [];
    let current = initialHead;
    let total = 0;
    let stepCount = 0;

    const left = reqList.filter(r => r < initialHead).sort((a, b) => a - b);
    const right = reqList.filter(r => r >= initialHead).sort((a, b) => a - b);

    if (direction >= 0) {
      for (const target of right) {
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `LOOK: Sweeping high -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }

      for (let i = left.length - 1; i >= 0; i--) {
        const target = left[i];
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: i === left.length - 1 && right.length > 0
            ? `LOOK: Reversing direction at last request (no boundary trip) -> serviced track ${target}`
            : `LOOK: Sweeping low -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }
    } else {
      for (let i = left.length - 1; i >= 0; i--) {
        const target = left[i];
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `LOOK: Sweeping low -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }

      for (let i = 0; i < right.length; i++) {
        const target = right[i];
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: i === 0 && left.length > 0
            ? `LOOK: Reversing direction at lowest request (no boundary trip) -> serviced track ${target}`
            : `LOOK: Sweeping high -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }
    }

    return {
      algorithm: 'LOOK',
      initial_head: initialHead,
      direction,
      max_tracks: maxTracks,
      scan_boundary: false,
      count_wraparound: countWraparound,
      total_movement: total,
      average_movement: reqList.length ? parseFloat((total / reqList.length).toFixed(2)) : 0,
      sequence,
      steps
    };
  }

  function runCLOOK() {
    const sequence = [initialHead];
    const steps = [];
    let current = initialHead;
    let total = 0;
    let stepCount = 0;

    const left = reqList.filter(r => r < initialHead).sort((a, b) => a - b);
    const right = reqList.filter(r => r >= initialHead).sort((a, b) => a - b);

    if (direction >= 0) {
      for (const target of right) {
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `C-LOOK: Forward sweep (high) -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }

      if (left.length > 0) {
        const jumpTarget = left[0];
        stepCount++;
        const jumpDist = Math.abs(jumpTarget - current);
        if (countWraparound) total += jumpDist;
        steps.push({
          step: stepCount,
          from: current,
          to: jumpTarget,
          distance: jumpDist,
          cumulative_distance: total,
          is_wraparound: true,
          reason: `C-LOOK: Circular jump directly to lowest pending track ${jumpTarget} (avoiding boundary 0)${countWraparound ? ' [counted in seek]' : ' [wraparound excluded from seek]'}`
        });
        sequence.push(jumpTarget);
        current = jumpTarget;

        for (let i = 1; i < left.length; i++) {
          const target = left[i];
          stepCount++;
          const dist = Math.abs(target - current);
          total += dist;
          steps.push({
            step: stepCount,
            from: current,
            to: target,
            distance: dist,
            cumulative_distance: total,
            is_wraparound: false,
            reason: `C-LOOK: Forward sweep after wrap -> serviced track ${target}`
          });
          sequence.push(target);
          current = target;
        }
      }
    } else {
      for (let i = left.length - 1; i >= 0; i--) {
        const target = left[i];
        stepCount++;
        const dist = Math.abs(target - current);
        total += dist;
        steps.push({
          step: stepCount,
          from: current,
          to: target,
          distance: dist,
          cumulative_distance: total,
          is_wraparound: false,
          reason: `C-LOOK: Forward sweep (low) -> serviced track ${target}`
        });
        sequence.push(target);
        current = target;
      }

      if (right.length > 0) {
        const jumpTarget = right[right.length - 1];
        stepCount++;
        const jumpDist = Math.abs(jumpTarget - current);
        if (countWraparound) total += jumpDist;
        steps.push({
          step: stepCount,
          from: current,
          to: jumpTarget,
          distance: jumpDist,
          cumulative_distance: total,
          is_wraparound: true,
          reason: `C-LOOK: Circular jump directly to highest pending track ${jumpTarget}${countWraparound ? ' [counted in seek]' : ' [wraparound excluded from seek]'}`
        });
        sequence.push(jumpTarget);
        current = jumpTarget;

        for (let i = right.length - 2; i >= 0; i--) {
          const target = right[i];
          stepCount++;
          const dist = Math.abs(target - current);
          total += dist;
          steps.push({
            step: stepCount,
            from: current,
            to: target,
            distance: dist,
            cumulative_distance: total,
            is_wraparound: false,
            reason: `C-LOOK: Forward sweep after wrap -> serviced track ${target}`
          });
          sequence.push(target);
          current = target;
        }
      }
    }

    return {
      algorithm: 'C-LOOK',
      initial_head: initialHead,
      direction,
      max_tracks: maxTracks,
      scan_boundary: false,
      count_wraparound: countWraparound,
      total_movement: total,
      average_movement: reqList.length ? parseFloat((total / reqList.length).toFixed(2)) : 0,
      sequence,
      steps
    };
  }

  const normalizedAlgo = (algorithm || '').toUpperCase();
  if (normalizedAlgo === 'ALL' || normalizedAlgo === '--ALL') {
    return {
      engine: 'High-Accuracy Mirror Engine',
      results: {
        'FCFS': runFCFS(),
        'SSTF': runSSTF(),
        'SCAN': runSCAN(),
        'C-SCAN': runCSCAN(),
        'LOOK': runLOOK(),
        'C-LOOK': runCLOOK()
      }
    };
  } else if (normalizedAlgo === 'FCFS') {
    return runFCFS();
  } else if (normalizedAlgo === 'SSTF') {
    return runSSTF();
  } else if (normalizedAlgo === 'SCAN') {
    return runSCAN();
  } else if (normalizedAlgo === 'C-SCAN' || normalizedAlgo === 'CSCAN') {
    return runCSCAN();
  } else if (normalizedAlgo === 'LOOK') {
    return runLOOK();
  } else if (normalizedAlgo === 'C-LOOK' || normalizedAlgo === 'CLOOK') {
    return runCLOOK();
  }

  throw new Error(`Unsupported algorithm: ${algorithm}`);
}
