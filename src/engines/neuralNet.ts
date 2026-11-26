export type ActivationId = 'relu' | 'sigmoid' | 'tanh';
export type DatasetPresetId = 'xor' | 'linear' | 'circle';

export interface SamplePoint {
  x1: number;
  x2: number;
  y: number;
}

export interface NetworkWeights {
  // Hidden layer: 3 neurons, each takes 2 inputs
  w1: [[number, number], [number, number], [number, number]];
  b1: [number, number, number];
  // Output layer: 1 neuron taking 3 hidden activations
  w2: [number, number, number];
  b2: number;
}

export interface ForwardTrace {
  x: [number, number];
  yTarget: number;
  z1: [number, number, number];
  a1: [number, number, number];
  z2: number;
  yHat: number;
  loss: number;
}

export interface BackwardTrace {
  dL_dyHat: number;
  dL_dz2: number;
  dW2: [number, number, number];
  db2: number;
  dL_da1: [number, number, number];
  dL_dz1: [number, number, number];
  dW1: [[number, number], [number, number], [number, number]];
  db1: [number, number, number];
  hiddenGradNorm: number;
  outputGradNorm: number;
}

export interface NNState {
  activation: ActivationId;
  dataset: DatasetPresetId;
  learningRate: number;
  epoch: number;
  sampleIndex: number;
  weights: NetworkWeights;
  forward: ForwardTrace;
  backward: BackwardTrace;
  lossHistory: number[];
  accuracy: number;
  status: 'healthy' | 'vanishing' | 'exploding' | 'dead-relu';
}

export const NN_DATASETS: Record<DatasetPresetId, SamplePoint[]> = {
  xor: [
    { x1: -1, x2: -1, y: 0 },
    { x1: -1, x2: 1, y: 1 },
    { x1: 1, x2: -1, y: 1 },
    { x1: 1, x2: 1, y: 0 },
  ],
  linear: [
    { x1: -1, x2: -0.8, y: 0 },
    { x1: -0.7, x2: -1, y: 0 },
    { x1: 0.9, x2: 0.8, y: 1 },
    { x1: 1, x2: 0.6, y: 1 },
  ],
  circle: [
    { x1: 0.0, x2: 0.2, y: 1 },
    { x1: 0.2, x2: -0.2, y: 1 },
    { x1: -1.1, x2: 0.9, y: 0 },
    { x1: 1.1, x2: -0.9, y: 0 },
  ],
};

function activate(z: number, fn: ActivationId): number {
  if (fn === 'relu') return Math.max(0, z);
  if (fn === 'tanh') return Math.tanh(z);
  const clamped = Math.max(-30, Math.min(30, z));
  return 1 / (1 + Math.exp(-clamped));
}

function activateDeriv(z: number, a: number, fn: ActivationId): number {
  if (fn === 'relu') return z > 0 ? 1 : 0;
  if (fn === 'tanh') return 1 - a * a;
  return a * (1 - a);
}

function sigmoid(z: number): number {
  const clamped = Math.max(-30, Math.min(30, z));
  return 1 / (1 + Math.exp(-clamped));
}

export function getInitialWeights(preset: 'balanced' | 'vanishing' | 'exploding'): NetworkWeights {
  if (preset === 'vanishing') {
    return {
      w1: [
        [0.06, -0.05],
        [-0.04, 0.07],
        [0.05, 0.04],
      ],
      b1: [3.2, -3.4, 3.1], // saturated sigmoid regime
      w2: [0.05, -0.06, 0.04],
      b2: 0.0,
    };
  }
  if (preset === 'exploding') {
    return {
      w1: [
        [4.2, -3.8],
        [-4.1, 4.4],
        [3.7, 3.9],
      ],
      b1: [0.2, -0.1, 0.3],
      w2: [4.6, -4.5, 4.2],
      b2: -0.2,
    };
  }
  return {
    w1: [
      [1.15, -1.1],
      [-1.05, 1.2],
      [0.85, 0.9],
    ],
    b1: [0.15, 0.15, -0.35],
    w2: [1.25, 1.2, -1.35],
    b2: -0.1,
  };
}

