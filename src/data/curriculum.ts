import { CurriculumStage, LessonData } from '../types/curriculum';
import { gradientDescentLesson } from './lessons/gradientDescentLesson';
import { neuralNetLesson } from './lessons/neuralNetLesson';
import { transformerAttentionLesson } from './lessons/transformerAttentionLesson';
import { ragPipelineLesson } from './lessons/ragPipelineLesson';
import { agentLoopLesson } from './lessons/agentLoopLesson';

export const CURRICULUM_STAGES: CurriculumStage[] = [
  {
    id: 'stage-00',
    number: '00',
    title: 'Mathematical Foundations',
    folderColor: 'sand',
    summary: 'Linear algebra, multivariable calculus, probability, entropy, and convex/non-convex optimization.',
    lessons: [
      { id: 'linear-algebra-tensors', title: 'Vectors, Matrices & Tensors', subtitle: 'Dot products, projections, eigenvalues, and tensor shapes.' },
      { id: 'calculus-chain-rule', title: 'Derivatives, Gradients & Chain Rule', subtitle: 'How sensitivities propagate backward through composite functions.' },
      { id: 'probability-bayes-entropy', title: 'Probability, Bayes & Entropy', subtitle: 'Distributions, MLE, KL divergence, and information gain.' },
      {
        id: 'gradient-descent',
        title: 'Gradient Descent Landscapes',
        subtitle: 'Interactive optimization across convex bowls, ravines, and local traps.',
        isFlagshipLab: true,
        simulationId: 'gradient-descent',
      },
    ],
  },
  {
    id: 'stage-01',
    number: '01',
    title: 'Programming & Engineering',
    folderColor: 'blue',
    summary: 'Python internals, memory layout, async I/O concurrency, REST/JSON-RPC, SQL, Git, and Docker.',
    lessons: [
      { id: 'python-internals-async', title: 'Python Memory, Generators & Asyncio', subtitle: 'Stack vs heap frames, event loops, and non-blocking I/O.' },
      { id: 'apis-http-docker', title: 'APIs, Serialization & Docker', subtitle: 'REST, JSON schemas, SQL query plans, and container isolation.' },
    ],
  },
  {
    id: 'stage-02',
    number: '02',
    title: 'Data Engineering & Science',
    folderColor: 'teal',
    summary: 'NumPy vectorization, Pandas pipelines, feature scaling, outlier detection, and preventing data leakage.',
    lessons: [
      { id: 'numpy-eda-cleaning', title: 'NumPy, EDA & Feature Scaling', subtitle: 'Vectorized arrays, missing values, Z-score vs min-max scaling.' },
      { id: 'etl-data-leakage', title: 'Pipelines, Splits & Data Leakage', subtitle: 'Why fitting scalers before train/test splitting invalidates benchmarks.' },
    ],
  },
  {
    id: 'stage-03',
    number: '03',
    title: 'Classical Machine Learning',
    folderColor: 'green',
    summary: 'Regression, trees, ensembles, SVMs, K-means, PCA, regularization, and precision/recall evaluation.',
    lessons: [
      { id: 'supervised-trees-boosting', title: 'Regression, Trees & XGBoost', subtitle: 'Linear boundaries, decision splits, bagging vs gradient boosting.' },
      { id: 'unsupervised-bias-variance', title: 'Clustering, PCA & Bias-Variance', subtitle: 'K-means centroids, dimensionality reduction, ROC-AUC, and overfitting.' },
    ],
  },
  {
    id: 'stage-04',
    number: '04',
    title: 'Deep Learning & Neural Nets',
    folderColor: 'violet',
    summary: 'Perceptrons, activations, forward/backward propagation, Adam, normalization, CNNs, RNNs, and transfer learning.',
    lessons: [
      {
        id: 'neural-net-backprop',
        title: 'Forward & Backward Propagation',
        subtitle: 'Watch activations flow forward and chain-rule gradients flow backward.',
        isFlagshipLab: true,
        simulationId: 'neural-net',
      },
      { id: 'cnn-rnn-modern-dl', title: 'CNNs, LSTMs, Normalization & Dropout', subtitle: 'Spatial feature extraction, sequence gating, BatchNorm vs LayerNorm.' },
    ],
  },
  {
    id: 'stage-05',
    number: '05',
    title: 'Natural Language Processing',
    folderColor: 'orange',
    summary: 'Subword tokenization, TF-IDF, dense word embeddings, cosine similarity, and classic sequence attention.',
    lessons: [
      { id: 'nlp-embeddings-tfidf', title: 'Tokenization, TF-IDF & Word Embeddings', subtitle: 'From sparse Bag-of-Words to dense semantic geometry.' },
    ],
  },
  {
    id: 'stage-06',
    number: '06',
    title: 'Transformers & LLM Foundations',
    folderColor: 'violet',
    summary: 'Self-attention, multi-head QKV, causal masking, BPE, KV caching, RoPE, quantization, LoRA, RLHF, and DPO.',
    lessons: [
      {
        id: 'transformer-self-attention',
        title: 'Transformer Self-Attention & Sampling',
        subtitle: 'Explore Q·K/√dk heatmaps, multi-head roles, causal masks, and Temp/Top-p.',
        isFlagshipLab: true,
        simulationId: 'transformer-attention',
      },
      { id: 'llm-training-kv-lora', title: 'Pretraining, KV Cache, Quantization & LoRA', subtitle: 'FP32→INT4 memory math, KV cache O(N) decoding, DPO & QLoRA.' },
    ],
  },
  {
    id: 'stage-07',
    number: '07',
    title: 'LLM Engineering',
    folderColor: 'blue',
    summary: 'Provider APIs, structured JSON outputs, function calling, streaming SSE, model routing, and cost control.',
    lessons: [
      { id: 'llm-structured-tools-routing', title: 'Structured Outputs, Tool Schemas & Routing', subtitle: 'Schema validation, retries, streaming, token cost, and model routing.' },
    ],
  },
  {
    id: 'stage-08',
    number: '08',
    title: 'Retrieval-Augmented Generation',
    folderColor: 'teal',
    summary: 'Ingestion, chunking overlap, dense + BM25 hybrid retrieval, RRF, cross-encoder reranking, Graph & Agentic RAG.',
    lessons: [
      {
        id: 'rag-retrieval-pipeline',
        title: 'RAG Retrieval & Chunking Pipeline',
        subtitle: 'Interactive chunk boundaries, 2D embeddings, BM25+Vector hybrid & reranking.',
        isFlagshipLab: true,
        simulationId: 'rag-pipeline',
      },
      { id: 'rag-graph-agentic', title: 'Graph RAG, Multi-Query & Grounded Eval', subtitle: 'Query rewriting, entity graphs, faithfulness, and context precision.' },
    ],
  },
  {
    id: 'stage-09',
    number: '09',
    title: 'Vector Databases & Search',
    folderColor: 'slate',
    summary: 'HNSW multi-layer graphs, IVF-PQ quantization, metadata pre-filtering, Qdrant, Pinecone, Weaviate, and FAISS.',
    lessons: [
      { id: 'hnsw-ivf-vector-dbs', title: 'HNSW, IVF-PQ & Vector Index Tuning', subtitle: 'Trading recall@K against p99 latency and RAM footprint at 100M+ vectors.' },
    ],
  },
  {
    id: 'stage-10',
    number: '10',
    title: 'Agentic AI Engineering',
    folderColor: 'green',
    summary: 'ReAct loops, Plan-and-Execute, tool calling, episodic/semantic memory, LangGraph, MCP, and A2A multi-agent orchestration.',
    lessons: [
      {
        id: 'autonomous-agent-loop',
        title: 'Autonomous Agent Execution Loop',
        subtitle: 'Step through Observe → Reason → Plan → Tool → Memory → Reflect → Recover.',
        isFlagshipLab: true,
        simulationId: 'agent-loop',
      },
      { id: 'agent-memory-frameworks', title: 'Memory Systems & Graph Frameworks', subtitle: 'Episodic vs semantic consolidation, LangGraph state machines, CrewAI & PydanticAI.' },
      { id: 'mcp-a2a-protocols', title: 'MCP & Agent-to-Agent (A2A) Protocols', subtitle: 'JSON-RPC hosts, clients, servers, capability discovery, and distributed delegation.' },
    ],
  },
  {
    id: 'stage-11',
    number: '11',
    title: 'Agent Eval, Security & Reliability',
    folderColor: 'rose',
    summary: 'Trajectory grading, hallucination detection, prompt injection defense, sandboxing, permission boundaries, and tracing.',
    lessons: [
      { id: 'agent-eval-security', title: 'Trajectory Eval, Guardrails & Prompt Injection', subtitle: 'Catching indirect injections, excessive agency, and tool drift before production.' },
    ],
  },
  {
    id: 'stage-12',
    number: '12',
    title: 'Production AI Infrastructure',
    folderColor: 'olive',
    summary: 'FastAPI streaming, vLLM/TGI continuous batching, GPU sizing, Redis queues, Kubernetes autoscaling, and telemetry.',
    lessons: [
      { id: 'production-vllm-infra', title: 'FastAPI, vLLM Batching & Production Ops', subtitle: 'Throughput vs TTFT latency, PagedAttention, queues, and cost governance.' },
    ],
  },
  {
    id: 'stage-13',
    number: '13',
    title: 'Advanced Research & Frontier AI',
    folderColor: 'orange',
    summary: 'Multimodal VLMs, diffusion/world models, test-time compute reasoning, Mixture-of-Experts, distillation, and robotics.',
    lessons: [
      { id: 'frontier-reasoning-moe', title: 'Test-Time Compute, MoE & Multimodal Agents', subtitle: 'Separating established production engineering from frontier research.' },
    ],
  },
];

