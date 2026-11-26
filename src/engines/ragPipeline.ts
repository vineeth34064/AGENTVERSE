export type SimilarityMetric = 'cosine' | 'euclidean';

export interface CorpusDoc {
  id: string;
  title: string;
  topic: string;
  text: string;
  criticalPhrase: string;
}

export interface TextChunk {
  id: string;
  docId: string;
  docTitle: string;
  index: number;
  start: number;
  end: number;
  text: string;
  severedCritical: boolean;
  vec2d: [number, number];
  cosineScore: number;
  euclideanDist: number;
  bm25Score: number;
  hybridScore: number;
  rerankScore: number;
  finalScore: number;
  tokenEstimate: number;
}

export interface RAGConfig {
  query: string;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  hybridAlpha: number; // 0 = pure BM25 lexical, 1 = pure Dense vector
  metric: SimilarityMetric;
  rerankEnabled: boolean;
}

export interface RAGResult {
  queryVec2d: [number, number];
  chunks: TextChunk[];
  retrieved: TextChunk[];
  recallAtK: number;
  contextTokens: number;
  severedCount: number;
  faithfulness: 'grounded' | 'severed' | 'low-recall';
  groundedAnswer: string;
}

export const RAG_CORPUS: CorpusDoc[] = [
  {
    id: 'doc-mcp',
    title: 'MCP Security & Tool Permissions',
    topic: 'mcp',
    criticalPhrase: 'MCP enforces least-privilege tool scoping via explicit host capability approval.',
    text:
      'Model Context Protocol separates the host orchestrator from external MCP servers over JSON-RPC. ' +
      'MCP enforces least-privilege tool scoping via explicit host capability approval. ' +
      'Every server declares schemas before invocation so unauthorized filesystem or database mutations stay blocked.',
  },
  {
    id: 'doc-chunk',
    title: 'Chunking & Boundary Integrity',
    topic: 'rag',
    criticalPhrase: 'Small chunks without overlap sever key assertions across split boundaries.',
    text:
      'Document ingestion splits long manuals into embedding-sized passages. ' +
      'Small chunks without overlap sever key assertions across split boundaries. ' +
      'Adding 15 to 25 percent overlap preserves context continuity while metadata filters narrow domain scope.',
  },
  {
    id: 'doc-hnsw',
    title: 'HNSW & Vector Search Latency',
    topic: 'vector',
    criticalPhrase: 'HNSW navigates multi-layer proximity graphs for sub-10ms approximate recall.',
    text:
      'Exact k-nearest neighbor scans scale linearly with corpus size and bottleneck at millions of vectors. ' +
      'HNSW navigates multi-layer proximity graphs for sub-10ms approximate recall. ' +
      'Tuning efSearch trades recall percentage against p99 query latency in production vector databases.',
  },
  {
    id: 'doc-kv',
    title: 'KV Cache & Autoregressive Inference',
    topic: 'llm',
    criticalPhrase: 'KV caching reuses prior Key and Value tensors to convert O(N^2) decoding into O(N).',
    text:
      'Autoregressive transformers generate one token per forward pass. ' +
      'KV caching reuses prior Key and Value tensors to convert O(N^2) decoding into O(N). ' +
      'Without caching, every generated token forces recomputing attention over the entire prompt prefix.',
  },
];

export const RAG_PRESET_QUERIES = [
  'How does MCP prevent unauthorized tool access?',
  'Why does small chunk size without overlap break retrieval?',
  'How does HNSW achieve fast vector search latency?',
  'How does KV caching speed up LLM token decoding?',
];

const TOPIC_KEYWORDS: Record<string, string[]> = {
  mcp: ['mcp', 'permission', 'capability', 'tool', 'unauthorized', 'host', 'json-rpc', 'security', 'scoping', 'approval'],
  rag: ['chunk', 'overlap', 'split', 'boundary', 'retrieval', 'context', 'ingestion', 'rag', 'metadata'],
  vector: ['hnsw', 'vector', 'search', 'latency', 'recall', 'graph', 'efsearch', 'approximate', 'database'],
  llm: ['kv', 'cache', 'caching', 'decoding', 'tensor', 'token', 'key', 'value', 'inference', 'autoregressive'],
};

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

// Deterministic 4D topic embedding projected cleanly into 2D semantic coordinates
function embedText(text: string): { vec4: [number, number, number, number]; vec2d: [number, number] } {
  const words = tokenize(text);
  const dims: [number, number, number, number] = [0.08, 0.08, 0.08, 0.08];
  const keys = ['mcp', 'rag', 'vector', 'llm'] as const;

  for (const w of words) {
    keys.forEach((k, idx) => {
      if (TOPIC_KEYWORDS[k]!.some((kw) => w.includes(kw) || kw.includes(w))) {
        dims[idx]! += 1;
      }
    });
  }

  const norm = Math.sqrt(dims.reduce((s, v) => s + v * v, 0)) || 1;
  const vec4: [number, number, number, number] = [
    dims[0] / norm,
    dims[1] / norm,
    dims[2] / norm,
    dims[3] / norm,
  ];
  // Project 4 orthogonal-ish topic axes into distinct 2D quadrants
  const x = (vec4[0] - vec4[2]) * 0.9 + (vec4[1] - vec4[3]) * 0.35;
  const y = (vec4[1] - vec4[3]) * 0.9 - (vec4[0] - vec4[2]) * 0.35;
  return { vec4, vec2d: [x, y] };
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    const va = a[i] ?? 0;
    const vb = b[i] ?? 0;
    dot += va * vb;
    na += va * va;
    nb += vb * vb;
  }
  return dot / ((Math.sqrt(na) * Math.sqrt(nb)) || 1);
}

