import { useEffect, useMemo, useState } from 'react';
import { Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import {
  RAG_CORPUS,
  RAG_PRESET_QUERIES,
  RAGConfig,
  runRAGPipeline,
  SimilarityMetric,
} from '../../engines/ragPipeline';
import { IsoBlock, IsoCylinder, IsoPill, IsoSvgDefs } from './IsoPrimitives';

interface RagPipelineSimProps {
  preset?: Record<string, unknown>;
  presetTrigger?: string;
  onChallengePass?: () => void;
  compact?: boolean;
}

export function RagPipelineSim({
  preset,
  presetTrigger,
  onChallengePass,
  compact = false,
}: RagPipelineSimProps) {
  const [config, setConfig] = useState<RAGConfig>({
    query: RAG_PRESET_QUERIES[0]!,
    chunkSize: 180,
    chunkOverlap: 40,
    topK: 2,
    hybridAlpha: 0.55,
    metric: 'cosine',
    rerankEnabled: true,
  });
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!preset) return;
    setConfig((prev) => ({
      ...prev,
      query:
        typeof preset.queryIndex === 'number'
          ? RAG_PRESET_QUERIES[preset.queryIndex] ?? prev.query
          : prev.query,
      chunkSize: typeof preset.chunkSize === 'number' ? preset.chunkSize : prev.chunkSize,
      chunkOverlap: typeof preset.chunkOverlap === 'number' ? preset.chunkOverlap : prev.chunkOverlap,
      topK: typeof preset.topK === 'number' ? preset.topK : prev.topK,
      hybridAlpha: typeof preset.hybridAlpha === 'number' ? preset.hybridAlpha : prev.hybridAlpha,
      metric: (preset.metric as SimilarityMetric) ?? prev.metric,
      rerankEnabled: typeof preset.rerankEnabled === 'boolean' ? preset.rerankEnabled : prev.rerankEnabled,
    }));
  }, [presetTrigger]);

  const result = useMemo(() => runRAGPipeline(config), [config]);

  // Challenge check: MCP security query, Faithfulness = Grounded, severedCount = 0, recallAtK >= 1, contextTokens <= 140
  useEffect(() => {
    if (
      result.faithfulness === 'grounded' &&
      result.severedCount === 0 &&
      result.recallAtK >= 0.99 &&
      result.contextTokens <= 140 &&
      config.rerankEnabled
    ) {
      onChallengePass?.();
    }
  }, [config.rerankEnabled, onChallengePass, result]);

  const faithLevel =
    result.faithfulness === 'grounded'
      ? 'good'
      : result.faithfulness === 'severed'
        ? 'warn'
        : 'bad';

  const faithLabel =
    result.faithfulness === 'grounded'
      ? 'Grounded'
      : result.faithfulness === 'severed'
        ? 'Severed Chunk!'
        : 'Low Recall!';

  const mapVecX = (v: number) => 595 + v * 84;
  const mapVecY = (v: number) => 104 - v * 52;

  return (
    <section className={`card stage ${fullscreen ? 'is-full' : ''}`}>
      <div className="stage__top">
        <div className="stage__hud">
          <div className="chip" data-level="none">
            <span className="chip__label">Total Chunks</span>
            <span className="chip__value">{result.chunks.length}</span>
          </div>
          <div className="chip" data-level={result.severedCount > 0 ? 'warn' : 'good'}>
            <span className="chip__label">Severed Hits</span>
            <span className="chip__value">{result.severedCount}</span>
          </div>
          <div className="chip" data-level={result.recallAtK >= 1 ? 'good' : 'bad'}>
            <span className="chip__label">Recall@{config.topK}</span>
            <span className="chip__value">{Math.round(result.recallAtK * 100)}%</span>
          </div>
          <div className="chip" data-level={result.contextTokens > 180 ? 'warn' : 'none'}>
            <span className="chip__label">Ctx Tokens</span>
            <span className="chip__value">~{result.contextTokens}</span>
          </div>
          <div className="chip" data-level={faithLevel}>
            <span className="chip__label">Faithfulness</span>
            <span className="chip__value">{faithLabel}</span>
          </div>
        </div>

        <div className="stage__tools">
          <button
            type="button"
            className="tool"
            onClick={() =>
              setConfig({
                query: RAG_PRESET_QUERIES[0]!,
                chunkSize: 180,
                chunkOverlap: 40,
                topK: 2,
                hybridAlpha: 0.55,
                metric: 'cosine',
                rerankEnabled: true,
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
            <IsoSvgDefs prefix="rag" />
            <rect x="0" y="0" width="760" height="272" fill="url(#rag-grid)" mask="url(#rag-mask)" />

            {/* Left Top: Isometric RAG Dataflow */}
            <path d="M98,66 L195,105" className="link link--beat" markerEnd="url(#rag-arrow-active)" />
            <path d="M262,102 L346,66" className="link link--beat" markerEnd="url(#rag-arrow-active)" />
            <path d="M262,135 L335,165" className="link" markerEnd="url(#rag-arrow)" />

            <IsoBlock
              prefix="rag"
              cx={68}
              cy={58}
              w={48}
              h={22}
              depth={22}
              tone="orange"
              label="Query"
              sublabel="Embed + BM25"
              active
            />
            <IsoCylinder
              prefix="rag"
              cx={224}
              cy={92}
              rx={34}
              ry={14}
              height={28}
              label="Vector DB"
              sublabel={`${result.chunks.length} chunks`}
              active
            />
            <IsoBlock
              prefix="rag"
              cx={382}
              cy={56}
              w={52}
              h={23}
              depth={22}
              tone={config.rerankEnabled ? 'green' : 'yellow'}
              label={config.rerankEnabled ? 'Reranker' : 'Raw Top-K'}
              sublabel={config.rerankEnabled ? 'Cross-Encoder' : 'No Rerank'}
              active={config.rerankEnabled}
            />
            <IsoBlock
              prefix="rag"
              cx={382}
              cy={162}
              w={54}
              h={24}
              depth={22}
              tone={result.faithfulness === 'grounded' ? 'blue' : 'orange'}
              label="LLM Answer"
              sublabel={`~${result.contextTokens} ctx tok`}
              alert={result.faithfulness !== 'grounded'}
            />

            <IsoPill
              x={145}
              y={104}
              width={92}
              text={`α=${config.hybridAlpha.toFixed(2)} ${config.metric}`}
            />

            {/* Right Top: 2D Embedding Vector Space Scatter */}
            <rect x="462" y="10" width="284" height="162" rx="11" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="476" y="29" fontSize="9.5" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              2D EMBEDDING VECTOR SPACE ({config.metric.toUpperCase()})
            </text>
            <line x1="478" y1="104" x2="730" y2="104" stroke="var(--line)" strokeWidth="1" />
            <line x1="595" y1="36" x2="595" y2="164" stroke="var(--line)" strokeWidth="1" />

            {/* Lines from query vector to Top-K hits */}
            {result.retrieved.map((hit) => (
              <line
                key={`line-${hit.id}`}
                x1={mapVecX(result.queryVec2d[0])}
                y1={mapVecY(result.queryVec2d[1])}
                x2={mapVecX(hit.vec2d[0])}
                y2={mapVecY(hit.vec2d[1])}
                stroke="var(--c-3fa456)"
                strokeDasharray="4 3"
                strokeWidth="1.6"
              />
            ))}

            {/* Chunk dots */}
            {result.chunks.map((c) => {
              const isHit = result.retrieved.some((r) => r.id === c.id);
              const px = mapVecX(c.vec2d[0]);
              const py = mapVecY(c.vec2d[1]);
              return (
                <circle
                  key={c.id}
                  cx={px}
                  cy={py}
                  r={isHit ? 5.5 : 3.2}
                  fill={c.severedCritical ? '#e5534b' : isHit ? '#9fd28f' : '#a9c5e8'}
                  stroke="var(--ink)"
                  strokeWidth={isHit ? 1.5 : 0.9}
                  opacity={isHit ? 1 : 0.65}
                />
              );
            })}

            {/* Query star */}
            <circle
              cx={mapVecX(result.queryVec2d[0])}
              cy={mapVecY(result.queryVec2d[1])}
              r="7"
              fill="#f3b47f"
              stroke="var(--ink)"
              strokeWidth="2"
            />
            <text
              x={mapVecX(result.queryVec2d[0]) + 10}
              y={mapVecY(result.queryVec2d[1]) + 3}
              fontSize="9.5"
              fontWeight="800"
              fill="var(--iso-text)"
            >
              Query
            </text>

            {/* Bottom Strip: Top Retrieved Chunks + Grounded Answer */}
            <rect x="14" y="196" width="732" height="68" rx="10" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="26" y="214" fontSize="9.5" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              RETRIEVED TOP-{config.topK} EVIDENCE &amp; GROUNDED OUTPUT
            </text>
            <text x="26" y="233" fontSize="10.5" fontWeight="700" fill={result.faithfulness === 'grounded' ? 'var(--c-24521c)' : 'var(--c-7d241d)'}>
              {result.groundedAnswer.slice(0, 102)}{result.groundedAnswer.length > 102 ? '…' : ''}
            </text>
            <text x="26" y="252" fontSize="9.5" fontWeight="600" fill="var(--muted)">
              Top Hit: [{result.retrieved[0]?.docTitle ?? 'None'}] · Score {((result.retrieved[0]?.finalScore ?? 0) * 100).toFixed(0)}% ·{' '}
              {result.retrieved[0]?.severedCritical ? '⚠ Boundary severed mid-sentence!' : '✓ Boundary intact'} · Corpus: {RAG_CORPUS.length} docs
            </text>
          </svg>
        </div>

        {/* Interactive Parameter Dock */}
        <div className="sim-dock">
          <div className="sim-ctrl" style={{ minWidth: 210 }}>
            <div className="sim-ctrl__head"><span>Query</span></div>
            <select
              className="sim-select"
              value={config.query}
              onChange={(e) => setConfig((c) => ({ ...c, query: e.target.value }))}
            >
              {RAG_PRESET_QUERIES.map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>
          </div>

          <div className="sim-ctrl" style={{ width: 120 }}>
            <div className="sim-ctrl__head">
              <span>Chunk Size</span>
              <span className="sim-ctrl__val">{config.chunkSize}c</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="50"
              max="300"
              step="10"
              value={config.chunkSize}
              onChange={(e) => setConfig((c) => ({ ...c, chunkSize: parseInt(e.target.value, 10) }))}
            />
          </div>

          <div className="sim-ctrl" style={{ width: 112 }}>
            <div className="sim-ctrl__head">
              <span>Overlap</span>
              <span className="sim-ctrl__val">{config.chunkOverlap}c</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="0"
              max="80"
              step="5"
              value={config.chunkOverlap}
              onChange={(e) => setConfig((c) => ({ ...c, chunkOverlap: parseInt(e.target.value, 10) }))}
            />
          </div>

          <div className="sim-ctrl" style={{ width: 115 }}>
            <div className="sim-ctrl__head">
              <span>Hybrid α</span>
              <span className="sim-ctrl__val">{config.hybridAlpha.toFixed(2)}</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.hybridAlpha}
              onChange={(e) => setConfig((c) => ({ ...c, hybridAlpha: parseFloat(e.target.value) }))}
            />
          </div>

          <div className="sim-ctrl" style={{ width: 80 }}>
            <div className="sim-ctrl__head">
              <span>Top-K</span>
              <span className="sim-ctrl__val">{config.topK}</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="1"
              max="5"
              step="1"
              value={config.topK}
              onChange={(e) => setConfig((c) => ({ ...c, topK: parseInt(e.target.value, 10) }))}
            />
          </div>

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Pipeline Toggles</span></div>
            <div className="sim-pills">
              <button
                type="button"
                className={`sim-pill ${config.rerankEnabled ? 'is-on' : ''}`}
                onClick={() => setConfig((c) => ({ ...c, rerankEnabled: !c.rerankEnabled }))}
              >
                Rerank: {config.rerankEnabled ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                className="sim-pill is-on"
                onClick={() =>
                  setConfig((c) => ({
                    ...c,
                    metric: c.metric === 'cosine' ? 'euclidean' : 'cosine',
                  }))
                }
              >
                {config.metric === 'cosine' ? 'Cosine' : 'Euclidean'}
              </button>
            </div>
          </div>
        </div>

        <div className="stage__legend">
          <span><i className="lg" />User Query Vector</span>
          <span><i className="lg lg--res" />Retrieved Top-K Hit</span>
          <span><i className="lg lg--fail">×</i>Severed Chunk Boundary</span>
        </div>
      </div>
    </section>
  );
}
