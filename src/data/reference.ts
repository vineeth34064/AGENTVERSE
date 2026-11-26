import { SimulationId } from '../types/curriculum';

export interface GraphNode {
  id: string;
  label: string;
  stage: string;
  x: number;
  y: number;
  lessonId: string;
  simId?: SimulationId;
  color: 'sand' | 'blue' | 'violet' | 'teal' | 'green' | 'rose';
}

export interface GraphEdge {
  from: string;
  to: string;
}

export const DEPENDENCY_NODES: GraphNode[] = [
  { id: 'math', label: 'Linear Algebra & Calculus', stage: 'Stage 00', x: 70, y: 120, lessonId: 'linear-algebra-tensors', color: 'sand' },
  { id: 'gd', label: 'Gradient Descent', stage: 'Stage 00', x: 250, y: 70, lessonId: 'gradient-descent', simId: 'gradient-descent', color: 'sand' },
  { id: 'eng', label: 'Python, Async & APIs', stage: 'Stage 01–02', x: 250, y: 205, lessonId: 'python-internals-async', color: 'blue' },
  { id: 'ml', label: 'Classical ML & Eval', stage: 'Stage 03', x: 430, y: 70, lessonId: 'supervised-trees-boosting', color: 'green' },
  { id: 'nn', label: 'Neural Nets & Backprop', stage: 'Stage 04', x: 430, y: 155, lessonId: 'neural-net-backprop', simId: 'neural-net', color: 'violet' },
  { id: 'tf', label: 'Transformers & Attention', stage: 'Stage 05–06', x: 615, y: 110, lessonId: 'transformer-self-attention', simId: 'transformer-attention', color: 'violet' },
  { id: 'llm', label: 'LLM Engineering', stage: 'Stage 07', x: 790, y: 70, lessonId: 'llm-structured-tools-routing', color: 'blue' },
  { id: 'rag', label: 'RAG & Vector DBs', stage: 'Stage 08–09', x: 790, y: 175, lessonId: 'rag-retrieval-pipeline', simId: 'rag-pipeline', color: 'teal' },
  { id: 'agent', label: 'Autonomous Agents & MCP', stage: 'Stage 10', x: 970, y: 120, lessonId: 'autonomous-agent-loop', simId: 'agent-loop', color: 'green' },
  { id: 'prod', label: 'Eval, Security & Prod Ops', stage: 'Stage 11–13', x: 1145, y: 120, lessonId: 'agent-eval-security', color: 'rose' },
];

export const DEPENDENCY_EDGES: GraphEdge[] = [
  { from: 'math', to: 'gd' },
  { from: 'math', to: 'eng' },
  { from: 'gd', to: 'ml' },
  { from: 'gd', to: 'nn' },
  { from: 'ml', to: 'nn' },
  { from: 'nn', to: 'tf' },
  { from: 'tf', to: 'llm' },
  { from: 'tf', to: 'rag' },
  { from: 'eng', to: 'llm' },
  { from: 'eng', to: 'rag' },
  { from: 'llm', to: 'agent' },
  { from: 'rag', to: 'agent' },
  { from: 'agent', to: 'prod' },
];

export interface CheatsheetCard {
  id: string;
  category: string;
  title: string;
  badge: string;
  rows: Array<{ label: string; value: string; note: string }>;
}

export const CHEATSHEETS: CheatsheetCard[] = [
  {
    id: 'cs-napkin-ai',
    category: 'Infrastructure & LLM Math',
    title: 'AI Engineering Napkin Numbers',
    badge: 'Must Know',
    rows: [
      { label: '7B Model Weights (FP16 / INT4)', value: '14 GB / 3.5 GB', note: '2 bytes per param in FP16, 0.5 bytes in INT4' },
      { label: '70B Model Weights (FP16 / INT4)', value: '140 GB / 35 GB', note: 'INT4 fits on 1× A100-80GB with KV headroom' },
      { label: '1 Token (English prose / code)', value: '~4 chars / ~0.75 words', note: '1,000 tokens ≈ 750 words' },
      { label: '1536-d Vector (1M docs FP32)', value: '~6.1 GB RAM', note: 'Shrinks ~16× with Product Quantization (PQ)' },
      { label: 'TTFT vs Inter-Token Latency', value: 'Prefill vs Decode', note: 'Prefill is compute-bound; Decode is memory-BW bound' },
    ],
  },
  {
    id: 'cs-opt-dl',
    category: 'Optimization & Neural Nets',
    title: 'Optimizers & Activation Cheat Sheet',
    badge: 'Stage 00–04',
    rows: [
      { label: 'Vanilla GD Stability Bound', value: 'η < 2 / L_max', note: 'Above 2/L_max, quadratic steps diverge' },
      { label: 'AdamW Default Betas', value: 'β₁=0.9, β₂=0.999', note: 'Decoupled weight decay prevents L2/Adam interference' },
      { label: 'ReLU / GELU / SwiGLU', value: 'No +ve saturation', note: 'Standard in modern Transformer FFN blocks' },
      { label: 'LayerNorm / RMSNorm', value: 'Normalize per token', note: 'Independent of batch size, unlike BatchNorm' },
    ],
  },
  {
    id: 'cs-rag-search',
    category: 'RAG & Vector Databases',
    title: 'Chunking, Hybrid & Reranking Rules',
    badge: 'Stage 08–09',
    rows: [
      { label: 'Chunk Size & Overlap', value: '256–512 tok · 15–25%', note: 'Preserves boundary assertions without diluting signal' },
      { label: 'Hybrid Fusion Formula', value: 'RRF: Σ 1/(60 + rank)', note: 'Combines BM25 exact terms + Dense semantics' },
      { label: 'Two-Stage Retrieval', value: 'Top-25 → Rerank → Top-4', note: 'Cross-encoder sharpens precision before LLM prompt' },
      { label: 'HNSW Tuning Knobs', value: 'M (links), efSearch', note: 'Higher efSearch = higher recall, higher p99 latency' },
    ],
  },
  {
    id: 'cs-agents-mcp',
    category: 'Agentic AI & Security',
    title: 'Agent Architecture & Guardrails',
    badge: 'Stage 10–11',
    rows: [
      { label: 'ReAct vs Plan-Execute', value: 'Adaptive vs DAG', note: 'ReAct handles surprises; Plan-Execute cuts round-trips' },
      { label: 'MCP Architecture', value: 'Host → Client ⇄ Server', note: 'Standardizes tools, resources & prompts over JSON-RPC' },
      { label: 'Indirect Prompt Injection', value: 'Untrusted Data ≠ Policy', note: 'Enforce strict tool allowlists + Human approval gates' },
      { label: 'Mandatory Production Bounds', value: 'max_steps + $ budget', note: 'Prevents runaway loops & downstream rate-limit storms' },
    ],
  },
];

