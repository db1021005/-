export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type DisplayMode = 'note' | 'interval' | 'finger';

export interface StringConfig {
  str: number; // 1 to 6 (1 = High E, 6 = Low E)
  openNote: NoteName;
  octave: number;
  semitoneFromC0: number;
}

export type TuningId = 'standard' | 'drop_d' | 'half_step_down' | 'dadgad' | 'open_d';

export interface TuningOption {
  id: TuningId;
  name: string;
  strings: StringConfig[];
}

export interface HarmonyFormula {
  id: string;
  name: string;
  type: 'chord' | 'scale';
  intervals: number[]; // semitones relative to root [0, 4, 7]
  labels: string[]; // ['1', '3', '5']
  semitones: string[]; // ['0', '+4', '+7']
  quality: string;
  category: 'triad' | '7th' | 'tension' | 'scale_basic' | 'scale_mode' | 'scale_exotic';
  difficulty: DifficultyLevel;
  description: string;
  voicingTip?: string;
}

export interface CagedVoicing {
  shape: 'C' | 'A' | 'G' | 'E' | 'D';
  name: string;
  posName: string;
  fretSpan: string;
  baseFretOffset: number; // relative to root on 5th or 6th string
  chordTones: { stringNum: number; fretOffset: number; intervalLabel: string; isRoot?: boolean }[];
  description: string;
}

export interface FretNodeInfo {
  stringNum: number;
  fret: number;
  note: NoteName;
  octave: number;
  midi: number;
  frequency: number;
  intervalDegree?: string;
  isRoot?: boolean;
}

export interface QuizQuestion {
  id: string;
  mode: 'position_to_note' | 'note_to_position' | 'chord_tone';
  difficulty: DifficultyLevel;
  prompt: string;
  subPrompt?: string;
  targetString?: number;
  targetFret?: number;
  targetNote?: NoteName;
  targetInterval?: string;
  chordContext?: {
    root: NoteName;
    chordId: string;
  };
  options?: NoteName[]; // 4 multiple choice options
  correctAnswerNote?: NoteName;
  correctAnswerPositions?: { stringNum: number; fret: number }[];
  explanation: string;
}

export interface QuizResultRecord {
  timestamp: number;
  questionId: string;
  mode: string;
  targetNote: string;
  stringNum?: number;
  fret?: number;
  userAnswer: string;
  isCorrect: boolean;
}

export interface FretStats {
  attempts: number;
  correct: number;
}