export const FLAGSHIP_LESSONS: Record<string, LessonData> = {
  'gradient-descent': gradientDescentLesson,
  'neural-net-backprop': neuralNetLesson,
  'transformer-self-attention': transformerAttentionLesson,
  'rag-retrieval-pipeline': ragPipelineLesson,
  'autonomous-agent-loop': agentLoopLesson,
};

export interface ConceptBrief {
  id: string;
  stageId: string;
  stageNumber: string;
  stageTitle?: string;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Research';
  duration: string;
  intuition: string;
  mathEquation: string;
  mathExplanation: string;
  pythonCode: string;
  engineeringTradeoffs: string[];
  failureMode: string;
  prerequisites: string[];
  relatedLabId: string;
}

export const CONCEPT_BRIEFS: Record<string, ConceptBrief> = {
  'linear-algebra-tensors': {
    id: 'linear-algebra-tensors',
    stageId: 'stage-00',
    stageNumber: '00',
    stageTitle: 'Mathematical Foundations',
    title: 'Vectors, Matrices & Tensors',
    subtitle: 'Dot products, projections, eigenvalues, and tensor shapes.',
    difficulty: 'Beginner',
    duration: '12 min',
    intuition: 'Every neural layer, embedding lookup, and attention score is a geometric projection: dot products measure directional alignment while matrices rotate, stretch, and collapse vector spaces.',
    mathEquation: 'y = Wx + b,   a · b = ‖a‖ ‖b‖ cos(θ)',
    mathExplanation: 'For x ∈ ℝⁿ and W ∈ ℝᵐˣⁿ, each output row computes a dot product measuring how strongly input x aligns with that neuron’s learned template vector.',
    pythonCode: `import numpy as np

# Query and Key vectors in d_k = 4 space
q = np.array([1.1, 0.7, 0.1, 0.6])
k = np.array([1.25, 0.9, 0.2, 0.85])

dot_score = np.dot(q, k)
cosine_sim = dot_score / (np.linalg.norm(q) * np.linalg.norm(k))
print(f"Dot: {dot_score:.3f}, Cosine: {cosine_sim:.3f}")`,
    engineeringTradeoffs: [
      'Dot product grows with vector magnitude (useful for attention logits before √d_k scaling).',
      'Cosine similarity normalizes length, isolating pure semantic direction in RAG embeddings.',
    ],
    failureMode: 'Shape mismatch bugs (e.g. (B, T, D) vs (B, D, T)) and unnormalized dot products saturating softmax.',
    prerequisites: [],
    relatedLabId: 'gradient-descent',
  },
  'calculus-chain-rule': {
    id: 'calculus-chain-rule',
    stageId: 'stage-00',
    stageNumber: '00',
    stageTitle: 'Mathematical Foundations',
    title: 'Derivatives, Gradients & Chain Rule',
    subtitle: 'How sensitivities propagate backward through composite functions.',
    difficulty: 'Beginner',
    duration: '14 min',
    intuition: 'The chain rule turns an arbitrarily deep computational graph into local multiplications: each node only needs its incoming upstream gradient and its own local derivative.',
    mathEquation: '∂L/∂w = (∂L/∂ŷ) · (∂ŷ/∂z) · (∂z/∂w)',
    mathExplanation: 'Automatic differentiation caches intermediate activations during the forward pass so backward gradients are exact and linear in graph size.',
    pythonCode: `def mse_grad(x, y_true, w, b):
    z = w * x + b
    loss = 0.5 * (z - y_true) ** 2
    dL_dz = z - y_true
    return loss, dL_dz * x, dL_dz  # dL/dw, dL/db`,
    engineeringTradeoffs: [
      'Reverse-mode autodiff (PyTorch) is O(1) backward passes for scalar loss with millions of parameters.',
      'Gradient checkpointing trades extra compute to slash activation VRAM during long-context training.',
    ],
    failureMode: 'Multiplying many derivatives < 1 causes vanishing gradients; > 1 causes exploding gradients.',
    prerequisites: ['linear-algebra-tensors'],
    relatedLabId: 'neural-net-backprop',
  },
  'probability-bayes-entropy': {
    id: 'probability-bayes-entropy',
    stageId: 'stage-00',
    stageNumber: '00',
    stageTitle: 'Mathematical Foundations',
    title: 'Probability, Bayes & Entropy',
    subtitle: 'Distributions, MLE, KL divergence, and information gain.',
    difficulty: 'Beginner',
    duration: '15 min',
    intuition: 'Cross-entropy measures the surprise of a predicted probability distribution against reality. Minimizing cross-entropy is mathematically identical to Maximum Likelihood Estimation.',
    mathEquation: 'H(P, Q) = -Σ P(x) log Q(x) = H(P) + D_KL(P ‖ Q)',
    mathExplanation: 'Next-token LLM training minimizes average negative log-likelihood (cross-entropy) across billions of tokens.',
    pythonCode: `import math

def cross_entropy(probs, target_idx):
    return -math.log(max(probs[target_idx], 1e-12))

print("Confident hit:", round(cross_entropy([0.92, 0.08], 0), 4))
print("Confident miss:", round(cross_entropy([0.05, 0.95], 0), 4))`,
    engineeringTradeoffs: [
      'Lower perplexity correlates with better compression, yet does not guarantee factual truthfulness or reasoning accuracy.',
      'KL penalties in RLHF/DPO prevent policy drift away from coherent base language priors.',
    ],
    failureMode: 'Overconfident softmax logits on out-of-distribution inputs cause poorly calibrated uncertainty.',
    prerequisites: ['linear-algebra-tensors'],
    relatedLabId: 'transformer-self-attention',
  },
  'python-internals-async': {
    id: 'python-internals-async',
    stageId: 'stage-01',
    stageNumber: '01',
    stageTitle: 'Programming & Engineering',
    title: 'Python Memory, Generators & Asyncio',
    subtitle: 'Stack vs heap frames, event loops, and non-blocking I/O.',
    difficulty: 'Beginner',
    duration: '15 min',
    intuition: 'LLM and Agent workloads spend 95% of wall-clock time waiting on network sockets (model APIs, vector DBs, tools). Asyncio multiplexes thousands of waiting coroutines on one thread.',
    mathEquation: 'T_total ≈ max_i(T_tool_i) instead of Σ_i T_tool_i',
    mathExplanation: 'Parallel async tool execution cuts multi-source agent latency from the sum of tool delays down to the slowest single call.',
    pythonCode: `import asyncio

async def call_tool(name: str, delay: float) -> str:
    await asyncio.sleep(delay)
    return f"{name}:ok"

async def run_parallel_tools():
    return await asyncio.gather(
        call_tool("vector_search", 0.12),
        call_tool("sql_lookup", 0.18),
    )`,
    engineeringTradeoffs: [
      'Use asyncio for I/O-bound LLM/tool concurrency; use multiprocessing or C-extensions (NumPy/PyTorch) for CPU-bound math.',
      'Streaming generators (`yield` / `async for`) enable first-token TTFT streaming without buffering entire responses.',
    ],
    failureMode: 'Calling blocking `requests.get()` inside an `async def` FastAPI handler freezes the entire event loop.',
    prerequisites: [],
    relatedLabId: 'autonomous-agent-loop',
  },
  'apis-http-docker': {
    id: 'apis-http-docker',
    stageId: 'stage-01',
    stageNumber: '01',
    stageTitle: 'Programming & Engineering',
    title: 'APIs, Serialization & Docker',
    subtitle: 'REST, JSON schemas, SQL query plans, and container isolation.',
    difficulty: 'Beginner',
    duration: '14 min',
    intuition: 'Production AI services wrap probabilistic models inside deterministic contracts: strict Pydantic schemas, parameterized SQL, idempotency keys, and reproducible Docker containers.',
    mathEquation: 'Contract = Schema(Input) → Bounded Execution → Typed Output',
    mathExplanation: 'Containers pin CUDA/Python/library versions so local experiments behave identically in cloud clusters.',
    pythonCode: `from pydantic import BaseModel, Field

class ToolRequest(BaseModel):
    query: str = Field(min_length=3, max_length=256)
    top_k: int = Field(default=5, ge=1, le=20)`,
    engineeringTradeoffs: [
      'SSE streaming improves perceived latency on chat UIs; structured JSON mode simplifies deterministic downstream pipelines.',
      'Read-only container root filesystems limit blast radius when agents run sandboxed code.',
    ],
    failureMode: 'Unbounded retries without backoff amplify downstream API outages (thundering herd).',
    prerequisites: ['python-internals-async'],
    relatedLabId: 'autonomous-agent-loop',
  },
  'numpy-eda-cleaning': {
    id: 'numpy-eda-cleaning',
    stageId: 'stage-02',
    stageNumber: '02',
    title: 'NumPy, EDA & Feature Scaling',
    subtitle: 'Vectorized arrays, missing values, Z-score vs min-max scaling.',
    difficulty: 'Beginner',
    duration: '12 min',
    intuition: 'Gradient-based optimizers stall when one feature spans [0, 10^6] and another spans [0, 1]. Scaling transforms elongated loss ravines into round bowls.',
    mathEquation: 'z = (x - μ) / σ',
    mathExplanation: 'Standardizing features equalizes curvature along coordinate axes, allowing larger stable learning rates.',
    pythonCode: `import numpy as np

X = np.array([[10.0, 1000.0], [20.0, 2000.0], [30.0, 3000.0]])
X_norm = (X - X.mean(axis=0)) / X.std(axis=0)
print(X_norm)`,
    engineeringTradeoffs: [
      'StandardScaler handles unbounded outliers better than MinMaxScaler.',
      'Tree models (XGBoost/RandomForest) are scale-invariant, whereas MLPs, SVMs, and Logistic Regression require scaling.',
    ],
    failureMode: 'Silent NaN propagation corrupts entire weight tensors within one training iteration.',
    prerequisites: ['linear-algebra-tensors'],
    relatedLabId: 'gradient-descent',
  },
  'etl-data-leakage': {
    id: 'etl-data-leakage',
    stageId: 'stage-02',
    stageNumber: '02',
    title: 'Pipelines, Splits & Data Leakage',
    subtitle: 'Why fitting scalers before train/test splitting invalidates benchmarks.',
    difficulty: 'Intermediate',
    duration: '14 min',
    intuition: 'Data leakage occurs whenever information from the validation/test future sneaks into training features—producing 99% offline accuracy and catastrophic production failure.',
    mathEquation: 'fit(X_train) → transform(X_train), transform(X_test)',
    mathExplanation: 'All statistics (mean, std, TF-IDF vocabulary, imputation medians) must be computed strictly on the training fold.',
    pythonCode: `# WRONG: scaler.fit(X_all) -> leaks test distribution!
# RIGHT:
mu = X_train.mean(axis=0)
sd = X_train.std(axis=0) + 1e-8
X_train_s = (X_train - mu) / sd
X_test_s  = (X_test  - mu) / sd`,
    engineeringTradeoffs: [
      'Time-series and user-session data require temporal or group splits—not random shuffling.',
      'RAG benchmarks also suffer retrieval leakage when golden answers overlap eval queries.',
    ],
    failureMode: 'Target leakage (including a post-outcome column) creates illusory near-perfect validation metrics.',
    prerequisites: ['numpy-eda-cleaning'],
    relatedLabId: 'rag-retrieval-pipeline',
  },
  'supervised-trees-boosting': {
    id: 'supervised-trees-boosting',
    stageId: 'stage-03',
    stageNumber: '03',
    title: 'Regression, Trees & XGBoost',
    subtitle: 'Linear boundaries, decision splits, bagging vs gradient boosting.',
    difficulty: 'Intermediate',
    duration: '16 min',
    intuition: 'Random Forests average many deep independent trees to cut variance; Gradient Boosting trains shallow sequential trees where each new tree fits the residual errors of the previous ensemble.',
    mathEquation: 'F_m(x) = F_{m-1}(x) + ν · h_m(x; r_{m-1})',
    mathExplanation: 'For tabular engineering data, XGBoost/LightGBM remain faster, cheaper, and often more accurate than deep neural networks.',
    pythonCode: `# Residual fitting intuition in 5 lines
preds = np.full_like(y, y.mean(), dtype=float)
for _ in range(10):
    residuals = y - preds
    step_tree = fit_stump(X, residuals)
    preds += 0.1 * step_tree.predict(X)`,
    engineeringTradeoffs: [
      'GBDTs excel on heterogeneous tabular features and handle missing values natively.',
      'Trees cannot extrapolate smoothly outside seen training ranges like linear or neural models.',
    ],
    failureMode: 'Unconstrained tree depth memorizes noise and diverges cleanly on out-of-sample test distributions.',
    prerequisites: ['etl-data-leakage', 'gradient-descent'],
    relatedLabId: 'gradient-descent',
  },
  'unsupervised-bias-variance': {
    id: 'unsupervised-bias-variance',
    stageId: 'stage-03',
    stageNumber: '03',
    title: 'Clustering, PCA & Bias-Variance',
    subtitle: 'K-means centroids, dimensionality reduction, ROC-AUC, and overfitting.',
    difficulty: 'Intermediate',
    duration: '15 min',
    intuition: 'Expected error decomposes into Bias² (underfitting wrong assumptions), Variance (oversensitivity to training sample noise), and irreducible noise.',
    mathEquation: 'E[(y - ŷ)²] = Bias(ŷ)² + Var(ŷ) + σ²',
    mathExplanation: 'With heavy class imbalance (1% fraud), 99% accuracy is useless—use Precision-Recall AUC and F1 instead.',
    pythonCode: `precision = tp / max(1, tp + fp)
recall = tp / max(1, tp + fn)
f1 = 2 * precision * recall / max(1e-9, precision + recall)`,
    engineeringTradeoffs: [
      'PCA accelerates high-dimensional search by keeping top variance eigenvectors, at the cost of linear interpretability.',
      'L2 regularization shrinks large weights smoothly; L1 drives weak feature weights to exact zero.',
    ],
    failureMode: 'Evaluating imbalanced anomaly detectors with raw accuracy hides 0% minority-class recall.',
    prerequisites: ['supervised-trees-boosting'],
    relatedLabId: 'neural-net-backprop',
  },
  'cnn-rnn-modern-dl': {
    id: 'cnn-rnn-modern-dl',
    stageId: 'stage-04',
    stageNumber: '04',
    title: 'CNNs, LSTMs, Normalization & Dropout',
    subtitle: 'Spatial feature extraction, sequence gating, BatchNorm vs LayerNorm.',
    difficulty: 'Intermediate',
    duration: '18 min',
    intuition: 'CNNs exploit translation invariance by sliding shared kernels across pixels; LSTMs/GRUs add highway memory cells to avoid vanishing sequential gradients.',
    mathEquation: 'LayerNorm(x) = γ · (x - μ_feat) / √(σ²_feat + ε) + β',
    mathExplanation: 'Transformers favor LayerNorm/RMSNorm over BatchNorm because token sequences vary in length and batch statistics fail at small batch sizes.',
    pythonCode: `def rms_norm(x, weight, eps=1e-6):
    rms = np.sqrt(np.mean(x ** 2, axis=-1, keepdims=True) + eps)
    return (x / rms) * weight`,
    engineeringTradeoffs: [
      'Sequential RNN hidden states cannot be parallelized across time during training, motivating self-attention.',
      'Residual skip connections (x + F(x)) create direct gradient highways across 100+ layers.',
    ],
    failureMode: 'Forgetting `model.eval()` leaves Dropout active and BatchNorm using noisy mini-batch stats at inference.',
    prerequisites: ['neural-net-backprop'],
    relatedLabId: 'transformer-self-attention',
  },
  'nlp-embeddings-tfidf': {
    id: 'nlp-embeddings-tfidf',
    stageId: 'stage-05',
    stageNumber: '05',
    title: 'Tokenization, TF-IDF & Word Embeddings',
    subtitle: 'From sparse Bag-of-Words to dense semantic geometry.',
    difficulty: 'Intermediate',
    duration: '14 min',
    intuition: 'BM25/TF-IDF excels at exact rare keywords (error codes, IDs), whereas dense embeddings map synonyms ("latency" ↔ "slow response") close together in vector space.',
    mathEquation: 'TF-IDF(t, d) = tf(t, d) · log(N / df(t))',
    mathExplanation: 'Modern search combines sparse lexical scoring and dense vector embeddings because neither alone solves every query class.',
    pythonCode: `# Byte-Pair Encoding intuition: merge most frequent adjacent byte pairs iteratively
pair_counts = {('t', 'h'): 45, ('h', 'e'): 40, ('i', 'n'): 38}
best_pair = max(pair_counts, key=pair_counts.get)`,
    engineeringTradeoffs: [
      'Subword BPE handles unseen rare words cleanly without exploding vocabulary size.',
      'Static Word2Vec assigns one vector per word ("bank"), whereas Transformer embeddings are contextualized.',
    ],
    failureMode: 'Poor tokenization of numbers or code whitespace degrades arithmetic and syntax reasoning.',
    prerequisites: ['linear-algebra-tensors'],
    relatedLabId: 'transformer-self-attention',
  },
  'llm-training-kv-lora': {
    id: 'llm-training-kv-lora',
    stageId: 'stage-06',
    stageNumber: '06',
    title: 'Pretraining, KV Cache, Quantization & LoRA',
    subtitle: 'FP32→INT4 memory math, KV cache O(N) decoding, DPO & QLoRA.',
    difficulty: 'Advanced',
    duration: '20 min',
    intuition: 'A 70B model in FP16 weighs ~140 GB; INT4 quantization shrinks weights 4× to ~35 GB, while LoRA adapts models by freezing base weights and learning tiny rank-r updates (A·B).',
    mathEquation: 'W_adapted = W₀ + (α/r) B·A,   B ∈ ℝ^{d×r}, A ∈ ℝ^{r×k}, r ≪ d',
    mathExplanation: 'During autoregressive decoding, caching past Keys and Values avoids O(N²) recomputation per generated token, making inference memory-bandwidth bound.',
    pythonCode: `# Memory napkin math for 7B model weights + KV cache
params = 7e9
fp16_gb = (params * 2) / 1e9  # 14.0 GB
int4_gb = (params * 0.5) / 1e9 # 3.5 GB
print(f"FP16: {fp16_gb:.1f} GB | INT4: {int4_gb:.1f} GB")`,
    engineeringTradeoffs: [
      'Prompting + RAG solves knowledge freshness; LoRA fine-tuning solves format/style/domain behavior.',
      'DPO aligns preference pairs directly without training a separate brittle PPO reward model.',
    ],
    failureMode: 'Long context windows explode KV cache VRAM linearly with batch size × sequence length.',
    prerequisites: ['transformer-self-attention'],
    relatedLabId: 'transformer-self-attention',
  },
  'llm-structured-tools-routing': {
    id: 'llm-structured-tools-routing',
    stageId: 'stage-07',
    stageNumber: '07',
    title: 'Structured Outputs, Tool Schemas & Routing',
    subtitle: 'Schema validation, retries, streaming, token cost, and model routing.',
    difficulty: 'Intermediate',
    duration: '16 min',
    intuition: 'Treat an LLM like an untyped probabilistic microservice: constrain outputs with JSON Schema/constrained decoding, route simple queries to fast small models, and validate every field.',
    mathEquation: 'Cost = (T_in · c_in + T_out · c_out) / 10⁶',
    mathExplanation: 'Routing 80% of classification/extraction requests to an 8B/flash tier while reserving frontier reasoning models for hard steps cuts inference spend by 5–10×.',
    pythonCode: `# Simple confidence/complexity router
def pick_model(task_complexity: float, needs_tools: bool) -> str:
    if task_complexity > 0.7 or needs_tools:
        return "frontier-reasoning-model"
    return "fast-compact-model"`,
    engineeringTradeoffs: [
      'Constrained JSON decoding guarantees syntactic validity, though semantic correctness still needs assertions.',
      'Prompt prefix caching slashes input token cost by up to 75–90% for static system prompts & tool registries.',
    ],
    failureMode: 'Unvalidated JSON fields parsed with regex or `eval()` crash downstream workflows on model drift.',
    prerequisites: ['transformer-self-attention', 'apis-http-docker'],
    relatedLabId: 'autonomous-agent-loop',
  },
  'rag-graph-agentic': {
    id: 'rag-graph-agentic',
    stageId: 'stage-08',
    stageNumber: '08',
    title: 'Graph RAG, Multi-Query & Grounded Eval',
    subtitle: 'Query rewriting, entity graphs, faithfulness, and context precision.',
    difficulty: 'Advanced',
    duration: '18 min',
    intuition: 'Single-shot vector lookup fails on multi-hop questions ("Which teams share dependencies affected by CVE-X?"). Agentic & Graph RAG decompose queries, traverse entity links, and self-critique missing evidence.',
    mathEquation: 'RAGAS = {Faithfulness, Answer Relevance, Context Precision, Context Recall}',
    mathExplanation: 'Evaluate retrieval recall separately from generator faithfulness—you cannot fix a retrieval miss with prompt engineering.',
    pythonCode: `def reciprocal_rank_fusion(rank_lists, k=60):
    scores = {}
    for ranking in rank_lists:
        for rank, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda x: x[1], reverse=True)`,
    engineeringTradeoffs: [
      'Graph RAG improves global corpus synthesis at the cost of higher ingestion LLM extraction expense.',
      'Multi-query rewriting boosts recall by ~12–20% while multiplying vector query fanout.',
    ],
    failureMode: 'Stuffing 20 noisy chunks triggers "lost in the middle" attention degradation and higher hallucination rates.',
    prerequisites: ['rag-retrieval-pipeline'],
    relatedLabId: 'rag-retrieval-pipeline',
  },
  'hnsw-ivf-vector-dbs': {
    id: 'hnsw-ivf-vector-dbs',
    stageId: 'stage-09',
    stageNumber: '09',
    title: 'HNSW, IVF-PQ & Vector Index Tuning',
    subtitle: 'Trading recall@K against p99 latency and RAM footprint at 100M+ vectors.',
    difficulty: 'Advanced',
    duration: '17 min',
    intuition: 'HNSW builds express highway skip-layers on top of a dense local neighborhood graph, jumping across millions of embeddings in logarithmic hops.',
    mathEquation: 'Query Latency ≈ O(efSearch · M · log N)',
    mathExplanation: 'Product Quantization (PQ) splits 1536-d vectors into sub-vectors quantized to 1-byte centroids—compressing RAM 16–32× with minor recall trade-offs.',
    pythonCode: `# Memory estimate: 10M vectors x 1536 dims x 4 bytes (FP32)
raw_gb = (10_000_000 * 1536 * 4) / 1e9  # ~61.4 GB
pq8_gb = (10_000_000 * 192 * 1) / 1e9   # ~1.92 GB (8x subvector compression)
print(f"Raw: {raw_gb:.1f} GB vs PQ: {pq8_gb:.2f} GB")`,
    engineeringTradeoffs: [
      'HNSW gives highest recall/speed in RAM; IVF-PQ + DiskANN scales cheaper to billions of vectors.',
      'Pre-filtering vs post-filtering metadata strongly affects recall when filter selectivity is < 5%.',
    ],
    failureMode: 'Post-filtering strict tenant ACLs after top-10 ANN retrieval can yield 0 valid results.',
    prerequisites: ['rag-retrieval-pipeline'],
    relatedLabId: 'rag-retrieval-pipeline',
  },
  'agent-memory-frameworks': {
    id: 'agent-memory-frameworks',
    stageId: 'stage-10',
    stageNumber: '10',
    title: 'Memory Systems & Graph Frameworks',
    subtitle: 'Episodic vs semantic consolidation, LangGraph state machines, CrewAI & PydanticAI.',
    difficulty: 'Advanced',
    duration: '18 min',
    intuition: 'Frameworks like LangGraph, CrewAI, and PydanticAI wrap the exact same core loop—explicit typed state, checkpointed transitions, and bounded tool dispatch—around durable execution graphs.',
    mathEquation: 'S_{t+1} = Transition(S_t, Action_t, Observation_t, Memory(S_t))',
    mathExplanation: 'Separating working context (token window) from long-term episodic/semantic stores prevents context bloat across multi-hour runs.',
    pythonCode: `# Minimal state-machine graph node pattern (framework-free)
def agent_node(state: dict) -> dict:
    memories = recall_memory(state["goal"], threshold=0.72)
    decision = llm_decide(state["goal"], state["history"], memories)
    return {**state, "next_action": decision}`,
    engineeringTradeoffs: [
      'Hand-rolled state machines give full observability; LangGraph shines for durable checkpoints & human interrupts.',
      'Storing every raw message in vector memory pollutes recall; consolidate key facts periodically.',
    ],
    failureMode: 'Unbounded conversation history overflows context or degrades tool selection accuracy.',
    prerequisites: ['autonomous-agent-loop'],
    relatedLabId: 'autonomous-agent-loop',
  },
  'mcp-a2a-protocols': {
    id: 'mcp-a2a-protocols',
    stageId: 'stage-10',
    stageNumber: '10',
    title: 'MCP & Agent-to-Agent (A2A) Protocols',
    subtitle: 'JSON-RPC hosts, clients, servers, capability discovery, and distributed delegation.',
    difficulty: 'Advanced',
    duration: '20 min',
    intuition: 'MCP standardizes how an agent connects vertically to tools, prompts, and resources (USB-C for AI tools), whereas A2A standardizes horizontal collaboration between independent specialist agents.',
    mathEquation: 'Host → MCP Client ⇄ (stdio / Streamable HTTP JSON-RPC) ⇄ MCP Server',
    mathExplanation: 'By decoupling tool discovery (`tools/list`) and invocation (`tools/call`), any compliant MCP server plugs cleanly into any host agent without custom glue code.',
    pythonCode: `# Minimal JSON-RPC 2.0 MCP tools/call request
request = {
    "jsonrpc": "2.0",
    "id": 42,
    "method": "tools/call",
    "params": {
        "name": "sql_query",
        "arguments": {"sql": "SELECT count(*) FROM incidents WHERE open = true"}
    }
}`,
    engineeringTradeoffs: [
      'stdio transport keeps local CLI servers zero-latency & air-gapped; Streamable HTTP scales remote multi-tenant servers.',
      'Always enforce host-level OAuth scopes and human consent before exposing write/delete MCP tools.',
    ],
    failureMode: 'Trusting unverified third-party MCP tool descriptions exposes agents to hidden tool-poisoning prompt injections.',
    prerequisites: ['autonomous-agent-loop', 'apis-http-docker'],
    relatedLabId: 'autonomous-agent-loop',
  },
  'agent-eval-security': {
    id: 'agent-eval-security',
    stageId: 'stage-11',
    stageNumber: '11',
    title: 'Trajectory Eval, Guardrails & Prompt Injection',
    subtitle: 'Catching indirect injections, excessive agency, and tool drift before production.',
    difficulty: 'Advanced',
    duration: '19 min',
    intuition: 'Final-answer accuracy alone hides unsafe agents: evaluate the entire execution trajectory—tool choice, argument safety, token budget, and recovery under injected faults.',
    mathEquation: 'Pass@k & Trajectory Score = f(GoalAchieved, ToolAccuracy, PolicySafe)',
    mathExplanation: 'Treat all retrieved web pages, emails, and database cells as untrusted data—never concatenate them into privileged system instructions.',
    pythonCode: `ALLOWED_TOOLS = {"file_read", "web_search"}  # Least privilege for untrusted summarize task

def authorize_tool_call(tool_name: str, human_approved: bool) -> bool:
    if tool_name not in ALLOWED_TOOLS:
        return human_approved
    return True`,
    engineeringTradeoffs: [
      'Strict tool allowlists + human-in-the-loop gates eliminate catastrophic silent exfiltration.',
      'Deterministic replay mocks let CI/CD test agent trajectories regressively without flaky live API variance.',
    ],
    failureMode: 'Excessive agency: giving a read-only triage agent unrestricted `send_email` or `drop_table` credentials.',
    prerequisites: ['autonomous-agent-loop', 'mcp-a2a-protocols'],
    relatedLabId: 'autonomous-agent-loop',
  },
  'production-vllm-infra': {
    id: 'production-vllm-infra',
    stageId: 'stage-12',
    stageNumber: '12',
    title: 'FastAPI, vLLM Batching & Production Ops',
    subtitle: 'Throughput vs TTFT latency, PagedAttention, queues, and cost governance.',
    difficulty: 'Advanced',
    duration: '18 min',
    intuition: 'GPU inference is compute-bound during prompt prefill and memory-bandwidth-bound during decoding; continuous batching + PagedAttention lets GPUs serve 10× more concurrent streams without OOM.',
    mathEquation: 'Throughput (tok/s) ∝ BatchSize / InterTokenLatency',
    mathExplanation: 'Async FastAPI gateways offload long agent runs to Redis/worker queues while streaming incremental progress over SSE or WebSockets.',
    pythonCode: `# Simple token bucket rate limiter check
def allow_request(tokens_avail: float, cost: float) -> tuple[bool, float]:
    if tokens_avail >= cost:
        return True, tokens_avail - cost
    return False, tokens_avail`,
    engineeringTradeoffs: [
      'Self-hosted vLLM wins economically above ~30–40% sustained GPU utilization; serverless APIs win for bursty low traffic.',
      'Always instrument per-tenant token burn, TTFT, p99 tool latency, and circuit-breaker fallbacks.',
    ],
    failureMode: 'Synchronous blocking worker pools exhaust connections when slow upstream LLM providers spike p99 latency.',
    prerequisites: ['llm-training-kv-lora', 'agent-eval-security'],
    relatedLabId: 'autonomous-agent-loop',
  },
  'frontier-reasoning-moe': {
    id: 'frontier-reasoning-moe',
    stageId: 'stage-13',
    stageNumber: '13',
    title: 'Test-Time Compute, MoE & Multimodal Agents',
    subtitle: 'Separating established production engineering from frontier research.',
    difficulty: 'Research',
    duration: '16 min',
    intuition: 'Mixture-of-Experts scales total model capacity while activating only 2–4 sparse experts per token; test-time compute allocates extra verifier/search tokens at inference to solve hard math and coding.',
    mathEquation: 'y = Σ_{i ∈ TopK(G(x))} g_i(x) · E_i(x)',
    mathExplanation: 'Distinguish battle-tested production tools (RAG, structured tool calling, deterministic state machines) from experimental frontier techniques (self-modifying weights, open-ended computer-use).',
    pythonCode: `# Top-2 Mixture-of-Experts routing weights
import numpy as np
router_logits = np.array([2.4, -0.3, 1.8, 0.1])
top2_idx = np.argsort(router_logits)[-2:]
weights = np.exp(router_logits[top2_idx])
weights /= weights.sum()`,
    engineeringTradeoffs: [
      'MoE reduces FLOPs per token, yet all expert weights still occupy GPU VRAM unless offloaded.',
      'Test-time search dramatically raises reasoning accuracy on verifiable domains (code/math) at higher latency and token cost.',
    ],
    failureMode: 'Deploying unverified open-ended computer-use agents on critical systems without deterministic sandboxing.',
    prerequisites: ['llm-training-kv-lora', 'autonomous-agent-loop'],
    relatedLabId: 'transformer-self-attention',
  },
};
