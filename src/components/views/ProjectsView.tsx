import { useState } from 'react';
import { AlertTriangle, CheckCircle2, FlaskConical, FolderGit2, Layers } from 'lucide-react';
import { ENGINEERING_PROJECTS } from '../../data/projects';
import { useProgress } from '../../state/useProgressStore';
import { ProjectSpec } from '../../types/curriculum';

interface ProjectsViewProps {
  onOpenLesson: (lessonId: string) => void;
  onNotify: (msg: string) => void;
}

export function ProjectsView({ onOpenLesson, onNotify }: ProjectsViewProps) {
  const [tier, setTier] = useState<'All' | ProjectSpec['tier']>('All');
  const [selectedId, setSelectedId] = useState<string>(ENGINEERING_PROJECTS[12]!.id);
  const { progress, toggleProjectComplete } = useProgress();

  const filtered =
    tier === 'All' ? ENGINEERING_PROJECTS : ENGINEERING_PROJECTS.filter((p) => p.tier === tier);
  const active = ENGINEERING_PROJECTS.find((p) => p.id === selectedId) ?? filtered[0]!;
  const isDone = progress.completedProjects.includes(active.id);

  return (
    <div className="scroll-view">
      <div className="scroll-view__inner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <FolderGit2 size={16} /> Real-World Engineering Project Laboratory (21 Builds)
            </div>
            <p className="muted-copy">
              Complete system specifications with architecture pipelines, milestones, failure scenarios, and trade-offs.
            </p>
          </div>

          <div className="sim-pills">
            {(['All', 'Beginner', 'Intermediate', 'Advanced', 'Capstone'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`sim-pill ${tier === t ? 'is-on' : ''}`}
                onClick={() => setTier(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(270px, 360px) minmax(0, 1fr)', gap: 16, alignItems: 'start' }}>
          {/* Project Directory List */}
          <div className="card" style={{ padding: 10, maxHeight: '72vh', overflowY: 'auto', scrollbarWidth: 'thin', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map((p) => {
              const selected = p.id === active.id;
              const done = progress.completedProjects.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  className={selected ? 'btn-pop' : ''}
                  style={{
                    textAlign: 'start',
                    padding: '9px 11px',
                    borderRadius: 9,
                    border: selected ? undefined : '1px solid var(--line)',
                    background: selected ? undefined : 'var(--paper-2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted)' }}>
                      #{String(p.number).padStart(2, '0')} · {p.tier}
                    </span>
                    {done && <CheckCircle2 size={14} style={{ color: 'var(--c-2f8a43)' }} />}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{p.title}</div>
                </button>
              );
            })}
          </div>

          {/* Active Project Blueprint */}
          <div className="card" style={{ padding: 20, background: 'var(--sheet)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div className="crumb">
                  Project #{active.number} <span>/</span> {active.tier} Track
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{active.title}</h2>
                <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 4 }}>{active.tagline}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {active.relatedLessonId && (
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ height: 34, fontSize: 12 }}
                    onClick={() => onOpenLesson(active.relatedLessonId!)}
                  >
                    <FlaskConical size={14} /> Open Related Lab
                  </button>
                )}
                <button
                  type="button"
                  className="btn-pop"
                  style={{ height: 34, padding: '0 13px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  onClick={() => {
                    toggleProjectComplete(active.id);
                    onNotify(isDone ? 'Project marked in progress' : `Completed Project #${active.number}!`);
                  }}
                >
                  <CheckCircle2 size={14} /> {isDone ? 'Shipped ✓' : 'Mark Shipped'}
                </button>
              </div>
            </div>

            <div className="card" style={{ padding: 14, background: 'var(--c-faf3e9)' }}>
              <div className="eyebrow" style={{ fontSize: 11.5, marginBottom: 4 }}>Problem Statement &amp; System Architecture</div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 10 }}>
                {active.problemStatement}
              </p>
              <div className="math-card" style={{ margin: 0 }}>
                <div className="math-card__label">Pipeline Flow</div>
                <div className="math-card__eq">{active.architectureSummary}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {active.components.map((c) => (
                  <span key={c} className="tag tag--violet">{c}</span>
                ))}
                {active.techStack.map((t) => (
                  <span key={t} className="tag tag--sand">{t}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
              <div className="card" style={{ padding: 14, background: 'var(--paper-2)' }}>
                <div className="eyebrow" style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Layers size={14} /> Implementation Milestones
                </div>
                <ul className="takeaways">
                  {active.milestones.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: 14, background: 'var(--c-fbebe7)', borderColor: 'var(--c-ebbcb3)' }}>
                <div className="eyebrow" style={{ fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-7d241d)', marginBottom: 8 }}>
                  <AlertTriangle size={14} /> Failure Scenarios to Test
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: 'var(--ink-2)' }}>
                  {active.failureScenarios.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card" style={{ padding: 14, background: 'var(--paper-2)' }}>
              <div className="eyebrow" style={{ fontSize: 11.5, marginBottom: 8 }}>Engineering Trade-Offs</div>
              <table className="compare">
                <thead>
                  <tr>
                    <th>Decision</th>
                    <th>Advantage</th>
                    <th>Trade-Off / Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {active.tradeOffs.map((tr) => (
                    <tr key={tr.decision}>
                      <td style={{ fontWeight: 700, color: 'var(--ink)' }}>{tr.decision}</td>
                      <td>{tr.pros}</td>
                      <td>{tr.cons}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
