export type LandscapeId = 'convex' | 'non-convex' | 'ravine' | 'cliff';
export type OptimizerId = 'gd' | 'momentum' | 'adam';
export type GDRegime = 'converged' | 'converging' | 'oscillating' | 'diverged' | 'local-trap';

export interface GDConfig {
  landscape: LandscapeId;
  optimizer: OptimizerId;
  learningRate: number;
  initialW: number;
  initialW2: number;
  momentumBeta: number;
}

export interface GDPoint {
  step: number;
  w: number;
  w2: number;
  loss: number;
  grad: number;
  grad2: number;
}

export interface GDState {
  config: GDConfig;
  step: number;
  w: number;
  w2: number;
  loss: number;
  grad: number;
  grad2: number;
  velocity: number;
  velocity2: number;
  m1: number;
  v1: number;
  m2: number;
  v2: number;
  history: GDPoint[];
  regime: GDRegime;
}

export interface LandscapeSpec {
  id: LandscapeId;
  name: string;
  formula: string;
  wRange: [number, number];
  globalMinW: number;
  localMinW?: number;
  evaluate: (w: number, w2?: number) => { loss: number; grad: number; grad2: number };
}

export const LANDSCAPES: Record<LandscapeId, LandscapeSpec> = {
  convex: {
    id: 'convex',
    name: 'Convex Quadratic Bowl',
    formula: 'L(θ) = 0.5(θ - 2.0)² + 0.35',
    wRange: [-4.2, 5.8],
    globalMinW: 2.0,
    evaluate: (w) => ({
      loss: 0.5 * (w - 2.0) ** 2 + 0.35,
      grad: w - 2.0,
      grad2: 0,
    }),
  },
  'non-convex': {
    id: 'non-convex',
    name: 'Non-Convex Multi-Minima',
    formula: 'L(θ) = 0.08θ⁴ - 0.65θ² + 0.22θ + 1.90',
    wRange: [-4.0, 4.0],
    globalMinW: -2.1,
    localMinW: 1.92,
    evaluate: (w) => ({
      loss: 0.08 * w ** 4 - 0.65 * w ** 2 + 0.22 * w + 1.9,
      grad: 0.32 * w ** 3 - 1.3 * w + 0.22,
      grad2: 0,
    }),
  },
  ravine: {
    id: 'ravine',
    name: 'Ill-Conditioned 2D Ravine',
    formula: 'L(θ₁, θ₂) = 0.14θ₁² + 2.40θ₂²',
    wRange: [-4.5, 4.5],
    globalMinW: 0.0,
    evaluate: (w, w2 = 1.6) => ({
      loss: 0.14 * w ** 2 + 2.4 * w2 ** 2,
      grad: 0.28 * w,
      grad2: 4.8 * w2,
    }),
  },
  cliff: {
    id: 'cliff',
    name: 'Steep Sigmoid Cliff',
    formula: 'L(θ) = 0.15(θ - 1.5)² + 2.2·σ(-3.2(θ + 0.4))',
    wRange: [-4.2, 4.8],
    globalMinW: 1.5,
    evaluate: (w) => {
      const z = -3.2 * (w + 0.4);
      const clampedZ = Math.max(-40, Math.min(40, z));
      const sig = 1 / (1 + Math.exp(-clampedZ));
      const loss = 0.15 * (w - 1.5) ** 2 + 2.2 * sig;
      const grad = 0.3 * (w - 1.5) - 2.2 * 3.2 * sig * (1 - sig);
      return { loss, grad, grad2: 0 };
    },
  },
};

export function createGDState(config: GDConfig): GDState {
  const spec = LANDSCAPES[config.landscape];
  const eval0 = spec.evaluate(config.initialW, config.initialW2);
  const initialPoint: GDPoint = {
    step: 0,
    w: config.initialW,
    w2: config.initialW2,
    loss: eval0.loss,
    grad: eval0.grad,
    grad2: eval0.grad2,
  };
  return {
    config,
    step: 0,
    w: config.initialW,
    w2: config.initialW2,
    loss: eval0.loss,
    grad: eval0.grad,
    grad2: eval0.grad2,
    velocity: 0,
    velocity2: 0,
    m1: 0,
    v1: 0,
    m2: 0,
    v2: 0,
    history: [initialPoint],
    regime: classifyRegime(config, [initialPoint], eval0.grad, eval0.loss),
  };
}

