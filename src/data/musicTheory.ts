import { DifficultyLevel, HarmonyFormula, NoteName, TuningId, TuningOption } from '../types/guitar';

export const CHROMATIC_NOTES: NoteName[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const ENHARMONIC_EQUIV: Record<string, NoteName> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'B#': 'C',
  'Cb': 'B',
  'E#': 'F',
  'Fb': 'E',
};

// Tunings list
export const TUNINGS: Record<TuningId, TuningOption> = {
  standard: {
    id: 'standard',
    name: 'Standard (E A D G B E)',
    strings: [
      { str: 1, openNote: 'E', octave: 4, semitoneFromC0: 52 },
      { str: 2, openNote: 'B', octave: 3, semitoneFromC0: 47 },
      { str: 3, openNote: 'G', octave: 3, semitoneFromC0: 43 },
      { str: 4, openNote: 'D', octave: 3, semitoneFromC0: 38 },
      { str: 5, openNote: 'A', octave: 2, semitoneFromC0: 33 },
      { str: 6, openNote: 'E', octave: 2, semitoneFromC0: 28 },
    ],
  },
  drop_d: {
    id: 'drop_d',
    name: 'Drop D (D A D G B E)',
    strings: [
      { str: 1, openNote: 'E', octave: 4, semitoneFromC0: 52 },
      { str: 2, openNote: 'B', octave: 3, semitoneFromC0: 47 },
      { str: 3, openNote: 'G', octave: 3, semitoneFromC0: 43 },
      { str: 4, openNote: 'D', octave: 3, semitoneFromC0: 38 },
      { str: 5, openNote: 'A', octave: 2, semitoneFromC0: 33 },
      { str: 6, openNote: 'D', octave: 2, semitoneFromC0: 26 },
    ],
  },
  half_step_down: {
    id: 'half_step_down',
    name: 'Half-Step Down (Eb Ab Db Gb Bb Eb)',
    strings: [
      { str: 1, openNote: 'D#', octave: 4, semitoneFromC0: 51 },
      { str: 2, openNote: 'A#', octave: 3, semitoneFromC0: 46 },
      { str: 3, openNote: 'F#', octave: 3, semitoneFromC0: 42 },
      { str: 4, openNote: 'C#', octave: 3, semitoneFromC0: 37 },
      { str: 5, openNote: 'G#', octave: 2, semitoneFromC0: 32 },
      { str: 6, openNote: 'D#', octave: 2, semitoneFromC0: 27 },
    ],
  },
  dadgad: {
    id: 'dadgad',
    name: 'DADGAD (Celtic / Folk)',
    strings: [
      { str: 1, openNote: 'D', octave: 4, semitoneFromC0: 50 },
      { str: 2, openNote: 'A', octave: 3, semitoneFromC0: 45 },
      { str: 3, openNote: 'G', octave: 3, semitoneFromC0: 43 },
      { str: 4, openNote: 'D', octave: 3, semitoneFromC0: 38 },
      { str: 5, openNote: 'A', octave: 2, semitoneFromC0: 33 },
      { str: 6, openNote: 'D', octave: 2, semitoneFromC0: 26 },
    ],
  },
  open_d: {
    id: 'open_d',
    name: 'Open D (D A D F# A D)',
    strings: [
      { str: 1, openNote: 'D', octave: 4, semitoneFromC0: 50 },
      { str: 2, openNote: 'A', octave: 3, semitoneFromC0: 45 },
      { str: 3, openNote: 'F#', octave: 3, semitoneFromC0: 42 },
      { str: 4, openNote: 'D', octave: 3, semitoneFromC0: 38 },
      { str: 5, openNote: 'A', octave: 2, semitoneFromC0: 33 },
      { str: 6, openNote: 'D', octave: 2, semitoneFromC0: 26 },
    ],
  },
};