export function forwardPass(
  weights: NetworkWeights,
  sample: SamplePoint,
  activation: ActivationId
): ForwardTrace {
  const z1: [number, number, number] = [
    weights.w1[0][0] * sample.x1 + weights.w1[0][1] * sample.x2 + weights.b1[0],
    weights.w1[1][0] * sample.x1 + weights.w1[1][1] * sample.x2 + weights.b1[1],
    weights.w1[2][0] * sample.x1 + weights.w1[2][1] * sample.x2 + weights.b1[2],
  ];
  const a1: [number, number, number] = [
    activate(z1[0], activation),
    activate(z1[1], activation),
    activate(z1[2], activation),
  ];
  const z2 =
    weights.w2[0] * a1[0] +
    weights.w2[1] * a1[1] +
    weights.w2[2] * a1[2] +
    weights.b2;
  const yHat = sigmoid(z2);
  const eps = 1e-7;
  const loss = -(
    sample.y * Math.log(yHat + eps) +
    (1 - sample.y) * Math.log(1 - yHat + eps)
  );
  return {
    x: [sample.x1, sample.x2],
    yTarget: sample.y,
    z1,
    a1,
    z2,
    yHat,
    loss,
  };
}

export function backwardPass(
  weights: NetworkWeights,
  forward: ForwardTrace,
  activation: ActivationId
): BackwardTrace {
  const eps = 1e-7;
  const dL_dyHat =
    -(forward.yTarget / (forward.yHat + eps)) +
    (1 - forward.yTarget) / (1 - forward.yHat + eps);
  // Derivative of BCE + sigmoid simplifies cleanly to (yHat - y)
  const dL_dz2 = forward.yHat - forward.yTarget;

  const dW2: [number, number, number] = [
    dL_dz2 * forward.a1[0],
    dL_dz2 * forward.a1[1],
    dL_dz2 * forward.a1[2],
  ];
  const db2 = dL_dz2;

  const dL_da1: [number, number, number] = [
    dL_dz2 * weights.w2[0],
    dL_dz2 * weights.w2[1],
    dL_dz2 * weights.w2[2],
  ];

  const dL_dz1: [number, number, number] = [
    dL_da1[0] * activateDeriv(forward.z1[0], forward.a1[0], activation),
    dL_da1[1] * activateDeriv(forward.z1[1], forward.a1[1], activation),
    dL_da1[2] * activateDeriv(forward.z1[2], forward.a1[2], activation),
  ];

  const dW1: [[number, number], [number, number], [number, number]] = [
    [dL_dz1[0] * forward.x[0], dL_dz1[0] * forward.x[1]],
    [dL_dz1[1] * forward.x[0], dL_dz1[1] * forward.x[1]],
    [dL_dz1[2] * forward.x[0], dL_dz1[2] * forward.x[1]],
  ];
  const db1: [number, number, number] = [dL_dz1[0], dL_dz1[1], dL_dz1[2]];

  const hiddenGradNorm = Math.sqrt(
    dW1.flat().reduce((acc, v) => acc + v * v, 0) +
      db1.reduce((acc, v) => acc + v * v, 0)
  );
  const outputGradNorm = Math.sqrt(
    dW2.reduce((acc, v) => acc + v * v, 0) + db2 * db2
  );

  return {
    dL_dyHat,
    dL_dz2,
    dW2,
    db2,
    dL_da1,
    dL_dz1,
    dW1,
    db1,
    hiddenGradNorm,
    outputGradNorm,
  };
}

function evaluateDataset(
  weights: NetworkWeights,
  dataset: SamplePoint[],
  activation: ActivationId
): { meanLoss: number; accuracy: number } {
  let lossSum = 0;
  let correct = 0;
  for (const s of dataset) {
    const f = forwardPass(weights, s, activation);
    lossSum += f.loss;
    const pred = f.yHat >= 0.5 ? 1 : 0;
    if (pred === s.y) correct++;
  }
  return {
    meanLoss: lossSum / dataset.length,
    accuracy: correct / dataset.length,
  };
}

