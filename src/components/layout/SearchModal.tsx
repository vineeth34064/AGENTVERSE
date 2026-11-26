import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, FlaskConical, FolderGit2, FileText, Search } from 'lucide-react';
import { CURRICULUM_STAGES, CONCEPT_BRIEFS, FLAGSHIP_LESSONS } from '../../data/curriculum';
import { ENGINEERING_PROJECTS } from '../../data/projects';
import { RESEARCH_LIBRARY } from '../../data/reference';
import { NavSection } from '../../types/curriculum';

interface SearchResult {
  id: string;
  group: 'Interactive Lab' | 'Curriculum Module' | 'Engineering Project' | 'Research Paper';
  title: string;
  subtitle: string;
  badge: string;
  action: () => void;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onOpenLesson: (lessonId: string) => void;
  onOpenNav: (nav: NavSection) => void;
}

export function SearchModal({ open, onClose, onOpenLesson, onOpenNav }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const allItems = useMemo<SearchResult[]>(() => {
    const items: SearchResult[] = [];

    for (const stage of CURRICULUM_STAGES) {
      for (const l of stage.lessons) {
        const flagship = FLAGSHIP_LESSONS[l.id];
        const brief = CONCEPT_BRIEFS[l.id];
        items.push({
          id: `lesson-${l.id}`,
          group: l.isFlagshipLab ? 'Interactive Lab' : 'Curriculum Module',
          title: l.title,
          subtitle: flagship?.subtitle ?? brief?.subtitle ?? l.subtitle,
          badge: l.isFlagshipLab ? `Stage ${stage.number} · LIVE LAB` : `Stage ${stage.number}`,
          action: () => {
            onOpenLesson(l.id);
            onClose();
          },
        });
      }
    }

    for (const proj of ENGINEERING_PROJECTS) {
      items.push({
        id: `proj-${proj.id}`,
        group: 'Engineering Project',
        title: `#${proj.number} ${proj.title}`,
        subtitle: proj.tagline,
        badge: proj.tier,
        action: () => {
          onOpenNav('projects');
          onClose();
        },
      });
    }

    for (const paper of RESEARCH_LIBRARY) {
      items.push({
        id: `paper-${paper.id}`,
        group: 'Research Paper',
        title: `${paper.title} (${paper.year})`,
        subtitle: paper.coreIdea,
        badge: paper.stage,
        action: () => {
          onOpenNav('roadmap');
          onClose();
        },
      });
    }

    return items;
  }, [onClose, onOpenLesson, onOpenNav]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems.slice(0, 14);
    return allItems
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.badge.toLowerCase().includes(q) ||
          item.group.toLowerCase().includes(q)
      )
      .slice(0, 18);
  }, [allItems, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((idx) => Math.min(filtered.length - 1, idx + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((idx) => Math.max(0, idx - 1));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex]!.action();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, onClose, open, selectedIndex]);

  if (!open) return null;

  const grouped = filtered.reduce<Record<string, SearchResult[]>>((acc, item) => {
    acc[item.group] = acc[item.group] ?? [];
    acc[item.group]!.push(item);
    return acc;
  }, {});

  let flatCounter = -1;

  return (
    <div className="sx is-open">
      <div className="sx__backdrop" onClick={onClose} />
      <div className="sx__dialog" role="dialog" aria-modal="true" aria-label="Search AGENTVERSE">
        <div className="sx__bar">
          <Search size={18} strokeWidth={2.2} style={{ color: 'var(--ink-2)', flex: 'none' }} />
          <input
            ref={inputRef}
            className="sx__input"
            type="text"
            placeholder="Search simulations, gradient descent, attention, RAG, MCP, projects…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          {query && (
            <button type="button" className="sx__esc" onClick={() => setQuery('')}>
              Clear
            </button>
          )}
          <button type="button" className="sx__esc" onClick={onClose}>
            esc
          </button>
        </div>

        <div className="sx__list" role="listbox">
          {filtered.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>
                No matching modules found
              </div>
              Try searching “attention”, “gradient”, “RAG”, “MCP”, or “prompt injection”.
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <div className="sx__group">
                  <span>{group}</span>
                  <span>{items.length}</span>
                </div>
                {items.map((item) => {
                  flatCounter += 1;
                  const idx = flatCounter;
                  const icon =
                    item.group === 'Interactive Lab' ? (
                      <FlaskConical size={15} />
                    ) : item.group === 'Engineering Project' ? (
                      <FolderGit2 size={15} />
                    ) : item.group === 'Research Paper' ? (
                      <FileText size={15} />
                    ) : (
                      <BookOpen size={15} />
                    );
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`sx__item ${idx === selectedIndex ? 'is-sel' : ''}`}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={item.action}
                    >
                      <span className="sx__icon">{icon}</span>
                      <span style={{ minWidth: 0 }}>
                        <div className="sx__title">{item.title}</div>
                        <div className="sx__text">{item.subtitle}</div>
                      </span>
                      <span className="sx__chip">{item.badge}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="sx__foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>esc</kbd> close
          </span>
          <span style={{ marginInlineStart: 'auto', fontWeight: 600 }}>
            {filtered.length} results
          </span>
        </div>
      </div>
    </div>
  );
}