// Harmony Formulations
export const HARMONY_CATALOG: Record<string, HarmonyFormula> = {
  // Chords - Triads
  Major: {
    id: 'Major',
    name: 'Major',
    type: 'chord',
    intervals: [0, 4, 7],
    labels: ['1', '3', '5'],
    semitones: ['0', '+4', '+7'],
    quality: 'Major Triad',
    category: 'triad',
    difficulty: 'beginner',
    description: '밝고 안정적인 기본 3화음입니다. 근음, 장3도, 완전5도로 구성됩니다.',
    voicingTip: '5번 줄 3프렛 C를 기점으로 메이저 바레(Barre) 폼(A Form)을 연주할 수 있으며, 6번 줄 8프렛 C에서는 전통적인 E Form 메이저 코드가 형성됩니다.',
  },
  Minor: {
    id: 'Minor',
    name: 'Minor (m)',
    type: 'chord',
    intervals: [0, 3, 7],
    labels: ['1', 'b3', '5'],
    semitones: ['0', '+3', '+7'],
    quality: 'Minor Triad',
    category: 'triad',
    difficulty: 'beginner',
    description: '차분하고 감성적인 마이너 3화음입니다. 메이저의 3도음을 반음 내려 단3도를 취합니다.',
    voicingTip: 'E Form 마이너는 6번 줄 근음에서 3번 손가락 바레 폼을 쓰고, A Form 마이너는 5번 줄 근음에서 2-3-4번 손가락으로 3,4번 줄을 잡습니다.',
  },
  Sus4: {
    id: 'Sus4',
    name: 'Sus4',
    type: 'chord',
    intervals: [0, 5, 7],
    labels: ['1', '4', '5'],
    semitones: ['0', '+5', '+7'],
    quality: 'Suspended Triad',
    category: 'triad',
    difficulty: 'beginner',
    description: '3도 대신 완전4도를 사용하여 메이저/마이너 성향이 유보된 긴장감을 연출합니다.',
    voicingTip: '메이저 코드 상태에서 3도 음을 반음 올려 4도로 짚으면 즉시 서스포 텐션이 걸립니다.',
  },
  Dim: {
    id: 'Dim',
    name: 'dim',
    type: 'chord',
    intervals: [0, 3, 6],
    labels: ['1', 'b3', 'b5'],
    semitones: ['0', '+3', '+6'],
    quality: 'Diminished Triad',
    category: 'triad',
    difficulty: 'beginner',
    description: '단3도 2개가 중첩되어 감5도(Tritone)를 포함하는 불안정한 긴장 코드입니다.',
    voicingTip: '다음 코드로의 강한 해결감을 주며 경과 화음(Passing chord)으로 자주 사용됩니다.',
  },
  Aug: {
    id: 'Aug',
    name: 'aug',
    type: 'chord',
    intervals: [0, 4, 8],
    labels: ['1', '3', '#5'],
    semitones: ['0', '+4', '+8'],
    quality: 'Augmented Triad',
    category: 'triad',
    difficulty: 'intermediate',
    description: '장3도 2개로 이루어져 완전5도가 반음 올라간(#5) 몽환적인 사운드입니다.',
    voicingTip: '4프렛 간격(대칭 구조)으로 지판에서 동일한 코드 모양이 반복되는 특징이 있습니다.',
  },

  // Chords - 7th
  Dom7: {
    id: 'Dom7',
    name: '7 (Dom)',
    type: 'chord',
    intervals: [0, 4, 7, 10],
    labels: ['1', '3', '5', 'b7'],
    semitones: ['0', '+4', '+7', '+10'],
    quality: 'Dominant 7th',
    category: '7th',
    difficulty: 'intermediate',
    description: '블루스와 재즈의 핵심인 도미넌트 7화음입니다. 장3도와 단7도 사이의 트라이톤이 특징입니다.',
    voicingTip: '블루스 셔플에서 1-4-5도 진행의 핵심이며 4현 컴핑 폼으로 깔끔하게 연주할 수 있습니다.',
  },
  Maj7: {
    id: 'Maj7',
    name: 'Maj7',
    type: 'chord',
    intervals: [0, 4, 7, 11],
    labels: ['1', '3', '5', '7'],
    semitones: ['0', '+4', '+7', '+11'],
    quality: 'Major 7th',
    category: '7th',
    difficulty: 'intermediate',
    description: '시티팝, 보사노바, 재즈에서 자주 쓰이는 우아하고 세련된 사운드입니다.',
    voicingTip: '메이저 코드의 근음(Octave Root)을 반음 내리면 바로 Maj7 음이 됩니다.',
  },
  Min7: {
    id: 'Min7',
    name: 'm7',
    type: 'chord',
    intervals: [0, 3, 7, 10],
    labels: ['1', 'b3', '5', 'b7'],
    semitones: ['0', '+3', '+7', '+10'],
    quality: 'Minor 7th',
    category: '7th',
    difficulty: 'intermediate',
    description: '네오소울, R&B, 재즈의 ii-V-I 진행에서 2도 화음으로 필수적인 사운드입니다.',
    voicingTip: 'A minor 7 바레 폼은 5번 줄 루트 기준 3번 손가락만 떼면 개방적인 m7 톤이 완성됩니다.',
  },
  m7b5: {
    id: 'm7b5',
    name: 'm7b5 (Half-Dim)',
    type: 'chord',
    intervals: [0, 3, 6, 10],
    labels: ['1', 'b3', 'b5', 'b7'],
    semitones: ['0', '+3', '+6', '+10'],
    quality: 'Half-Diminished 7th',
    category: '7th',
    difficulty: 'intermediate',
    description: '마이너 2-5-1 진행의 2도 화음으로 쓰이는 독특한 감미로운 긴장 코드입니다.',
    voicingTip: '지판에서 6-4-3-2번 현이나 5-4-3-2번 현을 사용하는 4-note 쉘 보이싱으로 연주합니다.',
  },

  // Chords - Extensions / Tensions
  Add9: {
    id: 'Add9',
    name: 'add9',
    type: 'chord',
    intervals: [0, 2, 4, 7],
    labels: ['1', '9', '3', '5'],
    semitones: ['0', '+2', '+4', '+7'],
    quality: 'Extended Triad',
    category: 'tension',
    difficulty: 'intermediate',
    description: '7도 없이 장2도(9th)를 더해 맑고 투명한 어쿠스틱/팝 사운드를 만듭니다.',
    voicingTip: 'Cadd9은 통기타 오픈 코드에서 1,2번 줄 3프렛을 잡은 채 연주하면 환상적인 배음을 냅니다.',
  },
  '9th': {
    id: '9th',
    name: '9th (Dom9)',
    type: 'chord',
    intervals: [0, 2, 4, 7, 10],
    labels: ['1', '9', '3', '5', 'b7'],
    semitones: ['0', '+2', '+4', '+7', '+10'],
    quality: 'Dominant 9th',
    category: 'tension',
    difficulty: 'advanced',
    description: '훵크(Funk)와 R&B 리듬 커팅에서 빠질 수 없는 세련된 텐션 코드입니다.',
    voicingTip: '5번 줄 근음 기준 x-R-3-b7-9-x 폼(예: C9은 x-3-2-3-3-3)으로 찰진 펑크 리듬을 표현합니다.',
  },
  '11th': {
    id: '11th',
    name: '11th (m11)',
    type: 'chord',
    intervals: [0, 3, 5, 7, 10],
    labels: ['1', 'b3', '11', '5', 'b7'],
    semitones: ['0', '+3', '+5', '+7', '+10'],
    quality: 'Minor 11th',
    category: 'tension',
    difficulty: 'advanced',
    description: '네오소울과 모던 재즈의 몽환적이고 깊이 있는 마이너 텐션 사운드입니다.',
    voicingTip: '바레 손가락 하나로 여러 현을 동시에 눌러 11도와 b7도를 겹치게 잡는 보이싱이 인기입니다.',
  },
  '13th': {
    id: '13th',
    name: '13th (Dom13)',
    type: 'chord',
    intervals: [0, 4, 7, 9, 10],
    labels: ['1', '3', '5', '13', 'b7'],
    semitones: ['0', '+4', '+7', '+9', '+10'],
    quality: 'Dominant 13th',
    category: 'tension',
    difficulty: 'advanced',
    description: '재즈 빅밴드와 퓨전에서 극대화된 풍성한 도미넌트 색채를 발산합니다.',
    voicingTip: '루트와 3도, b7도, 13도 4개 음만 남긴 컴핑 쉘 보이싱으로 연주할 때 가장 깔끔합니다.',
  },

  // Scales - Basic & Modes
  Ionian: {
    id: 'Ionian',
    name: '메이저 (Ionian)',
    type: 'scale',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    semitones: ['0', '+2', '+4', '+5', '+7', '+9', '+11'],
    quality: 'Diatonic Major Mode',
    category: 'scale_basic',
    difficulty: 'beginner',
    description: '서양 음악의 근본이 되는 자연 단조/장조 체계의 7음계 메이저 스케일입니다.',
    voicingTip: '온음-온음-반음-온음-온음-온음-반음 구조로, 3-4음과 7-8음 사이가 반음 간격입니다.',
  },
  Aeolian: {
    id: 'Aeolian',
    name: '내추럴 마이너 (Aeolian)',
    type: 'scale',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    labels: ['1', '2', 'b3', '4', '5', 'b6', 'b7'],
    semitones: ['0', '+2', '+3', '+5', '+7', '+8', '+10'],
    quality: 'Natural Minor Mode',
    category: 'scale_basic',
    difficulty: 'beginner',
    description: '자연 단음계로 메이저 스케일의 6번째 모드이자 서정적이고 비장한 멜로디의 원천입니다.',
    voicingTip: '나란한조(Relative Key) 메이저와 구성음이 동일하여 포지션 변환이 쉽습니다.',
  },
  PentatonicMinor: {
    id: 'PentatonicMinor',
    name: '펜타토닉 마이너',
    type: 'scale',
    intervals: [0, 3, 5, 7, 10],
    labels: ['1', 'b3', '4', '5', 'b7'],
    semitones: ['0', '+3', '+5', '+7', '+10'],
    quality: '5-Tone Minor',
    category: 'scale_basic',
    difficulty: 'beginner',
    description: '록과 블루스 기타 솔로의 절대적 필수 스케일입니다. 5개 음으로 불협화음 없이 즉흥 연주가 가능합니다.',
    voicingTip: '지판 상에서 박스 1번(Box 1) 패턴이 가장 유명하며 6번 줄 루트에서 직관적으로 연주됩니다.',
  },
  PentatonicMajor: {
    id: 'PentatonicMajor',
    name: '펜타토닉 메이저',
    type: 'scale',
    intervals: [0, 2, 4, 7, 9],
    labels: ['1', '2', '3', '5', '6'],
    semitones: ['0', '+2', '+4', '+7', '+9'],
    quality: '5-Tone Major',
    category: 'scale_basic',
    difficulty: 'beginner',
    description: '컨트리, 서던 록, 감미로운 팝 멜로디에서 노래하듯 연주되는 따뜻한 5음계입니다.',
    voicingTip: '마이너 펜타토닉 폼을 3프렛 아래로 이동시키면 그대로 메이저 펜타토닉 음계가 형성됩니다.',
  },
  Blues: {
    id: 'Blues',
    name: '블루스 (Blues Scale)',
    type: 'scale',
    intervals: [0, 3, 5, 6, 7, 10],
    labels: ['1', 'b3', '4', 'b5', '5', 'b7'],
    semitones: ['0', '+3', '+5', '+6', '+7', '+10'],
    quality: 'Hexatonic Blues',
    category: 'scale_basic',
    difficulty: 'intermediate',
    description: '마이너 펜타토닉에 블루 노트(b5, Blue Note)가 추가된 6음계로 끈적한 블루스 맛을 냅니다.',
    voicingTip: 'b5음에서 반음 벤딩이나 슬라이드로 5도로 넘어갈 때 특유의 감정선이 폭발합니다.',
  },
  Dorian: {
    id: 'Dorian',
    name: '도리안 (Dorian)',
    type: 'scale',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    labels: ['1', '2', 'b3', '4', '5', '6', 'b7'],
    semitones: ['0', '+2', '+3', '+5', '+7', '+9', '+10'],
    quality: 'Modal Minor (Mode 2)',
    category: 'scale_mode',
    difficulty: 'advanced',
    description: '자연단음계보다 장6도(Natural 6) 음이 밝고 세련된 느낌을 주는 펑크/재즈 모드입니다.',
    voicingTip: '카를로스 산타나의 전매특허 사운드로 m7 코드 위에서 6도 음을 돋보이게 짚어보세요.',
  },
  Mixolydian: {
    id: 'Mixolydian',
    name: '믹솔리디안 (Mixolydian)',
    type: 'scale',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    labels: ['1', '2', '3', '4', '5', '6', 'b7'],
    semitones: ['0', '+2', '+4', '+5', '+7', '+9', '+10'],
    quality: 'Modal Dominant (Mode 5)',
    category: 'scale_mode',
    difficulty: 'advanced',
    description: '도미넌트 7th 코드에 완벽히 매칭되는 5번째 모드로 블루스 록의 정수를 담고 있습니다.',
    voicingTip: '장3도와 단7도를 함께 가지고 있어 메이저의 밝음과 블루스의 거친 뉘앙스를 겸비합니다.',
  },
  Phrygian: {
    id: 'Phrygian',
    name: '프리지안 (Phrygian)',
    type: 'scale',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    labels: ['1', 'b2', 'b3', '4', '5', 'b6', 'b7'],
    semitones: ['0', '+1', '+3', '+5', '+7', '+8', '+10'],
    quality: 'Modal Minor (Mode 3)',
    category: 'scale_mode',
    difficulty: 'advanced',
    description: '스페니쉬 플라멩코 및 헤비메탈 리프에서 애용되는 단2도(b2) 특유의 이국적 어둠을 가집니다.',
    voicingTip: '루트에서 단2도로의 해머링 온/풀링 오프 반복으로 플라멩코 분위기를 낼 수 있습니다.',
  },
  Lydian: {
    id: 'Lydian',
    name: '리디안 (Lydian)',
    type: 'scale',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    labels: ['1', '2', '3', '#4', '5', '6', '7'],
    semitones: ['0', '+2', '+4', '+6', '+7', '+9', '+11'],
    quality: 'Modal Major (Mode 4)',
    category: 'scale_mode',
    difficulty: 'advanced',
    description: '스티브 바이, 조 사트리아니가 사랑하는 증4도(#4)의 우주적이고 신비로운 사운드입니다.',
    voicingTip: 'Maj7(#11) 코드와 매치되며, #4음을 길게 비브라토로 끌어주면 리디안 특유의 환상감이 살아납니다.',
  },
  HarmonicMinor: {
    id: 'HarmonicMinor',
    name: '하모닉 마이너 (Harmonic Minor)',
    type: 'scale',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    labels: ['1', '2', 'b3', '4', '5', 'b6', '7'],
    semitones: ['0', '+2', '+3', '+5', '+7', '+8', '+11'],
    quality: 'Minor with Leading Tone',
    category: 'scale_exotic',
    difficulty: 'advanced',
    description: '잉베이 말름스틴의 네오클래시컬 메탈과 클래식 화성에서 리딩 톤(Leading tone 7th)을 강조한 음계입니다.',
    voicingTip: 'b6도와 7도 사이의 증2도 간격이 뿜어내는 강렬한 아라비안/바로크풍 사운드가 매력입니다.',
  },
};