function detectStatus(
  forward: ForwardTrace,
  backward: BackwardTrace,
  activation: ActivationId
): NNState['status'] {
  if (backward.hiddenGradNorm > 6 || backward.outputGradNorm > 6) {
    return 'exploding';
  }
  if (activation === 'relu' && forward.a1.every((v) => v === 0)) {
    return 'dead-relu';
  }
  if (backward.hiddenGradNorm < 0.015 && forward.loss > 0.25) {
    return 'vanishing';
  }
  return 'healthy';
}

export function createNNState(
  activation: ActivationId = 'tanh',
  dataset: DatasetPresetId = 'xor',
  learningRate = 0.65,
  weightPreset: 'balanced' | 'vanishing' | 'exploding' = 'balanced'
): NNState {
  const weights = getInitialWeights(weightPreset);
  const samples = NN_DATASETS[dataset];
  const sample = samples[0]!;
  const forward = forwardPass(weights, sample, activation);
  const backward = backwardPass(weights, forward, activation);
  const metrics = evaluateDataset(weights, samples, activation);

  return {
    activation,
    dataset,
    learningRate,
    epoch: 0,
    sampleIndex: 0,
    weights,
    forward,
    backward,
    lossHistory: [metrics.meanLoss],
    accuracy: metrics.accuracy,
    status: detectStatus(forward, backward, activation),
  };
}

export function trainOneEpoch(state: NNState): NNState {
  const samples = NN_DATASETS[state.dataset];
  const lr = state.learningRate;

  const w: NetworkWeights = {
    w1: [
      [...state.weights.w1[0]],
      [...state.weights.w1[1]],
      [...state.weights.w1[2]],
    ],
    b1: [...state.weights.b1],
    w2: [...state.weights.w2],
    b2: state.weights.b2,
  };

  // Batch gradient accumulation across all dataset points
  const gW1: [[number, number], [number, number], [number, number]] = [
    [0, 0],
    [0, 0],
    [0, 0],
  ];
  const gb1: [number, number, number] = [0, 0, 0];
  const gW2: [number, number, number] = [0, 0, 0];
  let gb2 = 0;

  for (const s of samples) {
    const f = forwardPass(w, s, state.activation);
    const b = backwardPass(w, f, state.activation);
    for (let i = 0; i < 3; i++) {
      gW2[i]! += b.dW2[i]! / samples.length;
      gb1[i]! += b.db1[i]! / samples.length;
      gW1[i]![0] += b.dW1[i]![0] / samples.length;
      gW1[i]![1] += b.dW1[i]![1] / samples.length;
    }
    gb2 += b.db2 / samples.length;
  }

  for (let i = 0; i < 3; i++) {
    w.w2[i]! -= lr * gW2[i]!;
    w.b1[i]! -= lr * gb1[i]!;
    w.w1[i]![0] -= lr * gW1[i]![0];
    w.w1[i]![1] -= lr * gW1[i]![1];
  }
  w.b2 -= lr * gb2;

  const nextSampleIndex = (state.sampleIndex + 1) % samples.length;
  const activeSample = samples[nextSampleIndex]!;
  const forward = forwardPass(w, activeSample, state.activation);
  const backward = backwardPass(w, forward, state.activation);
  const metrics = evaluateDataset(w, samples, state.activation);

  return {
    ...state,
    epoch: state.epoch + 1,
    sampleIndex: nextSampleIndex,
    weights: w,
    forward,
    backward,
    lossHistory: [...state.lossHistory, metrics.meanLoss].slice(-80),
    accuracy: metrics.accuracy,
    status: detectStatus(forward, backward, state.activation),
  };
}

export function computeDecisionGrid(
  weights: NetworkWeights,
  activation: ActivationId,
  resolution = 16
): Array<{ x1: number; x2: number; yHat: number }> {
  const cells: Array<{ x1: number; x2: number; yHat: number }> = [];
  for (let r = 0; r < resolution; r++) {
    const x2 = 1.4 - (2.8 * r) / (resolution - 1);
    for (let c = 0; c < resolution; c++) {
      const x1 = -1.4 + (2.8 * c) / (resolution - 1);
      const out = forwardPass(weights, { x1, x2, y: 0 }, activation);
      cells.push({ x1, x2, yHat: out.yHat });
    }
  }
  return cells;
}
