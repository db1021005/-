import { DifficultyLevel, FretStats, QuizResultRecord } from '../types/guitar';

const STORAGE_KEY_STATS = 'bag_guitar_user_stats';
const STORAGE_KEY_HISTORY = 'bag_guitar_quiz_history';
const STORAGE_KEY_MISTAKES = 'bag_guitar_mistakes';

export interface UserStats {
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  practiceTimeMinutes: number;
  level: DifficultyLevel;
  // Matrix key: "string:fret" e.g. "5:3"
  fretboardHeatmap: Record<string, FretStats>;
}

export interface MistakeItem {
  id: string;
  timestamp: number;
  prompt: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  stringNum?: number;
  fret?: number;
  targetNote?: string;
  timesFailed: number;
}

export function loadUserStats(): UserStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load user stats from storage:', e);
  }
  return {
    totalAnswered: 42,
    totalCorrect: 36,
    currentStreak: 5,
    bestStreak: 12,
    practiceTimeMinutes: 48,
    level: 'intermediate',
    fretboardHeatmap: {
      '6:0': { attempts: 10, correct: 10 },
      '6:1': { attempts: 8, correct: 7 },
      '6:3': { attempts: 12, correct: 11 },
      '6:5': { attempts: 9, correct: 8 },
      '5:3': { attempts: 15, correct: 14 },
      '5:7': { attempts: 6, correct: 3 }, // low accuracy
      '4:5': { attempts: 8, correct: 7 },
      '3:2': { attempts: 10, correct: 9 },
      '3:9': { attempts: 5, correct: 2 }, // low accuracy
      '2:1': { attempts: 11, correct: 10 },
      '2:8': { attempts: 6, correct: 3 }, // low accuracy
      '1:0': { attempts: 14, correct: 14 },
    },
  };
}

export function saveUserStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to save stats:', e);
  }
}

export function loadMistakes(): MistakeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to load mistakes:', e);
  }
  return [
    {
      id: 'm1',
      timestamp: Date.now() - 3600000 * 2,
      prompt: '3번 줄 9프렛은 무슨 음일까요?',
      userAnswer: 'D#',
      correctAnswer: 'E',
      explanation: '3번 줄(G3)에서 9프렛은 G(0) → A(2) → B(4) → C(5) → D(7) → E(9)입니다.',
      stringNum: 3,
      fret: 9,
      targetNote: 'E',
      timesFailed: 2,
    },
    {
      id: 'm2',
      timestamp: Date.now() - 3600000 * 5,
      prompt: '5번 줄 7프렛은 무슨 음일까요?',
      userAnswer: 'F',
      correctAnswer: 'E',
      explanation: '5번 줄(A2)에서 7프렛(온음+온음+반음+온음)은 E음(완전5도)입니다.',
      stringNum: 5,
      fret: 7,
      targetNote: 'E',
      timesFailed: 3,
    },
    {
      id: 'm3',
      timestamp: Date.now() - 3600000 * 8,
      prompt: 'C Major 코드의 3도음(E)은 2번 줄 몇 프렛에 있을까요?',
      userAnswer: '4프렛',
      correctAnswer: '5프렛',
      explanation: '2번 줄 개방현(B3) 기준 E음은 5프렛에 위치합니다. (B→C:1F, C→D:3F, D→E:5F)',
      stringNum: 2,
      fret: 5,
      targetNote: 'E',
      timesFailed: 1,
    },
  ];
}

export function saveMistakes(mistakes: MistakeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakes));
  } catch (e) {
    console.warn('Failed to save mistakes:', e);
  }
}

export function recordQuizAttempt(
  record: QuizResultRecord,
  prompt: string,
  correctAnswer: string,
  explanation: string
): void {
  const stats = loadUserStats();
  stats.totalAnswered += 1;
  if (record.isCorrect) {
    stats.totalCorrect += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }

  // Update fret heatmap
  if (record.stringNum !== undefined && record.fret !== undefined) {
    const key = `${record.stringNum}:${record.fret}`;
    if (!stats.fretboardHeatmap[key]) {
      stats.fretboardHeatmap[key] = { attempts: 0, correct: 0 };
    }
    stats.fretboardHeatmap[key].attempts += 1;
    if (record.isCorrect) {
      stats.fretboardHeatmap[key].correct += 1;
    }
  }

  saveUserStats(stats);

  // If wrong, add or update mistake notebook
  if (!record.isCorrect) {
    const mistakes = loadMistakes();
    const existing = mistakes.find(m => m.stringNum === record.stringNum && m.fret === record.fret);
    if (existing) {
      existing.timesFailed += 1;
      existing.timestamp = Date.now();
      existing.userAnswer = record.userAnswer;
    } else {
      mistakes.unshift({
        id: 'm_' + Date.now(),
        timestamp: Date.now(),
        prompt,
        userAnswer: record.userAnswer,
        correctAnswer,
        explanation,
        stringNum: record.stringNum,
        fret: record.fret,
        targetNote: record.targetNote,
        timesFailed: 1,
      });
    }
    saveMistakes(mistakes.slice(0, 50));
  }
}
