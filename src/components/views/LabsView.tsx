import { useState } from 'react';
import { BookOpen, FlaskConical } from 'lucide-react';
import { FLAGSHIP_LESSONS } from '../../data/curriculum';
import { SimulationId } from '../../types/curriculum';
import { useProgress } from '../../state/useProgressStore';
import { SimulationRenderer } from '../simulations/SimulationRenderer';

interface LabsViewProps {
  onOpenLesson: (lessonId: string) => void;
  onNotify: (msg: string) => void;
}

const LAB_CATALOG: Array<{
  simId: SimulationId;
  lessonId: string;
  domain: 'Mathematics' | 'Deep Learning' | 'Transformers' | 'RAG' | 'Agentic AI';
  title: string;
  summary: string;
}> = [
  {
    simId: 'gradient-descent',
    lessonId: 'gradient-descent',
    domain: 'Mathematics',
    title: 'Gradient Descent & Optimizer Landscapes',
    summary: 'Explore convex bowls, 2D ravines, non-convex local traps, GD vs Momentum vs Adam, and LR divergence.',
  },
  {
    simId: 'neural-net',
    lessonId: 'neural-net-backprop',
    domain: 'Deep Learning',
    title: 'Neural Network Forward & Backprop Lab',
    summary: 'Train a live 2→3→1 MLP on XOR, watch decision boundaries fold, and trigger vanishing/exploding gradients.',
  },
  {
    simId: 'transformer-attention',
    lessonId: 'transformer-self-attention',
    domain: 'Transformers',
    title: 'Transformer Self-Attention & Sampling Lab',
    summary: 'Click tokens to inspect Q·K/√d_k heatmaps, causal masks, multi-head roles, and Temp/Top-k/Top-p.',
  },
  {
    simId: 'rag-pipeline',
    lessonId: 'rag-retrieval-pipeline',
    domain: 'RAG',
    title: 'RAG Chunking, Hybrid & Rerank Pipeline',
    summary: 'Break and fix chunk boundaries, inspect 2D vector embeddings, blend BM25+Dense, and toggle reranking.',
  },
  {
    simId: 'agent-loop',
    lessonId: 'autonomous-agent-loop',
    domain: 'Agentic AI',
    title: 'Autonomous Agent Execution & Safety Loop',
    summary: 'Step through ReAct/Plan-Execute loops, fault recovery, human approval gates, and prompt-injection defense.',
  },
];

export function LabsView({ onOpenLesson, onNotify }: LabsViewProps) {
  const [filter, setFilter] = useState<string>('All');
  const [selectedSim, setSelectedSim] = useState<SimulationId>('gradient-descent');
  const { markChallengeComplete, progress } = useProgress();

  const domains = ['All', 'Mathematics', 'Deep Learning', 'Transformers', 'RAG', 'Agentic AI'];
  const visible = filter === 'All' ? LAB_CATALOG : LAB_CATALOG.filter((l) => l.domain === filter);
  const activeEntry = LAB_CATALOG.find((l) => l.simId === selectedSim) ?? LAB_CATALOG[0]!;
  const lesson = FLAGSHIP_LESSONS[activeEntry.lessonId]!;

  return (
    <div className="scroll-view">
      <div className="scroll-view__inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <FlaskConical size={16} /> Interactive Simulation Playground
            </div>
            <p className="muted-copy">
              Independent sandbox mode—manipulate parameters directly or open the 9-step guided lesson.
            </p>
          </div>

          <div className="sim-pills">
            {domains.map((d) => (
              <button
                key={d}
                type="button"
                className={`sim-pill ${filter === d ? 'is-on' : ''}`}
                onClick={() => {
                  setFilter(d);
                  const first = (d === 'All' ? LAB_CATALOG : LAB_CATALOG.filter((l) => l.domain === d))[0];
                  if (first) setSelectedSim(first.simId);
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Lab Selector Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
          {visible.map((item) => {
            const isActive = item.simId === activeEntry.simId;
            return (
              <button
                key={item.simId}
                type="button"
                className={`card ${isActive ? 'btn-pop' : ''}`}
                onClick={() => setSelectedSim(item.simId)}
                style={{
                  textAlign: 'start',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span className="tag tag--sand">{item.domain}</span>
                  {progress.completedChallenges.includes(item.lessonId) && (
                    <span className="tag tag--mint">Challenge ✓</span>
                  )}
                </div>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}>{item.summary}</div>
              </button>
            );
          })}
        </div>

        {/* Active Full-Width Interactive Simulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{activeEntry.title}</h2>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                Challenge goal: {lesson.challenge?.successCriteria}
              </div>
            </div>
            <button
              type="button"
              className="btn-pop"
              style={{ height: 36, padding: '0 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 7 }}
              onClick={() => onOpenLesson(activeEntry.lessonId)}
            >
              <BookOpen size={14} /> Open Full 9-Step Lesson &amp; Python Code →
            </button>
          </div>

          <div style={{ minHeight: 470, display: 'flex' }}>
            <SimulationRenderer
              simulationId={activeEntry.simId}
              onChallengePass={() => {
                if (!progress.completedChallenges.includes(activeEntry.lessonId)) {
                  markChallengeComplete(activeEntry.lessonId);
                  onNotify(`Challenge Passed: ${lesson.challenge?.title ?? activeEntry.title}!`);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
