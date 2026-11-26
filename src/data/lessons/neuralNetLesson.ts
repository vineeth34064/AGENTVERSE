import { LessonData } from '../../types/curriculum';

export const neuralNetLesson: LessonData = {
  id: 'neural-net-backprop',
  stageId: 'stage-04',
  stageNumber: '04',
  stageTitle: 'Deep Learning & Neural Nets',
  title: 'Forward & Backward Propagation',
  subtitle: 'Watch nonlinear decision boundaries emerge as activations flow forward and chain-rule gradients flow backward.',
  duration: '16 min',
  difficulty: 'Intermediate',
  simulationId: 'neural-net',
  isFlagshipLab: true,
  goals: [
    'Trace weighted sums & nonlinear activations through a 2→3→1 MLP',
    'Understand why linear layers alone cannot solve XOR',
    'Compute exact layer gradients backward via the chain rule',
    'Diagnose vanishing sigmoid gradients vs dead ReLUs vs exploding weights',
    'Train an interactive classifier to >90% accuracy on XOR',
  ],
  prerequisites: ['calculus-chain-rule', 'gradient-descent'],
  relatedIds: ['cnn-rnn-modern-dl', 'transformer-self-attention', 'gradient-descent'],
  intuitionSummary:
    'A neural network is a coordinated assembly line of tiny linear detectors followed by nonlinear bends. During the forward pass, inputs are transformed into a prediction and scored against truth. During backpropagation, blame for the error flows backward from the output to every single weight in exact proportion to how much that weight contributed.',
  mathFoundation: {
    title: 'Exact Forward Pass & Chain-Rule Backpropagation',
    equations: [
      {
        label: 'Hidden Pre-Activation & Activation',
        expr: 'z⁽¹⁾ = W⁽¹⁾x + b⁽¹⁾,   a⁽¹⁾ = φ(z⁽¹⁾)',
        note: 'Nonlinearity φ (Tanh, ReLU, Sigmoid) lets hidden neurons bend space so XOR becomes separable.',
      },
      {
        label: 'Output Probability & Binary Cross-Entropy',
        expr: 'ŷ = σ(w⁽²⁾·a⁽¹⁾ + b⁽²⁾),   L = -[y·log(ŷ) + (1-y)·log(1-ŷ)]',
        note: 'The BCE + Sigmoid gradient simplifies cleanly to ∂L/∂z⁽²⁾ = ŷ - y.',
      },
      {
        label: 'Backward Chain Rule to Hidden Weights',
        expr: 'δ⁽¹⁾ = (w⁽²⁾ᵀ · δ⁽²⁾) ⊙ φ′(z⁽¹⁾),   ∂L/∂W⁽¹⁾ = δ⁽¹⁾ · xᵀ',
        note: 'Notice φ′(z⁽¹⁾): if Sigmoid saturates (φ′ → 0), hidden gradients vanish completely.',
      },
    ],
  },
  pythonFromScratch: {
    filename: 'mlp_backprop_from_scratch.py',
    description: 'Zero-framework NumPy 2→3→1 MLP solving XOR with explicit forward and backward pass.',
    code: `import numpy as np

X = np.array([[-1., -1.], [-1., 1.], [1., -1.], [1., 1.]])
Y = np.array([[0.], [1.], [1.], [0.]])  # XOR problem

rng = np.random.default_rng(42)
W1 = rng.normal(0, 1.0, size=(2, 3))
b1 = np.zeros((1, 3))
W2 = rng.normal(0, 1.0, size=(3, 1))
b2 = np.zeros((1, 1))

def sigmoid(z): return 1.0 / (1.0 + np.exp(-np.clip(z, -30, 30)))

for epoch in range(400):
    # Forward pass
    z1 = X @ W1 + b1
    a1 = np.tanh(z1)
    z2 = a1 @ W2 + b2
    y_hat = sigmoid(z2)

    # Backward pass (exact chain rule)
    dL_dz2 = (y_hat - Y) / len(X)
    dW2 = a1.T @ dL_dz2
    db2 = dL_dz2.sum(axis=0, keepdims=True)

    dL_da1 = dL_dz2 @ W2.T
    dL_dz1 = dL_da1 * (1.0 - a1 ** 2)  # tanh'(z1)
    dW1 = X.T @ dL_dz1
    db1 = dL_dz1.sum(axis=0, keepdims=True)

    lr = 0.6
    W2 -= lr * dW2; b2 -= lr * db2
    W1 -= lr * dW1; b1 -= lr * db1

print("XOR Predictions:", np.round(y_hat.ravel(), 3))`,
  },
  realWorldUse: [
    'Every Feed-Forward Network (FFN/MLP) block inside Transformer LLMs accounts for ~2/3 of total model parameters.',
    'Multi-modal projection adapters mapping vision encoder embeddings into LLM token space.',
    'Fraud scoring, click-through rate estimation, and policy/value heads in RL agents.',
  ],
  failureModes: [
    {
      name: 'Vanishing Gradients (Saturated Sigmoid)',
      cause: 'Large biases/weights push σ(z) to 0 or 1 where σ′(z) ≈ 0.',
      symptom: 'Output weights move slightly while Layer 1 gradient norm drops near zero (< 0.01).',
      mitigation: 'Replace Sigmoid hidden layers with ReLU/GELU/SwiGLU + Xavier/He initialization + Residual connections.',
    },
    {
      name: 'Dead ReLU Collapse',
      cause: 'High learning rate pushes a neuron bias deeply negative (z < 0 for all samples).',
      symptom: 'ReLU gradient is identically 0; the neuron never recovers.',
      mitigation: 'Lower learning rate or use LeakyReLU / GELU / SiLU.',
    },
    {
      name: 'Exploding Weights & NaN Loss',
      cause: 'Oversized initial weights amplify forward variance and backward gradients exponentially.',
      symptom: 'Hidden gradient norm spikes > 10 and decision boundary flickers violently.',
      mitigation: 'Apply He/Xavier init, LayerNorm/BatchNorm, and gradient clipping.',
    },
  ],
  steps: [
    {
      id: 'xor-problem',
      label: 'XOR Mystery',
      title: 'Why a single line fails XOR',
      chapter: 'Intuition',
      goalIndex: 1,
      body: [
        'Try drawing one straight line separating <code>(−1, +1), (+1, −1)</code> (Class 1) from <code>(−1, −1), (+1, +1)</code> (Class 0). It is mathematically <span class="term">impossible</span>.',
        'To solve XOR, a neural network folds the 2D plane using <b>3 hidden neurons</b> before making a final linear cut at the output.',
      ],
      simPreset: { dataset: 'xor', activation: 'tanh', weightPreset: 'balanced', learningRate: 0.65 },
    },
    {
      id: 'forward',
      label: 'Forward Pass',
      title: 'Computing predictions left → right',
      chapter: 'Visual',
      goalIndex: 0,
      body: [
        'Each hidden neuron multiplies inputs <code>(x₁, x₂)</code> by its edge weights, adds bias <code>b</code>, and bends the result with activation <code>φ(z)</code>.',
        'Watch the orange forward pulses travel from Inputs → Hidden → Output <code>ŷ</code> and compare <code>ŷ</code> to target <code>y</code>.',
      ],
      mathLabel: 'Hidden Layer Forward',
      mathEq: 'a₁ = φ(W₁x + b₁),   ŷ = σ(w₂·a₁ + b₂)',
      simPreset: { dataset: 'xor', activation: 'tanh', weightPreset: 'balanced', pulseMode: 'forward' },
    },
    {
      id: 'backward',
      label: 'Backprop',
      title: 'Sending error blame backward',
      chapter: 'Math',
      goalIndex: 2,
      body: [
        'Once loss <code>L(ŷ, y)</code> is measured, violet gradient packets travel <span class="term">right → left</span>.',
        'Every weight receives update <code>-η · (upstream δ) · (incoming activation)</code>. Click any neuron or edge in the diagram to inspect its exact partial derivative!',
      ],
      mathLabel: 'Chain Rule',
      mathEq: '∂L/∂W₁ = ((ŷ - y)·w₂ᵀ ⊙ φ′(z₁)) · xᵀ',
      changes: [
        { kind: 'add', text: 'Violet packets show δ gradients propagating backward' },
        { kind: 'mod', text: 'Layer gradient norms appear in the bottom bar chart' },
      ],
      simPreset: { dataset: 'xor', activation: 'tanh', weightPreset: 'balanced', pulseMode: 'backward' },
    },
    {
      id: 'train-boundary',
      label: 'Learn Space',
      title: 'Watch the decision boundary bend',
      chapter: 'Simulation',
      goalIndex: 4,
      body: [
        'Hit <b>Play</b> or <b>Train 10 Epochs</b> and watch the 2D Decision Boundary grid on the right twist from a diagonal blur into a sharp XOR saddle!',
        'Notice how hidden neurons carve out distinct linear half-planes whose weighted combination isolates opposite corners.',
      ],
      simPreset: { dataset: 'xor', activation: 'tanh', weightPreset: 'balanced', autoTrain: true },
    },
    {
      id: 'activations',
      label: 'Activations',
      title: 'Tanh vs ReLU vs Sigmoid',
      chapter: 'Code',
      goalIndex: 1,
      body: [
        'Switch activations live: <span class="term">Tanh</span> is zero-centered in <code>[-1, 1]</code>; <span class="term">ReLU</span> prevents positive saturation with slope <code>1</code>; <span class="term">Sigmoid</span> squashes into <code>(0, 1)</code>.',
      ],
      compare: {
        headers: ['Activation', 'Max Slope φ′', 'Main Pitfall'],
        rows: [
          ['Sigmoid', '0.25 at z=0', 'Vanishing gradients'],
          ['Tanh', '1.0 at z=0', 'Saturates at |z| > 3'],
          ['ReLU', '1.0 for z>0', 'Dead neurons (z < 0)'],
        ],
      },
    },
    {
      id: 'vanishing-grad',
      label: 'Vanishing ∇',
      title: 'Failure: Saturated Sigmoid Freeze',
      chapter: 'Failure',
      goalIndex: 3,
      body: [
        'Click the <b>Vanishing Init</b> preset with Sigmoid active. Large initial biases push <code>z₁</code> onto flat tails where <code>σ′(z₁) ≈ 0.01</code>.',
        'Look at the HUD: <code>Hidden ‖∇‖</code> collapses near <code>0.00</code>—training stalls indefinitely even though loss is huge!',
      ],
      callout: {
        kind: 'warn',
        title: 'Why Deep Sigmoid Nets Failed Before 2012',
        text: 'Multiplying 0.25 across 10 layers attenuates gradients by 0.25¹⁰ ≈ 9.5×10⁻⁷. Switching to ReLU/Tanh + balanced init immediately revives gradient flow.',
      },
      simPreset: { dataset: 'xor', activation: 'sigmoid', weightPreset: 'vanishing', learningRate: 0.5 },
    },
    {
      id: 'exploding-grad',
      label: 'Exploding ∇',
      title: 'Failure: Oversized Weight Instability',
      chapter: 'Failure',
      goalIndex: 3,
      body: [
        'Now test the <b>Exploding Init</b> preset. Huge initial weights multiply gradients across layers until updates overshoot violently.',
        'That is why <span class="term">Xavier (Glorot)</span> and <span class="term">He</span> initialization scale weights by <code>1/√n_in</code>.',
      ],
      simPreset: { dataset: 'xor', activation: 'relu', weightPreset: 'exploding', learningRate: 0.8 },
    },
    {
      id: 'challenge',
      label: 'Challenge',
      title: 'Cure vanishing gradients & solve XOR',
      chapter: 'Challenge',
      goalIndex: 4,
      body: [
        'Recover from a broken configuration or train on <b>XOR</b> until <code>Accuracy = 100%</code> and <code>Loss &lt; 0.15</code>.',
      ],
      simPreset: { dataset: 'xor', activation: 'tanh', weightPreset: 'balanced', learningRate: 0.9 },
    },
    {
      id: 'recap',
      label: 'Recap',
      title: 'Backpropagation takeaways',
      chapter: 'Check',
      goalIndex: 4,
      body: [
        'Backpropagation is simply efficient dynamic programming on the chain rule—powering everything from 2-layer MLPs to 100-layer Transformers.',
      ],
      takeaways: [
        'Nonlinear activations allow shallow layers to solve non-linearly separable data like XOR.',
        'Monitor per-layer gradient norms to catch vanishing or exploding regimes immediately.',
        'Use proper weight scaling (He/Xavier) and zero-centered / unsaturated activations.',
      ],
    },
  ],
  challenge: {
    title: 'Solve XOR Cleanly',
    brief:
      'Configure the 2→3→1 MLP on the XOR dataset with an appropriate activation and learning rate, then train until Accuracy hits 100% and mean Loss drops below 0.15.',
    hint: 'Choose Tanh or ReLU with Balanced Init and Learning Rate ~0.85, then run training for ~40–60 epochs.',
    successCriteria: 'XOR dataset Accuracy = 100% and mean Loss < 0.15.',
  },
  quiz: [
    {
      id: 'nn-q1',
      prompt: 'If you remove all nonlinear activation functions from a 10-layer MLP, what can the network represent?',
      options: [
        'Any smooth polynomial curve',
        'Only a single linear hyperplane transformation (W_eff·x + b_eff)',
        'Arbitrary XOR boundaries with enough neurons',
        'Exponential probability distributions',
      ],
      correctIndex: 1,
      explanation: 'A composition of linear matrix multiplications collapses algebraically into a single linear matrix.',
    },
    {
      id: 'nn-q2',
      prompt: 'What causes the "vanishing gradient" failure in deep Sigmoid networks?',
      options: [
        'Sigmoid outputs negative numbers too frequently',
        'The derivative σ′(z) ≤ 0.25 everywhere and approaches 0 whenever |z| grows large',
        'Binary Cross-Entropy has zero derivative',
        'Bias terms absorb the learning rate',
      ],
      correctIndex: 1,
      explanation: 'Repeated multiplication by values ≤ 0.25 shrinks gradients exponentially toward zero in earlier layers.',
    },
    {
      id: 'nn-q3',
      prompt: 'Which two values are multiplied together to compute ∂L/∂w_{ij} in backpropagation?',
      options: [
        'Input activation a_i and upstream error signal δ_j',
        'Learning rate η and loss L',
        'Weight w_{ij} and bias b_j',
        'Epoch count and batch size',
      ],
      correctIndex: 0,
      explanation: 'By the chain rule, ∂L/∂w_{ij} = (∂L/∂z_j) · (∂z_j/∂w_{ij}) = δ_j · a_i.',
    },
  ],
};
