import { AlertTriangle, ArrowRight, CheckCircle2, Clock, FlaskConical, Signal } from 'lucide-react';
import { ConceptBrief, CURRICULUM_STAGES } from '../../data/curriculum';
import { useProgress } from '../../state/useProgressStore';

interface ConceptOverviewProps {
  brief: ConceptBrief;
  onSelectLesson: (lessonId: string) => void;
  onNotify: (msg: string) => void;
}

export function ConceptOverview({ brief, onSelectLesson, onNotify }: ConceptOverviewProps) {
  const { progress, toggleLessonComplete } = useProgress();
  const isDone = progress.completedLessons.includes(brief.id);

  const stage = CURRICULUM_STAGES.find((s) => s.id === brief.stageId);
  const idx = stage ? stage.lessons.findIndex((l) => l.id === brief.id) : 0;

  return (
    <>
      <main className="sheet">
        <div className="lesson-head">
          <div className="crumb">
            {brief.stageNumber}. {brief.stageTitle ?? stage?.title ?? ''} <span>/</span> Module {idx + 1} of{' '}
            {stage?.lessons.length ?? 1}
          </div>
          <div className="lesson-head__row">
            <h1 className="title">{brief.title}</h1>
            <div className="tags">
              <span className="tag tag--sand">
                <Clock size={12} /> {brief.duration}
              </span>
              <span className="tag tag--mint">
                <Signal size={12} /> {brief.difficulty}
              </span>
              <span className="tag tag--violet">Concept Blueprint</span>
            </div>
          </div>
          <p className="subtitle">{brief.subtitle}</p>
        </div>

        <div className="scroll-view" style={{ padding: '14px 4px 6px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="card" style={{ padding: 16, background: 'var(--c-faf3e9)' }}>
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                First-Principles Intuition
              </div>
              <p style={{ fontSize: 12.8, lineHeight: 1.65, color: 'var(--ink-2)' }}>
                {brief.intuition}
              </p>

              <div className="math-card" style={{ marginTop: 12 }}>
                <div className="math-card__label">Core Mathematical &amp; Architectural Model</div>
                <div className="math-card__eq">{brief.mathEquation}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
                  {brief.mathExplanation}
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 16, background: 'var(--paper-2)' }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                Minimal Python Implementation
              </div>
              <pre className="code-block">{brief.pythonCode}</pre>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              <div className="card" style={{ padding: 14, background: 'var(--paper-2)' }}>
                <div className="eyebrow" style={{ marginBottom: 8 }}>
                  Engineering Trade-Offs
                </div>
                <ul className="takeaways">
                  {brief.engineeringTradeoffs.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ padding: 14, background: 'var(--c-fbebe7)', borderColor: 'var(--c-ebbcb3)' }}>
                <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--c-7d241d)', marginBottom: 8 }}>
                  <AlertTriangle size={14} /> Common Failure Mode
                </div>
                <p style={{ fontSize: 12.2, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                  {brief.failureMode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside className="rail">
        <section className="card guide">
          <div className="guide__meta">
            <span className="eyebrow">Connected Interactive Lab</span>
            <span className="chapter chapter--green">Hands-On</span>
          </div>
          <div className="guide__content" style={{ marginTop: 10 }}>
            <h2 className="guide__title">Experiment Live in the Related Simulation</h2>
            <div className="guide__body">
              <p>
                After mastering the core intuition and Python mechanics of <b>{brief.title}</b>, launch its companion interactive simulation lab to test parameter sensitivity and failure modes directly.
              </p>
            </div>

            {brief.prerequisites.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div className="eyebrow" style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>
                  Prerequisites
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {brief.prerequisites.map((pid) => (
                    <button
                      key={pid}
                      type="button"
                      className="sim-pill"
                      onClick={() => onSelectLesson(pid)}
                    >
                      {pid}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="guide__nav" style={{ flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              className="btn-pop"
              style={{ height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 12.5 }}
              onClick={() => onSelectLesson(brief.relatedLabId)}
            >
              <FlaskConical size={15} /> Open Interactive Simulation Lab <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="btn-ghost"
              style={{ height: 36, justifyContent: 'center', fontSize: 12 }}
              onClick={() => {
                toggleLessonComplete(brief.id);
                onNotify(isDone ? 'Unmarked module' : `Completed "${brief.title}"`);
              }}
            >
              <CheckCircle2 size={14} /> {isDone ? 'Completed ✓' : 'Mark Module Complete'}
            </button>
          </div>
        </section>
      </aside>
    </>
  );
}
