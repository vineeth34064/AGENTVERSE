import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  Keyboard,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { ChapterKind, LessonData } from '../../types/curriculum';
import { useProgress } from '../../state/useProgressStore';

interface GuideRailProps {
  lesson: LessonData;
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onOpenChallengeTab: () => void;
}

const chapterClass = (chapter: ChapterKind): string => {
  switch (chapter) {
    case 'Failure':
      return 'chapter--red';
    case 'Intuition':
    case 'Challenge':
      return 'chapter--green';
    case 'Math':
    case 'Simulation':
      return 'chapter--violet';
    case 'Code':
    case 'Visual':
      return 'chapter--blue';
    case 'Production':
      return 'chapter--amber';
    case 'Check':
      return 'chapter--ink';
    default:
      return 'chapter--sand';
  }
};

export function GuideRail({
  lesson,
  stepIndex,
  onPrev,
  onNext,
  onOpenChallengeTab,
}: GuideRailProps) {
  const { progress, toggleBookmark, saveNote } = useProgress();
  const step = lesson.steps[stepIndex]!;
  const total = lesson.steps.length;
  const nextStep = lesson.steps[stepIndex + 1];
  const isBookmarked = progress.bookmarks.includes(lesson.id);
  const visitedSteps = progress.completedSteps[lesson.id] ?? [];

  return (
    <aside className="rail">
      <section className="card guide">
        <div className="guide__meta">
          <span className="eyebrow">
            Step {stepIndex + 1} / {total}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="tool"
              style={{ height: 24, padding: '0 7px' }}
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark lesson'}
              onClick={() => toggleBookmark(lesson.id)}
            >
              <Bookmark size={12} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <span className={`chapter ${chapterClass(step.chapter)}`}>{step.chapter}</span>
          </div>
        </div>

        <div className="guide__content">
          <h2 className="guide__title">{step.title}</h2>
          <div className="guide__body">
            {step.body.map((html, i) => (
              <p key={i} dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </div>

          {step.mathEq && (
            <div className="math-card">
              <div className="math-card__label">{step.mathLabel ?? 'Formula'}</div>
              <div className="math-card__eq">{step.mathEq}</div>
            </div>
          )}

          {step.compare && (
            <table className="compare">
              <thead>
                <tr>
                  {step.compare.headers.map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {step.compare.rows.map((row, ri) => (
                  <tr key={ri}>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {step.callout && (
            <div className={`callout callout--${step.callout.kind}`}>
              <div className="callout__icon">
                {step.callout.kind === 'warn' ? (
                  <AlertTriangle size={15} />
                ) : step.callout.kind === 'insight' ? (
                  <Sparkles size={15} />
                ) : (
                  <Lightbulb size={15} />
                )}
              </div>
              <div>
                <div className="callout__title">{step.callout.title}</div>
                <p>{step.callout.text}</p>
              </div>
            </div>
          )}

          {step.changes && step.changes.length > 0 && (
            <div className="changes">
              <div className="eyebrow">What changed</div>
              <ul>
                {step.changes.map((ch, idx) => (
                  <li key={idx} className={`chg chg--${ch.kind}`}>
                    <b>{ch.kind === 'add' ? '+' : ch.kind === 'del' ? '−' : '~'}</b>
                    <span>{ch.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step.takeaways && (
            <ul className="takeaways" style={{ marginTop: 10 }}>
              {step.takeaways.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}

          {step.chapter === 'Challenge' && (
            <button
              type="button"
              className="btn-pop"
              style={{ marginTop: 10, width: '100%', height: 34, fontSize: 12 }}
              onClick={onOpenChallengeTab}
            >
              Open Challenge &amp; Quiz Check →
            </button>
          )}
        </div>

        <div className="guide__nav">
          <button
            type="button"
            className="btn-ghost"
            disabled={stepIndex === 0}
            onClick={onPrev}
          >
            <ArrowLeft size={14} strokeWidth={2.2} /> Back
          </button>
          <button
            type="button"
            className="btn-pop btn-next"
            onClick={stepIndex === total - 1 ? onOpenChallengeTab : onNext}
          >
            <span className="btn-next__label">
              {nextStep ? `Next: ${nextStep.label}` : 'Take Knowledge Check'}
            </span>
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>

        <div className="guide__hint">
          <Keyboard size={13} strokeWidth={1.8} />
          <span>
            <kbd>←</kbd> <kbd>→</kbd> step · <kbd>Ctrl K</kbd> search
          </span>
        </div>
      </section>

      <section className="card goals">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="eyebrow">You’ll learn</span>
          <span style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 700 }}>
            {visitedSteps.length}/{total} steps
          </span>
        </div>
        <ul>
          {lesson.goals.map((g, idx) => {
            const hit =
              stepIndex >= Math.floor(((idx + 1) / lesson.goals.length) * (total - 1)) ||
              progress.completedLessons.includes(lesson.id);
            return (
              <li key={idx} className={hit ? 'is-hit' : ''}>
                <span className={`check ${hit ? 'is-on' : ''}`}>
                  <Check size={10} strokeWidth={3} />
                </span>
                <span>{g}</span>
              </li>
            );
          })}
        </ul>
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
            Engineering Notes ({progress.notes[lesson.id] ? 'Saved' : 'Add note'})
          </summary>
          <textarea
            rows={2}
            placeholder="Record observations, edge cases, or formulas…"
            value={progress.notes[lesson.id] ?? ''}
            onChange={(e) => saveNote(lesson.id, e.target.value)}
            style={{
              width: '100%',
              marginTop: 6,
              padding: 8,
              borderRadius: 8,
              border: '1px solid var(--line-strong)',
              background: 'var(--c-fbf7f1)',
              fontSize: 11.5,
              resize: 'vertical',
            }}
          />
        </details>
      </section>
    </aside>
  );
}