// CAGED System Voicing Definitions
export const CAGED_SHAPES = [
  {
    shape: 'C',
    name: 'C Shape',
    posName: 'Pos 1',
    fretSpan: 'Open / 3F',
    description: '5번 줄 루트 기준 C 오픈 코드 폼의 바레 확장 형태',
  },
  {
    shape: 'A',
    name: 'A Shape',
    posName: 'Active (Pos 2)',
    fretSpan: '3~5 Fret',
    description: '5번 줄 루트 기준 A 폼 바레 코드 클러스터',
  },
  {
    shape: 'G',
    name: 'G Shape',
    posName: 'Pos 3',
    fretSpan: '5~8 Fret',
    description: '6번 줄 루트 기준 G 폼 아르페지오 및 코드 폼',
  },
  {
    shape: 'E',
    name: 'E Shape',
    posName: 'Pos 4',
    fretSpan: '8~10 Fret',
    description: '6번 줄 루트 기준 가장 대중적인 E 바레 코드 폼',
  },
  {
    shape: 'D',
    name: 'D Shape',
    posName: 'Pos 5',
    fretSpan: '10~13 Fret',
    description: '4번 줄 루트 기준 D 폼 하이포지션 트라이어드',
  },
];

// Helper to calculate note on string & fret
export function getFretNote(
  stringConfig: { str: number; openNote: NoteName; semitoneFromC0: number },
  fret: number
): { note: NoteName; octave: number; midi: number; frequency: number } {
  const rootIndex = CHROMATIC_NOTES.indexOf(stringConfig.openNote);
  const noteIndex = (rootIndex + fret) % 12;
  const note = CHROMATIC_NOTES[noteIndex];
  const totalSemitones = stringConfig.semitoneFromC0 + fret;
  const octave = Math.floor(totalSemitones / 12);
  const midi = totalSemitones + 12;
  const frequency = 440 * Math.pow(2, (midi - 69) / 12);

  return { note, octave, midi, frequency };
}

// Convert MIDI number to Frequency
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Interval label description
export function getIntervalDescription(label: string): string {
  switch (label) {
    case '1': return '완전 1도 (근음, Root)';
    case 'b2': return '단 2도 (반음 간격)';
    case '2': return '장 2도 (온음 간격)';
    case 'b3': return '단 3도 (마이너 성향)';
    case '3': return '장 3도 (메이저 성향)';
    case '4': return '완전 4도 (서스포 성향)';
    case '#4': return '증 4도 (리디안 텐션)';
    case 'b5': return '감 5도 (Tritone)';
    case '5': return '완전 5도 (기둥음, Fifth)';
    case '#5': return '증 5도 (어그먼티드)';
    case 'b6': return '단 6도';
    case '6': return '장 6도 (도리안 음)';
    case 'b7': return '단 7도 (도미넌트 7th)';
    case '7': return '장 7도 (메이저 7th)';
    case '9': return '장 9도 (텐션 9th)';
    case '11': return '완전 11도 (텐션 11th)';
    case '13': return '장 13도 (텐션 13th)';
    default: return '화성 구성음';
  }
}
