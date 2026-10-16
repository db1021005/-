import React, { useState, useEffect } from 'react';
import { DifficultyLevel, TuningId } from '../types/guitar';
import { TUNINGS } from '../data/musicTheory';
import { soundEngine } from '../audio/synth';

interface HeaderProps {
  activeTab: 'fretboard' | 'quiz-mode' | 'chord-scale' | 'analytics';
  setActiveTab: (tab: 'fretboard' | 'quiz-mode' | 'chord-scale' | 'analytics') => void;
  currentTuning: TuningId;
  setCurrentTuning: (tuning: TuningId) => void;
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;
  onOpenServerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentTuning,
  setCurrentTuning,
  difficulty,
  setDifficulty,
  onOpenServerModal,
}) => {
  const [isTuningMenuOpen, setIsTuningMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [metronomeBpm, setMetronomeBpm] = useState(120);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);
  const [showMetronomePopup, setShowMetronomePopup] = useState(false);

  // Metronome timer effect
  useEffect(() => {
    let intervalId: number | null = null;
    let beat = 0;
    if (isMetronomeActive) {
      const intervalMs = (60 / metronomeBpm) * 1000;
      soundEngine.playMetronomeTick(true);
      intervalId = window.setInterval(() => {
        beat = (beat + 1) % 4;
        soundEngine.playMetronomeTick(beat === 0);
      }, intervalMs);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isMetronomeActive, metronomeBpm]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1d27]/95 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.45)] border-b border-[#2f364a]">
      <div className="h-16 w-full px-4 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand & Tuning */}
        <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0">
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => setActiveTab('fretboard')}
            title="become a guitarist PRO 홈"
          >
            <img
              alt="Become a Guitarist Logo"
              className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WvYbtpv8oXPrIiZJYDHilGAgB23pd-Y30Cau8sXSN-nUoyopf9OZBMtmGMzU57ZFnGndiZhPqcIQHBUDzUcUd7YubFGyifrrRPQr7zSocej4f1mf8OUtOLVF2MM7374io1r-EKoexKY3VDqXdluKA8Lzl_qHrQHBhrjDG8c6Wmm1n1GIgbn1DXXucMAGKtoip626gADWVSCZmH3Z3iurgaGoqA1XjH80uehStMX_z6u54LQZ7rlL11z0U"
            />
            <span className="font-mono-code text-sm tracking-wider uppercase text-[#e2e2eb] flex items-center gap-1.5 font-bold">
              become a guitarist{' '}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#33343b] text-[#00dbe9] uppercase tracking-normal">
                PRO
              </span>
            </span>
          </div>

          {/* Tuning Dropdown */}
          <div className="relative hidden xl:block">
            <div className="flex items-center bg-[#0c0e14] px-3 py-1 rounded border border-[#2f364a] gap-1.5">
              <span className="material-symbols-outlined text-[#849495] text-[18px]">music_note</span>
              <span className="font-mono-code text-[11px] text-[#b9cacb] uppercase">Tuning:</span>
              <button
                type="button"
                className="font-mono-code text-xs text-[#dbfcff] hover:text-[#7df4ff] flex items-center gap-1 transition-colors"
                onClick={() => setIsTuningMenuOpen(!isTuningMenuOpen)}
              >
                <span className="font-semibold">{TUNINGS[currentTuning].name}</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            </div>

            {isTuningMenuOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-[#1e1f26] border border-[#2f364a] rounded-lg shadow-2xl py-1 z-50">
                {Object.values(TUNINGS).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setCurrentTuning(t.id);
                      setIsTuningMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-mono-code flex items-center justify-between transition-colors ${
                      currentTuning === t.id
                        ? 'bg-[#00f0ff]/15 text-[#00f0ff] font-semibold'
                        : 'text-[#e2e2eb] hover:bg-[#282a30]'
                    }`}
                  >
                    <span>{t.name}</span>
                    {currentTuning === t.id && (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#0c0e14] p-1 rounded-lg border border-[#2f364a] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('fretboard')}
            className={`px-3 sm:px-4 py-1.5 rounded font-mono-code text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'fretboard'
                ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-[#b9cacb] hover:bg-[#282a30] hover:text-[#e2e2eb]'
            }`}
          >
            인터랙티브 지판
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz-mode')}
            className={`px-3 sm:px-4 py-1.5 rounded font-mono-code text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'quiz-mode'
                ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-[#b9cacb] hover:bg-[#282a30] hover:text-[#e2e2eb]'
            }`}
          >
            지판 암기 퀴즈
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chord-scale')}
            className={`px-3 sm:px-4 py-1.5 rounded font-mono-code text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'chord-scale'
                ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-[#b9cacb] hover:bg-[#282a30] hover:text-[#e2e2eb]'
            }`}
          >
            코드/스케일 사전
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 sm:px-4 py-1.5 rounded font-mono-code text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-[#b9cacb] hover:bg-[#282a30] hover:text-[#e2e2eb]'
            }`}
          >
            학습 통계
          </button>
        </nav>

        {/* Right: Controls Rack (Difficulty, Metronome, Sound, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Difficulty Segment */}
          <div className="hidden sm:flex items-center bg-[#0c0e14] p-1 rounded border border-[#2f364a] text-[#b9cacb] font-mono-code text-xs">
            <button
              type="button"
              onClick={() => setDifficulty('beginner')}
              className={`px-2 py-1 rounded transition-colors ${
                difficulty === 'beginner'
                  ? 'bg-[#ee9800] text-[#2a1700] font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'hover:bg-[#282a30] hover:text-[#e2e2eb]'
              }`}
            >
              초급
            </button>
            <button
              type="button"
              onClick={() => setDifficulty('intermediate')}
              className={`px-2 py-1 rounded transition-colors ${
                difficulty === 'intermediate'
                  ? 'bg-[#ee9800] text-[#2a1700] font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'hover:bg-[#282a30] hover:text-[#e2e2eb]'
              }`}
            >
              중급
            </button>
            <button
              type="button"
              onClick={() => setDifficulty('advanced')}
              className={`px-2 py-1 rounded transition-colors ${
                difficulty === 'advanced'
                  ? 'bg-[#ee9800] text-[#2a1700] font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'hover:bg-[#282a30] hover:text-[#e2e2eb]'
              }`}
            >
              고급
            </button>
          </div>

          {/* Metronome Tool */}
          <div className="relative">
            <div className="flex items-center gap-1 bg-[#0c0e14] p-1 rounded border border-[#2f364a]">
              <button
                type="button"
                onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                className={`flex items-center gap-1 px-2 py-1 rounded font-mono-code text-xs transition-colors ${
                  isMetronomeActive
                    ? 'bg-[#00f0ff]/20 text-[#00f0ff] font-bold ring-1 ring-[#00f0ff]'
                    : 'text-[#00dbe9] hover:bg-[#282a30]'
                }`}
                title="메트로놈 토글 (클릭하여 켜기/끄기)"
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isMetronomeActive ? 'animate-pulse' : ''
                  }`}
                >
                  timer
                </span>
                <span>{metronomeBpm}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMetronomePopup(!showMetronomePopup)}
                className="px-1 py-1 rounded text-[#849495] hover:text-[#e2e2eb]"
                title="BPM 조절"
              >
                <span className="material-symbols-outlined text-[14px]">tune</span>
              </button>
            </div>

            {/* Metronome Popover */}
            {showMetronomePopup && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-[#1e1f26] border border-[#2f364a] rounded-xl shadow-2xl p-3 z-50 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="text-[#b9cacb]">메트로놈 BPM</span>
                  <span className="text-[#00f0ff] font-bold text-sm">{metronomeBpm}</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="220"
                  value={metronomeBpm}
                  onChange={(e) => setMetronomeBpm(Number(e.target.value))}
                  className="w-full accent-[#00f0ff] cursor-pointer"
                />
                <div className="grid grid-cols-4 gap-1 text-[11px] font-mono-code">
                  {[60, 90, 120, 140].map((bpm) => (
                    <button
                      key={bpm}
                      type="button"
                      onClick={() => setMetronomeBpm(bpm)}
                      className={`py-1 rounded text-center transition-colors ${
                        metronomeBpm === bpm
                          ? 'bg-[#00f0ff] text-[#00363a] font-bold'
                          : 'bg-[#282a30] text-[#e2e2eb] hover:bg-[#33343b]'
                      }`}
                    >
                      {bpm}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                  className={`w-full py-1.5 rounded text-xs font-mono-code font-bold transition-all ${
                    isMetronomeActive
                      ? 'bg-[#ee9800] text-[#2a1700]'
                      : 'bg-[#00f0ff] text-[#00363a]'
                  }`}
                >
                  {isMetronomeActive ? '메트로놈 정지' : '메트로놈 시작'}
                </button>
              </div>
            )}
          </div>

          {/* Sound Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`p-1.5 rounded border border-[#2f364a] transition-colors ${
              isMuted
                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                : 'bg-[#0c0e14] text-[#6ffbbe] hover:bg-[#282a30]'
            }`}
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* Profile & Windows 11 Server Status Button */}
          <div className="flex items-center pl-2 border-l border-[#2f364a]">
            <button
              type="button"
              onClick={onOpenServerModal}
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-[#00f0ff] transition-all"
              title="사용자 프로필 & Windows 11 웹서버 콘솔"
            >
              <img
                alt="Profile Avatar"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-[#2f364a]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxuhxNs3s4dDSRKDoa8GRD6USHafFEb-1phzIWxZXruQPnWsIS-TH8baiA28rA-vSJLqd4Is4Lt3OcVNidw0dY7Dhp5CDCkZHxlfX1iwRRi2D6ppzJU9deKb1ABM-xFQuxSbVMuX38Af1oC4gAo8j67AZqbrAKMqghklfaa7jNlCZ764gcZsaOIHfIlRPVTV9c26lk3oHYKZX-cdDQGbWBe6jWa306K4OLkGd_5SSYgwuSo7bwOHy_"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
