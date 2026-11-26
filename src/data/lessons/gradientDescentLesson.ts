import { LessonData } from '../../types/curriculum';

export const gradientDescentLesson: LessonData = {
  id: 'gradient-descent',
  stageId: 'stage-00',
  stageNumber: '00',
  stageTitle: 'Mathematical Foundations',
  title: 'Gradient Descent Landscapes',
  subtitle: 'Walk downhill blindly with a slope gauge—and watch learning rate make or break convergence.',
  duration: '12 min',
  difficulty: 'Beginner',
  simulationId: 'gradient-descent',
  isFlagshipLab: true,
  goals: [
    'Interpret gradient sign & magnitude as local slope',
    'Predict convergence, oscillation & divergence from learning rate η',
    'Compare Vanilla GD vs Momentum & Adam in ill-conditioned ravines',
    'Diagnose local minima traps on non-convex loss surfaces',
    'Verify convergence in Python from scratch & pass challenge',
  ],
  prerequisites: ['linear-algebra-tensors', 'calculus-chain-rule'],
  relatedIds: ['neural-net-backprop', 'calculus-chain-rule', 'numpy-eda-cleaning'],
  intuitionSummary:
    'Imagine standing blindfolded on a foggy mountain trying to reach the lowest valley. You cannot see the whole landscape, so you feel the slope right under your boots and take a step downhill. Too tiny a step takes forever; too huge a step vaults you clean across the valley and higher up the opposite cliff.',
  mathFoundation: {
    title: 'First-Order Parameter Update & Stability Condition',
    equations: [
      {
        label: 'Vanilla Gradient Descent',
        expr: 'θ_{t+1} = θ_t - η · ∇_θ L(θ_t)',
        note: 'Moves opposite the positive gradient direction scaled by learning rate η.',
      },
      {
        label: 'Momentum (Exponential Moving Average)',
        expr: 'v_{t+1} = β·v_t + ∇L(θ_t),   θ_{t+1} = θ_t - η·v_{t+1}',
        note: 'Accumulates consistent gradient direction across flat ravines while damping zig-zag oscillations.',
      },
      {
        label: 'Adam (Adaptive Moment Estimation)',
        expr: 'θ_{t+1} = θ_t - η · m̂_t / (√v̂_t + ε)',
        note: 'Normalizes each parameter step by its running gradient RMS scale.',
      },
      {
        label: 'Quadratic Stability Bound',
        expr: '0 < η < 2 / L_max   (for L(θ) = ½aθ²)',
        note: 'When η > 2/a, each step overshoots further than the previous distance—guaranteed divergence.',
      },
    ],
  },
  pythonFromScratch: {
    filename: 'gradient_descent_from_scratch.py',
    description: 'Pure Python implementation of Vanilla GD, Momentum, and Adam with numerical verification.',
    code: `import math

def loss_and_grad(w: float) -> tuple[float, float]:
    # Non-convex test landscape: L(w) = 0.08w^4 - 0.65w^2 + 0.22w + 1.9
    loss = 0.08 * (w ** 4) - 0.65 * (w ** 2) + 0.22 * w + 1.9
    grad = 0.32 * (w ** 3) - 1.30 * w + 0.22
    return loss, grad

def optimize(w0: float, lr: float = 0.12, beta: float = 0.88, steps: int = 30, mode: str = "momentum"):
    w, v, m, s = w0, 0.0, 0.0, 0.0
    trajectory = []
    for t in range(1, steps + 1):
        loss, g = loss_and_grad(w)
        trajectory.append((t, round(w, 4), round(loss, 4), round(g, 4)))
        if mode == "gd":
            w -= lr * g
        elif mode == "momentum":
            v = beta * v + g
            w -= lr * v
        elif mode == "adam":
            m = 0.9 * m + 0.1 * g
            s = 0.999 * s + 0.001 * (g * g)
            m_hat = m / (1.0 - 0.9 ** t)
            s_hat = s / (1.0 - 0.999 ** t)
            w -= lr * m_hat / (math.sqrt(s_hat) + 1e-8)
    return trajectory

for row in optimize(w0=3.1, lr=0.14, mode="momentum")[:6]:
    print(f"step={row[0]:02d}  w={row[1]:+.4f}  L={row[2]:.4f}  grad={row[3]:+.4f}")`,
  },
  realWorldUse: [
    'Training every neural network, LoRA adapter, and transformer pretraining run (typically AdamW + cosine LR warmup/decay).',
    'Logistic regression and embedding metric learning over millions of examples via mini-batch SGD.',
    'Policy gradient and Direct Preference Optimization (DPO) alignment loops.',
  ],
  failureModes: [
    {
      name: 'Learning Rate Explosion (η > 2/L)',
      cause: 'Step size exceeds curvature bound along steep loss walls.',
      symptom: 'Loss zig-zags wildly with growing amplitude until weights become NaN.',
      mitigation: 'Lower η, add linear LR warmup, or apply gradient norm clipping.',
    },
    {
      name: 'Ravine Oscillation',
      cause: 'Ill-conditioned loss (10× steeper along one axis than another).',
      symptom: 'Vanilla GD bounces sideways across walls while crawling slowly along the valley floor.',
      mitigation: 'Use Momentum, Adam, or normalize input features before training.',
    },
    {
      name: 'Local Minimum / Saddle Stagnation',
      cause: 'Non-convex surface traps low-LR trajectory in a suboptimal basin.',
      symptom: 'Gradient hits ~0 while loss remains noticeably above global optimum.',
      mitigation: 'Add momentum inertia, mini-batch noise, or cosine LR restarts.',
    },
  ],
  steps: [
    {
      id: 'intuition',
      label: 'Intuition',
      title: 'Why follow the negative slope?',
      chapter: 'Intuition',
      goalIndex: 0,
      body: [
        'Training an AI model means finding parameter values <span class="term">θ</span> that minimize a loss function <code>L(θ)</code>.',
        'At any point on the curve, the derivative <code>∇L(θ)</code> points uphill. Stepping in the <b>opposite</b> direction <code>-∇L(θ)</code> guarantees local descent for a small enough step.',
      ],
      callout: {
        kind: 'tip',
        title: 'First Principle',
        text: 'Gradient descent is local: it only reads slope at your current θ. Try dragging the Initial θ slider to see the tangent line tilt.',
      },
      simPreset: { landscape: 'convex', optimizer: 'gd', learningRate: 0.25, initialW: -2.6 },
    },
    {
      id: 'visual-step',
      label: 'Step Loop',
      title: 'Anatomy of a single update',
      chapter: 'Visual',
      goalIndex: 0,
      body: [
        'Each tick runs three arithmetic operations: evaluate <code>L(θ)</code>, differentiate <code>g = ∇L(θ)</code>, and update <code>θ ← θ - η·g</code>.',
        'Notice how steps naturally shrink near the bottom of the bowl because <b>the slope flattens toward zero</b>—acting like automatic braking.',
      ],
      mathLabel: 'Update Rule',
      mathEq: 'θ_{t+1} = θ_t - η · ∇L(θ_t)',
      changes: [
        { kind: 'add', text: 'Tangent line draws instantaneous slope ∇L(θ)' },
        { kind: 'mod', text: 'Step vector arrow scales proportionally with η' },
      ],
      simPreset: { landscape: 'convex', optimizer: 'gd', learningRate: 0.35, initialW: -3.2 },
    },
    {
      id: 'lr-oscillation',
      label: 'Overshoot',
      title: 'What happens when η is too large?',
      chapter: 'Failure',
      goalIndex: 1,
      body: [
        'On <code>L(θ) = 0.5(θ - 2)² + 0.35</code>, curvature is <code>1.0</code>. Once <code>η > 1.0</code>, every step leaps past the minimum to the opposite side.',
        'At <code>η = 1.85</code>, the ball bounces back and forth across the valley; push past <code>η = 2.0</code> and amplitude <span class="term">diverges to infinity</span>!',
      ],
      callout: {
        kind: 'warn',
        title: 'Stability Limit',
        text: 'Watch the Regime HUD badge flip to Oscillating or Diverged when η crosses 1.8 → 2.1.',
      },
      simPreset: { landscape: 'convex', optimizer: 'gd', learningRate: 1.88, initialW: -2.4 },
    },
    {
      id: 'ravine',
      label: '2D Ravine',
      title: 'Why Vanilla GD struggles in ravines',
      chapter: 'Simulation',
      goalIndex: 2,
      body: [
        'Real neural networks never have round bowls—some weights have 20× steeper curvature than others, creating a narrow <span class="term">ill-conditioned ravine</span>.',
        'Switch to the <b>2D Ravine</b> contour map: Vanilla GD wastes energy bouncing north-south across steep walls while creeping east-west toward zero.',
      ],
      mathLabel: 'Ill-Conditioned Surface',
      mathEq: 'L(θ₁, θ₂) = 0.14θ₁² + 2.40θ₂²   (κ ≈ 17.1)',
      simPreset: { landscape: 'ravine', optimizer: 'gd', learningRate: 0.36, initialW: -3.8, initialW2: 1.4 },
    },
    {
      id: 'momentum-adam',
      label: 'Momentum',
      title: 'Momentum & Adam smooth the path',
      chapter: 'Code',
      goalIndex: 2,
      body: [
        '<span class="term">Momentum</span> averages past gradients: opposing vertical bounces cancel out while consistent horizontal slope builds speed.',
        '<span class="term">Adam</span> goes further by dividing by per-axis RMS magnitude, equalizing step sizes across flat and steep directions simultaneously.',
      ],
      compare: {
        headers: ['Property', 'Vanilla GD', 'Adam'],
        rows: [
          ['Ravine speed', 'Crawls / zig-zags', 'Fast & damped'],
          ['LR sensitivity', 'High', 'Robust'],
          ['State memory', '0 extra scalars', '2× moments (m, v)'],
        ],
      },
      simPreset: { landscape: 'ravine', optimizer: 'momentum', learningRate: 0.28, initialW: -3.8, initialW2: 1.4, momentumBeta: 0.85 },
    },
    {
      id: 'non-convex',
      label: 'Local Trap',
      title: 'Trapped in a local minimum',
      chapter: 'Failure',
      goalIndex: 3,
      body: [
        'Deep learning loss surfaces are <span class="term">non-convex</span>: multiple valleys exist at different depths.',
        'Starting on the right side (<code>θ₀ = +3.1</code>) with low LR drops into the shallow local basin around <code>θ ≈ +1.92</code> instead of the deeper global valley at <code>θ ≈ -2.10</code>.',
      ],
      callout: {
        kind: 'insight',
        title: 'Escaping Traps',
        text: 'Try increasing Momentum β or initial LR so velocity carries the parameter over the central ridge at θ = 0.17!',
      },
      simPreset: { landscape: 'non-convex', optimizer: 'gd', learningRate: 0.12, initialW: 3.1 },
    },
    {
      id: 'cliff',
      label: 'Cliff Edge',
      title: 'Exploding gradients on steep cliffs',
      chapter: 'Production',
      goalIndex: 3,
      body: [
        'RNNs and unnormalized residual blocks create steep cliff walls where the local slope suddenly spikes 10× higher than surrounding plateaus.',
        'Without <span class="term">gradient clipping</span> or adaptive scaling, a single step down a cliff launches weights far out of distribution.',
      ],
      simPreset: { landscape: 'cliff', optimizer: 'adam', learningRate: 0.25, initialW: -2.0 },
    },
    {
      id: 'challenge',
      label: 'Challenge',
      title: 'Escape the local minimum trap',
      chapter: 'Challenge',
      goalIndex: 4,
      body: [
        'Switch to the <b>Challenge &amp; Quiz</b> tab or tune the controls right here: starting from <code>θ₀ = +3.1</code> on the <b>Non-Convex</b> landscape, reach <code>L(θ) &lt; 0.70</code> (global valley) without diverging.',
      ],
      changes: [
        { kind: 'add', text: 'Hint: Switch Optimizer to Momentum (β ≈ 0.88) and LR ≈ 0.35' },
      ],
      simPreset: { landscape: 'non-convex', optimizer: 'momentum', learningRate: 0.32, initialW: 3.1, momentumBeta: 0.88 },
    },
    {
      id: 'recap',
      label: 'Recap',
      title: 'Optimization engineering checklist',
      chapter: 'Check',
      goalIndex: 4,
      body: [
        'You now understand why learning rate, loss curvature, momentum inertia, and adaptive normalization govern every modern AI training run.',
      ],
      takeaways: [
        'Normalize features or use Adam to cure ill-conditioned ravines.',
        'Monitor gradient norms to catch divergence early and clip spikes.',
        'Always verify first-principles math on a 1D curve before debugging 1B-parameter runs.',
      ],
    },
  ],
  challenge: {
    title: 'Global Valley Escape',
    brief:
      'On the Non-Convex Multi-Minima surface starting at θ₀ = +3.10, use the optimizer controls to cross the central hill and settle inside the deeper global valley (L(θ) < 0.75) within 25 steps.',
    hint: 'Vanilla GD gets trapped at θ ≈ +1.92 (L ≈ 1.07). Switch to Momentum (β ≥ 0.85) with learning rate around 0.28–0.38 so accumulated inertia vaults over the ridge!',
    successCriteria: 'Reach Loss < 0.75 on Non-Convex landscape with Regime = Converged or Converging.',
  },
  quiz: [
    {
      id: 'gd-q1',
      prompt: 'For L(θ) = ½ a θ² (a > 0), what happens immediately when learning rate η exceeds 2 / a?',
      options: [
        'The optimizer smoothly converges slower than before',
        'Each step overshoots past the minimum with strictly growing magnitude (divergence)',
        'The optimizer stops at the local minimum',
        'Momentum cancels out the gradient automatically',
      ],
      correctIndex: 1,
      explanation: 'θ_{t+1} = (1 - ηa)θ_t. When |1 - ηa| > 1 (i.e. η > 2/a), amplitude multiplies every iteration and explodes.',
    },
    {
      id: 'gd-q2',
      prompt: 'Why does Adam outperform Vanilla GD inside narrow, ill-conditioned ravines?',
      options: [
        'Adam computes exact second-order Hessian inverses',
        'Adam uses random restarts on every batch',
        'Adam normalizes each coordinate update by its running gradient RMS (√v̂_t), damping steep walls while accelerating flat valleys',
        'Adam sets the learning rate to zero along steep axes',
      ],
      correctIndex: 2,
      explanation: 'By maintaining per-parameter first and second moments, Adam rescales updates inversely to recent gradient magnitude.',
    },
    {
      id: 'gd-q3',
      prompt: 'In real deep learning pipelines, why do we add gradient norm clipping alongside AdamW?',
      options: [
        'To prevent rare steep gradient cliffs or noisy batches from causing destructive parameter jumps',
        'To double the effective batch size',
        'To eliminate the need for activation functions',
        'To force weights to remain integers',
      ],
      correctIndex: 0,
      explanation: 'Even adaptive optimizers can get destabilized by sudden loss spikes; clipping caps ‖g‖ before parameter updates.',
    },
  ],
};
