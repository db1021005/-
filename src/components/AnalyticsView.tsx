import React, { useState, useEffect } from 'react';
import { TuningId } from '../types/guitar';
import { TUNINGS, getFretNote } from '../data/musicTheory';
import { UserStats, MistakeItem, loadUserStats, loadMistakes, saveMistakes, saveUserStats } from '../utils/storage';

interface AnalyticsViewProps {
  currentTuning: TuningId;
  onReviewMistakeQuiz: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  currentTuning,
  onReviewMistakeQuiz,
}) => {
  const [stats, setStats] = useState<UserStats>(loadUserStats());
  const [mistakes, setMistakes] = useState<MistakeItem[]>(loadMistakes());
  const [selectedFretDetail, setSelectedFretDetail] = useState<{
    stringNum: number;
    fret: number;
    note: string;
    attempts: number;
    correct: number;
    rate: number;
  } | null>(null);

  const tuningConfig = TUNINGS[currentTuning];

  useEffect(() => {
    setStats(loadUserStats());
    setMistakes(loadMistakes());
  }, []);

  const totalAnswered = stats.totalAnswered;
  const totalCorrect = stats.totalCorrect;
  const accuracyRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Clear mistakes
  const handleClearMistakes = () => {
    if (window.confirm('오답 노트를 초기화하시겠습니까?')) {
      saveMistakes([]);
      setMistakes([]);
    }
  };

  // Inspect fret in heatmap
  const handleHeatmapFretClick = (stringNum: number, fret: number) => {
    const sConf = tuningConfig.strings.find((s) => s.str === stringNum);
    if (!sConf) return;
    const noteData = getFretNote(sConf, fret);
    const key = `${stringNum}:${fret}`;
    const fretStat = stats.fretboardHeatmap[key] || { attempts: 0, correct: 0 };
    const rate = fretStat.attempts > 0 ? Math.round((fretStat.correct / fretStat.attempts) * 100) : 0;

    setSelectedFretDetail({
      stringNum,
      fret,
      note: noteData.note,
      attempts: fretStat.attempts,
      correct: fretStat.correct,
      rate,
    });
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Overview Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[#00f0ff] text-[20px]">
            analytics
          </span>
          <span className="text-[11px] font-mono-code text-[#00dbe9] uppercase tracking-wider font-bold">
            Performance Analytics &amp; Fret Heatmap
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#e2e2eb]">
          학습 통계 및 지판 취약도 분석
        </h2>
        <p className="text-xs sm:text-sm text-[#b9cacb] mt-1">
          기타 지판 6현 x 24프렛 그리드에서 정답률을 시각화하고, 오답 노트를 통해 취약한 포지션을 집중 보완합니다.
        </p>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#191b22] border border-[#2f364a] rounded-xl p-4 flex flex-col gap-1 shadow-md">
          <span className="text-[11px] font-mono-code text-[#b9cacb]">총 푼 문제</span>
          <span className="text-3xl font-bold text-[#e2e2eb] font-mono-code">{totalAnswered}회</span>
          <span className="text-[11px] text-[#65f2b5]">누적 풀이 기록</span>
        </div>

        <div className="bg-[#191b22] border border-[#2f364a] rounded-xl p-4 flex flex-col gap-1 shadow-md">
          <span className="text-[11px] font-mono-code text-[#b9cacb]">종합 정답률</span>
          <span className="text-3xl font-bold text-[#00f0ff] font-mono-code">{accuracyRate}%</span>
          <span className="text-[11px] text-[#00dbe9]">
            {totalCorrect}문제 정답 / {totalAnswered}문제
          </span>
        </div>

        <div className="bg-[#191b22] border border-[#2f364a] rounded-xl p-4 flex flex-col gap-1 shadow-md">
          <span className="text-[11px] font-mono-code text-[#b9cacb]">최고 연속 콤보</span>
          <span className="text-3xl font-bold text-[#ffb95f] font-mono-code">
            {stats.bestStreak}연속
          </span>
          <span className="text-[11px] text-[#ee9800]">
            현재 콤보: {stats.currentStreak}
          </span>
        </div>

        <div className="bg-[#191b22] border border-[#2f364a] rounded-xl p-4 flex flex-col gap-1 shadow-md">
          <span className="text-[11px] font-mono-code text-[#b9cacb]">오답 보관함</span>
          <span className="text-3xl font-bold text-red-400 font-mono-code">{mistakes.length}개</span>
          <span className="text-[11px] text-red-300">복습 필요 문제</span>
        </div>
      </div>

      {/* Interactive Fretboard Weakness Heatmap */}
      <div className="bg-[#191b22] border border-[#2f364a] rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2f364a]/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ffb95f] text-[22px]">
              grid_view
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#e2e2eb]">
                지판 취약도 인터랙티브 히트맵 (6현 × 24프렛)
              </h3>
              <span className="text-xs text-[#b9cacb]">
                각 프렛을 클릭하여 시도 횟수와 취약률을 조회하세요.
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 font-mono-code text-[11px]">
            <span className="flex items-center gap-1.5 text-[#e2e2eb]">
              <span className="w-3 h-3 rounded bg-[#10b981]" />
              숙련 (80%+)
            </span>
            <span className="flex items-center gap-1.5 text-[#e2e2eb]">
              <span className="w-3 h-3 rounded bg-[#ee9800]" />
              보통 (50~79%)
            </span>
            <span className="flex items-center gap-1.5 text-[#e2e2eb]">
              <span className="w-3 h-3 rounded bg-red-500" />
              취약 (&lt;50%)
            </span>
            <span className="flex items-center gap-1.5 text-[#849495]">
              <span className="w-3 h-3 rounded bg-[#282a30]" />
              미학습
            </span>
          </div>
        </div>

        {/* Heatmap Grid Viewport */}
        <div className="w-full overflow-x-auto pb-2 fretboard-scrollbar">
          <div className="min-w-[1000px] bg-[#0c0e14] p-3 rounded-xl border border-[#2f364a] flex flex-col gap-1.5 select-none">
            {tuningConfig.strings.map((strConfig) => {
              const sNum = strConfig.str;
              return (
                <div key={sNum} className="flex items-center h-8">
                  <span className="w-12 font-mono-code text-xs font-bold text-[#ffb95f] flex items-center justify-between pr-2">
                    <span>{strConfig.openNote}</span>
                    <span className="text-[10px] text-[#849495]">{sNum}현</span>
                  </span>

                  <div className="flex-1 flex justify-between gap-1">
                    {Array.from({ length: 25 }, (_, f) => f).map((fret) => {
                      const key = `${sNum}:${fret}`;
                      const fStat = stats.fretboardHeatmap[key];
                      const attempts = fStat ? fStat.attempts : 0;
                      const correct = fStat ? fStat.correct : 0;
                      const rate = attempts > 0 ? (correct / attempts) * 100 : -1;

                      let cellColor = 'bg-[#1e1f26] text-[#849495] hover:bg-[#33343b]';
                      if (rate >= 80) {
                        cellColor = 'bg-[#10b981]/30 text-[#6ffbbe] border border-[#10b981]/50 hover:bg-[#10b981]/50';
                      } else if (rate >= 50) {
                        cellColor = 'bg-[#ee9800]/30 text-[#ffb95f] border border-[#ee9800]/50 hover:bg-[#ee9800]/50';
                      } else if (rate >= 0) {
                        cellColor = 'bg-red-500/30 text-red-300 border border-red-500/50 hover:bg-red-500/50';
                      }

                      const isSelected =
                        selectedFretDetail?.stringNum === sNum &&
                        selectedFretDetail?.fret === fret;

                      return (
                        <button
                          key={fret}
                          type="button"
                          onClick={() => handleHeatmapFretClick(sNum, fret)}
                          className={`flex-1 h-7 rounded text-[10px] font-mono-code font-bold transition-all flex items-center justify-center ${cellColor} ${
                            isSelected ? 'ring-2 ring-[#00f0ff] scale-110 z-10' : ''
                          }`}
                          title={`${sNum}번현 ${fret}프렛 (${attempts}회 시도, 정답률 ${rate >= 0 ? Math.round(rate) + '%' : '미시도'})`}
                        >
                          {fret}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Fret numbering axis */}
            <div className="flex items-center pt-1 text-[10px] font-mono-code text-[#849495]">
              <span className="w-12 text-center">Fret:</span>
              <div className="flex-1 flex justify-between gap-1 text-center">
                {Array.from({ length: 25 }, (_, f) => f).map((fret) => (
                  <span
                    key={fret}
                    className={`flex-1 ${
                      [3, 5, 7, 9, 12, 15, 17, 19, 21, 24].includes(fret)
                        ? 'text-[#00f0ff] font-bold'
                        : ''
                    }`}
                  >
                    {fret === 0 ? 'Nut' : fret}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Fret Callout Strip */}
        {selectedFretDetail && (
          <div className="bg-[#0c0e14] p-3.5 rounded-xl border border-[#00f0ff]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center font-mono-code font-bold text-lg">
                {selectedFretDetail.note}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-[#e2e2eb]">
                  {selectedFretDetail.stringNum}번 줄 {selectedFretDetail.fret}프렛 ({selectedFretDetail.note}음)
                </span>
                <span className="text-xs text-[#b9cacb] font-mono-code">
                  총 {selectedFretDetail.attempts}회 시도 중 {selectedFretDetail.correct}회 정답 (정답률:{' '}
                  <strong
                    className={
                      selectedFretDetail.rate >= 80
                        ? 'text-[#6ffbbe]'
                        : selectedFretDetail.rate >= 50
                        ? 'text-[#ffb95f]'
                        : 'text-red-400'
                    }
                  >
                    {selectedFretDetail.attempts > 0 ? `${selectedFretDetail.rate}%` : '데이터 없음'}
                  </strong>
                  )
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onReviewMistakeQuiz}
              className="px-4 py-2 rounded-lg bg-[#00f0ff] text-[#00363a] font-mono-code text-xs font-bold hover:scale-105 transition-all self-end sm:self-center"
            >
              이 포지션 집중 퀴즈 풀기
            </button>
          </div>
        )}
      </div>

      {/* Mistake Review Notebook (오답 노트) */}
      <div className="bg-[#191b22] border border-[#2f364a] rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#2f364a]/50 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-red-400 text-[22px]">
              edit_note
            </span>
            <div>
              <h3 className="text-lg font-bold text-[#e2e2eb]">오답 노트 (Mistake Review)</h3>
              <span className="text-xs text-[#b9cacb]">
                틀렸던 문제들을 복습하고 취약점을 완벽하게 극복하세요.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mistakes.length > 0 && (
              <button
                type="button"
                onClick={handleClearMistakes}
                className="px-3 py-1.5 rounded bg-[#282a30] text-[#b9cacb] font-mono-code text-xs hover:text-red-400 transition-colors"
              >
                오답 초기화
              </button>
            )}
            <button
              type="button"
              onClick={onReviewMistakeQuiz}
              className="px-4 py-1.5 rounded bg-[#ee9800] text-[#2a1700] font-mono-code text-xs font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)] hover:scale-105 transition-all"
            >
              오답 복습 퀴즈 시작
            </button>
          </div>
        </div>

        {/* Mistakes List */}
        {mistakes.length === 0 ? (
          <div className="text-center py-8 text-[#849495] font-mono-code text-xs">
            현재 보관된 오답이 없습니다! 퀴즈를 풀면서 틀린 문제가 이곳에 자동으로 기록됩니다.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {mistakes.map((m) => (
              <div
                key={m.id}
                className="bg-[#0c0e14] border border-[#2f364a]/60 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono-code text-[10px] font-bold">
                      {m.timesFailed}회 오답
                    </span>
                    <h4 className="font-bold text-sm text-[#e2e2eb]">{m.prompt}</h4>
                  </div>
                  <p className="text-xs text-[#b9cacb]">{m.explanation}</p>
                </div>

                <div className="flex items-center gap-4 font-mono-code text-xs flex-shrink-0">
                  <div className="flex flex-col text-right">
                    <span className="text-red-400">내 답: {m.userAnswer}</span>
                    <span className="text-[#65f2b5] font-bold">정답: {m.correctAnswer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
