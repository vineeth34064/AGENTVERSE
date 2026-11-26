import { LessonData } from '../../types/curriculum';

export const transformerAttentionLesson: LessonData = {
  id: 'transformer-self-attention',
  stageId: 'stage-06',
  stageNumber: '06',
  stageTitle: 'Transformers & LLM Foundations',
  title: 'Transformer Self-Attention & Sampling',
  subtitle: 'Inspect Q·K/√d_k dot products, multi-head routing, causal masks, and temperature sampling live.',
  duration: '18 min',
  difficulty: 'Intermediate',
  simulationId: 'transformer-attention',
  isFlagshipLab: true,
  goals: [
    'Compute attention weights from Query, Key, and Value vectors',
    'See why √d_k scaling prevents softmax saturation',
    'Understand how causal masking prevents future token leakage',
    'Compare multiple specialized attention heads on the same prompt',
    'Control next-token entropy using Temperature, Top-k, and Top-p',
  ],
  prerequisites: ['linear-algebra-tensors', 'probability-bayes-entropy', 'neural-net-backprop'],
  relatedIds: ['llm-training-kv-lora', 'llm-structured-tools-routing', 'rag-retrieval-pipeline'],
  intuitionSummary:
    'Think of self-attention as a dynamic database lookup inside every token. Each token broadcasts a Query ("what context am I looking for?"), compares it against every token’s Key ("what information do I hold?"), and blends the matching Values into a rich contextualized vector.',
  mathFoundation: {
    title: 'Scaled Dot-Product Attention & Nucleus Sampling',
    equations: [
      {
        label: 'Scaled Dot-Product Attention',
        expr: 'Attention(Q, K, V) = softmax( (Q · Kᵀ) / √d_k + M_causal ) · V',
        note: 'Dividing by √d_k keeps logit variance at 1 as dimension d_k grows, avoiding flat softmax tails.',
      },
      {
        label: 'Multi-Head Concatenation',
        expr: 'MHA(X) = Concat(head₁, …, head_h) · W^O',
        note: 'Parallel heads specialize independently: one tracks pronoun coreference, another tracks local syntax.',
      },
      {
        label: 'Temperature-Scaled Next-Token Softmax',
        expr: 'P(w_i) = exp(z_i / T) / Σ_j exp(z_j / T)',
        note: 'T → 0 sharpens toward deterministic greedy decoding; T > 1 flattens probability mass.',
      },
    ],
  },
  pythonFromScratch: {
    filename: 'self_attention_from_scratch.py',
    description: 'Pure NumPy scaled dot-product causal self-attention & nucleus (top-p) sampler.',
    code: `import numpy as np

def softmax(x, axis=-1):
    x_max = np.max(x, axis=axis, keepdims=True)
    e = np.exp(x - x_max)
    return e / np.sum(e, axis=axis, keepdims=True)

def causal_self_attention(X, Wq, Wk, Wv):
    Q, K, V = X @ Wq, X @ Wk, X @ Wv
    d_k = Q.shape[-1]
    scores = (Q @ K.T) / np.sqrt(d_k)
    # Upper-triangular causal mask prevents looking at future tokens
    T = X.shape[0]
    mask = np.triu(np.full((T, T), -1e9), k=1)
    weights = softmax(scores + mask, axis=-1)
    return weights @ V, weights

def top_p_probs(logits, temperature=0.8, top_p=0.9):
    probs = softmax(logits / temperature)
    order = np.argsort(probs)[::-1]
    cum = np.cumsum(probs[order])
    keep = order[cum - probs[order] < top_p]
    return keep, probs[keep] / probs[keep].sum()`,
  },
  realWorldUse: [
    'Powers every frontier decoder-only LLM (GPT, Claude, Gemini, Llama, Qwen) and code model.',
    'Cross-attention bridges text tokens to image patches in Vision-Language Models.',
    'Understanding KV shape and causal masking directly unlocks KV-cache memory sizing and prefix caching.',
  ],
  failureModes: [
    {
      name: 'Unscaled Softmax Saturation',
      cause: 'Omitting 1/√d_k when d_k is 64 or 128 causes dot-product variance to explode.',
      symptom: 'Softmax snaps to one-hot 1.0/0.0, starving attention weights of gradients during training.',
      mitigation: 'Always scale dot products by 1/√d_k before softmax.',
    },
    {
      name: 'Causal Mask Omission (Data Leakage)',
      cause: 'Training an autoregressive decoder without an upper-triangular -∞ mask.',
      symptom: 'Token t cheats by reading token t+1 directly—0 loss in training, gibberish at generation.',
      mitigation: 'Enforce strict causal masking for autoregressive next-token models.',
    },
    {
      name: 'High-Temperature Tail Hallucination',
      cause: 'Setting T > 1.5 without Top-p nucleus truncation.',
      symptom: 'Low-probability nonsense tokens survive into sampling, breaking JSON schemas and facts.',
      mitigation: 'Use T ≤ 0.3 for deterministic tool calls/code and pair higher T with Top-p ≤ 0.9.',
    },
  ],
  steps: [
    {
      id: 'qkv-intuition',
      label: 'Q · K · V',
      title: 'Queries, Keys & Values explained',
      chapter: 'Intuition',
      goalIndex: 0,
      body: [
        'In <code>"The agent called tool because it timed_out"</code>, what does <span class="term">"it"</span> refer to? Human readers link <code>"it"</code> back to <code>"tool"</code>.',
        'Self-attention learns three projections per token: <b>Query</b> (what I seek), <b>Key</b> (what I advertise), and <b>Value</b> (the content I pass forward if matched).',
      ],
      simPreset: { scenarioId: 'coref', headId: 'coref', queryIndex: 5, causalMask: true, useScaling: true, temperature: 0.7 },
    },
    {
      id: 'dot-product',
      label: 'Scores',
      title: 'Dot product alignment & 1/√d_k',
      chapter: 'Math',
      goalIndex: 1,
      body: [
        'The attention weight from token <code>i</code> to token <code>j</code> starts with dot product <code>q_i · k_j</code>.',
        'Click tokens along the ribbon or cells in the <b>N×N Heatmap</b> to see raw dot products turn into normalized probabilities summing to <code>1.00</code>.',
      ],
      mathLabel: 'Attention Score',
      mathEq: 'α_ij = softmax_j( (q_i · k_j) / √d_k )',
      simPreset: { scenarioId: 'coref', headId: 'coref', queryIndex: 5, causalMask: true, useScaling: true },
    },
    {
      id: 'scaling-failure',
      label: 'Scaling Fail',
      title: 'Failure: Removing √d_k saturation',
      chapter: 'Failure',
      goalIndex: 1,
      body: [
        'Toggle <b>√d_k Scaling OFF</b> in the control dock! As dot-product magnitude spikes, softmax collapses nearly all mass onto one winner.',
        'Notice <b>Entropy H</b> plummet toward <code>0.0 bits</code>: in backprop, saturated softmax gradients vanish just like saturated sigmoid!',
      ],
      callout: {
        kind: 'warn',
        title: 'Why 1/√d_k Is Non-Negotiable',
        text: 'If q and k have unit variance components, q·k has variance d_k. Dividing by √d_k restores unit variance regardless of head size.',
      },
      simPreset: { scenarioId: 'coref', headId: 'coref', queryIndex: 5, causalMask: true, useScaling: false },
    },
    {
      id: 'causal-mask',
      label: 'Causal Mask',
      title: 'Preventing future-token cheating',
      chapter: 'Visual',
      goalIndex: 2,
      body: [
        'Select token <code>"tool"</code> (index 3). With <b>Causal Mask ON</b>, future tokens (<code>"because"</code>, <code>"it"</code>, <code>"timed_out"</code>) receive <code>-∞</code> logits → exact <code>0.00</code> attention.',
        'This lets a decoder train on all positions in parallel without leaking tomorrow’s answer into today’s prediction.',
      ],
      simPreset: { scenarioId: 'coref', headId: 'coref', queryIndex: 3, causalMask: true, useScaling: true },
    },
    {
      id: 'multi-head',
      label: 'Multi-Head',
      title: 'Comparing specialized attention heads',
      chapter: 'Simulation',
      goalIndex: 3,
      body: [
        'Switch the Head selector between <span class="term">Head 1 (Coreference)</span>, <span class="term">Head 2 (Local Syntax)</span>, and <span class="term">Head 3 (Semantic)</span>.',
        'One head links <code>"it" → "tool"</code>; another tracks immediate neighbors; together they assemble multi-faceted context.',
      ],
      compare: {
        headers: ['Head Role', 'Focus Pattern', 'Typical Benefit'],
        rows: [
          ['Coreference', 'Pronoun → antecedent', 'Long-range entity tracking'],
          ['Local Syntax', 'Token t → t-1, t-2', 'Grammar & phrase structure'],
          ['Semantic', 'Topic & verb-object', 'Intent & tool binding'],
        ],
      },
      simPreset: { scenarioId: 'coref', headId: 'local', queryIndex: 5, causalMask: true, useScaling: true },
    },
    {
      id: 'kv-context',
      label: 'Value Blend',
      title: 'Blending Values into Context & KV Cache',
      chapter: 'Production',
      goalIndex: 0,
      body: [
        'Once attention weights <code>α_ij</code> are computed, the output vector is simply the weighted blend <code>z_i = Σ α_ij · v_j</code>.',
        'In production inference, storing previously computed <code>K</code> and <code>V</code> tensors in GPU VRAM (<b>KV Cache</b>) prevents recomputing them on every generated token!',
      ],
      simPreset: { scenarioId: 'rag', headId: 'semantic', queryIndex: 5, causalMask: true, useScaling: true },
    },
    {
      id: 'sampling',
      label: 'Temp & Top-p',
      title: 'Controlling creativity vs determinism',
      chapter: 'Simulation',
      goalIndex: 4,
      body: [
        'At the end of the final Transformer block, logits become next-token probabilities. Drag <b>Temperature T</b> from <code>0.2</code> to <code>2.0</code> and tighten <b>Top-p</b>.',
        'Low temperature locks onto the highest-probability token (ideal for SQL/JSON tool calls); Top-p trims noisy long-tail hallucinations.',
      ],
      simPreset: { scenarioId: 'coref', headId: 'coref', queryIndex: 5, causalMask: true, useScaling: true, temperature: 1.5, topK: 5, topP: 0.85 },
    },
    {
      id: 'challenge',
      label: 'Challenge',
      title: 'Diagnose & fix attention breakdown',
      chapter: 'Challenge',
      goalIndex: 4,
      body: [
        'Ensure <code>1/√d_k Scaling</code> and <code>Causal Mask</code> are enabled, inspect how <code>"state"</code> attends to its definition in the Python scenario, and tune sampling to keep the top 2 next tokens with ≥ 75% combined mass.',
      ],
      simPreset: { scenarioId: 'code', headId: 'coref', queryIndex: 7, causalMask: true, useScaling: true, temperature: 0.6, topK: 2, topP: 0.9 },
    },
    {
      id: 'recap',
      label: 'Recap',
      title: 'Transformer mechanics mastered',
      chapter: 'Check',
      goalIndex: 4,
      body: [
        'Every LLM behavior—from long-range pronoun binding to JSON determinism and KV-cache VRAM limits—traces directly back to these matrix operations.',
      ],
      takeaways: [
        'Self-attention computes dynamic all-to-all context in O(T²) per forward pass.',
        '1/√d_k scaling preserves healthy softmax entropy and training gradients.',
        'Temperature + Top-p control decoding precision for agentic tool calls.',
      ],
    },
  ],
  challenge: {
    title: 'Precision Code Attention & Sampling',
    brief:
      'Switch to the "Python Function Scope" prompt, enable Causal Mask + √d_k Scaling, select the final token "state", and tune Temperature & Top-k so the top 2 candidate continuations stay included with Entropy > 0.70 bits.',
    hint: 'Set Scenario = code, Head = coref, Query = last token ("state"), Causal Mask = ON, Scaling = ON, Temperature ≈ 0.5–0.8, Top-k = 2.',
    successCriteria: 'Causal Mask ON, Scaling ON, Top Attended points to param "state" (idx 3), Top-k = 2.',
  },
  quiz: [
    {
      id: 'tf-q1',
      prompt: 'Why is the dot product Q·Kᵀ divided by √d_k before applying softmax?',
      options: [
        'To reduce the number of parameters in the model',
        'To prevent dot-product variance from growing with d_k and saturating softmax into near-zero gradients',
        'To enforce causal masking automatically',
        'To convert floating point weights to INT8',
      ],
      correctIndex: 1,
      explanation: 'When d_k is large (e.g. 64 or 128), unscaled dot products have large magnitude, driving softmax into flat regions with tiny gradients.',
    },
    {
      id: 'tf-q2',
      prompt: 'What happens if you set Temperature T → 0.1 and Top-k = 1 during agent JSON tool generation?',
      options: [
        'The model produces wildly creative stories',
        'Decoding becomes nearly deterministic (greedy), selecting the highest-logit valid token',
        'The causal mask is disabled',
        'KV cache memory doubles',
      ],
      correctIndex: 1,
      explanation: 'Low temperature sharpens the distribution onto the top logit, ideal for structured JSON schemas and tool arguments.',
    },
    {
      id: 'tf-q3',
      prompt: 'How does KV caching change autoregressive token generation time complexity?',
      options: [
        'Turns per-step attention over prefix length N from O(N²) recomputation into O(N) vector-matrix lookup',
        'Eliminates the need for Value vectors',
        'Forces bidirectional attention',
        'Reduces model parameter count by half',
      ],
      correctIndex: 0,
      explanation: 'Reusing cached past Keys and Values means each new token only projects itself and attends across the N stored entries.',
    },
  ],
};
