import { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  X,
} from 'lucide-react';
import { CURRICULUM_STAGES } from '../../data/curriculum';
import { useProgress } from '../../state/useProgressStore';
import { NavSection } from '../../types/curriculum';

interface SidebarProps {
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  drawerOpen: boolean;
  onCloseDrawer: () => void;
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
}

export function Sidebar({
  activeLessonId,
  onSelectLesson,
  drawerOpen,
  onCloseDrawer,
  activeNav,
  onSelectNav,
}: SidebarProps) {
  const { progress } = useProgress();

  const activeStageId =
    CURRICULUM_STAGES.find((s) => s.lessons.some((l) => l.id === activeLessonId))?.id ?? 'stage-00';

  const [openStages, setOpenStages] = useState<Record<string, boolean>>({
    'stage-00': true,
    'stage-04': true,
    'stage-06': true,
    'stage-08': true,
    'stage-10': true,
    [activeStageId]: true,
  });

  useEffect(() => {
    setOpenStages((prev) => ({ ...prev, [activeStageId]: true }));
  }, [activeStageId]);

  const [progressOpen, setProgressOpen] = useState(false);

  const toggleStage = (stageId: string) => {
    setOpenStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const totalLessons = CURRICULUM_STAGES.reduce((acc, s) => acc + s.lessons.length, 0);
  const doneCount = progress.completedLessons.length;
  const pct = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;

  return (
    <>
      <div
        className={`drawer-backdrop ${drawerOpen ? 'is-open' : ''}`}
        onClick={onCloseDrawer}
      />
      <aside className={`sidebar ${drawerOpen ? 'is-open' : ''}`} aria-label="University Curriculum">
        <nav className="drawer-nav">
          {(['home', 'learn', 'labs', 'projects', 'roadmap'] as NavSection[]).map((nav) => (
            <button
              key={nav}
              type="button"
              className={`nav__item ${activeNav === nav ? 'btn-pop is-active' : ''}`}
              onClick={() => {
                onSelectNav(nav);
                onCloseDrawer();
              }}
            >
              <span style={{ textTransform: 'capitalize' }}>{nav}</span>
            </button>
          ))}
        </nav>

        <div className="tree-root">
          <svg width="22" height="18" viewBox="0 0 20 16" aria-hidden="true">
            <path d="M1 3a2 2 0 0 1 2-2h4.3l2 2.2H17a2 2 0 0 1 2 2V13a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2Z" fill="currentColor" />
          </svg>
          <span>University</span>
          <span className="tree-root__meta">14 stages · {totalLessons} modules</span>
          <button
            className="drawer-close"
            type="button"
            aria-label="Close curriculum menu"
            onClick={onCloseDrawer}
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <nav className="course">
          {CURRICULUM_STAGES.map((stage) => {
            const isOpen = Boolean(openStages[stage.id]);
            const stageDone = stage.lessons.filter((l) =>
              progress.completedLessons.includes(l.id)
            ).length;

            return (
              <section key={stage.id} className={`mod ${isOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="mod__head"
                  aria-expanded={isOpen}
                  onClick={() => toggleStage(stage.id)}
                >
                  <ChevronRight size={14} strokeWidth={2.2} className="mod__chev" />
                  <svg className={`folder folder--${stage.folderColor}`} width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
                    <path d="M1.2 3.2A2 2 0 0 1 3.2 1.2h4.1l2 2.2h7.5a2 2 0 0 1 2 2v8.4a2 2 0 0 1-2 2H3.2a2 2 0 0 1-2-2Z" />
                    <path className="folder__lip" d="M1.2 6.2h17.6" />
                  </svg>
                  <span className="mod__title" title={`${stage.number}. ${stage.title}`}>
                    {stage.number}. {stage.title}
                  </span>
                  <span className="mod__count">
                    {stageDone}/{stage.lessons.length}
                  </span>
                </button>

                <div className="mod__body">
                  <div className="mod__clip">
                    <ul className="mod__lessons">
                      {stage.lessons.map((lesson) => {
                        const isCurrent = lesson.id === activeLessonId;
                        const isDone = progress.completedLessons.includes(lesson.id);

                        return (
                          <li
                            key={lesson.id}
                            className={`lesson ${isCurrent ? 'is-current' : ''}`}
                          >
                            <button
                              type="button"
                              className={isCurrent ? 'btn-pop' : ''}
                              onClick={() => {
                                onSelectLesson(lesson.id);
                                onCloseDrawer();
                              }}
                            >
                              <span className="lesson__markbox">
                                {isDone ? (
                                  <CheckCircle2 size={15} strokeWidth={2} className="lesson__mark lesson__mark--done" />
                                ) : (
                                  <FileText size={14} strokeWidth={1.6} className="lesson__mark" />
                                )}
                              </span>
                              <span className="lesson__title" title={lesson.title}>
                                {lesson.title}
                              </span>
                              {lesson.isFlagshipLab && (
                                <span className="live-badge">LAB</span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </nav>

        <section className={`card progress ${progressOpen ? 'is-open' : ''}`}>
          <button
            className="progress__head"
            type="button"
            aria-expanded={progressOpen}
            onClick={() => setProgressOpen((v) => !v)}
          >
            <span className="eyebrow">Progress</span>
            <span className="progress__pct">
              {doneCount} / {totalLessons}
            </span>
            <ChevronRight size={14} strokeWidth={2.2} className="progress__chev" />
          </button>

          <div className="progress__body">
            <div className="progress__clip">
              <div className="bar">
                <span style={{ width: `${pct}%` }} />
              </div>
              <ul className="progress__list">
                {CURRICULUM_STAGES.map((stage) => {
                  const stageDone = stage.lessons.filter((l) =>
                    progress.completedLessons.includes(l.id)
                  ).length;
                  const allDone = stageDone === stage.lessons.length;
                  const partDone = stageDone > 0 && !allDone;
                  return (
                    <li key={stage.id}>
                      <span className={`check ${allDone ? 'is-on' : partDone ? 'is-part' : ''}`}>
                        <Check size={10} strokeWidth={3} />
                      </span>
                      <span className="progress__label">
                        {stage.number}. {stage.title}
                      </span>
                      <span className="progress__count">
                        {stageDone}/{stage.lessons.length}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      </aside>
    </>
  );
}
