import { describe, expect, it } from 'vitest';
import { createGDState, stepGD } from '../engines/gradientDescent';
import { createNNState, trainOneEpoch, computeDecisionGrid } from '../engines/neuralNet';
import { computeAttention } from '../engines/transformerAttention';
import { runRAGPipeline } from '../engines/ragPipeline';
import { createAgentState, stepAgent, resolveApproval } from '../engines/agentRuntime';

describe('Gradient Descent Engine', () => {
  it('converges toward w=2.0 on convex quadratic with safe learning rate', () => {
    let state = createGDState({
      landscape: 'convex',
      optimizer: 'gd',
      learningRate: 0.25,
      initialW: -2.0,
      initialW2: 0,
      momentumBeta: 0.9,
    });
    for (let i = 0; i < 30; i++) {
      state = stepGD(state);
    }
    expect(Math.abs(state.w - 2.0)).toBeLessThan(0.02);
    expect(state.loss).toBeLessThan(0.36);
    expect(state.regime).toBe('converged');
  });

  it('detects oscillation and divergence when learning rate exceeds stability limit', () => {
    let state = createGDState({
      landscape: 'convex',
      optimizer: 'gd',
      learningRate: 2.25,
      initialW: 0.0,
      initialW2: 0,
      momentumBeta: 0.9,
    });
    for (let i = 0; i < 10; i++) {
      state = stepGD(state);
    }
    expect(['oscillating', 'diverged']).toContain(state.regime);
  });
});

describe('Neural Network Forward & Backprop Engine', () => {
  it('reduces loss on XOR when training with tanh activation', () => {
    let state = createNNState('tanh', 'xor', 0.8, 'balanced');
    const initialLoss = state.lossHistory[0]!;
    for (let e = 0; e < 60; e++) {
      state = trainOneEpoch(state);
    }
    const finalLoss = state.lossHistory[state.lossHistory.length - 1]!;
    expect(finalLoss).toBeLessThan(initialLoss);
    expect(state.accuracy).toBeGreaterThanOrEqual(0.75);
  });

  it('detects vanishing gradients on saturated sigmoid initialization', () => {
    const state = createNNState('sigmoid', 'xor', 0.5, 'vanishing');
    expect(state.backward.hiddenGradNorm).toBeLessThan(0.015);
    expect(state.status).toBe('vanishing');
    const grid = computeDecisionGrid(state.weights, state.activation, 8);
    expect(grid).toHaveLength(64);
  });
});

describe('Transformer Self-Attention Engine', () => {
  it('produces normalized probability distribution per query token and enforces causal mask', () => {
    const res = computeAttention({
      scenarioId: 'coref',
      headId: 'coref',
      queryIndex: 3, // "tool"
      causalMask: true,
      useScaling: true,
      queryBoost: 1,
      temperature: 1.0,
      topK: 4,
      topP: 0.9,
    });
    const sumWeights = res.selectedWeights.reduce((a, b) => a + b, 0);
    expect(sumWeights).toBeCloseTo(1.0, 5);
    // Future tokens after index 3 must be masked to 0
    expect(res.selectedWeights[4]).toBe(0);
    expect(res.selectedWeights[5]).toBe(0);
    expect(res.selectedWeights[6]).toBe(0);
  });

  it('amplifies entropy reduction when temperature drops toward 0.1', () => {
    const cold = computeAttention({
      scenarioId: 'coref',
      headId: 'coref',
      queryIndex: 5,
      causalMask: true,
      useScaling: true,
      queryBoost: 1,
      temperature: 0.15,
      topK: 6,
      topP: 0.95,
    });
    const hot = computeAttention({
      scenarioId: 'coref',
      headId: 'coref',
      queryIndex: 5,
      causalMask: true,
      useScaling: true,
      queryBoost: 1,
      temperature: 2.0,
      topK: 6,
      topP: 0.95,
    });
    expect(cold.samplingDist[0]!.prob).toBeGreaterThan(hot.samplingDist[0]!.prob);
  });
});

describe('RAG Pipeline Engine', () => {
  it('retrieves MCP security doc cleanly with proper chunking and hybrid search', () => {
    const res = runRAGPipeline({
      query: 'How does MCP prevent unauthorized tool access?',
      chunkSize: 180,
      chunkOverlap: 40,
      topK: 2,
      hybridAlpha: 0.55,
      metric: 'cosine',
      rerankEnabled: true,
    });
    expect(res.retrieved).toHaveLength(2);
    expect(res.retrieved[0]!.docId).toBe('doc-mcp');
    expect(res.faithfulness).toBe('grounded');
  });

  it('detects severed critical boundaries when chunk size is too small with zero overlap', () => {
    const res = runRAGPipeline({
      query: 'Why does small chunk size without overlap break retrieval?',
      chunkSize: 52,
      chunkOverlap: 0,
      topK: 2,
      hybridAlpha: 0.5,
      metric: 'cosine',
      rerankEnabled: false,
    });
    expect(res.severedCount).toBeGreaterThan(0);
  });
});

describe('Autonomous Agent Runtime Engine', () => {
  it('pauses on human approval gate and completes cleanly after approval', () => {
    let state = createAgentState({
      scenarioId: 'latency-audit',
      architecture: 'react',
      injectToolError: false,
      humanApprovalGate: true,
      strictSandbox: true,
      memoryThreshold: 0.5,
    });

    for (let i = 0; i < 30; i++) {
      if (state.phase === 'await-approval') {
        state = resolveApproval(state, true);
      } else if (state.phase === 'completed' || state.phase === 'blocked') {
        break;
      } else {
        state = stepAgent(state);
      }
    }

    expect(state.phase).toBe('completed');
    expect(state.approvalDecision).toBe('approved');
    expect(state.trace.length).toBeGreaterThan(6);
  });

  it('blocks prompt injection under strict sandbox and catches breach when disabled', () => {
    let protectedState = createAgentState({
      scenarioId: 'prompt-injection',
      architecture: 'react',
      injectToolError: false,
      humanApprovalGate: false,
      strictSandbox: true,
      memoryThreshold: 0.5,
    });

    for (let i = 0; i < 20 && protectedState.phase !== 'completed'; i++) {
      protectedState = stepAgent(protectedState);
    }
    expect(protectedState.guardrailStatus).toBe('injection-blocked');

    let breachedState = createAgentState({
      scenarioId: 'prompt-injection',
      architecture: 'react',
      injectToolError: false,
      humanApprovalGate: false,
      strictSandbox: false,
      memoryThreshold: 0.5,
    });

    for (let i = 0; i < 20 && breachedState.phase !== 'blocked'; i++) {
      breachedState = stepAgent(breachedState);
    }
    expect(breachedState.guardrailStatus).toBe('breached');
  });
});
