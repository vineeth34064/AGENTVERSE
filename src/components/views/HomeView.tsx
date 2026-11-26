import { ArrowRight, BookOpen, Compass, FlaskConical, FolderGit2, Sparkles } from 'lucide-react';
import { CURRICULUM_STAGES, FLAGSHIP_LESSONS } from '../../data/curriculum';
import { ENGINEERING_PROJECTS } from '../../data/projects';
import { useProgress } from '../../state/useProgressStore';
import { NavSection } from '../../types/curriculum';
import { AgentLoopSim } from '../simulations/AgentLoopSim';

interface HomeViewProps {
  onOpenLesson: (lessonId: string) => void;
  onOpenNav: (nav: NavSection) => void;
}

export function HomeView({ onOpenLesson, onOpenNav }: HomeViewProps) {
  const { progress } = useProgress();
  const totalLessons = CURRICULUM_STAGES.reduce((acc, s) => acc + s.lessons.length, 0);
  const flagshipList = Object.values(FLAGSHIP_LESSONS);

  // Recommend next incomplete lesson
  const nextRecommended =
    flagshipList.find((l) => !progress.completedLessons.includes(l.id)) ??
    flagshipList[flagshipList.length - 1]!;

  return (
    <div className="scroll-view">
      <div className="scroll-view__inner">
        {/* Hero Split */}
        <section
          className="card"
          style={{
            padding: 22,
            background: 'linear-gradient(var(--a-2), var(--a-4) 240px), var(--sheet)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 22,
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="tag tag--mint">
                <Sparkles size={12} /> Interactive AI &amp; Agentic University
              </span>
              <span className="tag tag--sand">14 Stages · 5 Live Engines · 21 Projects</span>
            </div>

            <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 38px)', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.12 }}>
              Understand Intelligence.{' '}
              <span style={{ background: 'linear-gradient(transparent 58%, var(--a-8) 58%)', padding: '0 4px' }}>
                Engineer Autonomy.
              </span>
            </h1>

            <p style={{ color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.65 }}>
              Do not memorize static slides. Manipulate learning rates, backprop gradients, Q·Kᵀ attention heads, hybrid RAG chunkers, and sandboxed AI agents directly—observing internal mechanics, math, Python code, and real-world failure modes side by side.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
              <button
                type="button"
                className="btn-pop"
                style={{ height: 40, padding: '0 16px', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                onClick={() => onOpenLesson(nextRecommended.id)}
              >
                <BookOpen size={15} />
                {progress.completedLessons.length > 0 ? `Continue: ${nextRecommended.title}` : 'Start: Gradient Descent Lab'}
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="btn-ghost"
                style={{ height: 40, fontSize: 13 }}
                onClick={() => onOpenNav('labs')}
              >
                <FlaskConical size={15} /> Open Sim Labs
              </button>

              <button
                type="button"
                className="btn-ghost"
                style={{ height: 40, fontSize: 13 }}
                onClick={() => onOpenLesson('autonomous-agent-loop')}
              >
                Jump to Agentic AI →
              </button>
            </div>

            {/* Live Progress Strip */}
            <div
              style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                marginTop: 6,
                paddingTop: 12,
                borderTop: '1px solid var(--line)',
                fontSize: 12,
              }}
            >
              <div>
                <span style={{ color: 'var(--muted)' }}>Curriculum:</span>{' '}
                <b>
                  {progress.completedLessons.length} / {totalLessons} modules
                </b>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>Challenges:</span>{' '}
                <b>{progress.completedChallenges.length} / 5 passed</b>
              </div>
              <div>
                <span style={{ color: 'var(--muted)' }}>Projects:</span>{' '}
                <b>{progress.completedProjects.length} / {ENGINEERING_PROJECTS.length} shipped</b>
              </div>
            </div>
          </div>

          {/* Live Interactive Agent Demo embedded right on Homepage */}
          <div style={{ minHeight: 410, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span className="eyebrow" style={{ fontSize: 11.5 }}>
                Live Preview · Autonomous Agent Runtime
              </span>
              <button
                type="button"
                className="sim-pill"
                onClick={() => onOpenLesson('autonomous-agent-loop')}
              >
                Full 9-Step Lesson →
              </button>
            </div>
            <div style={{ flex: 1, display: 'flex', minHeight: 380 }}>
              <AgentLoopSim compact />
            </div>
          </div>
        </section>

        {/* 5 Flagship Interactive Simulations */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div>
              <div className="eyebrow">5 Core Interactive Simulation Engines</div>
              <p className="muted-copy">
                From mathematical optimization to multi-step tool-calling autonomy—every slider computes real math.
              </p>
            </div>
            <button type="button" className="btn-ghost" style={{ height: 32, fontSize: 12 }} onClick={() => onOpenNav('labs')}>
              Explore All Labs →
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
            {flagshipList.map((lesson) => {
              const done = progress.completedLessons.includes(lesson.id);
              const passed = progress.completedChallenges.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  type="button"
                  className="card"
                  onClick={() => onOpenLesson(lesson.id)}
                  style={{
                    textAlign: 'start',
                    padding: 14,
                    background: 'var(--paper-2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    transition: 'transform 0.15s, border-color 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span className="tag tag--sand">Stage {lesson.stageNumber}</span>
                    {passed ? (
                      <span className="tag tag--mint">Challenge ✓</span>
                    ) : done ? (
                      <span className="tag tag--mint">Done ✓</span>
                    ) : (
                      <span className="tag tag--violet">{lesson.steps.length} steps</span>
                    )}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)' }}>{lesson.title}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5, flex: 1 }}>
                    {lesson.subtitle}
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--c-2f8a43)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    Launch Simulation <ArrowRight size={13} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 14-Stage Roadmap Preview */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div>
              <div className="eyebrow">Complete 14-Stage Curriculum Architecture</div>
              <p className="muted-copy">
                Zero skipped prerequisites: Stage 00 Linear Algebra through Stage 13 Frontier Research.
              </p>
            </div>
            <button type="button" className="btn-ghost" style={{ height: 32, fontSize: 12 }} onClick={() => onOpenNav('roadmap')}>
              <Compass size={14} /> Dependency Graph
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
            {CURRICULUM_STAGES.map((stage) => {
              const firstLesson = stage.lessons[0]!;
              const doneCount = stage.lessons.filter((l) => progress.completedLessons.includes(l.id)).length;
              return (
                <button
                  key={stage.id}
                  type="button"
                  className="card"
                  onClick={() => onOpenLesson(firstLesson.id)}
                  style={{
                    textAlign: 'start',
                    padding: '12px 14px',
                    background: 'var(--card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                    <svg className={`folder folder--${stage.folderColor}`} width="18" height="14" viewBox="0 0 20 16" aria-hidden="true">
                      <path d="M1.2 3.2A2 2 0 0 1 3.2 1.2h4.1l2 2.2h7.5a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2H3.2a2 2 0 0 1-2-2Z" />
                      <path className="folder__lip" d="M1.2 6.2h17.6" />
                    </svg>
                    <span style={{ fontWeight: 800, fontSize: 13 }}>
                      {stage.number}. {stage.title}
                    </span>
                    <span style={{ marginInlineStart: 'auto', fontSize: 11, color: 'var(--muted)' }}>
                      {doneCount}/{stage.lessons.length}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.45 }}>
                    {stage.summary}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Featured Projects Strip */}
        <section className="card" style={{ padding: 16, background: 'var(--paper-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div className="eyebrow">Real-World Engineering Project Laboratory</div>
              <p className="muted-copy">
                Combine math, ML, RAG, MCP, and evaluation into 21 production-grade system builds.
              </p>
            </div>
            <button type="button" className="btn-pop" style={{ height: 34, padding: '0 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => onOpenNav('projects')}>
              <FolderGit2 size={14} /> Browse All 21 Projects
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 10 }}>
            {[ENGINEERING_PROJECTS[2]!, ENGINEERING_PROJECTS[5]!, ENGINEERING_PROJECTS[12]!, ENGINEERING_PROJECTS[18]!].map((p) => (
              <button
                key={p.id}
                type="button"
                className="card"
                onClick={() => onOpenNav('projects')}
                style={{ textAlign: 'start', padding: 12, background: 'var(--card)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span className="tag tag--sand">#{p.number}</span>
                  <span className="tag tag--violet">{p.tier}</span>
                </div>
                <div style={{ fontWeight: 800, fontSize: 12.5 }}>{p.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{p.tagline}</div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
