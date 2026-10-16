import React, { useState, useEffect, useRef } from 'react';
import { DifficultyLevel, DisplayMode, HarmonyFormula, NoteName, TuningId } from '../types/guitar';
import { CHROMATIC_NOTES, HARMONY_CATALOG, CAGED_SHAPES, TUNINGS, getFretNote } from '../data/musicTheory';
import { soundEngine } from '../audio/synth';

interface InteractiveFretboardViewProps {
  currentTuning: TuningId;
  difficulty: DifficultyLevel;
  onLaunchQuizWithKey: (root: NoteName, harmonyKey: string) => void;
}

export const InteractiveFretboardView: React.FC<InteractiveFretboardViewProps> = ({
  currentTuning,
  difficulty,
  onLaunchQuizWithKey,
}) => {
  // States
  const [currentRoot, setCurrentRoot] = useState<NoteName>('C');
  const [activeHarmonyKey, setActiveHarmonyKey] = useState<string>('Major');
  const [harmonyTab, setHarmonyTab] = useState<'chord' | 'scale'>('chord');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('note');
  const [activeStrings, setActiveStrings] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6]));
  const [activeCagedShape, setActiveCagedShape] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('지판의 노드를 클릭하여 해당 프렛 음을 청음하세요.');
  const [playingNodeKey, setPlayingNodeKey] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tuningConfig = TUNINGS[currentTuning];
  const activeFormula: HarmonyFormula = HARMONY_CATALOG[activeHarmonyKey] || HARMONY_CATALOG['Major'];

  // Calculate target pitches and map them
  const rootIndex = CHROMATIC_NOTES.indexOf(currentRoot);
  const targetPitches = activeFormula.intervals.map((iv) => CHROMATIC_NOTES[(rootIndex + iv) % 12]);

  // Handle note click
  const handleNodeClick = (stringNum: number, fret: number, note: NoteName, freq: number) => {
    soundEngine.playPluck(freq, 1.2);
    setPlayingNodeKey(`${stringNum}:${fret}`);
    setFeedbackText(`${stringNum}번 현 ${fret}프렛 (${note}) 청음 중`);
    setTimeout(() => {
      setPlayingNodeKey(null);
    }, 300);
  };

  // Play open string (Nut)
  const handleNutClick = (stringNum: number) => {
    const sConf = tuningConfig.strings.find((s) => s.str === stringNum);
    if (!sConf) return;
    const noteData = getFretNote(sConf, 0);
    soundEngine.playPluck(noteData.frequency, 1.4);
    setPlayingNodeKey(`${stringNum}:0`);
    setFeedbackText(`개방현(Nut 0 Fret) ${stringNum}번 현: ${noteData.note}${noteData.octave} 청음`);
    setTimeout(() => {
      setPlayingNodeKey(null);
    }, 300);
  };

  // Strum representative chord across active strings
  const handleStrumChord = () => {
    setFeedbackText(`'${currentRoot} ${activeFormula.name}' 6현 스트럼 오디오 시뮬레이션 실행 중...`);
    const chordFrequencies: number[] = [];

    // pick representative fret per string from 6 to 1
    [6, 5, 4, 3, 2, 1].forEach((strNum) => {
      if (!activeStrings.has(strNum)) return;
      const sConf = tuningConfig.strings.find((s) => s.str === strNum);
      if (!sConf) return;

      let chosenFret = -1;
      // check open string
      const openNote = getFretNote(sConf, 0);
      if (targetPitches.includes(openNote.note)) {
        chosenFret = 0;
      } else {
        // Look within 1~5 frets (open/low position chord)
        for (let f = 1; f <= 5; f++) {
          const fn = getFretNote(sConf, f);
          if (targetPitches.includes(fn.note)) {
            chosenFret = f;
            break;
          }
        }
      }

      if (chosenFret !== -1) {
        const fn = getFretNote(sConf, chosenFret);
        chordFrequencies.push(fn.frequency);
      }
    });

    soundEngine.strumChord(chordFrequencies, 100);
  };

  // Play scale run arpeggio
  const handleScaleRun = () => {
    setFeedbackText(`'${currentRoot} ${activeFormula.name}' 스케일 오디오 런 시퀀싱 실행...`);
    const scaleNotes: number[] = [];
    // collect unique frequencies from string 6 to string 1
    for (let f = 0; f <= 12; f++) {
      tuningConfig.strings.forEach((s) => {
        const noteData = getFretNote(s, f);
        if (targetPitches.includes(noteData.note)) {
          if (!scaleNotes.includes(noteData.frequency)) {
            scaleNotes.push(noteData.frequency);
          }
        }
      });
    }
    // Sort frequencies ascending
    scaleNotes.sort((a, b) => a - b);
    const runSample = scaleNotes.slice(0, 10);
    soundEngine.playScaleRun(runSample, 150);
  };

  // Toggle individual string visibility
  const toggleString = (strNum: number) => {
    const next = new Set(activeStrings);
    if (next.has(strNum)) {
      if (next.size > 1) next.delete(strNum);
    } else {
      next.add(strNum);
    }
    setActiveStrings(next);
  };

  // Toggle all strings
  const toggleAllStrings = () => {
    if (activeStrings.size === 6) {
      setActiveStrings(new Set([1]));
    } else {
      setActiveStrings(new Set([1, 2, 3, 4, 5, 6]));
    }
  };

  // Zoom handlers
  const zoomTo112 = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
    setFeedbackText('1~12 프렛 기본 포지션 뷰로 정렬되었습니다.');
  };

  const zoomToFull24 = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 360, behavior: 'smooth' });
    }
    setFeedbackText('24프렛 전체 솔로/하이포지션 영역 탐색 모드');
  };

  // CAGED Highlight filter range
  const getCagedFretRange = (shape: string): [number, number] => {
    switch (shape) {
      case 'C': return [0, 4];
      case 'A': return [3, 6];
      case 'G': return [5, 8];
      case 'E': return [8, 11];
      case 'D': return [10, 14];
      default: return [0, 24];
    }
  };

  // Helper to determine node content
  const getNodeDisplayContent = (note: NoteName, fret: number) => {
    const pitchIdx = targetPitches.indexOf(note);
    if (pitchIdx === -1) return note;

    if (displayMode === 'note') return note;
    if (displayMode === 'interval') return activeFormula.labels[pitchIdx];
    // Finger heuristic
    const mod = fret % 4;
    return mod === 0 ? '4' : String(mod);
  };

  return (
    <div className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-10 pb-16">
      {/* Subtle ambient studio glow behind primary workbench */}
      <div className="absolute -top-32 left-1/4 w-[640px] h-[340px] bg-[#00f0ff]/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-96 right-10 w-[520px] h-[280px] bg-[#ee9800]/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Page Overline & Meta Status Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-6 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#282a30] text-[#7df4ff] text-[10px] font-mono-code uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse shadow-[0_0_8px_#00f0ff]" />
              DSP Audio Engine Online
            </span>
            <span className="text-[#b9cacb] font-mono-code text-[11px]">
              · 24-Fret Pro Workbench
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e2e2eb] tracking-tight flex items-center gap-3">
            인터랙티브 6현 지판 탐색기
            <span className="text-xs font-normal text-[#b9cacb] px-2.5 py-1 rounded bg-[#191b22] hidden sm:inline-block font-mono-code">
              {tuningConfig.name}
            </span>
          </h1>
        </div>

        {/* Quick Action Pedals */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleStrumChord}
            className="group flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#282a30] text-[#e2e2eb] hover:bg-[#33343b] transition-all shadow-md active:scale-95"
            title="현재 코드 구성음 스트럼 연주"
          >
            <span className="material-symbols-outlined text-[#00dbe9] text-[20px] group-hover:rotate-12 transition-transform">
              volume_up
            </span>
            <span className="font-mono-code text-xs font-semibold">코드 스트럼 재생</span>
            <span className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded bg-[#0c0e14] text-[#00f0ff] text-[10px] font-mono-code">
              BPM 100
            </span>
          </button>

          <button
            type="button"
            onClick={handleScaleRun}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[#282a30] text-[#e2e2eb] hover:bg-[#33343b] transition-all shadow-md active:scale-95"
            title="스케일 순차적 아르페지오 재생"
          >
            <span className="material-symbols-outlined text-[#6ffbbe] text-[20px]">
              graphic_eq
            </span>
            <span className="font-mono-code text-xs font-semibold">스케일 런</span>
          </button>

          <button
            type="button"
            onClick={() => onLaunchQuizWithKey(currentRoot, activeHarmonyKey)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00f0ff] text-[#00363a] font-mono-code text-xs font-bold shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_28px_rgba(0,240,255,0.55)] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">psychology</span>
            <span>선택 키로 암기 퀴즈 풀기</span>
          </button>
        </div>
      </div>

      {/* Studio Command Deck (Controls Rack) */}
      <section className="bg-[#191b22] rounded-xl p-4 sm:p-5 shadow-xl mb-6 border border-[#2f364a]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
          {/* Column 1: Root Note Matrix */}
          <div className="xl:col-span-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-[11px] text-[#b9cacb] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-[#ee9800] text-[16px]">adjust</span>
                근음 선택 (Root Note)
              </span>
              <span className="font-mono-code text-sm text-[#ffb95f] font-bold">
                {currentRoot}
              </span>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-12 xl:grid-cols-6 gap-1 bg-[#0c0e14] p-1.5 rounded-lg border border-[#2f364a]/50">
              {CHROMATIC_NOTES.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => setCurrentRoot(note)}
                  className={`py-2 rounded font-mono-code text-xs text-center transition-all ${
                    currentRoot === note
                      ? 'bg-[#ee9800] text-[#2a1700] font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)] scale-105'
                      : 'text-[#b9cacb] hover:text-[#e2e2eb] hover:bg-[#282a30]'
                  }`}
                >
                  {note}
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Harmony Mode & Structure (Chords & Scales) */}
          <div className="xl:col-span-5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono-code text-[11px] text-[#b9cacb] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                  <span className="material-symbols-outlined text-[#00f0ff] text-[16px]">tune</span>
                  화성 구조 (Chords &amp; Scales)
                </span>
                <div className="flex p-0.5 rounded bg-[#0c0e14] text-xs font-mono-code border border-[#2f364a]/60">
                  <button
                    type="button"
                    onClick={() => {
                      setHarmonyTab('chord');
                      setActiveHarmonyKey('Major');
                    }}
                    className={`px-2 py-0.5 rounded font-semibold transition-all ${
                      harmonyTab === 'chord'
                        ? 'bg-[#282a30] text-[#00f0ff]'
                        : 'text-[#b9cacb] hover:text-[#e2e2eb]'
                    }`}
                  >
                    코드 (Chord)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHarmonyTab('scale');
                      setActiveHarmonyKey('Ionian');
                    }}
                    className={`px-2 py-0.5 rounded transition-all ${
                      harmonyTab === 'scale'
                        ? 'bg-[#282a30] text-[#00f0ff] font-semibold'
                        : 'text-[#b9cacb] hover:text-[#e2e2eb]'
                    }`}
                  >
                    스케일 (Scale)
                  </button>
                </div>
              </div>
              <span className="font-mono-code text-[11px] text-[#00dbe9] px-2 py-0.5 rounded bg-[#282a30] border border-[#2f364a]/40">
                {activeFormula.labels.join(' - ')}
              </span>
            </div>

            {/* Presets Grid */}
            <div className="flex flex-wrap gap-1.5 bg-[#0c0e14] p-2 rounded-lg border border-[#2f364a]/50">
              {Object.values(HARMONY_CATALOG)
                .filter((item) => item.type === harmonyTab)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveHarmonyKey(item.id)}
                    className={`px-2.5 py-1.5 rounded font-mono-code text-xs transition-all ${
                      activeHarmonyKey === item.id
                        ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                        : 'bg-[#1e1f26] text-[#e2e2eb] hover:bg-[#282a30]'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Column 3: Display Filters & String Visibility */}
          <div className="xl:col-span-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-mono-code text-[11px] text-[#b9cacb] uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                <span className="material-symbols-outlined text-[#6ffbbe] text-[16px]">visibility</span>
                노드 표시 모드
              </span>
              <span className="font-mono-code text-[11px] text-[#b9cacb]">표시 전환</span>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-[#0c0e14] p-1 rounded-lg border border-[#2f364a]/50">
              <button
                type="button"
                onClick={() => setDisplayMode('note')}
                className={`py-2 rounded font-mono-code text-xs text-center transition-all ${
                  displayMode === 'note'
                    ? 'bg-[#282a30] text-[#00dbe9] font-bold shadow-sm'
                    : 'text-[#b9cacb] hover:text-[#e2e2eb] hover:bg-[#282a30]'
                }`}
              >
                음이름 (C,E)
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('interval')}
                className={`py-2 rounded font-mono-code text-xs text-center transition-all ${
                  displayMode === 'interval'
                    ? 'bg-[#282a30] text-[#00dbe9] font-bold shadow-sm'
                    : 'text-[#b9cacb] hover:text-[#e2e2eb] hover:bg-[#282a30]'
                }`}
              >
                도수 (1, 3, 5)
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('finger')}
                className={`py-2 rounded font-mono-code text-xs text-center transition-all ${
                  displayMode === 'finger'
                    ? 'bg-[#282a30] text-[#00dbe9] font-bold shadow-sm'
                    : 'text-[#b9cacb] hover:text-[#e2e2eb] hover:bg-[#282a30]'
                }`}
              >
                운지 (1~4)
              </button>
            </div>

            {/* String Quick Toggle Strip */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-mono-code text-xs text-[#b9cacb]">현 활성화 필터:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6].map((strNum) => (
                  <button
                    key={strNum}
                    type="button"
                    onClick={() => toggleString(strNum)}
                    className={`w-6 h-6 rounded font-mono-code text-xs flex items-center justify-center font-bold transition-all ${
                      activeStrings.has(strNum)
                        ? 'bg-[#282a30] text-[#7df4ff] ring-1 ring-[#00dbe9]/50'
                        : 'bg-[#1e1f26] text-[#849495] opacity-50'
                    }`}
                  >
                    {strNum}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={toggleAllStrings}
                  className="px-1.5 h-6 rounded bg-[#33343b] text-[#e2e2eb] font-mono-code text-[11px] hover:text-[#00f0ff]"
                  title="전체 선택/해제"
                >
                  ALL
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fretboard Viewport Outer Stage */}
      <div className="relative w-full rounded-2xl bg-[#0c0e14] p-3 sm:p-5 shadow-2xl overflow-hidden mb-8 border border-[#2f364a]">
        {/* Fretboard Header HUD Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-2 px-2 border-b border-[#2f364a]/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ee9800] shadow-[0_0_8px_#ffb95f]" />
              <span className="text-lg font-bold text-[#e2e2eb]">
                {currentRoot} {activeFormula.name} 지판 전개도
              </span>
            </div>
            <span className="text-xs text-[#b9cacb] hidden md:inline font-mono-code">
              24프렛 완전 스팬 (1~24 Fretboard)
            </span>
          </div>

          {/* Legend Pill Markers */}
          <div className="flex items-center gap-3 font-mono-code text-xs">
            <span className="flex items-center gap-1.5 text-[#e2e2eb]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ee9800] text-[#2a1700] text-[9px] flex items-center justify-center font-bold">
                R
              </span>
              근음 (Root)
            </span>
            <span className="flex items-center gap-1.5 text-[#e2e2eb]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#00f0ff] text-[#00363a] text-[9px] flex items-center justify-center font-bold">
                3
              </span>
              3도 (3rd)
            </span>
            <span className="flex items-center gap-1.5 text-[#e2e2eb]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#65f2b5] text-[#003824] text-[9px] flex items-center justify-center font-bold">
                5
              </span>
              5도 (5th)
            </span>
            <span className="flex items-center gap-1.5 text-[#e2e2eb]">
              <span className="w-3.5 h-3.5 rounded-full bg-[#373940] text-[#e2e2eb] text-[9px] flex items-center justify-center font-bold">
                ·
              </span>
              패싱/확장음
            </span>
          </div>
        </div>

        {/* Mobile horizontal scroll hint */}
        <div className="flex items-center justify-between xl:hidden font-mono-code text-xs text-[#b9cacb] px-2 mb-2 bg-[#1e1f26] py-1.5 rounded">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#00f0ff]">swipe</span>
            가로로 스크롤하여 24프렛 전체를 탐색하세요
          </span>
          <span className="text-[#00dbe9]">Nut 0 → 24 Fret</span>
        </div>

        {/* MAIN FRETBOARD SCROLLING CONTAINER */}
        <div
          ref={scrollContainerRef}
          className="w-full overflow-x-auto pb-4 pt-2 fretboard-scrollbar select-none cursor-crosshair"
          id="fretboardScrollContainer"
        >
          <div className="relative min-w-[1360px] lg:min-w-[1600px] h-[330px] rounded-xl overflow-hidden bg-gradient-to-r from-[#171513] via-[#1c1815] to-[#12100e] shadow-inner flex flex-col justify-between py-5 px-3 border border-[#2f364a]/80">
            {/* Wood Grain Visual Effect Layer */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60 pointer-events-none" />

            {/* Vertical Frets Grid Layer (Frets 1 to 24 with real physical width narrowing) */}
            <div className="absolute inset-0 left-[72px] right-2 flex pointer-events-none">
              {Array.from({ length: 24 }, (_, i) => i + 1).map((fret) => {
                // Diminishing width factor for visual realism
                const flexGrow = Math.max(0.65, 1.25 - fret * 0.024);
                const hasSingleInlay = [3, 5, 7, 9, 15, 17, 19, 21].includes(fret);
                const hasDoubleInlay = fret === 12 || fret === 24;

                return (
                  <div
                    key={fret}
                    style={{ flex: flexGrow }}
                    className="relative flex items-center justify-center h-full"
                  >
                    {/* Inlay Single Marker */}
                    {hasSingleInlay && (
                      <div className="w-3.5 h-3.5 rounded-full bg-white/20 shadow-[0_0_8px_rgba(255,255,255,0.15)] pointer-events-none" />
                    )}

                    {/* Inlay Double Marker (12 & 24) */}
                    {hasDoubleInlay && (
                      <div className="flex flex-col justify-around py-12 items-center h-full">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ffb95f]/30 shadow-[0_0_10px_rgba(255,185,95,0.25)] pointer-events-none" />
                        <div className="w-3.5 h-3.5 rounded-full bg-[#ffb95f]/30 shadow-[0_0_10px_rgba(255,185,95,0.25)] pointer-events-none" />
                      </div>
                    )}

                    {/* Metal Fret Wire */}
                    <div
                      className={`absolute right-0 top-0 bottom-0 shadow-[1px_0_3px_rgba(0,0,0,0.8)] ${
                        fret === 12 || fret === 24
                          ? 'w-[3.5px] bg-slate-300'
                          : 'w-[2.5px] bg-slate-400/70'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* THE NUT (Fret 0 divider) */}
            <div className="absolute left-[70px] top-0 bottom-0 w-[7px] bg-amber-100/90 shadow-[2px_0_8px_rgba(0,0,0,0.8)] z-10 pointer-events-none rounded-r-xs" />

            {/* Interactive 6 Strings & Note Nodes */}
            <div className="relative w-full h-full flex flex-col justify-between z-20">
              {tuningConfig.strings.map((strConfig) => {
                const sNum = strConfig.str;
                const isVisible = activeStrings.has(sNum);
                const openNoteData = getFretNote(strConfig, 0);
                const isOpenInHarmony = targetPitches.includes(openNoteData.note);
                const openPitchIdx = targetPitches.indexOf(openNoteData.note);
                const openDegree = openPitchIdx !== -1 ? activeFormula.labels[openPitchIdx] : '';

                // String gauge styles
                let wireHeight = 'h-[1.5px]';
                let wireGradient = 'from-slate-200 via-slate-300 to-slate-400';
                if (sNum === 2) wireHeight = 'h-[2px]';
                if (sNum === 3) {
                  wireHeight = 'h-[2.2px]';
                  wireGradient = 'from-amber-200/90 via-slate-300 to-slate-400';
                }
                if (sNum === 4) {
                  wireHeight = 'h-[2.8px]';
                  wireGradient = 'from-slate-400 via-zinc-300 to-slate-500';
                }
                if (sNum === 5) {
                  wireHeight = 'h-[3.2px]';
                  wireGradient = 'from-slate-400 via-stone-300 to-slate-500';
                }
                if (sNum === 6) {
                  wireHeight = 'h-[3.8px]';
                  wireGradient = 'from-stone-400 via-zinc-200 to-slate-600 shadow-[0_1.5px_4px_rgba(0,0,0,0.95)]';
                }

                return (
                  <div
                    key={sNum}
                    className={`relative w-full h-9 flex items-center transition-opacity ${
                      isVisible ? 'opacity-100' : 'opacity-25'
                    }`}
                  >
                    {/* Left Nut Label / Tuner Button (Fret 0) */}
                    <button
                      type="button"
                      onClick={() => handleNutClick(sNum)}
                      className={`w-14 h-8 rounded font-mono-code text-xs flex items-center justify-between px-2.5 z-30 shadow transition-all ${
                        isOpenInHarmony
                          ? openDegree === '1'
                            ? 'bg-[#ee9800] text-[#2a1700] font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                            : openDegree.includes('3')
                            ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                            : 'bg-[#33343b] text-[#7df4ff] font-bold'
                          : 'bg-[#282a30] text-[#b9cacb] hover:bg-[#373940]'
                      } ${playingNodeKey === `${sNum}:0` ? 'ring-2 ring-white scale-110' : ''}`}
                      title={`${sNum}번 현 개방현(${openNoteData.note}${openNoteData.octave}) 클릭하여 청음`}
                    >
                      <span className="font-bold">
                        {openNoteData.note}
                        {openNoteData.octave}
                      </span>
                      <span className="text-[10px] text-opacity-80">
                        {sNum === 1 ? '1st' : sNum === 2 ? '2nd' : sNum === 3 ? '3rd' : `${sNum}th`}
                      </span>
                    </button>

                    {/* Metallic Wire string */}
                    <div
                      className={`absolute left-14 right-0 ${wireHeight} bg-gradient-to-r ${wireGradient} shadow-[0_1px_2px_rgba(0,0,0,0.9)] pointer-events-none`}
                    />

                    {/* 24 Interactive Fret Nodes */}
                    <div className="ml-4 flex-1 flex h-full relative">
                      {Array.from({ length: 24 }, (_, i) => i + 1).map((fret) => {
                        const flexGrow = Math.max(0.65, 1.25 - fret * 0.024);
                        const noteData = getFretNote(strConfig, fret);
                        const isInHarmony = targetPitches.includes(noteData.note);
                        const pitchIdx = targetPitches.indexOf(noteData.note);
                        const degree = pitchIdx !== -1 ? activeFormula.labels[pitchIdx] : '';

                        // CAGED Range Focus
                        let isInsideCaged = true;
                        if (activeCagedShape) {
                          const [minF, maxF] = getCagedFretRange(activeCagedShape);
                          isInsideCaged = fret >= minF && fret <= maxF;
                        }

                        const isPlaying = playingNodeKey === `${sNum}:${fret}`;
                        const displayContent = getNodeDisplayContent(noteData.note, fret);

                        return (
                          <div
                            key={fret}
                            style={{ flex: flexGrow }}
                            className="relative flex items-center justify-center h-full"
                          >
                            <button
                              type="button"
                              onClick={() => handleNodeClick(sNum, fret, noteData.note, noteData.frequency)}
                              className="relative flex items-center justify-center w-full h-full group focus:outline-none"
                              title={`${sNum}번현 ${fret}프렛 (${noteData.note}${noteData.octave})`}
                            >
                              {isInHarmony && isVisible && isInsideCaged ? (
                                <span
                                  className={`node-badge pointer-events-none z-10 w-6 h-6 rounded-full text-xs font-mono-code flex items-center justify-center font-bold transition-transform ${
                                    degree === '1'
                                      ? 'bg-[#ee9800] text-[#2a1700] shadow-[0_0_14px_rgba(245,158,11,0.55)] scale-105'
                                      : degree.includes('3')
                                      ? 'bg-[#00f0ff] text-[#00363a] shadow-[0_0_14px_rgba(0,240,255,0.45)]'
                                      : degree.includes('5')
                                      ? 'bg-[#65f2b5] text-[#003824] shadow-[0_0_14px_rgba(16,185,129,0.45)]'
                                      : 'bg-[#373940] text-[#e2e2eb] shadow-sm'
                                  } ${isPlaying ? 'ring-2 ring-white scale-125' : ''}`}
                                >
                                  {displayContent}
                                </span>
                              ) : (
                                <span
                                  className={`node-badge pointer-events-none transition-all duration-150 w-6 h-6 rounded-full text-xs font-mono-code flex items-center justify-center font-bold text-[#e2e2eb] opacity-0 scale-75 group-hover:opacity-75 group-hover:scale-100 group-hover:bg-[#373940] ${
                                    isPlaying ? 'opacity-100 ring-2 ring-white scale-110' : ''
                                  }`}
                                >
                                  {noteData.note}
                                </span>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fret Index Number Rail (0 to 24) */}
          <div className="min-w-[1360px] lg:min-w-[1600px] flex items-center pt-2 text-[#b9cacb] font-mono-code text-[11px]">
            <div className="w-14 text-center font-bold text-[#ffb95f]">0 (Nut)</div>
            <div className="ml-4 flex-1 flex text-center">
              {Array.from({ length: 24 }, (_, i) => i + 1).map((fret) => {
                const flexGrow = Math.max(0.65, 1.25 - fret * 0.024);
                const isSpecial = [3, 5, 7, 9, 15, 17, 19, 21].includes(fret);
                const isOctave = fret === 12 || fret === 24;

                return (
                  <span
                    key={fret}
                    style={{ flex: flexGrow }}
                    className={`${
                      isOctave
                        ? 'text-[#00dbe9] font-bold'
                        : isSpecial
                        ? 'text-[#ffb95f] font-semibold'
                        : 'text-[#849495]'
                    }`}
                  >
                    {fret}
                    {isOctave ? ' ••' : isSpecial ? ' •' : ''}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Interactive Audio Waveform Status Bar */}
        <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-4 font-mono-code text-xs text-[#b9cacb]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6ffbbe] shadow-[0_0_6px_#6ffbbe]" />
              <span>WebAudio Synth Active</span>
            </div>
            <span>•</span>
            <span className="text-[#00f0ff]">{feedbackText}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#b9cacb]">지판 뷰:</span>
              <button
                type="button"
                onClick={zoomTo112}
                className="px-2.5 py-1 rounded bg-[#282a30] text-[#e2e2eb] hover:text-[#00f0ff] transition-colors"
              >
                1-12프렛 집중
              </button>
              <button
                type="button"
                onClick={zoomToFull24}
                className="px-2.5 py-1 rounded bg-[#00f0ff] text-[#00363a] font-bold transition-colors"
              >
                전체 24프렛
              </button>
            </div>
            <div className="flex items-center gap-1 text-[#00f0ff]">
              <span className="material-symbols-outlined text-[18px]">graphic_eq</span>
              <div className="flex gap-0.5 items-end h-3">
                <span className="w-1 h-1.5 bg-[#00f0ff] rounded-xs animate-pulse" />
                <span className="w-1 h-3 bg-[#00f0ff] rounded-xs animate-pulse" />
                <span className="w-1 h-2 bg-[#00f0ff] rounded-xs animate-pulse" />
                <span className="w-1 h-2.5 bg-[#00f0ff] rounded-xs animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Theory & CAGED Voicings Dual Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Theory Formula & Interval Analysis Deck */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#191b22] rounded-xl p-5 shadow-lg flex flex-col gap-4 border border-[#2f364a]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7df4ff] text-[20px]">
                  auto_stories
                </span>
                <h2 className="text-lg font-bold text-[#e2e2eb]">
                  화성학 구조 분석 ({currentRoot} {activeFormula.name})
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#33343b] text-[#7df4ff] font-mono-code text-xs">
                {activeFormula.quality}
              </span>
            </div>

            {/* Formula Table */}
            <div className="bg-[#0c0e14] rounded-lg p-3 border border-[#2f364a]/50">
              <div className="grid grid-cols-4 gap-2 text-center font-mono-code text-xs pb-2 border-b border-[#2f364a]/60 text-[#b9cacb] font-semibold">
                <span>도수 (Degree)</span>
                <span>구성음 (Pitch)</span>
                <span>인터벌 (Interval)</span>
                <span>반음 간격</span>
              </div>
              <div className="flex flex-col gap-1.5 pt-2">
                {activeFormula.intervals.map((iv, idx) => {
                  const pitch = CHROMATIC_NOTES[(rootIndex + iv) % 12];
                  const label = activeFormula.labels[idx];
                  const semitone = activeFormula.semitones[idx] + ' st';

                  let badgeColor = 'text-[#e2e2eb]';
                  if (label === '1') badgeColor = 'text-[#ffb95f] font-bold';
                  else if (label.includes('3')) badgeColor = 'text-[#00f0ff] font-bold';
                  else if (label.includes('5')) badgeColor = 'text-[#65f2b5] font-bold';

                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-4 gap-2 text-center text-xs py-1.5 rounded bg-[#1e1f26]/60 items-center font-mono-code"
                    >
                      <span className={badgeColor}>{label}</span>
                      <span className="text-[#e2e2eb] font-bold">{pitch}</span>
                      <span className="text-[#b9cacb] text-[11px]">
                        {label === '1'
                          ? '완전 1도'
                          : label.includes('3')
                          ? label.includes('b') ? '단 3도' : '장 3도'
                          : label.includes('5')
                          ? label.includes('b') ? '감 5도' : '완전 5도'
                          : label.includes('7')
                          ? label.includes('b') ? '단 7도' : '장 7도'
                          : '화성 성분'}
                      </span>
                      <span className="text-[#00dbe9] text-[11px]">{semitone}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Harmonic Function Tips */}
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-[#1e1f26] border border-[#2f364a]/40">
              <span className="material-symbols-outlined text-[#ee9800] text-[20px] flex-shrink-0 mt-0.5">
                lightbulb
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono-code text-xs font-semibold text-[#e2e2eb]">
                  기타 지판 운지 팁: {currentRoot}음 포지션 가이드
                </span>
                <p className="text-xs text-[#b9cacb] leading-relaxed">
                  {activeFormula.voicingTip ||
                    `${currentRoot}음을 5번현이나 6번현에서 찾아 바레 코드를 형성하거나 펜타토닉 박스를 연결할 수 있습니다.`}
                </p>
              </div>
            </div>
          </div>

          {/* Practice / Quiz Launcher Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#282a30] to-[#1e1f26] rounded-xl p-5 shadow-lg flex items-center justify-between gap-4 border border-[#2f364a]">
            <div className="flex flex-col gap-1 z-10">
              <span className="font-mono-code text-[11px] text-[#6ffbbe] uppercase tracking-wider font-semibold">
                Interactive Trainer
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#e2e2eb]">
                지금 보고 있는 키로 5분 스피드 퀴즈
              </h3>
              <p className="text-xs text-[#b9cacb]">
                선택된{' '}
                <span className="text-[#ffb95f] font-bold">
                  {currentRoot} {activeFormula.name}
                </span>{' '}
                음들을 지판에서 신속하게 짚어내는 훈련을 시작합니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onLaunchQuizWithKey(currentRoot, activeHarmonyKey)}
              className="flex-shrink-0 px-4 py-3 rounded-lg bg-[#ee9800] text-[#2a1700] font-mono-code text-xs font-bold shadow-[0_0_16px_rgba(245,158,11,0.35)] hover:scale-105 transition-transform flex items-center gap-1.5 z-10 whitespace-nowrap"
            >
              <span>퀴즈 시작</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#ee9800]/10 pointer-events-none blur-xl" />
          </div>
        </div>

        {/* Right Panel: CAGED System Voicing Visualizer */}
        <div className="lg:col-span-7 bg-[#191b22] rounded-xl p-5 shadow-lg flex flex-col gap-4 border border-[#2f364a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb95f] text-[22px]">
                view_quilt
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#e2e2eb]">CAGED 포지션별 대표 보이싱 폼</h2>
                <span className="font-mono-code text-xs text-[#b9cacb]">
                  기타리스트의 지판 마스터를 위한 5개 프렛 블록
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#282a30] text-[#7df4ff] font-mono-code text-xs border border-[#2f364a]/50">
              Interactive Chords
            </span>
          </div>

          {/* 5 CAGED Mini Interactive Diagram Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {CAGED_SHAPES.map((c) => {
              const isActive = activeCagedShape === c.shape;
              return (
                <div
                  key={c.shape}
                  onClick={() => setActiveCagedShape(isActive ? null : c.shape)}
                  className={`group p-3 rounded-lg transition-all flex flex-col gap-2.5 cursor-pointer shadow-sm border ${
                    isActive
                      ? 'bg-[#1e1f26] border-[#00f0ff] shadow-[0_0_14px_rgba(0,240,255,0.2)]'
                      : 'bg-[#0c0e14] border-[#2f364a]/60 hover:bg-[#282a30]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono-code">
                    <span
                      className={`text-xs font-bold ${
                        isActive ? 'text-[#00f0ff]' : 'text-[#ffb95f]'
                      }`}
                    >
                      {c.name}
                    </span>
                    <span className="text-[10px] text-[#b9cacb]">
                      {isActive ? 'Active' : c.posName}
                    </span>
                  </div>

                  {/* Mini Fretboard Graphic */}
                  <div className="w-full h-24 rounded bg-[#33343b]/40 p-2 flex flex-col justify-between relative overflow-hidden border border-[#2f364a]/30">
                    <div className="h-0.5 bg-slate-500/70 w-full" />
                    <div className="h-0.5 bg-slate-500/70 w-full" />
                    <div className="h-0.5 bg-slate-500/70 w-full" />
                    <div className="h-0.5 bg-slate-500/70 w-full" />
                    <div className="h-0.5 bg-slate-500/70 w-full" />
                    <div className="h-0.5 bg-slate-500/70 w-full" />

                    {/* Shape specific sample marker dots */}
                    {c.shape === 'C' && (
                      <>
                        <span className="absolute top-[28%] left-[62%] w-3 h-3 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                        <span className="absolute top-[44%] left-[45%] w-2.5 h-2.5 rounded-full bg-[#00f0ff] text-[8px] flex items-center justify-center font-bold text-[#00363a]">
                          3
                        </span>
                        <span className="absolute top-[76%] left-[28%] w-2.5 h-2.5 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                      </>
                    )}
                    {c.shape === 'A' && (
                      <>
                        <span className="absolute top-[28%] left-[30%] w-3 h-3 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                        <span className="absolute top-[44%] left-[65%] w-2.5 h-2.5 rounded-full bg-[#65f2b5] text-[8px] flex items-center justify-center font-bold text-[#003824]">
                          5
                        </span>
                        <span className="absolute top-[60%] left-[65%] w-2.5 h-2.5 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                        <span className="absolute top-[76%] left-[65%] w-2.5 h-2.5 rounded-full bg-[#00f0ff] text-[8px] flex items-center justify-center font-bold text-[#00363a]">
                          3
                        </span>
                      </>
                    )}
                    {c.shape === 'G' && (
                      <>
                        <span className="absolute top-[12%] left-[70%] w-3 h-3 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                        <span className="absolute top-[28%] left-[55%] w-2.5 h-2.5 rounded-full bg-[#00f0ff] text-[8px] flex items-center justify-center font-bold text-[#00363a]">
                          3
                        </span>
                        <span className="absolute top-[92%] left-[70%] w-3 h-3 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                      </>
                    )}
                    {c.shape === 'E' && (
                      <>
                        <span className="absolute top-[12%] left-[40%] w-3 h-3 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                        <span className="absolute top-[28%] left-[72%] w-2.5 h-2.5 rounded-full bg-[#65f2b5] text-[8px] flex items-center justify-center font-bold text-[#003824]">
                          5
                        </span>
                        <span className="absolute top-[44%] left-[72%] w-3 h-3 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                        <span className="absolute top-[60%] left-[56%] w-2.5 h-2.5 rounded-full bg-[#00f0ff] text-[8px] flex items-center justify-center font-bold text-[#00363a]">
                          3
                        </span>
                      </>
                    )}
                    {c.shape === 'D' && (
                      <>
                        <span className="absolute top-[44%] left-[40%] w-3 h-3 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                        <span className="absolute top-[60%] left-[72%] w-2.5 h-2.5 rounded-full bg-[#65f2b5] text-[8px] flex items-center justify-center font-bold text-[#003824]">
                          5
                        </span>
                        <span className="absolute top-[76%] left-[56%] w-3 h-3 rounded-full bg-[#ee9800] text-[8px] flex items-center justify-center font-bold text-[#2a1700]">
                          R
                        </span>
                      </>
                    )}
                  </div>

                  <div className="font-mono-code text-[11px] text-[#b9cacb] flex items-center justify-between">
                    <span>{c.fretSpan}</span>
                    <span className="text-[#00dbe9] group-hover:underline">
                      {isActive ? '해제' : '적용'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CAGED Action and explanation bar */}
          <div className="bg-[#1e1f26] p-3.5 rounded-lg flex items-center justify-between gap-3 text-xs text-[#b9cacb] border border-[#2f364a]/50">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00f0ff] text-[18px]">info</span>
              <span>
                {activeCagedShape
                  ? `CAGED ${activeCagedShape} 폼이 선택되었습니다. 해당 프렛 영역의 노트들만 집중 하이라이트됩니다.`
                  : '선택된 폼 클릭 시 상단 지판에서 해당 포지션의 핵심 운지 클러스터를 집중 강조합니다.'}
              </span>
            </div>
            {activeCagedShape && (
              <button
                type="button"
                onClick={() => setActiveCagedShape(null)}
                className="px-2.5 py-1 rounded bg-[#33343b] text-[#e2e2eb] font-mono-code text-xs hover:text-[#00f0ff] transition-colors flex-shrink-0"
              >
                전체 지판 보기로 복귀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
