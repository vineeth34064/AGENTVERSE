import { LessonData } from '../../types/curriculum';

export const ragPipelineLesson: LessonData = {
  id: 'rag-retrieval-pipeline',
  stageId: 'stage-08',
  stageNumber: '08',
  stageTitle: 'Retrieval-Augmented Generation',
  title: 'RAG Retrieval & Chunking Pipeline',
  subtitle: 'Experiment with chunk boundaries, vector geometry, BM25 + semantic hybrid search, and reranking.',
  duration: '18 min',
  difficulty: 'Intermediate',
  simulationId: 'rag-pipeline',
  isFlagshipLab: true,
  goals: [
    'See how chunk size and overlap prevent severing critical assertions',
    'Compare cosine similarity vs Euclidean distance in 2D embedding space',
    'Combine BM25 lexical search with dense vectors via Hybrid fusion',
    'Improve precision with cross-encoder reranking before context assembly',
    'Diagnose low recall and context fragmentation failures',
  ],
  prerequisites: ['nlp-embeddings-tfidf', 'transformer-self-attention'],
  relatedIds: ['rag-graph-agentic', 'hnsw-ivf-vector-dbs', 'autonomous-agent-loop'],
  intuitionSummary:
    'An LLM’s weights freeze at training time and cannot see your private docs or yesterday’s incidents. RAG acts like an open-book exam: first retrieve the exact relevant passages from your knowledge base, rank the sharpest evidence to the top, and ground the model’s answer solely in those retrieved chunks.',
  mathFoundation: {
    title: 'Similarity Geometry, BM25 & Hybrid Retrieval',
    equations: [
      {
        label: 'Cosine Similarity vs Euclidean Distance',
        expr: 'cos(q, d) = (q · d) / (‖q‖‖d‖),   dist(q, d) = ‖q - d‖₂',
        note: 'Cosine ignores vector length and compares semantic direction; for unit-normalized vectors, cos = 1 - ½‖q-d‖².',
      },
      {
        label: 'Hybrid Score Blending',
        expr: 'S_hybrid(q, d) = α · S_dense(q, d) + (1 - α) · S_BM25(q, d)',
        note: 'Balances semantic synonym matching (α → 1) with exact keyword/error-code precision (α → 0).',
      },
      {
        label: 'Chunk Stride & Boundary Integrity',
        expr: 'stride = chunk_size - overlap',
        note: 'Zero overlap fractures sentences sitting at multiples of chunk_size; 15–25% overlap preserves continuity.',
      },
    ],
  },
  pythonFromScratch: {
    filename: 'rag_pipeline_from_scratch.py',
    description: 'From-scratch sliding chunker, cosine similarity retriever, BM25 scorer, and hybrid fusion.',
    code: `import math, re
from collections import Counter

def chunk_document(text: str, size: int = 180, overlap: int = 40) -> list[str]:
    stride = max(1, size - overlap)
    return [text[i : i + size] for i in range(0, len(text), stride)]

def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a)) or 1.0
    nb = math.sqrt(sum(y * y for y in b)) or 1.0
    return dot / (na * nb)

def bm25_score(query: str, doc: str, avg_len: float = 30.0) -> float:
    q_terms = re.findall(r"[a-z0-9]+", query.lower())
    d_terms = re.findall(r"[a-z0-9]+", doc.lower())
    counts = Counter(d_terms)
    k1, b = 1.5, 0.75
    score = 0.0
    for t in q_terms:
        tf = counts[t]
        if tf:
            score += (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * len(d_terms) / avg_len))
    return score`,
  },
  realWorldUse: [
    'Enterprise support copilots, codebase Q&A assistants, and legal/medical citation engines.',
    'Dynamic tool-output and long-term episodic memory retrieval inside Agentic AI systems.',
    'Compliance-critical QA where every generated claim must link back to a verifiable chunk ID.',
  ],
  failureModes: [
    {
      name: 'Mid-Sentence Chunk Severing',
      cause: 'Setting small chunk sizes with zero overlap.',
      symptom: 'Key subject and predicate land in separate chunks, breaking embeddings and producing incomplete context.',
      mitigation: 'Use semantic/recursive sentence splitting plus 15–25% chunk overlap.',
    },
    {
      name: 'Exact Identifier Miss (Pure Dense)',
      cause: 'Relying solely on dense embeddings for exact acronyms, error codes, or SKUs (e.g. "HNSW", "efSearch").',
      symptom: 'Bi-encoder compresses rare identifiers away, ranking vague generic passages higher.',
      mitigation: 'Blend BM25 sparse retrieval with dense vectors (Hybrid α ≈ 0.5–0.65).',
    },
    {
      name: 'Lost in the Middle / Context Bloat',
      cause: 'Retrieving Top-K = 20 unfiltered chunks without reranking.',
      symptom: 'Relevant facts buried in middle tokens get ignored by LLM attention while inflating cost.',
      mitigation: 'Retrieve broadly (Top-20), apply a Cross-Encoder Reranker, and inject only Top-3 to Top-5.',
    },
  ],
  steps: [
    {
      id: 'why-rag',
      label: 'Why RAG',
      title: 'Grounding LLMs in private live evidence',
      chapter: 'Intuition',
      goalIndex: 0,
      body: [
        'Pretrained LLMs memorize static world patterns—they hallucinate when asked about private internal specs or fast-changing APIs.',
        '<span class="term">Retrieval-Augmented Generation (RAG)</span> turns generation into an open-book pipeline: <b>Chunk → Embed → Retrieve → Rerank → Grounded Answer</b>.',
      ],
      simPreset: { queryIndex: 0, chunkSize: 180, chunkOverlap: 40, topK: 2, hybridAlpha: 0.6, rerankEnabled: true },
    },
    {
      id: 'chunking-bad',
      label: 'Bad Chunks',
      title: 'Failure: Tiny chunks with zero overlap',
      chapter: 'Failure',
      goalIndex: 0,
      body: [
        'Watch the <b>Chunk Boundary Strip</b> when <code>Chunk Size = 55</code> and <code>Overlap = 0</code>!',
        'Red highlights show critical assertions sliced right down the middle—the retriever may pull half a sentence without its conclusion!',
      ],
      callout: {
        kind: 'warn',
        title: 'Garbage In, Garbage Out',
        text: 'Most "LLM hallucination" bugs in RAG apps are actually broken chunk boundaries or missing retrieval hits.',
      },
      simPreset: { queryIndex: 1, chunkSize: 55, chunkOverlap: 0, topK: 2, hybridAlpha: 0.6, rerankEnabled: false },
    },
    {
      id: 'chunking-good',
      label: 'Overlap Fix',
      title: 'Healing boundaries with sliding overlap',
      chapter: 'Simulation',
      goalIndex: 0,
      body: [
        'Raise <b>Chunk Size ≈ 190</b> and <b>Overlap ≈ 45</b>. Now key assertions stay intact inside coherent windows and <b>Faithfulness</b> snaps to <code>Grounded</code>.',
      ],
      changes: [
        { kind: 'add', text: 'Critical assertions remain whole inside overlapping spans' },
        { kind: 'mod', text: 'Faithfulness chip updates from Severed → Grounded' },
      ],
      simPreset: { queryIndex: 1, chunkSize: 190, chunkOverlap: 45, topK: 2, hybridAlpha: 0.6, rerankEnabled: true },
    },
    {
      id: 'vector-space',
      label: 'Vector Space',
      title: 'Cosine similarity in 2D vector space',
      chapter: 'Visual',
      goalIndex: 1,
      body: [
        'Every chunk and the user query are projected into the <b>2D Semantic Map</b> on the right. Dashed lines connect the query star to the Top-K nearest chunks.',
        'Toggle <b>Cosine</b> vs <b>Euclidean</b>: cosine measures angular alignment regardless of document length.',
      ],
      mathLabel: 'Cosine Alignment',
      mathEq: 'sim(q, c) = (q · c) / (‖q‖ · ‖c‖)',
      simPreset: { queryIndex: 2, chunkSize: 185, chunkOverlap: 40, topK: 2, metric: 'cosine' },
    },
    {
      id: 'hybrid-search',
      label: 'Hybrid BM25',
      title: 'Why Hybrid beats pure vector search',
      chapter: 'Math',
      goalIndex: 2,
      body: [
        'Slide <b>Hybrid α</b> from <code>0.0</code> (pure BM25 exact keywords) to <code>1.0</code> (pure Dense semantic similarity).',
        'Pure dense vectors grasp paraphrases; pure BM25 nails exact acronyms like <code>efSearch</code> or <code>JSON-RPC</code>. Blending at <code>α ≈ 0.55</code> wins on both.',
      ],
      compare: {
        headers: ['Query Type', 'BM25 (α=0)', 'Hybrid (α=0.55)'],
        rows: [
          ['Exact error/API code', 'Strong', 'Strong'],
          ['Paraphrased meaning', 'Weak', 'Strong'],
          ['Production default', 'Baseline', 'Recommended'],
        ],
      },
      simPreset: { queryIndex: 2, chunkSize: 185, chunkOverlap: 40, topK: 2, hybridAlpha: 0.55, rerankEnabled: false },
    },
    {
      id: 'reranking',
      label: 'Reranker',
      title: 'Two-stage retrieval + Cross-Encoder reranking',
      chapter: 'Production',
      goalIndex: 3,
      body: [
        'Bi-encoders embed query and chunk separately (fast for millions of docs). A <span class="term">Cross-Encoder Reranker</span> reads query + candidate chunk <b>jointly</b> to score true relevance.',
        'Toggle <b>Reranker ON</b> and observe incomplete severed chunks drop below complete, authoritative evidence.',
      ],
      simPreset: { queryIndex: 0, chunkSize: 165, chunkOverlap: 35, topK: 2, hybridAlpha: 0.55, rerankEnabled: true },
    },
    {
      id: 'topk-budget',
      label: 'Top-K Budget',
      title: 'Balancing Recall@K vs Context Bloat',
      chapter: 'Failure',
      goalIndex: 4,
      body: [
        'Watch the <b>Ctx Tokens</b> HUD chip as you increase <code>Top-K</code> from <code>1</code> to <code>5</code>.',
        'Too low (<code>K=1</code>) risks missing multi-doc answers; too high inflates latency, cost, and distraction from off-topic chunks.',
      ],
      simPreset: { queryIndex: 0, chunkSize: 185, chunkOverlap: 40, topK: 4, hybridAlpha: 0.55, rerankEnabled: true },
    },
    {
      id: 'challenge',
      label: 'Challenge',
      title: 'Fix a broken RAG configuration',
      chapter: 'Challenge',
      goalIndex: 4,
      body: [
        'Starting from severely fragmented chunks, configure chunk size, overlap, hybrid α, and reranking to achieve <code>Faithfulness = Grounded</code> with <code>Context Tokens &lt; 140</code>.',
      ],
      simPreset: { queryIndex: 0, chunkSize: 60, chunkOverlap: 0, topK: 1, hybridAlpha: 0.95, rerankEnabled: false },
    },
    {
      id: 'recap',
      label: 'Recap',
      title: 'Production RAG engineering checklist',
      chapter: 'Check',
      goalIndex: 4,
      body: [
        'Great RAG is information retrieval engineering first and prompting second.',
      ],
      takeaways: [
        'Preserve sentence boundaries with 15–25% chunk overlap.',
        'Combine BM25 keyword precision with dense semantic embeddings.',
        'Rerank top candidates down to a tight, high-signal Top-K context window.',
      ],
    },
  ],
  challenge: {
    title: 'Zero-Severing High-Signal RAG',
    brief:
      'Fix the retrieval pipeline on the MCP Security query so Faithfulness reaches "Grounded", Severed Chunks = 0, Recall@K = 100%, while keeping Context Tokens ≤ 140.',
    hint: 'Set Chunk Size around 175–210, Overlap around 35–45, Top-K = 2, Hybrid α around 0.50–0.65, and turn Reranker ON.',
    successCriteria: 'Faithfulness = Grounded, Severed Chunks = 0, and Context Tokens ≤ 140.',
  },
  quiz: [
    {
      id: 'rag-q1',
      prompt: 'Why is Hybrid Search (BM25 + Dense Vector) usually superior to pure dense vector search in developer docs?',
      options: [
        'BM25 reduces vector dimensions from 1536 to 64',
        'Dense vectors capture synonyms/paraphrases while BM25 preserves exact matches on rare identifiers, acronyms, and error codes',
        'Hybrid search eliminates the need for chunking',
        'BM25 prevents prompt injection automatically',
      ],
      correctIndex: 1,
      explanation: 'Dense embeddings smooth over exact strings like "CVE-2025-104" or "efSearch"; BM25 rescues exact lexical precision.',
    },
    {
      id: 'rag-q2',
      prompt: 'What is the primary role of a Cross-Encoder Reranker in a two-stage RAG pipeline?',
      options: [
        'To split PDFs into smaller chunks',
        'To jointly attend across (query, candidate chunk) pairs on the top-N retrieved docs for much sharper ranking',
        'To compress embeddings into INT4',
        'To replace the generator LLM completely',
      ],
      correctIndex: 1,
      explanation: 'Cross-encoders are too slow to run on 10M docs, so they rerank the top 20–50 candidates from fast bi-encoder retrieval.',
    },
    {
      id: 'rag-q3',
      prompt: 'What problem does adding 15–25% overlap between consecutive text chunks solve?',
      options: [
        'It doubles GPU VRAM capacity',
        'It avoids severing key cause-and-effect assertions that sit right on chunk boundaries',
        'It removes duplicate documents from the database',
        'It forces Euclidean distance to equal zero',
      ],
      correctIndex: 1,
      explanation: 'Overlapping windows ensure sentences spanning a boundary appear intact in at least one chunk.',
    },
  ],
};
