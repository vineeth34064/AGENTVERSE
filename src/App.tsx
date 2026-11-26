import { useEffect, useState } from 'react';
import { ProgressProvider } from './state/useProgressStore';
import { NavSection, ThemeMode } from './types/curriculum';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { SearchModal } from './components/layout/SearchModal';
import { Toast } from './components/layout/Toast';
import { LessonStudio } from './components/learn/LessonStudio';
import { HomeView } from './components/views/HomeView';
import { LabsView } from './components/views/LabsView';
import { ProjectsView } from './components/views/ProjectsView';
import { RoadmapView } from './components/views/RoadmapView';

function AgentverseApp() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const paramTheme = new URLSearchParams(window.location.search).get('theme');
    if (paramTheme === 'light' || paramTheme === 'dark') return paramTheme;
    try {
      const saved = JSON.parse(localStorage.getItem('agentverse:theme') ?? '"dark"');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [activeNav, setActiveNav] = useState<NavSection>(() => {
    const view = new URLSearchParams(window.location.search).get('view');
    if (view === 'home' || view === 'learn' || view === 'labs' || view === 'projects' || view === 'roadmap') {
      return view;
    }
    return 'learn';
  });
  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    return new URLSearchParams(window.location.search).get('lesson') || 'gradient-descent';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('agentverse:theme', JSON.stringify(theme));
    } catch {
      // ignore storage errors
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#211e1a' : '#f4ebe0');
  }, [theme]);

  // Global Ctrl+K / Cmd+K search shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const notify = (msg: string) => {
    setToastMsg(msg);
    window.setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 3200);
  };

  const openLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setActiveNav('learn');
  };

  return (
    <div className="window">
      <Topbar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        onOpenSearch={() => setSearchOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onToggleDrawer={() => setDrawerOpen((d) => !d)}
      />

      {activeNav === 'learn' ? (
        <div className="body">
          <Sidebar
            activeLessonId={activeLessonId}
            onSelectLesson={openLesson}
            drawerOpen={drawerOpen}
            onCloseDrawer={() => setDrawerOpen(false)}
            activeNav={activeNav}
            onSelectNav={setActiveNav}
          />
          <LessonStudio
            lessonId={activeLessonId}
            onSelectLesson={openLesson}
            onNotify={notify}
          />
        </div>
      ) : (
        <div className="body body--full">
          <Sidebar
            activeLessonId={activeLessonId}
            onSelectLesson={openLesson}
            drawerOpen={drawerOpen}
            onCloseDrawer={() => setDrawerOpen(false)}
            activeNav={activeNav}
            onSelectNav={setActiveNav}
          />
          {activeNav === 'home' && (
            <HomeView onOpenLesson={openLesson} onOpenNav={setActiveNav} />
          )}
          {activeNav === 'labs' && (
            <LabsView onOpenLesson={openLesson} onNotify={notify} />
          )}
          {activeNav === 'projects' && (
            <ProjectsView onOpenLesson={openLesson} onNotify={notify} />
          )}
          {activeNav === 'roadmap' && (
            <RoadmapView onOpenLesson={openLesson} onNotify={notify} />
          )}
        </div>
      )}

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onOpenLesson={openLesson}
        onOpenNav={setActiveNav}
      />
      <Toast message={toastMsg} />
    </div>
  );
}

export function App() {
  return (
    <ProgressProvider>
      <AgentverseApp />
    </ProgressProvider>
  );
}
export default App;
