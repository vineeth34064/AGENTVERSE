import { LessonStep } from '../../types/curriculum';

interface TimelineProps {
  steps: LessonStep[];
  currentIndex: number;
  onSelectStep: (idx: number) => void;
}

const chapterColorClass = (chapter: LessonStep['chapter']): string => {
  switch (chapter) {
    case 'Failure':
      return 'chapter-dot--red';
    case 'Intuition':
    case 'Challenge':
      return 'chapter-dot--green';
    case 'Simulation':
    case 'Math':
      return 'chapter-dot--violet';
    case 'Check':
      return 'chapter-dot--ink';
    default:
      return 'chapter-dot--blue';
  }
};

export function Timeline({ steps, currentIndex, onSelectStep }: TimelineProps) {
  const total = steps.length;
  const pct = total > 1 ? (currentIndex / (total - 1)) * 100 : 100;

  return (
    <section className="card timeline">
      <div className="timeline__head">
        <span className="eyebrow">In this lesson</span>
        <span className="timeline__count">
          Step {currentIndex + 1} of {total}
        </span>
      </div>

      <div className="timeline__track" style={{ ['--n' as string]: total }}>
        <div className="timeline__rail">
          <span style={{ width: `${pct}%` }} />
        </div>
        <ol className="timeline__steps">
          {steps.map((step, idx) => {
            const stateClass =
              idx < currentIndex ? 'is-done' : idx === currentIndex ? 'is-current' : '';
            return (
              <li key={step.id} className={stateClass}>
                <button
                  type="button"
                  title={step.title}
                  onClick={() => onSelectStep(idx)}
                >
                  <span className={`timeline__dot ${chapterColorClass(step.chapter)}`}>
                    {idx + 1}
                  </span>
                  <span className="timeline__label">{step.label}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