function euclidDist(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

function bm25Score(queryTokens: string[], chunkText: string, avgLen: number): number {
  const chunkTokens = tokenize(chunkText);
  if (chunkTokens.length === 0 || queryTokens.length === 0) return 0;
  const k1 = 1.5;
  const b = 0.75;
  let score = 0;
  for (const qt of queryTokens) {
    const tf = chunkTokens.filter((ct) => ct === qt || ct.startsWith(qt)).length;
    if (tf > 0) {
      const denom = tf + k1 * (1 - b + b * (chunkTokens.length / Math.max(1, avgLen)));
      score += (tf * (k1 + 1)) / denom;
    }
  }
  return Math.min(1, score / Math.max(1.5, queryTokens.length * 0.85));
}

export function runRAGPipeline(config: RAGConfig): RAGResult {
  const size = Math.max(45, Math.min(340, config.chunkSize));
  const overlap = Math.max(0, Math.min(size - 15, config.chunkOverlap));
  const stride = Math.max(20, size - overlap);

  const qTokens = tokenize(config.query);
  const qEmbed = embedText(config.query);

  const rawChunks: Array<{
    id: string;
    doc: CorpusDoc;
    index: number;
    start: number;
    end: number;
    text: string;
    severedCritical: boolean;
  }> = [];

  for (const doc of RAG_CORPUS) {
    let start = 0;
    let idx = 0;
    const critStart = doc.text.indexOf(doc.criticalPhrase);
    const critEnd = critStart + doc.criticalPhrase.length;

    while (start < doc.text.length) {
      const end = Math.min(doc.text.length, start + size);
      const text = doc.text.slice(start, end);
      const overlapsCritical = end > critStart && start < critEnd;
      const containsFullCritical = start <= critStart && end >= critEnd;
      const severedCritical = overlapsCritical && !containsFullCritical;

      rawChunks.push({
        id: `${doc.id}-c${idx}`,
        doc,
        index: idx,
        start,
        end,
        text,
        severedCritical,
      });

      if (end >= doc.text.length) break;
      start += stride;
      idx++;
    }
  }

  const avgLen =
    rawChunks.reduce((acc, c) => acc + tokenize(c.text).length, 0) /
    Math.max(1, rawChunks.length);

  const chunks: TextChunk[] = rawChunks.map((rc) => {
    const cEmbed = embedText(rc.text);
    const cos = cosineSim(qEmbed.vec4, cEmbed.vec4);
    const euc = euclidDist(qEmbed.vec4, cEmbed.vec4);
    const denseSim =
      config.metric === 'cosine' ? cos : Math.max(0, 1 - euc / 1.5);
    const lexical = bm25Score(qTokens, rc.text, avgLen);
    const hybrid = config.hybridAlpha * denseSim + (1 - config.hybridAlpha) * lexical;

    // Cross-encoder reranker rewards exact phrase completeness & semantic+lexical alignment
    const completenessBonus = rc.severedCritical ? -0.18 : 0.14;
    const rerank = Math.max(0, Math.min(1, hybrid * 0.8 + lexical * 0.22 + completenessBonus));
    const finalScore = config.rerankEnabled ? rerank : hybrid;

    return {
      id: rc.id,
      docId: rc.doc.id,
      docTitle: rc.doc.title,
      index: rc.index,
      start: rc.start,
      end: rc.end,
      text: rc.text,
      severedCritical: rc.severedCritical,
      vec2d: cEmbed.vec2d,
      cosineScore: cos,
      euclideanDist: euc,
      bm25Score: lexical,
      hybridScore: hybrid,
      rerankScore: rerank,
      finalScore,
      tokenEstimate: Math.ceil(rc.text.length / 4),
    };
  });

  const sorted = [...chunks].sort((a, b) => b.finalScore - a.finalScore);
  const retrieved = sorted.slice(0, config.topK);

  // Determine which document is ground-truth target for the query
  const targetDoc =
    RAG_CORPUS.map((d) => ({
      doc: d,
      match: bm25Score(qTokens, d.text, 35) + cosineSim(qEmbed.vec4, embedText(d.text).vec4),
    })).sort((a, b) => b.match - a.match)[0]?.doc ?? RAG_CORPUS[0]!;

  const targetHits = retrieved.filter((c) => c.docId === targetDoc.id);
  const intactTargetHit = targetHits.some((c) => !c.severedCritical);
  const recallAtK = targetHits.length > 0 ? Math.min(1, targetHits.length / Math.min(2, config.topK)) : 0;
  const severedCount = retrieved.filter((c) => c.severedCritical).length;
  const contextTokens = retrieved.reduce((acc, c) => acc + c.tokenEstimate, 0);

  let faithfulness: RAGResult['faithfulness'] = 'grounded';
  if (targetHits.length === 0) {
    faithfulness = 'low-recall';
  } else if (!intactTargetHit) {
    faithfulness = 'severed';
  }

  const groundedAnswer =
    faithfulness === 'grounded'
      ? `Grounded from [${targetDoc.title}]: ${targetDoc.criticalPhrase}`
      : faithfulness === 'severed'
        ? `Partial / Fragmented Answer: Retrieved chunks from "${targetDoc.title}" were split mid-sentence — increase chunk size or overlap.`
        : `Retrieval Miss: Top-${config.topK} chunks missed "${targetDoc.title}". Enable Hybrid search or raise Top-K.`;

  return {
    queryVec2d: qEmbed.vec2d,
    chunks,
    retrieved,
    recallAtK,
    contextTokens,
    severedCount,
    faithfulness,
    groundedAnswer,
  };
}
