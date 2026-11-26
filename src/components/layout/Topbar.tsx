import type { ReactNode } from 'react';
import {
  BookOpen,
  Compass,
  Flame,
  FlaskConical,
  FolderGit2,
  Home,
  Menu,
  Moon,
  Search,
  Sun,
} from 'lucide-react';
import { NavSection, ThemeMode } from '../../types/curriculum';
import { useProgress } from '../../state/useProgressStore';
import { CURRICULUM_STAGES } from '../../data/curriculum';

interface TopbarProps {
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
  onOpenSearch: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onToggleDrawer: () => void;
}

export function Topbar({
  activeNav,
  onSelectNav,
  onOpenSearch,
  theme,
  onToggleTheme,
  onToggleDrawer,
}: TopbarProps) {
  const { progress } = useProgress();
  const totalLessons = CURRICULUM_STAGES.reduce((acc, s) => acc + s.lessons.length, 0);

  const navItems: Array<{ id: NavSection; label: string; icon: ReactNode }> = [
    { id: 'home', label: 'Home', icon: <Home size={16} strokeWidth={1.8} /> },
    { id: 'learn', label: 'Learn', icon: <BookOpen size={16} strokeWidth={1.8} /> },
    { id: 'labs', label: 'Sim Labs', icon: <FlaskConical size={16} strokeWidth={1.8} /> },
    { id: 'projects', label: 'Projects', icon: <FolderGit2 size={16} strokeWidth={1.8} /> },
    { id: 'roadmap', label: 'Roadmap', icon: <Compass size={16} strokeWidth={1.8} /> },
  ];

  return (
    <header className="topbar">
      <button
        className="menu-btn"
        type="button"
        aria-label="Open curriculum menu"
        onClick={onToggleDrawer}
      >
        <Menu size={18} strokeWidth={2.2} />
      </button>

      <a
        className="brand"
        href="#home"
        onClick={(e) => {
          e.preventDefault();
          onSelectNav('home');
        }}
        aria-label="AGENTVERSE Home"
      >
        <svg className="logo" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
          <path
            d="M16 10.6V15.4M8.2 19.4V15.4H23.8V18.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <rect x="9" y="2.4" width="14" height="8.6" rx="2.6" fill="#fcd4ad" stroke="currentColor" strokeWidth="1.8" />
          <rect x="2" y="19.4" width="12.4" height="9" rx="2.6" fill="#a9c5e8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M18 20.4V27.2A5.8 2.2 0 0 0 29.6 27.2V20.4Z" fill="#cbbae6" />
          <ellipse cx="23.8" cy="20.4" rx="5.8" ry="2.2" fill="#ece4f6" />
          <path d="M18 20.4V27.2A5.8 2.2 0 0 0 29.6 27.2V20.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <ellipse cx="23.8" cy="20.4" rx="5.8" ry="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span className="brand__name">
          AGENT<span>VERSE</span>
        </span>
      </a>

      <nav className="nav" aria-label="Primary Navigation">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav__item ${activeNav === item.id ? 'btn-pop is-active' : ''}`}
            onClick={() => onSelectNav(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        className="search"
        type="button"
        aria-label="Search curriculum, labs, projects, and papers"
        aria-keyshortcuts="Control+K"
        onClick={onOpenSearch}
      >
        <Search size={15} strokeWidth={2} />
        <span className="search__hint">Search concepts, labs, papers…</span>
        <kbd>Ctrl K</kbd>
      </button>

      <button
        type="button"
        className="xp-pill"
        title="View your learning progress & concept graph"
        onClick={() => onSelectNav('roadmap')}
      >
        <span className="xp-pill__dot" />
        <span>
          {progress.completedLessons.length}/{totalLessons}
        </span>
        <span style={{ color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <Flame size={12} /> {progress.streakDays}d
        </span>
      </button>

      <button
        className="theme-btn"
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === 'dark' ? 'Switch to warm paper light theme' : 'Switch to dark notebook theme'}
        title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark' ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
      </button>
    </header>
  );
}
