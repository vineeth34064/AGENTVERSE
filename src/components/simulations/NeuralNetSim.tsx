import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Maximize2, Minimize2 } from 'lucide-react';
import {
  ActivationId,
  computeDecisionGrid,
  createNNState,
  DatasetPresetId,
  NN_DATASETS,
  NNState,
  trainOneEpoch,
} from '../../engines/neuralNet';
import { IsoSvgDefs } from './IsoPrimitives';

interface NeuralNetSimProps {
  preset?: Record<string, unknown>;
  presetTrigger?: string;
  onChallengePass?: () => void;
  compact?: boolean;
}

export function NeuralNetSim({
  preset,
  presetTrigger,
  onChallengePass,
  compact = false,
}: NeuralNetSimProps) {
  const [activation, setActivation] = useState<ActivationId>('tanh');
  const [dataset, setDataset] = useState<DatasetPresetId>('xor');
  const [learningRate, setLearningRate] = useState(0.65);
  const [weightPreset, setWeightPreset] = useState<'balanced' | 'vanishing' | 'exploding'>('balanced');
  const [pulseMode, setPulseMode] = useState<'forward' | 'backward'>('forward');
  const [selectedNode, setSelectedNode] = useState<'h0' | 'h1' | 'h2' | 'out'>('h0');
  const [state, setState] = useState<NNState>(() => createNNState('tanh', 'xor', 0.65, 'balanced'));
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!preset) return;
    const act = (preset.activation as ActivationId) ?? 'tanh';
    const ds = (preset.dataset as DatasetPresetId) ?? 'xor';
    const lr = typeof preset.learningRate === 'number' ? preset.learningRate : 0.65;
    const wp = (preset.weightPreset as 'balanced' | 'vanishing' | 'exploding') ?? 'balanced';
    const pm = (preset.pulseMode as 'forward' | 'backward') ?? 'forward';
    setPlaying(Boolean(preset.autoTrain));
    setActivation(act);
    setDataset(ds);
    setLearningRate(lr);
    setWeightPreset(wp);
    setPulseMode(pm);
    setState(createNNState(act, ds, lr, wp));
  }, [presetTrigger]);

  const rebuild = (
    act = activation,
    ds = dataset,
    lr = learningRate,
    wp = weightPreset
  ) => {
    setPlaying(false);
    setState(createNNState(act, ds, lr, wp));
  };

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setPulseMode((m) => (m === 'forward' ? 'backward' : 'forward'));
      setState((prev) => {
        const next = { ...prev, learningRate };
        const updated = trainOneEpoch(next);
        if (updated.epoch >= 140) setPlaying(false);
        return updated;
      });
    }, 140);
    return () => window.clearInterval(timer);
  }, [learningRate, playing]);

  const meanLoss = state.lossHistory[state.lossHistory.length - 1] ?? state.forward.loss;

  // Challenge check: Solve XOR with 100% accuracy and meanLoss < 0.15
  useEffect(() => {
    if (dataset === 'xor' && state.accuracy >= 1.0 && meanLoss < 0.15) {
      onChallengePass?.();
    }
  }, [dataset, meanLoss, onChallengePass, state.accuracy]);

  const gridCells = useMemo(
    () => computeDecisionGrid(state.weights, state.activation, 12),
    [state.activation, state.weights]
  );

  const statusLevel =
    state.status === 'healthy'
      ? meanLoss < 0.18
        ? 'good'
        : 'none'
      : state.status === 'exploding'
        ? 'bad'
        : 'warn';

  // Node positions in left network pane (width 435)
  const inNodes = [
    { id: 'x1', x: 75, y: 88, label: 'x₁', val: state.forward.x[0] },
    { id: 'x2', x: 75, y: 184, label: 'x₂', val: state.forward.x[1] },
  ];
  const hidNodes = [
    { id: 'h0' as const, x: 222, y: 58, label: 'h₁', a: state.forward.a1[0], d: state.backward.dL_dz1[0] },
    { id: 'h1' as const, x: 222, y: 136, label: 'h₂', a: state.forward.a1[1], d: state.backward.dL_dz1[1] },
    { id: 'h2' as const, x: 222, y: 214, label: 'h₃', a: state.forward.a1[2], d: state.backward.dL_dz1[2] },
  ];
  const outNode = {
    x: 372,
    y: 136,
    label: 'ŷ',
    a: state.forward.yHat,
    d: state.backward.dL_dz2,
  };

  return (
    <section className={`card stage ${fullscreen ? 'is-full' : ''}`}>
      <div className="stage__top">
        <div className="stage__hud">
          <div className="chip" data-level="none">
            <span className="chip__label">Epoch</span>
            <span className="chip__value">{state.epoch}</span>
          </div>
          <div className="chip" data-level={meanLoss < 0.15 ? 'good' : meanLoss > 1.2 ? 'bad' : 'none'}>
            <span className="chip__label">Mean Loss</span>
            <span className="chip__value">{meanLoss.toFixed(3)}</span>
          </div>
          <div className="chip" data-level={state.accuracy >= 1 ? 'good' : 'none'}>
            <span className="chip__label">Accuracy</span>
            <span className="chip__value">{Math.round(state.accuracy * 100)}%</span>
          </div>
          <div className="chip" data-level={statusLevel}>
            <span className="chip__label">Hidden ‖∇‖</span>
            <span className="chip__value">{state.backward.hiddenGradNorm.toFixed(3)}</span>
          </div>
          <div className="chip" data-level={statusLevel}>
            <span className="chip__label">Health</span>
            <span className="chip__value" style={{ textTransform: 'capitalize' }}>
              {state.status.replace('-', ' ')}
            </span>
          </div>
        </div>

        <div className="stage__tools">
          <button
            type="button"
            className="tool"
            onClick={() => rebuild()}
            title="Reset network weights"
          >
            <RotateCcw size={14} /> <span>Reset</span>
          </button>
          <button
            type="button"
            className="tool"
            onClick={() => {
              setPlaying(false);
              setState((s) => trainOneEpoch({ ...s, learningRate }));
            }}
            title="Run 1 training epoch"
          >
            <SkipForward size={14} /> <span>+1 Epoch</span>
          </button>
          <button
            type="button"
            className={`tool ${playing ? 'is-on' : ''}`}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span>{playing ? 'Pause' : 'Train'}</span>
          </button>
          {!compact && (
            <button type="button" className="tool" onClick={() => setFullscreen((f) => !f)}>
              {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
        </div>
      </div>

      <div className="stage__body">
        <div className="stage__canvas">
          <svg className="stage-svg" viewBox="0 0 760 270" preserveAspectRatio="xMidYMid meet">
            <IsoSvgDefs prefix="nn" />
            <rect x="0" y="0" width="760" height="270" fill="url(#nn-grid)" mask="url(#nn-mask)" />

            {/* Left Network Graph Panel */}
            <rect x="14" y="12" width="424" height="246" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="28" y="31" fontSize="10" fontWeight="800" fill="var(--muted)" letterSpacing="0.06em">
              2 → 3 → 1 MLP COMPUTATION GRAPH ({pulseMode === 'forward' ? 'FORWARD aᵢ' : 'BACKWARD δⱼ'})
            </text>

            {/* Input -> Hidden edges */}
            {hidNodes.map((h, hi) =>
              inNodes.map((inp, ii) => {
                const weight = state.weights.w1[hi]![ii]!;
                const strokeW = Math.min(4.2, Math.max(1.0, Math.abs(weight) * 1.4));
                const color = weight >= 0 ? 'var(--c-2f86ce)' : 'var(--rust)';
                return (
                  <g key={`${inp.id}-${h.id}`}>
                    <line
                      x1={inp.x}
                      y1={inp.y}
                      x2={h.x}
                      y2={h.y}
                      stroke={color}
                      strokeWidth={strokeW}
                      strokeOpacity="0.72"
                    />
                    {pulseMode === 'backward' && (
                      <circle
                        cx={(inp.x + h.x) / 2}
                        cy={(inp.y + h.y) / 2}
                        r="4"
                        fill={state.status === 'vanishing' ? '#e5534b' : '#b79ce6'}
                        stroke="var(--ink)"
                        strokeWidth="1.1"
                      />
                    )}
                    {pulseMode === 'forward' && (
                      <circle
                        cx={(inp.x + h.x) / 2}
                        cy={(inp.y + h.y) / 2}
                        r="3.8"
                        fill="#f3b47f"
                        stroke="var(--ink)"
                        strokeWidth="1.1"
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Hidden -> Output edges */}
            {hidNodes.map((h, hi) => {
              const weight = state.weights.w2[hi]!;
              const strokeW = Math.min(4.2, Math.max(1.0, Math.abs(weight) * 1.4));
              const color = weight >= 0 ? 'var(--c-3fa456)' : 'var(--rust)';
              return (
                <g key={`${h.id}-out`}>
                  <line
                    x1={h.x}
                    y1={h.y}
                    x2={outNode.x}
                    y2={outNode.y}
                    stroke={color}
                    strokeWidth={strokeW}
                    strokeOpacity="0.78"
                  />
                  <circle
                    cx={(h.x + outNode.x) / 2}
                    cy={(h.y + outNode.y) / 2}
                    r="4"
                    fill={pulseMode === 'backward' ? '#b79ce6' : '#9fd28f'}
                    stroke="var(--ink)"
                    strokeWidth="1.1"
                  />
                </g>
              );
            })}

            {/* Input Nodes */}
            {inNodes.map((n) => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r="22" fill="url(#nn-orange-top)" stroke="var(--iso-stroke)" strokeWidth="1.8" />
                <text x={n.x} y={n.y - 3} textAnchor="middle" fontSize="10.5" fontWeight="800" fill="var(--iso-text)">{n.label}</text>
                <text x={n.x} y={n.y + 11} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="var(--muted)">{n.val.toFixed(1)}</text>
              </g>
            ))}

            {/* Hidden Nodes */}
            {hidNodes.map((n) => {
              const isSel = selectedNode === n.id;
              return (
                <g key={n.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedNode(n.id)}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="24"
                    fill="url(#nn-blue-top)"
                    stroke={isSel ? 'var(--green-3)' : 'var(--iso-stroke)'}
                    strokeWidth={isSel ? 2.6 : 1.8}
                  />
                  <text x={n.x} y={n.y - 5} textAnchor="middle" fontSize="10" fontWeight="800" fill="var(--iso-text)">
                    {n.label} ({activation})
                  </text>
                  <text x={n.x} y={n.y + 7} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--iso-text)">
                    a={n.a.toFixed(2)}
                  </text>
                  <text x={n.x} y={n.y + 18} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--c-7d241d)">
                    δ={n.d.toFixed(3)}
                  </text>
                </g>
              );
            })}

            {/* Output Node */}
            <g style={{ cursor: 'pointer' }} onClick={() => setSelectedNode('out')}>
              <circle
                cx={outNode.x}
                cy={outNode.y}
                r="26"
                fill="url(#nn-green-top)"
                stroke={selectedNode === 'out' ? 'var(--green-3)' : 'var(--iso-stroke)'}
                strokeWidth={selectedNode === 'out' ? 2.6 : 1.8}
              />
              <text x={outNode.x} y={outNode.y - 6} textAnchor="middle" fontSize="11" fontWeight="800" fill="var(--iso-text)">
                ŷ = {outNode.a.toFixed(2)}
              </text>
              <text x={outNode.x} y={outNode.y + 7} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--muted)">
                target={state.forward.yTarget}
              </text>
              <text x={outNode.x} y={outNode.y + 19} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--c-7d241d)">
                δ₂={outNode.d.toFixed(2)}
              </text>
            </g>

            {/* Right Panel Top: Live 2D Decision Boundary */}
            <rect x="452" y="12" width="150" height="156" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="464" y="30" fontSize="9.5" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              DECISION BOUNDARY
            </text>
            <g transform="translate(468, 38)">
              {gridCells.map((cell, idx) => {
                const col = idx % 12;
                const row = Math.floor(idx / 12);
                const p = cell.yHat;
                const fill = p >= 0.5 ? `rgba(127, 194, 120, ${(0.2 + p * 0.65).toFixed(2)})` : `rgba(208, 104, 58, ${(0.2 + (1 - p) * 0.65).toFixed(2)})`;
                return <rect key={idx} x={col * 9.8} y={row * 9.8} width="9.8" height="9.8" fill={fill} />;
              })}
              {/* Plot ground-truth dataset points */}
              {NN_DATASETS[dataset].map((pt, i) => {
                const px = ((pt.x1 + 1.4) / 2.8) * 117.6;
                const py = ((1.4 - pt.x2) / 2.8) * 117.6;
                return (
                  <circle
                    key={i}
                    cx={px}
                    cy={py}
                    r="5"
                    fill={pt.y === 1 ? '#9fd28f' : '#e8834d'}
                    stroke="var(--ink)"
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>

            {/* Right Panel Top-Right: Layer Gradient Norms */}
            <rect x="612" y="12" width="134" height="156" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="624" y="30" fontSize="9.5" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              GRADIENT NORMS
            </text>
            {[
              { label: '‖∇W₁‖', val: state.backward.hiddenGradNorm, x: 638 },
              { label: '‖∇W₂‖', val: state.backward.outputGradNorm, x: 696 },
            ].map((bar) => {
              const h = Math.min(82, Math.max(4, bar.val * 55));
              return (
                <g key={bar.label}>
                  <rect x={bar.x} y={128 - h} width="28" height={h} rx="5" fill={bar.val < 0.015 ? '#e5534b' : '#7fc278'} stroke="var(--ink)" strokeWidth="1.3" />
                  <text x={bar.x + 14} y={122 - h} textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--iso-text)">
                    {bar.val.toFixed(2)}
                  </text>
                  <text x={bar.x + 14} y="144" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--muted)">
                    {bar.label}
                  </text>
                </g>
              );
            })}

            {/* Right Panel Bottom: Selected Node Inspector */}
            <rect x="452" y="178" width="294" height="80" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="466" y="197" fontSize="9.5" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              INSPECTOR · CLICK ANY NEURON ({selectedNode.toUpperCase()})
            </text>
            {selectedNode === 'out' ? (
              <>
                <text x="466" y="219" fontSize="10.5" fontWeight="700" fill="var(--iso-text)">
                  w₂ = [{state.weights.w2.map((v) => v.toFixed(2)).join(', ')}], b₂={state.weights.b2.toFixed(2)}
                </text>
                <text x="466" y="238" fontSize="10.5" fontWeight="600" fill="var(--muted)">
                  dL/dw₂ = [{state.backward.dW2.map((v) => v.toFixed(3)).join(', ')}]
                </text>
              </>
            ) : (
              (() => {
                const idx = selectedNode === 'h0' ? 0 : selectedNode === 'h1' ? 1 : 2;
                return (
                  <>
                    <text x="466" y="219" fontSize="10.5" fontWeight="700" fill="var(--iso-text)">
                      w₁[{idx + 1}] = [{state.weights.w1[idx]![0].toFixed(2)}, {state.weights.w1[idx]![1].toFixed(2)}], b={state.weights.b1[idx]!.toFixed(2)}
                    </text>
                    <text x="466" y="238" fontSize="10.5" fontWeight="600" fill="var(--muted)">
                      z={state.forward.z1[idx]!.toFixed(2)} → a={state.forward.a1[idx]!.toFixed(2)} · δ={state.backward.dL_dz1[idx]!.toFixed(4)}
                    </text>
                  </>
                );
              })()
            )}
          </svg>
        </div>

        {/* Interactive Parameter Dock */}
        <div className="sim-dock">
          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Dataset</span></div>
            <select
              className="sim-select"
              value={dataset}
              onChange={(e) => {
                const ds = e.target.value as DatasetPresetId;
                setDataset(ds);
                rebuild(activation, ds, learningRate, weightPreset);
              }}
            >
              <option value="xor">XOR (Non-Linear)</option>
              <option value="linear">Linearly Separable</option>
              <option value="circle">Inside Circle</option>
            </select>
          </div>

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Activation φ</span></div>
            <div className="sim-pills">
              {(['tanh', 'relu', 'sigmoid'] as ActivationId[]).map((act) => (
                <button
                  key={act}
                  type="button"
                  className={`sim-pill ${activation === act ? 'is-on' : ''}`}
                  onClick={() => {
                    setActivation(act);
                    rebuild(act, dataset, learningRate, weightPreset);
                  }}
                >
                  {act.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Weight Init</span></div>
            <div className="sim-pills">
              {(['balanced', 'vanishing', 'exploding'] as const).map((wp) => (
                <button
                  key={wp}
                  type="button"
                  className={`sim-pill ${wp !== 'balanced' ? 'sim-pill--warn' : ''} ${weightPreset === wp ? 'is-on' : ''}`}
                  onClick={() => {
                    setWeightPreset(wp);
                    rebuild(activation, dataset, learningRate, wp);
                  }}
                >
                  {wp}
                </button>
              ))}
            </div>
          </div>

          <div className="sim-ctrl" style={{ width: 135 }}>
            <div className="sim-ctrl__head">
              <span>Learning Rate</span>
              <span className="sim-ctrl__val">{learningRate.toFixed(2)}</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="0.05"
              max="1.50"
              step="0.05"
              value={learningRate}
              onChange={(e) => setLearningRate(parseFloat(e.target.value))}
            />
          </div>

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Signal View</span></div>
            <div className="sim-pills">
              <button
                type="button"
                className={`sim-pill ${pulseMode === 'forward' ? 'is-on' : ''}`}
                onClick={() => setPulseMode('forward')}
              >
                Forward a
              </button>
              <button
                type="button"
                className={`sim-pill ${pulseMode === 'backward' ? 'is-on' : ''}`}
                onClick={() => setPulseMode('backward')}
              >
                Backward δ
              </button>
            </div>
          </div>
        </div>

        <div className="stage__legend">
          <span><i className="lg" />Forward activation</span>
          <span><i className="lg lg--mine" />Backward gradient δ</span>
          <span><i className="lg lg--res" />Class 1 boundary</span>
          <span><i className="lg lg--fail">×</i>Vanishing / Exploding ∇</span>
        </div>
      </div>
    </section>
  );
}
