export const PRESET_WORKLOADS = [
  {
    id: 'silberschatz-classic',
    title: 'Silberschatz Classic Benchmark',
    description: 'The standard textbook benchmark queue from Operating System Concepts (98, 183, 37, 122, 14, 124, 65, 67) with initial head at track 53.',
    requests: [98, 183, 37, 122, 14, 124, 65, 67],
    initialHead: 53,
    direction: 1,
    maxTracks: 200,
    scanBoundary: true,
    countWraparound: true,
    category: 'Textbook Reference'
  },
  {
    id: 'clustered-regions',
    title: 'Bimodal Clustered Workload',
    description: 'Two separate clusters at low and high track ranges to illustrate how sweep algorithms bridge isolated track clusters.',
    requests: [12, 15, 14, 18, 22, 160, 165, 172, 168, 175],
    initialHead: 90,
    direction: 1,
    maxTracks: 200,
    scanBoundary: true,
    countWraparound: true,
    category: 'Clustered Workload'
  },
  {
    id: 'starvation-outlier',
    title: 'Distant Outlier / Starvation Vulnerability',
    description: 'A dense cluster near the head with a single distant track (track 195). Demonstrates SSTF postponement vs SCAN/LOOK fairness guarantee.',
    requests: [21, 23, 25, 22, 28, 20, 26, 24, 195],
    initialHead: 20,
    direction: 1,
    maxTracks: 200,
    scanBoundary: true,
    countWraparound: true,
    category: 'Fairness & Starvation'
  },
  {
    id: 'extreme-edges',
    title: 'Extreme Edge Oscillations',
    description: 'Alternating requests near cylinder 0 and cylinder 199. Demonstrates the extreme seek penalty of FCFS compared to directional sweeps.',
    requests: [4, 192, 8, 196, 2, 198, 12],
    initialHead: 50,
    direction: -1,
    maxTracks: 200,
    scanBoundary: true,
    countWraparound: true,
    category: 'Boundary & Extremes'
  },
  {
    id: 'uniform-spread',
    title: 'Uniform Wide Distribution',
    description: 'Broadly distributed I/O requests across all disk cylinders, simulating general multi-tasking desktop file access.',
    requests: [176, 79, 34, 60, 92, 11, 41, 114, 140, 188],
    initialHead: 50,
    direction: 1,
    maxTracks: 200,
    scanBoundary: true,
    countWraparound: true,
    category: 'General Workload'
  }
];
