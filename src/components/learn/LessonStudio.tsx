import { useEffect, useState } from 'react';
import { Award, Clock, Code2, FlaskConical, ListOrdered, Signal } from 'lucide-react';
import { CONCEPT_BRIEFS, CURRICULUM_STAGES, FLAGSHIP_LESSONS } from '../../data/curriculum';
import { StageTab } from '../../types/curriculum';
import { useProgress } from '../../state/useProgressStore';
import { SimulationRenderer } from '../simulations/SimulationRenderer';
import { Timeline } from './Timeline';
import { GuideRail } from './GuideRail';
import { MathCodePanel } from './MathCodePanel';
import { ChallengeQuizPanel } from './ChallengeQuizPanel';
import { ConceptOverview } from './ConceptOverview';

interface LessonStudioProps {
  lessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onNotify: (msg: string) => void;
}

export function LessonStudio({
  lessonId,
  onSelectLesson,
  onNotify,
}: LessonStudioProps) {
  const flagship = FLAGSHIP_LESSONS[lessonId];
  const brief = CONCEPT_BRIEFS[lessonId];

  const [stepIndex, setStepIndex] = useState(0);
  const [stageTab, setStageTab] = useState<StageTab>('simulation');
  const { markStepVisited, markChallengeComplete, progress } = useProgress();

  // Reset step index and tab when switching lessons
  useEffect(() => {
    setStepIndex(0);
    setStageTab('simulation');
  }, [lessonId]);

  // Mark visited step
  useEffect(() => {
    if (!flagship) return;
    const step = flagship.steps[stepIndex];
    if (step) {
      markStepVisited(flagship.id, step.id, flagship.steps.length);
    }
  }, [flagship, markStepVisited, stepIndex]);

  // Keyboard arrow navigation
  useEffect(() => {
    if (!flagship) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'ArrowRight') {
        setStepIndex((i) => Math.min(flagship.steps.length - 1, i + 1));
      } else if (e.key === 'ArrowLeft') {
        setStepIndex((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flagship]);

  if (!flagship && brief) {
    return (
      <ConceptOverview
        brief={brief}
        onSelectLesson={onSelectLesson}
        onNotify={onNotify}
      />
    );
  }

  const lesson = flagship ?? FLAGSHIP_LESSONS['gradient-descent']!;
  const stage = CURRICULUM_STAGES.find((s) => s.id === lesson.stageId);
  const lessonNum = stage ? stage.lessons.findIndex((l) => l.id === lesson.id) + 1 : 1;
  const currentStep = lesson.steps[stepIndex] ?? lesson.steps[0]!;

  const handleChallengePass = () => {
    if (!progress.completedChallenges.includes(lesson.id)) {
      markChallengeComplete(lesson.id);
      onNotify(`Challenge Passed: ${lesson.challenge?.title ?? lesson.title}!`);
    }
  };

  return (
    <>
      <main className="sheet">
        <div className="lesson-head">
          <div className="crumb">
            {lesson.stageNumber}. {lesson.stageTitle} <span>/</span> Lesson {lessonNum} of{' '}
            {stage?.lessons.length ?? 1}
          </div>
          <div className="lesson-head__row">
            <h1 className="title">{lesson.title}</h1>
            <div className="tags">
              <div className="mode-tabs" role="tablist" aria-label="Lesson View Mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageTab === 'simulation'}
                  className={`mode-tab ${stageTab === 'simulation' ? 'is-active' : ''}`}
                  onClick={() => setStageTab('simulation')}
                >
                  <FlaskConical size={12} /> Sim
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageTab === 'math-code'}
                  className={`mode-tab ${stageTab === 'math-code' ? 'is-active' : ''}`}
                  onClick={() => setStageTab('math-code')}
                >
                  <Code2 size={12} /> Math &amp; Code
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={stageTab === 'challenge'}
                  className={`mode-tab ${stageTab === 'challenge' ? 'is-active' : ''}`}
                  onClick={() => setStageTab('challenge')}
                >
                  <Award size={12} /> Check
                </button>
              </div>

              <span className="tag tag--sand">
                <Clock size={12} /> {lesson.duration}
              </span>
              <span className="tag tag--mint">
                <Signal size={12} /> {lesson.difficulty}
              </span>
              <span className="tag tag--violet">
                <ListOrdered size={12} /> {lesson.steps.length} steps
              </span>
            </div>
          </div>
          <p className="subtitle" title={lesson.subtitle}>
            {lesson.subtitle}
          </p>
        </div>

        {stageTab === 'simulation' && lesson.simulationId ? (
          <SimulationRenderer
            simulationId={lesson.simulationId}
            preset={currentStep.simPreset}
            presetTrigger={`${lesson.id}:${currentStep.id}`}
            onChallengePass={handleChallengePass}
          />
        ) : stageTab === 'math-code' ? (
          <section className="card stage" style={{ background: 'var(--card)' }}>
            <MathCodePanel lesson={lesson} />
          </section>
        ) : (
          <section className="card stage" style={{ background: 'var(--card)' }}>
            <ChallengeQuizPanel
              lesson={lesson}
              onReturnToSim={() => setStageTab('simulation')}
              onNotify={onNotify}
            />
          </section>
        )}

        <Timeline
          steps={lesson.steps}
          currentIndex={stepIndex}
          onSelectStep={(idx) => {
            setStepIndex(idx);
            setStageTab('simulation');
          }}
        />
      </main>

      <GuideRail
        lesson={lesson}
        stepIndex={stepIndex}
        onPrev={() => setStepIndex((i) => Math.max(0, i - 1))}
        onNext={() => setStepIndex((i) => Math.min(lesson.steps.length - 1, i + 1))}
        onOpenChallengeTab={() => setStageTab('challenge')}
      />
    </>
  );
}
