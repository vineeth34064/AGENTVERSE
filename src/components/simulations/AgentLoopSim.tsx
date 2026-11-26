import { useEffect, useState } from 'react';
import {
  Check,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  SkipForward,
  X,
} from 'lucide-react';
import {
  AGENT_SCENARIOS,
  AgentArchitectureId,
  AgentConfig,
  AgentScenarioId,
  AgentState,
  createAgentState,
  resolveApproval,
  stepAgent,
} from '../../engines/agentRuntime';
import { IsoBlock, IsoCylinder, IsoPill, IsoSvgDefs } from './IsoPrimitives';

interface AgentLoopSimProps {
  preset?: Record<string, unknown>;
  presetTrigger?: string;
  onChallengePass?: () => void;
  compact?: boolean;
}

export function AgentLoopSim({
  preset,
  presetTrigger,
  onChallengePass,
  compact = false,
}: AgentLoopSimProps) {
  const [config, setConfig] = useState<AgentConfig>({
    scenarioId: 'latency-audit',
    architecture: 'react',
    injectToolError: false,
    humanApprovalGate: true,
    strictSandbox: true,
    memoryThreshold: 0.5,
  });

  const [state, setState] = useState<AgentState>(() => createAgentState(config));
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!preset) return;
    const next: AgentConfig = {
      scenarioId: (preset.scenarioId as AgentScenarioId) ?? 'latency-audit',
      architecture: (preset.architecture as AgentArchitectureId) ?? 'react',
      injectToolError: typeof preset.injectToolError === 'boolean' ? preset.injectToolError : false,
      humanApprovalGate: typeof preset.humanApprovalGate === 'boolean' ? preset.humanApprovalGate : true,
      strictSandbox: typeof preset.strictSandbox === 'boolean' ? preset.strictSandbox : true,
      memoryThreshold: typeof preset.memoryThreshold === 'number' ? preset.memoryThreshold : 0.5,
    };
    setPlaying(false);
    setConfig(next);
    setState(createAgentState(next));
  }, [presetTrigger]);

  const updateConfig = (partial: Partial<AgentConfig>) => {
    const next = { ...config, ...partial };
    setPlaying(false);
    setConfig(next);
    setState(createAgentState(next));
  };

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setState((prev) => {
        if (
          prev.phase === 'completed' ||
          prev.phase === 'blocked' ||
          prev.phase === 'await-approval'
        ) {
          setPlaying(false);
          return prev;
        }
        return stepAgent(prev);
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [playing]);

  // Challenge check: Latency Audit with injected tool error recovered + human approval approved + strict sandbox + completed
  useEffect(() => {
    if (
      config.scenarioId === 'latency-audit' &&
      state.phase === 'completed' &&
      state.errorRecovered &&
      state.approvalDecision === 'approved' &&
      config.strictSandbox
    ) {
      onChallengePass?.();
    }
  }, [
    config.scenarioId,
    config.strictSandbox,
    onChallengePass,
    state.approvalDecision,
    state.errorRecovered,
    state.phase,
  ]);

  const scenario = AGENT_SCENARIOS[config.scenarioId];

  const guardLevel =
    state.guardrailStatus === 'breached'
      ? 'bad'
      : state.guardrailStatus === 'gate-pending'
        ? 'warn'
        : 'good';

  const guardText =
    state.guardrailStatus === 'breached'
      ? 'Breached!'
      : state.guardrailStatus === 'gate-pending'
        ? 'Gate Pending'
        : state.guardrailStatus === 'injection-blocked'
          ? 'Injection Blocked'
          : 'Protected';

  const latestTrace = state.trace[state.trace.length - 1];

  return (
    <section className={`card stage ${fullscreen ? 'is-full' : ''}`}>
      <div className="stage__top">
        <div className="stage__hud">
          <div className="chip" data-level={state.phase === 'completed' ? 'good' : state.phase === 'blocked' ? 'bad' : 'none'}>
            <span className="chip__label">Phase</span>
            <span className="chip__value" style={{ textTransform: 'capitalize' }}>
              {state.phase.replace('-', ' ')}
            </span>
          </div>
          <div className="chip" data-level="none">
            <span className="chip__label">Steps</span>
            <span className="chip__value">
              {state.stepCount}/{state.maxSteps}
            </span>
          </div>
          <div className="chip" data-level="none">
            <span className="chip__label">Tokens</span>
            <span className="chip__value">{state.tokensUsed}</span>
          </div>
          <div className="chip" data-level="none">
            <span className="chip__label">Recalled Mem</span>
            <span className="chip__value">{state.recalledMemories.length}</span>
          </div>
          <div className="chip" data-level={guardLevel}>
            <span className="chip__label">Guardrail</span>
            <span className="chip__value">{guardText}</span>
          </div>
        </div>

        <div className="stage__tools">
          {state.phase === 'await-approval' && (
            <>
              <button
                type="button"
                className="btn-pop"
                style={{ height: 29, padding: '0 10px', fontSize: 11.5, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                onClick={() => {
                  setState((s) => resolveApproval(s, true));
                  setPlaying(true);
                }}
              >
                <Check size={14} /> Approve Tool
              </button>
              <button
                type="button"
                className="tool"
                style={{ background: 'var(--c-f8d5cf)', color: 'var(--c-7d241d)' }}
                onClick={() => setState((s) => resolveApproval(s, false))}
              >
                <X size={14} /> Reject
              </button>
            </>
          )}

          <button
            type="button"
            className="tool"
            onClick={() => {
              setPlaying(false);
              setState(createAgentState(config));
            }}
          >
            <RotateCcw size={14} /> <span>Reset</span>
          </button>
          <button
            type="button"
            className="tool"
            disabled={state.phase === 'completed' || state.phase === 'blocked' || state.phase === 'await-approval'}
            onClick={() => {
              setPlaying(false);
              setState((s) => stepAgent(s));
            }}
          >
            <SkipForward size={14} /> <span>Step</span>
          </button>
          <button
            type="button"
            className={`tool ${playing ? 'is-on' : ''}`}
            disabled={state.phase === 'await-approval' || state.phase === 'completed' || state.phase === 'blocked'}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            <span>{playing ? 'Pause' : 'Play Loop'}</span>
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
          <svg className="stage-svg" viewBox="0 0 760 276" preserveAspectRatio="xMidYMid meet">
            <IsoSvgDefs prefix="ag" />
            <rect x="0" y="0" width="760" height="276" fill="url(#ag-grid)" mask="url(#ag-mask)" />

            {/* Links between isometric blocks */}
            <path
              d="M118,64 L196,60"
              className={`link ${state.activeLink === 'goal->reasoner' ? 'link--beat' : ''}`}
              markerEnd="url(#ag-arrow)"
            />
            <path
              d="M254,104 L254,124"
              className={`link ${state.activeLink === 'memory->reasoner' ? 'link--beat' : ''}`}
              markerEnd="url(#ag-arrow)"
            />
            <path
              d="M312,60 L378,62"
              className={`link ${state.activeLink === 'reasoner->guardrail' ? 'link--beat' : ''}`}
              markerEnd="url(#ag-arrow)"
            />
            <path
              d="M478,60 L540,58"
              className={`link ${
                state.guardrailStatus === 'injection-blocked'
                  ? 'link--cut'
                  : state.activeLink === 'guardrail->tools'
                    ? 'link--beat'
                    : ''
              }`}
              markerEnd="url(#ag-arrow)"
            />
            <path
              d="M546,84 Q425,148 296,154"
              className={`link link--dashed ${state.activeLink === 'tools->memory' ? 'link--beat' : ''}`}
              markerEnd="url(#ag-arrow)"
            />
            <path
              d="M306,82 Q445,106 544,142"
              className={`link link--dashed ${state.activeLink === 'reasoner->evaluator' ? 'link--beat' : ''}`}
              markerEnd="url(#ag-arrow)"
            />

            {/* Isometric Agent Architecture Nodes */}
            <IsoBlock
              prefix="ag"
              cx={72}
              cy={64}
              w={46}
              h={22}
              depth={20}
              tone="orange"
              label="User Goal"
              active={state.activeNode === 'goal'}
            />
            <IsoBlock
              prefix="ag"
              cx={254}
              cy={60}
              w={58}
              h={24}
              depth={20}
              tone="blue"
              label={config.architecture === 'react' ? 'ReAct LLM' : config.architecture === 'plan-execute' ? 'Planner DAG' : 'Supervisor'}
              active={state.activeNode === 'reasoner'}
            />
            <IsoCylinder
              prefix="ag"
              cx={254}
              cy={140}
              rx={36}
              ry={13}
              height={22}
              label="Memory"
              sublabel={`${state.recalledMemories.length} recalled (τ=${config.memoryThreshold.toFixed(2)})`}
              active={state.activeNode === 'memory'}
            />
            <IsoBlock
              prefix="ag"
              cx={428}
              cy={62}
              w={50}
              h={22}
              depth={20}
              tone={state.guardrailStatus === 'breached' ? 'orange' : 'green'}
              label="Guardrail"
              active={state.activeNode === 'guardrail'}
              alert={state.guardrailStatus === 'breached' || state.phase === 'await-approval'}
            />
            <IsoPill
              x={428}
              y={22}
              width={118}
              text={config.strictSandbox ? 'Strict Allowlist' : 'Unrestricted!'}
              tone={config.strictSandbox ? 'good' : 'bad'}
            />
            <IsoBlock
              prefix="ag"
              cx={596}
              cy={58}
              w={56}
              h={22}
              depth={18}
              tone="yellow"
              label="Tool Sandbox"
              sublabel="JSON-RPC / MCP"
              active={state.activeNode === 'tools'}
              alert={latestTrace?.status === 'error'}
            />
            <IsoBlock
              prefix="ag"
              cx={596}
              cy={146}
              w={52}
              h={20}
              depth={16}
              tone="purple"
              label="Evaluator"
              sublabel={state.phase === 'completed' ? 'Verified ✓' : 'Observing…'}
              active={state.activeNode === 'evaluator'}
            />

            {state.phase === 'await-approval' && (
              <IsoPill x={428} y={108} width={145} text="Human Approval Needed!" tone="warn" />
            )}
            {state.guardrailStatus === 'injection-blocked' && (
              <IsoPill x={508} y={22} width={155} text="Injection Blocked ✓" tone="good" />
            )}
            {state.guardrailStatus === 'breached' && (
              <IsoPill x={596} y={22} width={160} text="Exfiltration Breach!" tone="bad" />
            )}

            {/* Live Trajectory Inspector Strip */}
            <rect x="14" y="206" width="732" height="62" rx="10" fill="var(--iso-card-bg)" stroke="var(--line-strong)" strokeWidth="1.2" />
            <text x="26" y="224" fontSize="9.5" fontWeight="800" fill="var(--muted)" letterSpacing="0.05em">
              GOAL: {scenario.goal.toUpperCase()}
            </text>
            <text
              x="26"
              y="243"
              fontSize="11"
              fontWeight="800"
              fill={
                latestTrace?.status === 'error'
                  ? 'var(--c-c0392b)'
                  : latestTrace?.status === 'blocked'
                    ? 'var(--c-6d4a0c)'
                    : 'var(--iso-text)'
              }
            >
              {latestTrace
                ? `[Step ${latestTrace.step}] ${latestTrace.title} — ${latestTrace.detail.slice(0, 74)}`
                : 'Press "Step" or "Play Loop" to start autonomous execution.'}
            </text>
            <text x="26" y="259" fontSize="9.5" fontWeight="600" fill="var(--muted)">
              {latestTrace?.toolArgs
                ? `Args: ${latestTrace.toolArgs}`
                : latestTrace?.toolOutput
                  ? `Output: ${latestTrace.toolOutput.slice(0, 90)}`
                  : state.finalOutcome ?? `Trace events: ${state.trace.length} · Latency: ${state.latencyTotalMs}ms`}
            </text>
          </svg>
        </div>

        {/* Interactive Parameter Dock */}
        <div className="sim-dock">
          <div className="sim-ctrl" style={{ minWidth: 185 }}>
            <div className="sim-ctrl__head"><span>Mission Scenario</span></div>
            <select
              className="sim-select"
              value={config.scenarioId}
              onChange={(e) => updateConfig({ scenarioId: e.target.value as AgentScenarioId })}
            >
              <option value="latency-audit">Q3 Latency Audit &amp; Patch</option>
              <option value="mcp-research">MCP Schema Discovery</option>
              <option value="prompt-injection">Prompt Injection Defense</option>
            </select>
          </div>

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Pattern</span></div>
            <div className="sim-pills">
              {(['react', 'plan-execute', 'supervisor'] as AgentArchitectureId[]).map((arch) => (
                <button
                  key={arch}
                  type="button"
                  className={`sim-pill ${config.architecture === arch ? 'is-on' : ''}`}
                  onClick={() => updateConfig({ architecture: arch })}
                >
                  {arch === 'react' ? 'ReAct' : arch === 'plan-execute' ? 'Plan-Exec' : 'Supervisor'}
                </button>
              ))}
            </div>
          </div>

          <div className="sim-ctrl">
            <div className="sim-ctrl__head"><span>Failure &amp; Safety Controls</span></div>
            <div className="sim-pills">
              <button
                type="button"
                className={`sim-pill ${config.injectToolError ? 'sim-pill--warn is-on' : ''}`}
                onClick={() => updateConfig({ injectToolError: !config.injectToolError })}
              >
                <ShieldAlert size={11} /> 429 Error: {config.injectToolError ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                className={`sim-pill ${config.humanApprovalGate ? 'is-on' : ''}`}
                onClick={() => updateConfig({ humanApprovalGate: !config.humanApprovalGate })}
              >
                Human Gate: {config.humanApprovalGate ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                className={`sim-pill ${config.strictSandbox ? 'is-on' : 'sim-pill--warn is-on'}`}
                onClick={() => updateConfig({ strictSandbox: !config.strictSandbox })}
              >
                Sandbox: {config.strictSandbox ? 'STRICT' : 'OPEN'}
              </button>
            </div>
          </div>

          <div className="sim-ctrl" style={{ width: 120 }}>
            <div className="sim-ctrl__head">
              <span>Memory τ</span>
              <span className="sim-ctrl__val">{config.memoryThreshold.toFixed(2)}</span>
            </div>
            <input
              className="sim-slider"
              type="range"
              min="0.10"
              max="0.95"
              step="0.05"
              value={config.memoryThreshold}
              onChange={(e) => updateConfig({ memoryThreshold: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        <div className="stage__legend">
          <span><i className="lg lg--res" />Active / Verified</span>
          <span><i className="lg lg--slow" />Human Gate Paused</span>
          <span><i className="lg lg--fail">×</i>429 Fault / Injection Breach</span>
        </div>
      </div>
    </section>
  );
}
