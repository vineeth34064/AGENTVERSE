import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import {
  createGDState,
  GDConfig,
  GDState,
  LANDSCAPES,
  LandscapeId,
  OptimizerId,
  stepGD,
} from '../../engines/gradientDescent';
import { IsoSvgDefs } from './IsoPrimitives';

interface GradientDescentSimProps {
  preset?: Record<string, unknown>;
  presetTrigger?: string;
  onChallengePass?: () => void;
  compact?: boolean;
}

export function GradientDescentSim({
  preset,
  presetTrigger,
  onChallengePass,
  compact = false,
}: GradientDescentSimProps) {
  const [config, setConfig] = useState<GDConfig>({
    landscape: 'convex',
    optimizer: 'gd',
    learningRate: 0.25,
    initialW: -2.6,
    initialW2: 1.4,
    momentumBeta: 0.85,
  });

  const [state, setState] = useState<GDState>(() => createGDState(config));
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Sync preset when learner switches lesson step
  useEffect(() => {
    if (!preset) return;
    const nextConfig: GDConfig = {
      landscape: (preset.landscape as LandscapeId) ?? 'convex',
      optimizer: (preset.optimizer as OptimizerId) ?? 'gd',
      learningRate: typeof preset.learningRate === 'number' ? preset.learningRate : 0.25,
      initialW: typeof preset.initialW === 'number' ? preset.initialW : -2.6,
      initialW2: typeof preset.initialW2 === 'number' ? preset.initialW2 : 1.4,
      momentumBeta: typeof preset.momentumBeta === 'number' ? preset.momentumBeta : 0.85,
    };
    setPlaying(false);
    setConfig(nextConfig);
    setState(createGDState(nextConfig));
  }, [presetTrigger]);

  // Reset trajectory when config changes manually
  const updateConfig = (partial: Partial<GDConfig>) => {
    const next = { ...config, ...partial };
    setConfig(next);
    setState(createGDState(next));
  };

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setState((prev) => {
        if (prev.regime === 'converged' || prev.regime === 'diverged' || prev.step >= 45) {
          setPlaying(false);
          return prev;
        }
        return stepGD(prev);
      });
    }, 320);
    return () => window.clearInterval(timer);
  }, [playing]);

  // Challenge check: Non-convex starting near +3.1 reaching global valley (L < 0.75) within 25 steps
  useEffect(() => {
    if (
      config.landscape === 'non-convex' &&
      config.initialW >= 2.5 &&
      state.loss < 0.75 &&
      state.step <= 25 &&
      state.regime !== 'diverged'
    ) {
      onChallengePass?.();
    }
  }, [config.initialW, config.landscape, onChallengePass, state.loss, state.regime, state.step]);

  const spec = LANDSCAPES[config.landscape];

  // Sample 1D curve geometry
  const curveGeom = useMemo(() => {
    const [wMin, wMax] = spec.wRange;
    const samples: Array<{ w: number; loss: number }> = [];
    let maxLoss = 0;
    for (let i = 0; i <= 120; i++) {
      const w = wMin + ((wMax - wMin) * i) / 120;
      const loss = spec.evaluate(w, 0).loss;
      if (loss > maxLoss) maxLoss = loss;
      samples.push({ w, loss });
    }
    const yMax = Math.max(4.5, Math.min(8.5, maxLoss * 1.12));
    const mapX = (w: number) => 45 + ((w - wMin) / (wMax - wMin)) * 370;
    const mapY = (l: number) => 225 - (Math.min(yMax, Math.max(0, l)) / yMax) * 185;
    const pathD = samples
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${mapX(p.w).toFixed(1)},${mapY(p.loss).toFixed(1)}`)
      .join(' ');
    return { mapX, mapY, pathD, wMin, wMax, yMax };
  }, [spec]);

  const curX = curveGeom.mapX(Math.max(curveGeom.wMin, Math.min(curveGeom.wMax, state.w)));
  const curY = curveGeom.mapY(state.loss);
  const tangentSpan = 0.9;
  const tanX1 = curveGeom.mapX(Math.max(curveGeom.wMin, state.w - tangentSpan));
  const tanY1 = curveGeom.mapY(state.loss - state.grad * tangentSpan);
  const tanX2 = curveGeom.mapX(Math.min(curveGeom.wMax, state.w + tangentSpan));
  const tanY2 = curveGeom.mapY(state.loss + state.grad * tangentSpan);

  const regimeLevel =
    state.regime === 'converged'
      ? 'good'
      : state.regime === 'diverged'
        ? 'bad'
        : state.regime === 'oscillating' || state.regime === 'local-trap'
          ? 'warn'
          : 'none';

  const regimeText: Record<GDState['regime'], string> = {
    converged: 'Converged',
    converging: 'Descending',
    oscillating: 'Oscillating',
    diverged: 'Diverged!',
    'local-trap': 'Local Trap!',
  };

  return (
    <section className={`card stage ${fullscreen ? 'is-full' : ''}`}>
      <div className="stage__top">
        <div className="stage__hud">
          <div className="chip" data-level="none">
            <span className="chip__label">Step</span>
            <span className="chip__value">{state.step}</span>
          </div>
          <div className="chip" data-level="none">
            <span className="chip__label">Parameter θ</span>
            <span className="chip__value">{state.w.toFixed(3)}</span>
          </div>
          <div className="chip" data-level={state.loss < 0.75 ? 'good' : state.loss > 15 ? 'bad' : 'none'}>
            <span className="chip__label">Loss L(θ)</span>
            <span className="chip__value">{state.loss.toFixed(3)}</span>
          </div>
          <div className="chip" data-level="none">
            <span className="chip__label">Gradient ∇L</span>
            <span className="chip__value">{state.grad >= 0 ? `+${state.grad.toFixed(3)}` : state.grad.toFixed(3)}</span>
          </div>
          <div className="chip" data-level={regimeLevel}>
            <span className="chip__label">Regime</span>
            <span className="chip__value">{regimeText[state.regime]}</span>
          </div>
        </div>

        <div className="stage__tools">
          <button
            type="button"
            className="tool"
            onClick={() => {
              setPlaying(false);
              setState(createGDState(config));
            }}
            title="Reset simulation (R)"
          >
            <RotateCcw size={14} /> <span>Reset</span>
          </button>
          <button
            type="button"
            className="tool"
            onClick={() => {
              setPlaying(false);
              setState((s) => stepGD(s));
            }}
            title="Advance one optimization step"
          >
            <SkipForward size={14} /> <span>Step</span>
          </button>
          <button
            type="button"
            className={`tool ${playing ? 'is-on' : ''}`}
            onClick={() => setPlaying((p) => !p)}
            title="Play/Pause descent"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span>{playing ? 'Pause' : 'Play'}</span>
          </button>
          {!compact && (
            <button
              type="button"
              className="tool"
              onClick={() => setFullscreen((f) => !f)}
              title="Toggle fullscreen stage"
            >
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>
      </div>

      <div className="stage__body">
        <div className="stage__canvas">
          <svg className="stage-svg" viewBox="0 0 760 270" preserveAspectRatio="xMidYMid meet">
            <IsoSvgDefs prefix="gd" />
            <rect x="0" y="0" width="760" height="270" fill="url(#gd-grid)" mask="url(#gd-mask)" />

            {/* Left Panel: Loss Surface or 2D Ravine Contour */}
            <rect x="16" y="14" width="424" height="242" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="30" y="32" fontSize="9.5" fontWeight="800" fill="var(--muted)" letterSpacing="0.04em">
              {config.landscape === 'ravine' ? '2D CONTOUR SURFACE (θ₁, θ₂)' : `${spec.name.toUpperCase()} · ${spec.formula}`}
            </text>

            {config.landscape === 'ravine' ? (
              <g>
                {/* Elliptical contours centered at (228, 138) */}
                {[1, 2, 3, 4, 5].map((ring) => (
                  <ellipse
                    key={ring}
                    cx="228"
                    cy="138"
                    rx={ring * 36}
                    ry={ring * 15}
                    fill="none"
                    stroke="var(--line-strong)"
                    strokeDasharray={ring === 1 ? 'none' : '4 3'}
                    strokeWidth="1.2"
                  />
                ))}
                <circle cx="228" cy="138" r="4.5" fill="var(--green-3)" stroke="var(--ink)" strokeWidth="1.3" />
                <text x="236" y="142" fontSize="9.5" fontWeight="700" fill="var(--c-24521c)">min (0,0)</text>

                {/* Trajectory path in 2D */}
                <polyline
                  fill="none"
                  stroke="var(--rust-2)"
                  strokeWidth="2.2"
                  points={state.history
                    .map((p) => {
                      const px = 228 + Math.max(-4.5, Math.min(4.5, p.w)) * 38;
                      const py = 138 - Math.max(-2.2, Math.min(2.2, p.w2)) * 42;
                      return `${px.toFixed(1)},${py.toFixed(1)}`;
                    })
                    .join(' ')}
                />
                {state.history.map((p) => {
                  const px = 228 + Math.max(-4.5, Math.min(4.5, p.w)) * 38;
                  const py = 138 - Math.max(-2.2, Math.min(2.2, p.w2)) * 42;
                  return (
                    <circle
                      key={p.step}
                      cx={px}
                      cy={py}
                      r={p.step === state.step ? 6 : 3}
                      fill={p.step === state.step ? '#f3b47f' : 'var(--c-e8a33a)'}
                      stroke="var(--ink)"
                      strokeWidth="1.4"
                    />
                  );
                })}
              </g>
            ) : (
              <g>
                {/* Axes */}
                <line x1="45" y1="225" x2="415" y2="225" stroke="var(--line-strong)" strokeWidth="1.2" />
                <line x1="45" y1="40" x2="45" y2="225" stroke="var(--line-strong)" strokeWidth="1.2" />

                {/* Global Min marker */}
                <line
                  x1={curveGeom.mapX(spec.globalMinW)}
                  y1="44"
                  x2={curveGeom.mapX(spec.globalMinW)}
                  y2="225"
                  stroke="var(--green-3)"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                <text
                  x={curveGeom.mapX(spec.globalMinW)}
                  y="240"
                  textAnchor="middle"
                  fontSize="9.5"
                  fontWeight="700"
                  fill="var(--c-24521c)"
                >
                  θ*={spec.globalMinW}
                </text>

                {/* Loss Curve */}
                <path d={curveGeom.pathD} fill="none" stroke="var(--iso-stroke)" strokeWidth="2.4" strokeLinecap="round" />

                {/* Tangent Line */}
                <line
                  x1={tanX1}
                  y1={tanY1}
                  x2={tanX2}
                  y2={tanY2}
                  stroke="var(--rust-2)"
                  strokeWidth="1.8"
                  strokeDasharray="5 3"
                />

                {/* Breadcrumb History */}
                {state.history.slice(0, -1).map((pt) => {
                  const hx = curveGeom.mapX(Math.max(curveGeom.wMin, Math.min(curveGeom.wMax, pt.w)));
                  const hy = curveGeom.mapY(pt.loss);
                  return (
                    <circle
                      key={pt.step}
                      cx={hx}
                      cy={hy}
                      r="3.2"
                      fill="#b79ce6"
                      stroke="var(--ink)"
                      strokeWidth="1"
                      opacity="0.8"
                    />
                  );
                })}

                {/* Active Parameter Ball */}
                <g className={state.regime === 'diverged' ? 'pulse' : ''}>
                  <circle
                    cx={curX}
                    cy={curY}
                    r="7.5"
                    fill={state.regime === 'diverged' ? '#e5534b' : state.regime === 'converged' ? '#9fd28f' : '#f3b47f'}
                    stroke="var(--ink)"
                    strokeWidth="2"
                  />
                </g>
              </g>
            )}

            {/* Right Panel Top: Loss vs Iteration Sparkline */}
            <rect x="454" y="14" width="290" height="122" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="468" y="34" fontSize="10" fontWeight="800" fill="var(--muted)" letterSpacing="0.06em">
              LOSS CONVERGENCE TRACE
            </text>
            <polyline
              fill="none"
              stroke="var(--c-3fa456)"
              strokeWidth="2.2"
              points={state.history
                .map((p, idx) => {
                  const px = 472 + (idx / Math.max(1, Math.max(12, state.history.length - 1))) * 254;
                  const maxH = Math.max(3, ...state.history.map((h) => Math.min(20, h.loss)));
                  const py = 122 - (Math.min(20, p.loss) / maxH) * 74;
                  return `${px.toFixed(1)},${py.toFixed(1)}`;
                })
                .join(' ')}
            />
            <text x="468" y="128" fontSize="9.5" fill="var(--muted)">t = 0</text>
            <text x="726" y="128" textAnchor="end" fontSize="9.5" fill="var(--muted)">t = {state.step}</text>

            {/* Right Panel Bottom: Live Update Formula Card */}
            <rect x="454" y="148" width="290" height="108" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="468" y="168" fontSize="10" fontWeight="800" fill="var(--muted)" letterSpacing="0.06em">
              LIVE UPDATE CALCULATION ({config.optimizer.toUpperCase()})
            </text>
            <text x="468" y="190" fontSize="11" fontWeight="700" fill="var(--iso-text)">
              θ_next = {state.w.toFixed(2)} - ({config.learningRate.toFixed(2)} × {state.grad.toFixed(2)})
            </text>
            <text x="468" y="210" fontSize="11" fontWeight="600" fill="var(--muted)">
              Step Δθ = {(-config.learningRate * state.grad).toFixed(3)} · LR η = {config.learningRate.toFixed(2)}
            </text>
            <rect
              x="466"
              y="223"
              width="266"
              height="22"
              rx="6"
              fill={
                state.regime === 'diverged'
                  ? 'var(--c-f8d5cf)'
                  : state.regime === 'converged'
                    ? 'var(--c-dcefd2)'
                    : 'var(--c-fbe5bd)'
              }
            />
            <text
              x="476"
              y="238"
              fontSize="10.5"
              fontWeight="800"
              fill={
                state.regime === 'diverged'
                  ? 'var(--c-7d241d)'
                  : state.regime === 'converged'
                    ? 'var(--c-24521c)'
                    : 'var(--c-6d4a0c)'
              }
            >
              {state.regime === 'diverged'
                ? 'Diverged! Reduce η below stability bound.'
                : state.regime === 'local-trap'
                  ? 'Stuck in local valley — try Momentum!'
                  : state.regime === 'converged'
                    ? `Settled cleanly at θ = ${state.w.toFixed(3)}`
                    : `Descending toward minimum…`}
            </text>
          </svg>
        </div>

        {/* Interactive Parameter Dock */}
        <div className="sim-dock">
          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Landscape</span></div>
            <select
              className="sim-select"
              value={config.landscape}
              onChange={(e) => {
                const l = e.target.value as LandscapeId;
                updateConfig({ landscape: l, initialW: l === 'non-convex' ? 3.1 : -2.6 });
              }}
            >
              <option value="convex">Convex Bowl</option>
              <option value="non-convex">Non-Convex Multi-Min</option>
              <option value="ravine">2D Ravine Contour</option>
              <option value="cliff">Steep Cliff</option>
            </select>
          </div>

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Optimizer</span></div>
            <div className="sim-pills">
              {(['gd', 'momentum', 'adam'] as OptimizerId[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`sim-pill ${config.optimizer === opt ? 'is-on' : ''}`}
                  onClick={() => updateConfig({ optimizer: opt })}
                >
                  {opt === 'gd' ? 'GD' : opt === 'momentum' ? 'Momentum' : 'Adam'}
                </button>
              ))}
            </div>
          </div>

          <div className="sim-ctrl" style={{ width: 145 }}>
            <div className="sim-ctrl__head">
              <span>Learning Rate η</span>
              <span className="sim-ctrl__val">{config.learningRate.toFixed(2)}</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="0.02"
              max="2.20"
              step="0.02"
              value={config.learningRate}
              onChange={(e) => updateConfig({ learningRate: parseFloat(e.target.value) })}
            />
          </div>

          <div className="sim-ctrl" style={{ width: 130 }}>
            <div className="sim-ctrl__head">
              <span>Initial θ₀</span>
              <span className="sim-ctrl__val">{config.initialW.toFixed(1)}</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="-3.8"
              max="3.8"
              step="0.1"
              value={config.initialW}
              onChange={(e) => updateConfig({ initialW: parseFloat(e.target.value) })}
            />
          </div>

          {config.optimizer === 'momentum' && (
            <div className="sim-ctrl" style={{ width: 120 }}>
              <div className="sim-ctrl__head">
                <span>Beta β</span>
                <span className="sim-ctrl__val">{config.momentumBeta.toFixed(2)}</span>
              </div>
              <input
                className="sim-slider"
                type="range"
                min="0.50"
                max="0.96"
                step="0.02"
                value={config.momentumBeta}
                onChange={(e) => updateConfig({ momentumBeta: parseFloat(e.target.value) })}
              />
            </div>
          )}

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Quick Experiments</span></div>
            <div className="sim-pills">
              <button
                type="button"
                className="sim-pill"
                onClick={() => updateConfig({ landscape: 'convex', optimizer: 'gd', learningRate: 2.12, initialW: -1.5 })}
              >
                <Sparkles size={11} /> Explode η
              </button>
              <button
                type="button"
                className="sim-pill"
                onClick={() => updateConfig({ landscape: 'non-convex', optimizer: 'momentum', learningRate: 0.32, initialW: 3.1, momentumBeta: 0.88 })}
              >
                Escape Trap
              </button>
            </div>
          </div>
        </div>

        <div className="stage__legend">
          <span><i className="lg" />Current θ</span>
          <span><i className="lg lg--mine" />Trajectory history</span>
          <span><i className="lg lg--res" />Global minimum</span>
          <span><i className="lg lg--fail">×</i>Divergence / Trap</span>
        </div>
      </div>
    </section>
  );
}
