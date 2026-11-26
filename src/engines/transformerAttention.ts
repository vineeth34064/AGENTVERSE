export type PromptPresetId = 'coref' | 'rag' | 'code';
export type HeadRoleId = 'coref' | 'local' | 'semantic';

export interface AttentionScenario {
  id: PromptPresetId;
  label: string;
  tokens: string[];
  defaultQueryIndex: number;
  // 4-dim Q, K, V embeddings per token per head role
  qVectors: Record<HeadRoleId, number[][]>;
  kVectors: Record<HeadRoleId, number[][]>;
  vVectors: number[][];
  nextTokenCandidates: Array<{ token: string; baseLogit: number }>;
}

export interface AttentionConfig {
  scenarioId: PromptPresetId;
  headId: HeadRoleId;
  queryIndex: number;
  causalMask: boolean;
  useScaling: boolean;
  queryBoost: number; // lets learner steer alignment toward target token
  temperature: number;
  topK: number;
  topP: number;
}

export interface AttentionComputation {
  tokens: string[];
  dk: number;
  rawScoresMatrix: number[][];
  scaledScoresMatrix: number[][];
  weightsMatrix: number[][];
  selectedWeights: number[];
  selectedRaw: number[];
  selectedScaled: number[];
  entropyBits: number;
  topAttendedIndex: number;
  contextVector: number[];
  samplingDist: Array<{
    token: string;
    prob: number;
    included: boolean;
    logit: number;
  }>;
}