export interface ResearchPaper {
  id: string;
  year: number;
  title: string;
  authors: string;
  stage: string;
  coreIdea: string;
  whyItMatters: string;
  keyEquationOrPattern: string;
  status: 'Foundational Production' | 'Active Standard' | 'Frontier Research';
  relatedLessonId: string;
}

export const RESEARCH_LIBRARY: ResearchPaper[] = [
  {
    id: 'paper-adam',
    year: 2014,
    title: 'Adam: A Method for Stochastic Optimization',
    authors: 'Kingma & Ba',
    stage: 'Stage 00',
    coreIdea: 'Combines momentum (first moment) with RMSProp per-parameter adaptive scaling (second moment) plus bias correction.',
    whyItMatters: 'Remains the backbone optimizer (via AdamW) of almost every LLM and deep neural training pipeline.',
    keyEquationOrPattern: 'θ_{t+1} = θ_t - η · m̂_t / (√v̂_t + ε)',
    status: 'Foundational Production',
    relatedLessonId: 'gradient-descent',
  },
  {
    id: 'paper-attention',
    year: 2017,
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    stage: 'Stage 06',
    coreIdea: 'Replaces sequential recurrence with parallelizable Multi-Head Scaled Dot-Product Self-Attention and positional encodings.',
    whyItMatters: 'Unlocked scaling laws from millions to trillions of parameters and powers modern LLMs.',
    keyEquationOrPattern: 'Attention(Q,K,V) = softmax(QKᵀ / √d_k) V',
    status: 'Foundational Production',
    relatedLessonId: 'transformer-self-attention',
  },
  {
    id: 'paper-lora',
    year: 2021,
    title: 'LoRA: Low-Rank Adaptation of Large Language Models',
    authors: 'Hu et al.',
    stage: 'Stage 06',
    coreIdea: 'Freezes pretrained weights W₀ and injects trainable low-rank matrices ΔW = B·A (r ≪ d), cutting fine-tuning VRAM 10×.',
    whyItMatters: 'Allows single-GPU task adaptation and hot-swappable multi-tenant adapters in production.',
    keyEquationOrPattern: 'h = W₀x + (α/r) BAx',
    status: 'Foundational Production',
    relatedLessonId: 'llm-training-kv-lora',
  },
  {
    id: 'paper-rag',
    year: 2020,
    title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP',
    authors: 'Lewis et al.',
    stage: 'Stage 08',
    coreIdea: 'Pairs parametric LLM weights with a non-parametric dense document retriever at inference time.',
    whyItMatters: 'Standard architecture for grounding LLMs in fresh, private, and auditable enterprise knowledge.',
    keyEquationOrPattern: 'p(y|x) ≈ Σ_{z ∈ TopK} p_η(z|x) p_θ(y|x, z)',
    status: 'Foundational Production',
    relatedLessonId: 'rag-retrieval-pipeline',
  },
  {
    id: 'paper-react',
    year: 2022,
    title: 'ReAct: Synergizing Reasoning and Acting in Language Models',
    authors: 'Yao et al.',
    stage: 'Stage 10',
    coreIdea: 'Interleaves verbal reasoning traces (Thought) with executable actions (Tool Calls) and environment Observations.',
    whyItMatters: 'Established the canonical single-agent execution loop that reduces hallucination via grounded tool observations.',
    keyEquationOrPattern: 'Thought_t → Action_t → Observation_t → Thought_{t+1}',
    status: 'Active Standard',
    relatedLessonId: 'autonomous-agent-loop',
  },
  {
    id: 'paper-reflexion',
    year: 2023,
    title: 'Reflexion: Language Agents with Verbal Reinforcement Learning',
    authors: 'Shinn et al.',
    stage: 'Stage 10–13',
    coreIdea: 'Stores natural-language self-critiques of failed trajectories in episodic memory so future trials avoid repeated mistakes without weight updates.',
    whyItMatters: 'Inspires test-time self-correction and evaluator feedback loops in modern coding and research agents.',
    keyEquationOrPattern: 'Memory_{t+1} = Memory_t ∪ Reflect(Trajectory_t, EvaluatorSignal)',
    status: 'Frontier Research',
    relatedLessonId: 'autonomous-agent-loop',
  },
];
