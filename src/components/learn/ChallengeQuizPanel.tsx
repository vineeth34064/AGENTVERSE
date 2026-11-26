import { useState } from 'react';
import { Award, CheckCircle2, HelpCircle, PlayCircle, XCircle } from 'lucide-react';
import { LessonData } from '../../types/curriculum';
import { useProgress } from '../../state/useProgressStore';

interface ChallengeQuizPanelProps {
  lesson: LessonData;
  onReturnToSim: () => void;
  onNotify: (msg: string) => void;
}

export function ChallengeQuizPanel({
  lesson,
  onReturnToSim,
  onNotify,
}: ChallengeQuizPanelProps) {
  const { progress, recordQuizScore, toggleLessonComplete } = useProgress();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const challengeDone = progress.completedChallenges.includes(lesson.id);
  const bestQuiz = progress.quizScores[lesson.id];
  const lessonDone = progress.completedLessons.includes(lesson.id);

  const handleSubmitQuiz = () => {
    let correct = 0;
    for (const q of lesson.quiz) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    const pct = Math.round((correct / lesson.quiz.length) * 100);
    setSubmitted(true);
    recordQuizScore(lesson.id, pct);
    onNotify(`Knowledge Check scored ${pct}% (${correct}/${lesson.quiz.length})`);
  };

  return (
    <div className="scroll-view" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Practical Engineering Challenge */}
        {lesson.challenge && (
          <div className="card" style={{ padding: 16, background: 'var(--paper-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Award size={15} /> Engineering Challenge · {lesson.challenge.title}
              </div>
              <span
                className={`tag ${challengeDone ? 'tag--mint' : 'tag--sand'}`}
              >
                {challengeDone ? 'Verified Passed ✓' : 'Live Sim Check Pending'}
              </span>
            </div>
            <p style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>
              {lesson.challenge.brief}
            </p>
            <div className="callout callout--tip" style={{ marginTop: 10 }}>
              <div className="callout__icon">
                <HelpCircle size={14} />
              </div>
              <div>
                <div className="callout__title">Pass Criteria &amp; Hint</div>
                <p>
                  <b>Criteria:</b> {lesson.challenge.successCriteria}
                  <br />
                  <b>Hint:</b> {lesson.challenge.hint}
                </p>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-pop"
                style={{ height: 34, padding: '0 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={onReturnToSim}
              >
                <PlayCircle size={14} /> Test Solution in Simulation
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{ height: 34, fontSize: 12 }}
                onClick={() => {
                  toggleLessonComplete(lesson.id);
                  onNotify(lessonDone ? 'Marked lesson incomplete' : 'Lesson marked complete!');
                }}
              >
                {lessonDone ? 'Completed ✓ (Toggle)' : 'Mark Lesson Complete'}
              </button>
            </div>
          </div>
        )}

        {/* Knowledge Check Quiz */}
        <div className="card" style={{ padding: 16, background: 'var(--paper-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="eyebrow">Knowledge Check ({lesson.quiz.length} Questions)</div>
            {bestQuiz !== undefined && (
              <span className="tag tag--mint">Best Score: {bestQuiz}%</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {lesson.quiz.map((q, qi) => {
              const chosen = answers[q.id];
              return (
                <div
                  key={q.id}
                  style={{
                    border: '1px solid var(--line-strong)',
                    background: 'var(--card)',
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 8 }}>
                    {qi + 1}. {q.prompt}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {q.options.map((opt, oi) => {
                      const isSelected = chosen === oi;
                      const isCorrect = oi === q.correctIndex;
                      let bg = 'var(--c-fbf7f1)';
                      let border = 'var(--line-strong)';
                      if (submitted) {
                        if (isCorrect) {
                          bg = 'var(--c-dcefd2)';
                          border = 'var(--c-24521c)';
                        } else if (isSelected && !isCorrect) {
                          bg = 'var(--c-f8d5cf)';
                          border = 'var(--c-8f2a22)';
                        }
                      } else if (isSelected) {
                        bg = 'var(--green)';
                        border = 'var(--ink)';
                      }
                      return (
                        <button
                          key={oi}
                          type="button"
                          onClick={() => {
                            if (!submitted) setAnswers((a) => ({ ...a, [q.id]: oi }));
                          }}
                          style={{
                            textAlign: 'start',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: `1.3px solid ${border}`,
                            background: bg,
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          {submitted && isCorrect && <CheckCircle2 size={14} style={{ color: 'var(--c-24521c)', flex: 'none' }} />}
                          {submitted && isSelected && !isCorrect && <XCircle size={14} style={{ color: 'var(--c-8f2a22)', flex: 'none' }} />}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>
                      <b>Explanation:</b> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn-pop"
              style={{ height: 36, padding: '0 16px', fontSize: 12.5 }}
              onClick={handleSubmitQuiz}
            >
              Grade Knowledge Check
            </button>
            {submitted && (
              <button
                type="button"
                className="btn-ghost"
                style={{ height: 36, fontSize: 12.5 }}
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
              >
                Retake
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