export const ATTENTION_SCENARIOS: Record<PromptPresetId, AttentionScenario> = {
  coref: {
    id: 'coref',
    label: 'Pronoun Coreference',
    tokens: ['The', 'agent', 'called', 'tool', 'because', 'it', 'timed_out'],
    defaultQueryIndex: 5, // "it"
    qVectors: {
      coref: [
        [0.2, 0.1, 0.0, 0.3],
        [0.9, 0.6, -0.2, 0.1],
        [0.3, 0.8, 0.4, -0.1],
        [0.8, 0.5, 0.3, 0.2],
        [0.1, 0.2, 0.9, 0.1],
        [1.1, 0.7, 0.1, 0.6], // "it" searches for entity/tool
        [0.4, 0.9, 0.5, 0.2],
      ],
      local: [
        [1.0, 0.1, 0.0, 0.0],
        [0.9, 0.8, 0.1, 0.0],
        [0.3, 1.0, 0.7, 0.0],
        [0.1, 0.4, 1.0, 0.2],
        [0.0, 0.1, 0.8, 0.9],
        [0.0, 0.0, 0.6, 1.1],
        [0.0, 0.0, 0.2, 1.2],
      ],
      semantic: [
        [0.1, 0.1, 0.1, 0.1],
        [0.9, 0.2, 0.8, 0.1],
        [0.6, 0.9, 0.4, 0.3],
        [0.8, 0.7, 0.5, 0.2],
        [0.2, 0.3, 0.8, 0.6],
        [0.7, 0.4, 0.6, 0.7],
        [0.6, 0.9, 0.2, 0.9],
      ],
    },
    kVectors: {
      coref: [
        [0.1, 0.0, 0.2, 0.1],
        [0.8, 0.3, -0.1, 0.5], // agent
        [0.2, 0.4, 0.1, 0.0],
        [1.25, 0.9, 0.2, 0.85], // tool (strong coreference match with "it")
        [0.0, 0.1, 0.4, 0.1],
        [0.3, 0.2, 0.1, 0.3],
        [0.4, 0.5, 0.3, 0.2],
      ],
      local: [
        [1.1, 0.2, 0.0, 0.0],
        [0.9, 0.9, 0.1, 0.0],
        [0.2, 1.0, 0.8, 0.0],
        [0.1, 0.4, 1.1, 0.3],
        [0.0, 0.1, 0.9, 1.0],
        [0.0, 0.0, 0.5, 1.1],
        [0.0, 0.0, 0.2, 1.2],
      ],
      semantic: [
        [0.1, 0.1, 0.1, 0.1],
        [1.0, 0.3, 0.9, 0.2],
        [0.5, 1.0, 0.4, 0.4],
        [0.9, 0.8, 0.6, 0.3],
        [0.2, 0.3, 0.8, 0.5],
        [0.4, 0.3, 0.4, 0.5],
        [0.6, 0.9, 0.3, 1.0],
      ],
    },
    vVectors: [
      [0.1, 0.2, 0.0, 0.1],
      [0.8, 0.1, 0.4, 0.2],
      [0.3, 0.7, 0.2, 0.1],
      [0.9, 0.8, 0.1, 0.6],
      [0.2, 0.2, 0.8, 0.1],
      [0.4, 0.4, 0.3, 0.4],
      [0.2, 0.6, 0.1, 0.9],
    ],
    nextTokenCandidates: [
      { token: 'and', baseLogit: 4.1 },
      { token: 'after', baseLogit: 3.5 },
      { token: 'during', baseLogit: 2.9 },
      { token: 'so', baseLogit: 2.3 },
      { token: 'when', baseLogit: 1.7 },
      { token: 'suddenly', baseLogit: 0.9 },
    ],
  },
  rag: {
    id: 'rag',
    label: 'RAG Context Grounding',
    tokens: ['Query', 'retrieves', 'chunks', 'from', 'vector', 'index'],
    defaultQueryIndex: 5,
    qVectors: {
      coref: [
        [0.9, 0.4, 0.2, 0.1],
        [0.4, 0.9, 0.5, 0.1],
        [0.8, 0.7, 0.6, 0.2],
        [0.2, 0.2, 0.9, 0.1],
        [0.9, 0.5, 0.4, 0.8],
        [0.8, 0.6, 0.4, 1.1],
      ],
      local: [
        [1.1, 0.2, 0.0, 0.0],
        [0.9, 1.0, 0.2, 0.0],
        [0.2, 0.9, 1.0, 0.1],
        [0.0, 0.3, 1.1, 0.5],
        [0.0, 0.1, 0.6, 1.1],
        [0.0, 0.0, 0.3, 1.2],
      ],
      semantic: [
        [1.0, 0.7, 0.3, 0.2],
        [0.6, 0.9, 0.6, 0.3],
        [0.9, 0.8, 0.7, 0.5],
        [0.2, 0.2, 0.5, 0.2],
        [0.9, 0.6, 0.7, 0.9],
        [1.0, 0.8, 0.6, 1.0],
      ],
    },
    kVectors: {
      coref: [
        [0.8, 0.5, 0.2, 0.2],
        [0.3, 0.7, 0.4, 0.1],
        [0.9, 0.6, 0.3, 0.7],
        [0.1, 0.1, 0.6, 0.1],
        [1.0, 0.7, 0.4, 1.1],
        [0.7, 0.5, 0.3, 0.9],
      ],
      local: [
        [1.1, 0.2, 0.0, 0.0],
        [0.9, 1.0, 0.2, 0.0],
        [0.2, 0.9, 1.0, 0.1],
        [0.0, 0.3, 1.1, 0.5],
        [0.0, 0.1, 0.7, 1.1],
        [0.0, 0.0, 0.3, 1.2],
      ],
      semantic: [
        [0.9, 0.6, 0.4, 0.3],
        [0.5, 0.8, 0.5, 0.3],
        [1.1, 0.9, 0.8, 0.6],
        [0.1, 0.2, 0.4, 0.1],
        [1.0, 0.7, 0.6, 1.0],
        [0.8, 0.7, 0.5, 0.9],
      ],
    },
    vVectors: [
      [0.9, 0.2, 0.3, 0.1],
      [0.4, 0.8, 0.2, 0.3],
      [0.8, 0.7, 0.5, 0.4],
      [0.1, 0.2, 0.4, 0.1],
      [0.7, 0.4, 0.8, 0.9],
      [0.6, 0.5, 0.7, 0.8],
    ],
    nextTokenCandidates: [
      { token: 'using', baseLogit: 3.9 },
      { token: 'via', baseLogit: 3.3 },
      { token: 'with', baseLogit: 2.8 },
      { token: 'and', baseLogit: 2.1 },
      { token: 'before', baseLogit: 1.2 },
      { token: 'quickly', baseLogit: 0.7 },
    ],
  },
  code: {
    id: 'code',
    label: 'Python Function Scope',
    tokens: ['def', 'step', '(', 'state', ')', ':', 'return', 'state'],
    defaultQueryIndex: 7,
    qVectors: {
      coref: [
        [0.1, 0.2, 0.0, 0.1],
        [0.4, 0.8, 0.2, 0.3],
        [0.1, 0.3, 0.1, 0.0],
        [1.0, 0.6, 0.3, 0.8],
        [0.1, 0.2, 0.2, 0.1],
        [0.2, 0.3, 0.4, 0.2],
        [0.5, 0.7, 0.8, 0.4],
        [1.2, 0.7, 0.3, 0.9], // second "state" attends strongly to param "state"
      ],
      local: [
        [1.0, 0.1, 0.0, 0.0],
        [0.9, 0.9, 0.1, 0.0],
        [0.3, 1.0, 0.5, 0.0],
        [0.1, 0.6, 1.0, 0.2],
        [0.0, 0.2, 0.9, 0.6],
        [0.0, 0.1, 0.6, 0.9],
        [0.0, 0.0, 0.4, 1.1],
        [0.0, 0.0, 0.2, 1.2],
      ],
      semantic: [
        [0.4, 0.2, 0.1, 0.1],
        [0.8, 0.7, 0.3, 0.2],
        [0.1, 0.1, 0.2, 0.1],
        [1.0, 0.8, 0.4, 0.7],
        [0.1, 0.1, 0.2, 0.1],
        [0.2, 0.2, 0.4, 0.2],
        [0.6, 0.8, 0.9, 0.5],
        [1.1, 0.8, 0.5, 0.8],
      ],
    },
    kVectors: {
      coref: [
        [0.1, 0.1, 0.0, 0.1],
        [0.5, 0.6, 0.2, 0.2],
        [0.0, 0.1, 0.1, 0.0],
        [1.2, 0.9, 0.4, 1.0],
        [0.0, 0.1, 0.1, 0.1],
        [0.1, 0.2, 0.3, 0.1],
        [0.4, 0.6, 0.7, 0.3],
        [0.9, 0.6, 0.3, 0.8],
      ],
      local: [
        [1.0, 0.1, 0.0, 0.0],
        [0.9, 0.9, 0.1, 0.0],
        [0.3, 1.0, 0.5, 0.0],
        [0.1, 0.6, 1.0, 0.2],
        [0.0, 0.2, 0.9, 0.6],
        [0.0, 0.1, 0.6, 0.9],
        [0.0, 0.0, 0.4, 1.1],
        [0.0, 0.0, 0.2, 1.2],
      ],
      semantic: [
        [0.3, 0.2, 0.1, 0.1],
        [0.9, 0.7, 0.3, 0.2],
        [0.0, 0.1, 0.1, 0.0],
        [1.1, 0.9, 0.5, 0.8],
        [0.0, 0.1, 0.1, 0.0],
        [0.1, 0.2, 0.3, 0.1],
        [0.5, 0.7, 0.8, 0.4],
        [0.9, 0.7, 0.4, 0.7],
      ],
    },
    vVectors: [
      [0.2, 0.1, 0.0, 0.1],
      [0.7, 0.5, 0.2, 0.2],
      [0.1, 0.1, 0.1, 0.1],
      [0.9, 0.8, 0.6, 0.9],
      [0.1, 0.1, 0.1, 0.1],
      [0.2, 0.2, 0.3, 0.1],
      [0.4, 0.6, 0.8, 0.4],
      [0.8, 0.7, 0.6, 0.8],
    ],
    nextTokenCandidates: [
      { token: '.next', baseLogit: 4.0 },
      { token: '.copy()', baseLogit: 3.4 },
      { token: '+ 1', baseLogit: 2.5 },
      { token: 'or None', baseLogit: 1.9 },
      { token: ';', baseLogit: 1.1 },
      { token: 'pass', baseLogit: 0.4 },
    ],
  },
};

