import { BookOpen, Compass, FileText, Flame, RotateCcw } from 'lucide-react';
import { CURRICULUM_STAGES } from '../../data/curriculum';
import {
  CHEATSHEETS,
  DEPENDENCY_EDGES,
  DEPENDENCY_NODES,
  RESEARCH_LIBRARY,
} from '../../data/reference';
import { useProgress } from '../../state/useProgressStore';
import { IsoSvgDefs } from '../simulations/IsoPrimitives';

interface RoadmapViewProps {
  onOpenLesson: (lessonId: string) => void;
  onNotify: (msg: string) => void;
}

export function RoadmapView({ onOpenLesson, onNotify }: RoadmapViewProps) {
  const { progress, resetProgress } = useProgress();
  const totalLessons = CURRICULUM_STAGES.reduce((acc, s) => acc + s.lessons.length, 0);

  return (
    <div className="scroll-view">
      <div className="scroll-view__inner">
        {/* Progress Telemetry Header */}
        <section className="card" style={{ padding: 18, background: 'var(--sheet)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Compass size={16} /> Concept Dependency Graph, Cheatsheets &amp; Research Library
            </div>
            <p className="muted-copy" style={{ marginTop: 4 }}>
              Click any node in the prerequisite graph to jump straight into its simulation or module.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="tag tag--mint">
              Modules: {progress.completedLessons.length}/{totalLessons}
            </span>
            <span className="tag tag--sand">
              Challenges: {progress.completedChallenges.length}/5
            </span>
            <span className="tag tag--violet">
              <Flame size={12} /> {progress.streakDays}d streak
            </span>
            <button
              type="button"
              className="tool"
              onClick={() => {
                resetProgress();
                onNotify('Learning progress cleared');
              }}
            >
              <RotateCcw size={13} /> Reset Progress
            </button>
          </div>
        </section>

        {/* Interactive Concept Dependency Graph */}
        <section className="card" style={{ padding: 16, background: 'var(--c-faf3e9)' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            AI → Agentic Systems Prerequisite Graph (Clickable Nodes)
          </div>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox="0 0 1230 270" style={{ width: '100%', minWidth: 880, height: 245, fontFamily: 'var(--font)' }}>
              <IsoSvgDefs prefix="map" />
              <rect x="0" y="0" width="1230" height="270" fill="url(#map-grid)" mask="url(#map-mask)" />

              {DEPENDENCY_EDGES.map((e) => {
                const a = DEPENDENCY_NODES.find((n) => n.id === e.from)!;
                const b = DEPENDENCY_NODES.find((n) => n.id === e.to)!;
                return (
                  <path
                    key={`${e.from}-${e.to}`}
                    d={`M${a.x + 65},${a.y} C${(a.x + b.x) / 2 + 25},${a.y} ${(a.x + b.x) / 2 - 25},${b.y} ${b.x - 65},${b.y}`}
                    className="link"
                    markerEnd="url(#map-arrow)"
                  />
                );
              })}

              {DEPENDENCY_NODES.map((node) => {
                const done = progress.completedLessons.includes(node.lessonId);
                return (
                  <g
                    key={node.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => onOpenLesson(node.lessonId)}
                  >
                    <rect x={node.x - 64} y={node.y - 25} width="128" height="54" rx="10" fill="var(--drop)" />
                    <rect
                      x={node.x - 64}
                      y={node.y - 28}
                      width="128"
                      height="54"
                      rx="10"
                      fill={done ? 'var(--green)' : node.simId ? 'var(--violet)' : 'var(--iso-card-bg)'}
                      stroke={done ? 'var(--c-2f8a43)' : 'var(--iso-stroke)'}
                      strokeWidth={node.simId ? 2 : 1.4}
                    />
                    <text x={node.x} y={node.y - 10} textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--muted)">
                      {node.stage} {node.simId ? '· LAB' : ''}
                    </text>
                    <text x={node.x} y={node.y + 6} textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--iso-text)">
                      {node.label.slice(0, 19)}
                    </text>
                    <text x={node.x} y={node.y + 19} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--c-24521c)">
                      {done ? '✓ Completed' : 'Open →'}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        {/* Engineering Cheatsheets */}
        <section>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Napkin Math &amp; Engineering Reference Cheatsheets
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
            {CHEATSHEETS.map((cs) => (
              <div key={cs.id} className="card" style={{ padding: 14, background: 'var(--paper-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)' }}>{cs.category}</div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{cs.title}</div>
                  </div>
                  <span className="tag tag--sand">{cs.badge}</span>
                </div>
                <table className="compare">
                  <tbody>
                    {cs.rows.map((r) => (
                      <tr key={r.label}>
                        <td style={{ fontWeight: 700, color: 'var(--ink)' }}>{r.label}</td>
                        <td style={{ fontWeight: 800, color: 'var(--c-2f8a43)', whiteSpace: 'nowrap' }}>{r.value}</td>
                        <td style={{ color: 'var(--muted)' }}>{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {/* Research Library */}
        <section>
          <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <FileText size={15} /> Foundational &amp; Frontier Research Library
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
            {RESEARCH_LIBRARY.map((paper) => (
              <div key={paper.id} className="card" style={{ padding: 14, background: 'var(--card)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span className="tag tag--sand">{paper.year} · {paper.stage}</span>
                  <span className={`tag ${paper.status === 'Frontier Research' ? 'tag--orange' : 'tag--mint'}`}>
                    {paper.status}
                  </span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{paper.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{paper.authors}</div>
                <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.5 }}>{paper.coreIdea}</p>
                <div className="math-card" style={{ margin: 0 }}>
                  <div className="math-card__eq" style={{ fontSize: 11.5 }}>{paper.keyEquationOrPattern}</div>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                  <b>Why it matters:</b> {paper.whyItMatters}
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ height: 32, fontSize: 11.5, marginTop: 'auto', justifyContent: 'center' }}
                  onClick={() => onOpenLesson(paper.relatedLessonId)}
                >
                  <BookOpen size={13} /> Experiment in Related Lab →
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
