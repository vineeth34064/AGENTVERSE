import { useState } from 'react';
import { Check, Copy, AlertTriangle, Cpu } from 'lucide-react';
import { LessonData } from '../../types/curriculum';

export function MathCodePanel({ lesson }: { lesson: LessonData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(lesson.pythonFromScratch.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="scroll-view" style={{ padding: '14px 16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Intuition & Real-World Context */}
        <div className="card" style={{ padding: 14, background: 'var(--paper-2)' }}>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            First-Principles Intuition
          </div>
          <p className="muted-copy" style={{ color: 'var(--ink-2)', fontSize: 12.5 }}>
            {lesson.intuitionSummary}
          </p>
        </div>

        {/* Mathematical Foundation */}
        <div className="card" style={{ padding: 14, background: 'var(--paper-2)' }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            {lesson.mathFoundation.title}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {lesson.mathFoundation.equations.map((eq) => (
              <div key={eq.label} className="math-card" style={{ margin: 0 }}>
                <div className="math-card__label">{eq.label}</div>
                <div className="math-card__eq" style={{ marginBottom: 6 }}>
                  {eq.expr}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.45 }}>
                  {eq.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* From-Scratch Python Implementation */}
        <div className="card" style={{ padding: 14, background: 'var(--paper-2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 10 }}>
            <div>
              <div className="eyebrow">
                From-Scratch Implementation · {lesson.pythonFromScratch.filename}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                {lesson.pythonFromScratch.description}
              </div>
            </div>
            <button type="button" className="tool" onClick={handleCopy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy Python'}</span>
            </button>
          </div>
          <pre className="code-block">{lesson.pythonFromScratch.code}</pre>
        </div>

        {/* Real-World Engineering & Failure Analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
          <div className="card" style={{ padding: 14, background: 'var(--paper-2)' }}>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Cpu size={14} /> Production Engineering Use
            </div>
            <ul className="takeaways">
              {lesson.realWorldUse.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ padding: 14, background: 'var(--paper-2)' }}>
            <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <AlertTriangle size={14} /> Failure Analysis Matrix
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lesson.failureModes.map((fm) => (
                <div
                  key={fm.name}
                  style={{
                    border: '1px solid var(--c-ebbcb3)',
                    background: 'var(--c-fbebe7)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    fontSize: 11.5,
                  }}
                >
                  <div style={{ fontWeight: 800, color: 'var(--c-7d241d)' }}>{fm.name}</div>
                  <div style={{ color: 'var(--ink-2)', marginTop: 2 }}>
                    <b>Cause:</b> {fm.cause}
                  </div>
                  <div style={{ color: 'var(--ink-2)' }}>
                    <b>Fix:</b> {fm.mitigation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