function dot(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] ?? 0) * (b[i] ?? 0);
  }
  return sum;
}

export function softmax(logits: number[]): number[] {
  const valid = logits.filter((v) => Number.isFinite(v));
  const max = valid.length > 0 ? Math.max(...valid) : 0;
  const exps = logits.map((v) => (Number.isFinite(v) ? Math.exp(v - max) : 0));
  const total = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / total);
}

export function computeAttention(config: AttentionConfig): AttentionComputation {
  const scenario = ATTENTION_SCENARIOS[config.scenarioId];
  const tokens = scenario.tokens;
  const Q = scenario.qVectors[config.headId];
  const K = scenario.kVectors[config.headId];
  const V = scenario.vVectors;
  const dk = Q[0]?.length ?? 4;
  // Scale factor: 1/sqrt(dk), or intentionally amplified by 2.4x when unscaled to illustrate high-d_k saturation
  const scaleFactor = config.useScaling ? 1 / Math.sqrt(dk) : 2.4;

  const qIdx = Math.max(0, Math.min(tokens.length - 1, config.queryIndex));
  const rawScoresMatrix: number[][] = [];
  const scaledScoresMatrix: number[][] = [];
  const weightsMatrix: number[][] = [];

  for (let i = 0; i < tokens.length; i++) {
    const rawRow: number[] = [];
    const scaledRow: number[] = [];
    const qVec = Q[i]!.map((val, d) =>
      i === qIdx && d === 0 ? val * config.queryBoost : val
    );

    for (let j = 0; j < tokens.length; j++) {
      const raw = dot(qVec, K[j]!);
      rawRow.push(raw);
      if (config.causalMask && j > i) {
        scaledRow.push(Number.NEGATIVE_INFINITY);
      } else {
        scaledRow.push(raw * scaleFactor);
      }
    }
    rawScoresMatrix.push(rawRow);
    scaledScoresMatrix.push(scaledRow);
    weightsMatrix.push(softmax(scaledRow));
  }

  const selectedWeights = weightsMatrix[qIdx]!;
  const selectedRaw = rawScoresMatrix[qIdx]!;
  const selectedScaled = scaledScoresMatrix[qIdx]!;

  let entropyBits = 0;
  let topAttendedIndex = 0;
  let topWeight = -1;
  const contextVector = new Array<number>(V[0]?.length ?? 4).fill(0);

  for (let j = 0; j < selectedWeights.length; j++) {
    const w = selectedWeights[j] ?? 0;
    if (w > 1e-6) {
      entropyBits -= w * Math.log2(w);
    }
    if (w > topWeight) {
      topWeight = w;
      topAttendedIndex = j;
    }
    const vVec = V[j]!;
    for (let d = 0; d < contextVector.length; d++) {
      contextVector[d]! += w * (vVec[d] ?? 0);
    }
  }

  // Sampling distribution over candidate next tokens
  const temp = Math.max(0.08, config.temperature);
  const scaledLogits = scenario.nextTokenCandidates.map((c) => c.baseLogit / temp);
  const probs = softmax(scaledLogits);

  const ranked = scenario.nextTokenCandidates
    .map((c, idx) => ({
      token: c.token,
      logit: c.baseLogit,
      prob: probs[idx] ?? 0,
      origIdx: idx,
    }))
    .sort((a, b) => b.prob - a.prob);

  let cumulative = 0;
  const includedSet = new Set<string>();
  for (let rank = 0; rank < ranked.length; rank++) {
    const item = ranked[rank]!;
    if (rank < config.topK && (rank === 0 || cumulative < config.topP)) {
      includedSet.add(item.token);
      cumulative += item.prob;
    }
  }

  const samplingDist = ranked.map((r) => ({
    token: r.token,
    prob: r.prob,
    logit: r.logit,
    included: includedSet.has(r.token),
  }));

  return {
    tokens,
    dk,
    rawScoresMatrix,
    scaledScoresMatrix,
    weightsMatrix,
    selectedWeights,
    selectedRaw,
    selectedScaled,
    entropyBits,
    topAttendedIndex,
    contextVector,
    samplingDist,
  };
}
