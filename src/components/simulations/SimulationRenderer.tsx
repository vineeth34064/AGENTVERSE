import { SimulationId } from '../../types/curriculum';
import { GradientDescentSim } from './GradientDescentSim';
import { NeuralNetSim } from './NeuralNetSim';
import { TransformerSim } from './TransformerSim';
import { RagPipelineSim } from './RagPipelineSim';
import { AgentLoopSim } from './AgentLoopSim';

interface SimulationRendererProps {
  simulationId: SimulationId;
  preset?: Record<string, unknown>;
  presetTrigger?: string;
  onChallengePass?: () => void;
  compact?: boolean;
}

export function SimulationRenderer({
  simulationId,
  preset,
  presetTrigger,
  onChallengePass,
  compact = false,
}: SimulationRendererProps) {
  switch (simulationId) {
    case 'gradient-descent':
      return (
        <GradientDescentSim
          preset={preset}
          presetTrigger={presetTrigger}
          onChallengePass={onChallengePass}
          compact={compact}
        />
      );
    case 'neural-net':
      return (
        <NeuralNetSim
          preset={preset}
          presetTrigger={presetTrigger}
          onChallengePass={onChallengePass}
          compact={compact}
        />
      );
    case 'transformer-attention':
      return (
        <TransformerSim
          preset={preset}
          presetTrigger={presetTrigger}
          onChallengePass={onChallengePass}
          compact={compact}
        />
      );
    case 'rag-pipeline':
      return (
        <RagPipelineSim
          preset={preset}
          presetTrigger={presetTrigger}
          onChallengePass={onChallengePass}
          compact={compact}
        />
      );
    case 'agent-loop':
      return (
        <AgentLoopSim
          preset={preset}
          presetTrigger={presetTrigger}
          onChallengePass={onChallengePass}
          compact={compact}
        />
      );
  }
}