function classifyRegime(
  config: GDConfig,
  history: GDPoint[],
  grad: number,
  loss: number
): GDRegime {
  if (!Number.isFinite(loss) || Math.abs(grad) > 50 || loss > 80) {
    return 'diverged';
  }
  const spec = LANDSCAPES[config.landscape];
  const lastW = history[history.length - 1]?.w ?? config.initialW;
  const gradMag = Math.abs(grad) + Math.abs(history[history.length - 1]?.grad2 ?? 0);

  if (gradMag < 0.03 && history.length > 2) {
    if (
      spec.localMinW !== undefined &&
      Math.abs(lastW - spec.localMinW) < 0.35 &&
      Math.abs(lastW - spec.globalMinW) > 1.0
    ) {
      return 'local-trap';
    }
    return 'converged';
  }

  if (history.length >= 4) {
    const recent = history.slice(-4);
    let signFlips = 0;
    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1]!;
      const curr = recent[i]!;
      const gPrev = config.landscape === 'ravine' ? prev.grad2 : prev.grad;
      const gCurr = config.landscape === 'ravine' ? curr.grad2 : curr.grad;
      if (gPrev * gCurr < 0) signFlips++;
    }
    if (signFlips >= 2) return 'oscillating';
  }

  return 'converging';
}

export function stepGD(state: GDState): GDState {
  if (state.regime === 'diverged') return state;

  const { config } = state;
  const spec = LANDSCAPES[config.landscape];
  const nextStep = state.step + 1;
  const lr = config.learningRate;
  const beta = config.momentumBeta;

  let nextW = state.w;
  let nextW2 = state.w2;
  let nextVel = state.velocity;
  let nextVel2 = state.velocity2;
  let m1 = state.m1;
  let v1 = state.v1;
  let m2 = state.m2;
  let v2 = state.v2;

  if (config.optimizer === 'gd') {
    nextW = state.w - lr * state.grad;
    nextW2 = state.w2 - lr * state.grad2;
  } else if (config.optimizer === 'momentum') {
    nextVel = beta * state.velocity + state.grad;
    nextVel2 = beta * state.velocity2 + state.grad2;
    nextW = state.w - lr * nextVel;
    nextW2 = state.w2 - lr * nextVel2;
  } else {
    const b1 = 0.9;
    const b2 = 0.999;
    const eps = 1e-8;
    m1 = b1 * state.m1 + (1 - b1) * state.grad;
    v1 = b2 * state.v1 + (1 - b2) * state.grad * state.grad;
    const mHat1 = m1 / (1 - Math.pow(b1, nextStep));
    const vHat1 = v1 / (1 - Math.pow(b2, nextStep));
    nextW = state.w - lr * (mHat1 / (Math.sqrt(vHat1) + eps));

    m2 = b1 * state.m2 + (1 - b1) * state.grad2;
    v2 = b2 * state.v2 + (1 - b2) * state.grad2 * state.grad2;
    const mHat2 = m2 / (1 - Math.pow(b1, nextStep));
    const vHat2 = v2 / (1 - Math.pow(b2, nextStep));
    nextW2 = state.w2 - lr * (mHat2 / (Math.sqrt(vHat2) + eps));
  }

  // Clamp runaway display bounds cleanly while flagging divergence
  const clippedW = Math.max(-18, Math.min(18, nextW));
  const clippedW2 = Math.max(-18, Math.min(18, nextW2));
  const evalNext = spec.evaluate(clippedW, clippedW2);

  const nextPoint: GDPoint = {
    step: nextStep,
    w: clippedW,
    w2: clippedW2,
    loss: evalNext.loss,
    grad: evalNext.grad,
    grad2: evalNext.grad2,
  };

  const nextHistory = [...state.history, nextPoint].slice(-60);
  const nextRegime = classifyRegime(config, nextHistory, evalNext.grad, evalNext.loss);

  return {
    config,
    step: nextStep,
    w: clippedW,
    w2: clippedW2,
    loss: evalNext.loss,
    grad: evalNext.grad,
    grad2: evalNext.grad2,
    velocity: nextVel,
    velocity2: nextVel2,
    m1,
    v1,
    m2,
    v2,
    history: nextHistory,
    regime: nextRegime,
  };
}
