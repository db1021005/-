import React, { useState } from 'react';
import { DifficultyLevel, HarmonyFormula, NoteName } from '../types/guitar';
import { CHROMATIC_NOTES, HARMONY_CATALOG } from '../data/musicTheory';
import { soundEngine } from '../audio/synth';

interface ChordScaleCatalogViewProps {
  onSelectFormula: (root: NoteName, formulaId: string) => void;
  userDifficulty: DifficultyLevel;
}

export const ChordScaleCatalogView: React.FC<ChordScaleCatalogViewProps> = ({
  onSelectFormula,
  userDifficulty,
}) => {
  const [rootNote, setRootNote] = useState<NoteName>('C');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'triad' | '7th' | 'tension' | 'scale_basic' | 'scale_mode'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<HarmonyFormula | null>(null);

  const formulas = Object.values(HARMONY_CATALOG);

  // Filter formulas
  const filteredFormulas = formulas.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchQuality = item.quality.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      if (!matchName && !matchQuality && !matchDesc) return false;
    }
    return true;
  });

  const rootIdx = CHROMATIC_NOTES.indexOf(rootNote);

  // Audio Play preview
  const handlePlaySound = (formula: HarmonyFormula) => {
    const rootIndex = CHROMATIC_NOTES.indexOf(rootNote);
    // Base frequency for root ~ 130Hz to 260Hz
    const rootFreq = 130.81 * Math.pow(2, rootIndex / 12);
    const freqs = formula.intervals.map((iv) => rootFreq * Math.pow(2, iv / 12));

    if (formula.type === 'chord') {
      soundEngine.strumChord(freqs, 110);
    } else {
      soundEngine.playScaleRun(freqs, 160);
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#00f0ff] text-[20px]">
              menu_book
            </span>
            <span className="text-[11px] font-mono-code text-[#00dbe9] uppercase tracking-wider font-bold">
              Comprehensive Guitar Library
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#e2e2eb]">
            종합 코드 &amp; 스케일 백과사전
          </h2>
          <p className="text-xs sm:text-sm text-[#b9cacb] mt-1">
            3화음부터 텐션 코드, 펜타토닉, 블루스, 7가지 모드 스케일까지 완벽 정리된 지판 레퍼런스
          </p>
        </div>

        {/* Root Selector */}
        <div className="flex flex-col gap-1.5 bg-[#191b22] p-2.5 rounded-xl border border-[#2f364a]">
          <span className="text-[11px] font-mono-code text-[#b9cacb] flex items-center justify-between">
            <span>기준 근음 (Root):</span>
            <span className="text-[#ffb95f] font-bold">{rootNote}</span>
          </span>
          <div className="grid grid-cols-6 gap-1">
            {CHROMATIC_NOTES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRootNote(n)}
                className={`w-7 h-7 rounded font-mono-code text-xs font-bold transition-all ${
                  rootNote === n
                    ? 'bg-[#ee9800] text-[#2a1700] shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    : 'bg-[#0c0e14] text-[#b9cacb] hover:text-[#e2e2eb]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#191b22] p-3 rounded-xl border border-[#2f364a] mb-6">
        {/* Category Chips */}
        <div className="flex flex-wrap gap-1.5 font-mono-code text-xs">
          {[
            { id: 'all', label: '전체 (All)' },
            { id: 'triad', label: '기본 3화음' },
            { id: '7th', label: '7th 코드' },
            { id: 'tension', label: '텐션/확장 화음' },
            { id: 'scale_basic', label: '기본/펜타토닉' },
            { id: 'scale_mode', label: '모드 스케일' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded transition-all ${
                categoryFilter === cat.id
                  ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                  : 'bg-[#0c0e14] text-[#b9cacb] hover:bg-[#282a30] hover:text-[#e2e2eb]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#849495] text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="이름/성향 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0c0e14] border border-[#2f364a] rounded-lg text-xs font-mono-code text-[#e2e2eb] placeholder-[#849495] focus:outline-none focus:border-[#00f0ff]"
          />
        </div>
      </div>

      {/* Catalog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFormulas.map((item) => {
          const pitches = item.intervals.map((iv) => CHROMATIC_NOTES[(rootIdx + iv) % 12]);
          const isChord = item.type === 'chord';

          return (
            <div
              key={item.id}
              className="bg-[#191b22] hover:bg-[#1e1f26] border border-[#2f364a] rounded-xl p-5 transition-all shadow-md flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-[#282a30] text-[#7df4ff] uppercase">
                      {item.category.replace('_', ' ')}
                    </span>
                    <h3 className="text-xl font-bold text-[#e2e2eb] mt-1 group-hover:text-[#00f0ff] transition-colors">
                      {rootNote} {item.name}
                    </h3>
                  </div>
                  <span
                    className={`text-[10px] font-mono-code px-2 py-0.5 rounded font-bold ${
                      item.difficulty === 'beginner'
                        ? 'bg-[#65f2b5]/20 text-[#65f2b5]'
                        : item.difficulty === 'intermediate'
                        ? 'bg-[#ee9800]/20 text-[#ffb95f]'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {item.difficulty === 'beginner'
                      ? '초급'
                      : item.difficulty === 'intermediate'
                      ? '중급'
                      : '고급'}
                  </span>
                </div>

                <p className="text-xs text-[#b9cacb] line-clamp-2 leading-relaxed mb-3">
                  {item.description}
                </p>

                {/* Formula & Pitches Strip */}
                <div className="bg-[#0c0e14] p-3 rounded-lg border border-[#2f364a]/50 flex flex-col gap-1.5 font-mono-code text-xs">
                  <div className="flex items-center justify-between text-[#849495] text-[11px]">
                    <span>구성 도수:</span>
                    <span className="text-[#00dbe9] font-bold">{item.labels.join(' - ')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#849495] text-[11px]">
                    <span>음계 구성음:</span>
                    <span className="text-[#ffb95f] font-bold">{pitches.join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#2f364a]/40">
                <button
                  type="button"
                  onClick={() => handlePlaySound(item)}
                  className="flex-1 py-2 rounded-lg bg-[#282a30] hover:bg-[#33343b] text-[#e2e2eb] font-mono-code text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="사운드 미리듣기"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#00f0ff]">
                    volume_up
                  </span>
                  <span>{isChord ? '스트럼 청음' : '스케일 청음'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectFormula(rootNote, item.id)}
                  className="flex-1 py-2 rounded-lg bg-[#00f0ff] hover:bg-[#7df4ff] text-[#00363a] font-mono-code text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  title="인터랙티브 6현 지판에 표시"
                >
                  <span>지판에 적용</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
