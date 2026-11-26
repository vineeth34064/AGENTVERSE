import { useEffect, useMemo, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import {
  ATTENTION_SCENARIOS,
  AttentionConfig,
  computeAttention,
  HeadRoleId,
  PromptPresetId,
} from '../../engines/transformerAttention';
import { IsoSvgDefs } from './IsoPrimitives';

interface TransformerSimProps {
  preset?: Record<string, unknown>;
  presetTrigger?: string;
  onChallengePass?: () => void;
  compact?: boolean;
}

export function TransformerSim({
  preset,
  presetTrigger,
  onChallengePass,
  compact = false,
}: TransformerSimProps) {
  const [config, setConfig] = useState<AttentionConfig>({
    scenarioId: 'coref',
    headId: 'coref',
    queryIndex: 5,
    causalMask: true,
    useScaling: true,
    queryBoost: 1.0,
    temperature: 0.8,
    topK: 4,
    topP: 0.9,
  });
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!preset) return;
    setConfig((prev) => ({
      ...prev,
      scenarioId: (preset.scenarioId as PromptPresetId) ?? prev.scenarioId,
      headId: (preset.headId as HeadRoleId) ?? prev.headId,
      queryIndex:
        typeof preset.queryIndex === 'number'
          ? preset.queryIndex
          : ATTENTION_SCENARIOS[(preset.scenarioId as PromptPresetId) ?? prev.scenarioId].defaultQueryIndex,
      causalMask: typeof preset.causalMask === 'boolean' ? preset.causalMask : prev.causalMask,
      useScaling: typeof preset.useScaling === 'boolean' ? preset.useScaling : prev.useScaling,
      temperature: typeof preset.temperature === 'number' ? preset.temperature : prev.temperature,
      topK: typeof preset.topK === 'number' ? preset.topK : prev.topK,
      topP: typeof preset.topP === 'number' ? preset.topP : prev.topP,
    }));
  }, [presetTrigger]);

  const result = useMemo(() => computeAttention(config), [config]);

  // Challenge check: scenario = code, causalMask ON, scaling ON, queryIndex = 7 ("state"), topAttendedIndex = 3 ("state" param), topK = 2, entropy > 0.70
  useEffect(() => {
    if (
      config.scenarioId === 'code' &&
      config.causalMask &&
      config.useScaling &&
      config.queryIndex === 7 &&
      result.topAttendedIndex === 3 &&
      config.topK === 2 &&
      result.entropyBits > 0.7
    ) {
      onChallengePass?.();
    }
  }, [
    config.causalMask,
    config.queryIndex,
    config.scenarioId,
    config.topK,
    config.useScaling,
    onChallengePass,
    result.entropyBits,
    result.topAttendedIndex,
  ]);

  const qToken = result.tokens[config.queryIndex] ?? '';
  const topToken = result.tokens[result.topAttendedIndex] ?? '';
  const nTokens = result.tokens.length;

  return (
    <section className={`card stage ${fullscreen ? 'is-full' : ''}`}>
      <div className="stage__top">
        <div className="stage__hud">
          <div className="chip" data-level="none">
            <span className="chip__label">Query Token</span>
            <span className="chip__value">"{qToken}"</span>
          </div>
          <div className="chip" data-level="good">
            <span className="chip__label">Top Attended</span>
            <span className="chip__value">
              "{topToken}" ({Math.round((result.selectedWeights[result.topAttendedIndex] ?? 0) * 100)}%)
            </span>
          </div>
          <div className="chip" data-level={!config.useScaling || result.entropyBits < 0.3 ? 'warn' : 'none'}>
            <span className="chip__label">Attn Entropy</span>
            <span className="chip__value">{result.entropyBits.toFixed(2)} bits</span>
          </div>
          <div className="chip" data-level={config.causalMask ? 'good' : 'warn'}>
            <span className="chip__label">Masking</span>
            <span className="chip__value">{config.causalMask ? 'Causal' : 'Bidirectional'}</span>
          </div>
          <div className="chip" data-level={config.useScaling ? 'none' : 'bad'}>
            <span className="chip__label">Scaling</span>
            <span className="chip__value">{config.useScaling ? '1 / √d_k' : 'UNSCALED!'}</span>
          </div>
        </div>

        <div className="stage__tools">
          <button
            type="button"
            className="tool"
            onClick={() =>
              setConfig({
                scenarioId: 'coref',
                headId: 'coref',
                queryIndex: 5,
                causalMask: true,
                useScaling: true,
                queryBoost: 1.0,
                temperature: 0.8,
                topK: 4,
                topP: 0.9,
              })
            }
          >
            <RotateCcw size={14} /> <span>Reset</span>
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
          <svg className="stage-svg" viewBox="0 0 760 272" preserveAspectRatio="xMidYMid meet">
            <IsoSvgDefs prefix="tf" />
            <rect x="0" y="0" width="760" height="272" fill="url(#tf-grid)" mask="url(#tf-mask)" />

            {/* Left Top: Token Ribbon & Attention Arcs */}
            <rect x="14" y="10" width="446" height="140" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="28" y="29" fontSize="10" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              CLICK ANY QUERY TOKEN TO INSPECT ATTENTION BEAMS ({config.headId.toUpperCase()} HEAD)
            </text>

            {/* Attention Arcs from Query Token to Key Tokens */}
            {result.tokens.map((tok, j) => {
              const slotW = 414 / nTokens;
              const qx = 30 + config.queryIndex * slotW + slotW / 2;
              const kx = 30 + j * slotW + slotW / 2;
              const weight = result.selectedWeights[j] ?? 0;
              const yBase = 104;
              const arcHeight = Math.min(58, Math.abs(qx - kx) * 0.34 + 14);
              const masked = config.causalMask && j > config.queryIndex;

              if (masked) return null;
              return (
                <path
                  key={`arc-${tok}-${j}`}
                  d={`M${qx},${yBase} Q${(qx + kx) / 2},${yBase - arcHeight} ${kx},${yBase}`}
                  fill="none"
                  stroke={j === result.topAttendedIndex ? 'var(--c-3fa456)' : 'var(--c-7c63d0)'}
                  strokeWidth={Math.max(0.8, weight * 7.5)}
                  strokeOpacity={Math.max(0.14, Math.min(0.95, weight * 1.4))}
                />
              );
            })}

            {/* Token Pills */}
            {result.tokens.map((tok, idx) => {
              const slotW = 414 / nTokens;
              const x = 30 + idx * slotW + 3;
              const w = slotW - 6;
              const isQuery = idx === config.queryIndex;
              const weight = result.selectedWeights[idx] ?? 0;
              const masked = config.causalMask && idx > config.queryIndex;

              return (
                <g
                  key={`tok-${idx}`}
                  style={{ cursor: 'pointer', opacity: masked ? 0.42 : 1 }}
                  onClick={() => setConfig((c) => ({ ...c, queryIndex: idx }))}
                >
                  <rect
                    x={x}
                    y={104}
                    width={w}
                    height={26}
                    rx={7}
                    fill={isQuery ? 'var(--green)' : weight > 0.2 ? 'var(--violet)' : 'var(--paper-2)'}
                    stroke={isQuery ? 'var(--ink)' : 'var(--line-strong)'}
                    strokeWidth={isQuery ? 1.9 : 1.2}
                  />
                  <text x={x + w / 2} y={121} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--iso-text)">
                    {tok}
                  </text>
                  <text x={x + w / 2} y={142} textAnchor="middle" fontSize="9" fontWeight="800" fill="var(--muted)">
                    {masked ? 'mask' : `${Math.round(weight * 100)}%`}
                  </text>
                </g>
              );
            })}

            {/* Left Bottom: Attention Dot-Product Score Bar */}
            <rect x="14" y="158" width="446" height="104" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="28" y="177" fontSize="10" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              Q·Kᵀ LOGITS → SOFTMAX WEIGHTS FOR "{qToken}"
            </text>
            {result.tokens.map((tok, j) => {
              const slotW = 414 / nTokens;
              const x = 32 + j * slotW;
              const w = result.selectedWeights[j] ?? 0;
              const raw = result.selectedRaw[j] ?? 0;
              const barH = Math.max(2, w * 46);
              return (
                <g key={`bar-${j}`}>
                  <rect
                    x={x + 6}
                    y={236 - barH}
                    width={slotW - 14}
                    height={barH}
                    rx="4"
                    fill={j === result.topAttendedIndex ? 'var(--c-3fa456)' : 'var(--c-2f86ce)'}
                    stroke="var(--ink)"
                    strokeWidth="1.1"
                  />
                  <text x={x + slotW / 2 - 1} y={231 - barH} textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--iso-text)">
                    {raw.toFixed(1)}
                  </text>
                  <text x={x + slotW / 2 - 1} y={251} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="var(--muted)">
                    {tok.slice(0, 6)}
                  </text>
                </g>
              );
            })}

            {/* Right Top: N x N Attention Heatmap Matrix */}
            <rect x="472" y="10" width="274" height="140" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="486" y="29" fontSize="9.5" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              N×N ATTENTION HEATMAP
            </text>
            <g transform="translate(534, 38)">
              {result.weightsMatrix.map((row, ri) =>
                row.map((val, ci) => {
                  const cellSize = Math.floor(96 / nTokens);
                  const masked = config.causalMask && ci > ri;
                  return (
                    <rect
                      key={`${ri}-${ci}`}
                      x={ci * cellSize}
                      y={ri * cellSize}
                      width={cellSize - 1.5}
                      height={cellSize - 1.5}
                      rx="2"
                      fill={
                        masked
                          ? 'var(--line)'
                          : `rgba(127, 194, 120, ${Math.max(0.08, Math.min(1, val * 1.6)).toFixed(2)})`
                      }
                      stroke={ri === config.queryIndex ? 'var(--ink)' : 'transparent'}
                      strokeWidth="1"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setConfig((c) => ({ ...c, queryIndex: ri }))}
                    />
                  );
                })
              )}
              <text x="-6" y="50" textAnchor="end" fontSize="8.5" fontWeight="700" fill="var(--muted)">
                Queries ↓
              </text>
              <text x="48" y="106" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="var(--muted)">
                Keys →
              </text>
            </g>

            {/* Right Bottom: Next-Token Sampling (Temp / Top-k / Top-p) */}
            <rect x="472" y="158" width="274" height="104" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="486" y="177" fontSize="9.5" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              NEXT-TOKEN DIST (T={config.temperature.toFixed(1)}, K={config.topK}, p={config.topP.toFixed(2)})
            </text>
            {result.samplingDist.slice(0, 5).map((cand, idx) => {
              const y = 186 + idx * 14;
              const barW = Math.max(2, cand.prob * 140);
              return (
                <g key={cand.token} style={{ opacity: cand.included ? 1 : 0.35 }}>
                  <text x="486" y={y + 9} fontSize="9.5" fontWeight="700" fill="var(--iso-text)">
                    {cand.token}
                  </text>
                  <rect
                    x="554"
                    y={y}
                    width={barW}
                    height="10"
                    rx="3"
                    fill={cand.included ? 'var(--c-3fa456)' : 'var(--muted-2)'}
                  />
                  <text x="734" y={y + 9} textAnchor="end" fontSize="9" fontWeight="700" fill="var(--muted)">
                    {(cand.prob * 100).toFixed(0)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Interactive Parameter Dock */}
        <div className="sim-dock">
          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Prompt</span></div>
            <select
              className="sim-select"
              value={config.scenarioId}
              onChange={(e) => {
                const sc = e.target.value as PromptPresetId;
                setConfig((c) => ({
                  ...c,
                  scenarioId: sc,
                  queryIndex: ATTENTION_SCENARIOS[sc].defaultQueryIndex,
                }));
              }}
            >
              <option value="coref">Pronoun Coreference</option>
              <option value="rag">RAG Context</option>
              <option value="code">Python Scope</option>
            </select>
          </div>

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Head</span></div>
            <div className="sim-pills">
              {(['coref', 'local', 'semantic'] as HeadRoleId[]).map((h) => (
                <button
                  key={h}
                  type="button"
                  className={`sim-pill ${config.headId === h ? 'is-on' : ''}`}
                  onClick={() => setConfig((c) => ({ ...c, headId: h }))}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Transformer Flags</span></div>
            <div className="sim-pills">
              <button
                type="button"
                className={`sim-pill ${config.causalMask ? 'is-on' : 'sim-pill--warn is-on'}`}
                onClick={() => setConfig((c) => ({ ...c, causalMask: !c.causalMask }))}
              >
                Causal: {config.causalMask ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                className={`sim-pill ${config.useScaling ? 'is-on' : 'sim-pill--warn is-on'}`}
                onClick={() => setConfig((c) => ({ ...c, useScaling: !c.useScaling }))}
              >
                1/√d_k: {config.useScaling ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="sim-ctrl" style={{ width: 118 }}>
            <div className="sim-ctrl__head">
              <span>Temp T</span>
              <span className="sim-ctrl__val">{config.temperature.toFixed(1)}</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="0.1"
              max="2.2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => setConfig((c) => ({ ...c, temperature: parseFloat(e.target.value) }))}
            />
          </div>

          <div className="sim-ctrl" style={{ width: 92 }}>
            <div className="sim-ctrl__head">
              <span>Top-K</span>
              <span className="sim-ctrl__val">{config.topK}</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="1"
              max="6"
              step="1"
              value={config.topK}
              onChange={(e) => setConfig((c) => ({ ...c, topK: parseInt(e.target.value, 10) }))}
            />
          </div>

          <div className="sim-ctrl" style={{ width: 105 }}>
            <div className="sim-ctrl__head">
              <span>Top-P</span>
              <span className="sim-ctrl__val">{config.topP.toFixed(2)}</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="0.30"
              max="1.00"
              step="0.05"
              value={config.topP}
              onChange={(e) => setConfig((c) => ({ ...c, topP: parseFloat(e.target.value) }))}
            />
          </div>
        </div>

        <div className="stage__legend">
          <span><i className="lg lg--res" />Strong attention weight</span>
          <span><i className="lg lg--mine" />Secondary weight</span>
          <span><i className="lg" />Masked future tokens = 0%</span>
        </div>
      </div>
    </section>
  );
}
