export type ThemeMode = 'dark' | 'light';

export type NavSection = 'home' | 'learn' | 'labs' | 'projects' | 'roadmap';

export type StageTab = 'simulation' | 'math-code' | 'challenge';

export type FolderColor =
  | 'sand'
  | 'green'
  | 'violet'
  | 'orange'
  | 'blue'
  | 'teal'
  | 'rose'
  | 'slate'
  | 'olive';

export type ChapterKind =
  | 'Intuition'
  | 'Visual'
  | 'Simulation'
  | 'Math'
  | 'Code'
  | 'Production'
  | 'Failure'
  | 'Challenge'
  | 'Check';

export type SimulationId =
  | 'gradient-descent'
  | 'neural-net'
  | 'transformer-attention'
  | 'rag-pipeline'
  | 'agent-loop';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Research';

export interface DiffChange {
  kind: 'add' | 'del' | 'mod';
  text: string;
}

export interface CompareTable {
  headers: [string, string, string];
  rows: Array<[string, string, string]>;
}

export interface LessonStep {
  id: string;
  label: string;
  title: string;
  chapter: ChapterKind;
  body: string[];
  mathLabel?: string;
  mathEq?: string;
  callout?: {
    kind: 'tip' | 'warn' | 'insight';
    title: string;
    text: string;
  };
  changes?: DiffChange[];
  compare?: CompareTable;
  takeaways?: string[];
  goalIndex?: number;
  simPreset?: Record<string, unknown>;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface EngineeringChallenge {
  title: string;
  brief: string;
  hint: string;
  successCriteria: string;
}

export interface LessonData {
  id: string;
  stageId: string;
  stageNumber: string;
  stageTitle: string;
  title: string;
  subtitle: string;
  duration: string;
  difficulty: Difficulty;
  simulationId?: SimulationId;
  isFlagshipLab: boolean;
  goals: string[];
  prerequisites: string[];
  relatedIds: string[];
  intuitionSummary: string;
  mathFoundation: {
    title: string;
    equations: Array<{ label: string; expr: string; note: string }>;
  };
  pythonFromScratch: {
    filename: string;
    description: string;
    code: string;
  };
  realWorldUse: string[];
  failureModes: Array<{ name: string; cause: string; symptom: string; mitigation: string }>;
  steps: LessonStep[];
  challenge?: EngineeringChallenge;
  quiz: QuizQuestion[];
}

export interface CurriculumStage {
  id: string;
  number: string;
  title: string;
  folderColor: FolderColor;
  summary: string;
  lessons: Array<{
    id: string;
    title: string;
    subtitle: string;
    isFlagshipLab?: boolean;
    simulationId?: SimulationId;
  }>;
}

export interface ProjectSpec {
  id: string;
  number: number;
  tier: 'Beginner' | 'Intermediate' | 'Advanced' | 'Capstone';
  title: string;
  tagline: string;
  problemStatement: string;
  architectureSummary: string;
  components: string[];
  techStack: string[];
  milestones: string[];
  failureScenarios: string[];
  tradeOffs: Array<{ decision: string; pros: string; cons: string }>;
  relatedSim?: SimulationId;
  relatedLessonId?: string;
}

export interface ProgressState {
  completedLessons: string[];
  completedSteps: Record<string, string[]>;
  completedChallenges: string[];
  quizScores: Record<string, number>;
  completedProjects: string[];
  bookmarks: string[];
  notes: Record<string, string>;
  streakDays: number;
  lastActiveDate: string;
}
