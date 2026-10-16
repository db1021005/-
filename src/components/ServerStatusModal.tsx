import React from 'react';
import { DifficultyLevel } from '../types/guitar';
import { soundEngine } from '../audio/synth';

interface ServerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  difficulty: DifficultyLevel;
  setDifficulty: (level: DifficultyLevel) => void;
}

export const ServerStatusModal: React.FC<ServerStatusModalProps> = ({
  isOpen,
  onClose,
  difficulty,
  setDifficulty,
}) => {
  if (!isOpen) return null;

  const testAudioTone = () => {
    soundEngine.playCorrectSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#191b22] border border-[#2f364a] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#2f364a] bg-[#1e1f26]">
          <div className="flex items-center gap-3">
            <img
              alt="User Avatar"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#00f0ff]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxuhxNs3s4dDSRKDoa8GRD6USHafFEb-1phzIWxZXruQPnWsIS-TH8baiA28rA-vSJLqd4Is4Lt3OcVNidw0dY7Dhp5CDCkZHxlfX1iwRRi2D6ppzJU9deKb1ABM-xFQuxSbVMuX38Af1oC4gAo8j67AZqbrAKMqghklfaa7jNlCZ764gcZsaOIHfIlRPVTV9c26lk3oHYKZX-cdDQGbWBe6jWa306K4OLkGd_5SSYgwuSo7bwOHy_"
            />
            <div>
              <h3 className="font-bold text-base text-[#e2e2eb] flex items-center gap-2">
                <span>기타리스트 프로필 &amp; 시스템 콘솔</span>
                <span className="px-1.5 py-0.5 rounded bg-[#33343b] text-[#00dbe9] text-[10px] font-mono-code font-bold">
                  PRO
                </span>
              </h3>
              <span className="text-xs text-[#b9cacb] font-mono-code">db1021005@gmail.com</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#282a30] text-[#b9cacb] hover:text-[#e2e2eb] hover:bg-[#33343b] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* Windows 11 Web Server Specifications */}
          <div className="bg-[#0c0e14] border border-[#2f364a] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code text-[#00f0ff] uppercase tracking-wider font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                Windows 11 Web Server Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#10b981]/20 text-[#6ffbbe] text-[10px] font-mono-code font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                ONLINE (Port 3000)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono-code text-[#b9cacb]">
              <div className="bg-[#1e1f26] p-2.5 rounded-lg flex flex-col gap-0.5">
                <span className="text-[10px] text-[#849495]">Operating Platform:</span>
                <span className="text-[#e2e2eb] font-semibold">Windows 11 x64 Build</span>
              </div>
              <div className="bg-[#1e1f26] p-2.5 rounded-lg flex flex-col gap-0.5">
                <span className="text-[10px] text-[#849495]">Server Backend:</span>
                <span className="text-[#e2e2eb] font-semibold">Node.js + Express 4.21</span>
              </div>
              <div className="bg-[#1e1f26] p-2.5 rounded-lg flex flex-col gap-0.5">
                <span className="text-[10px] text-[#849495]">DSP Engine:</span>
                <span className="text-[#65f2b5] font-semibold">WebAudio 96kHz Low-Latency</span>
              </div>
              <div className="bg-[#1e1f26] p-2.5 rounded-lg flex flex-col gap-0.5">
                <span className="text-[10px] text-[#849495]">Client Runtime:</span>
                <span className="text-[#00dbe9] font-semibold">React 19 + Vite 8.3</span>
              </div>
            </div>
          </div>

          {/* User Training Difficulty Preset */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono-code text-[#b9cacb] font-semibold">
              학습자 맞춤 난이도 설정 (PRD 요구사항 ⑥):
            </span>
            <div className="grid grid-cols-3 gap-2 font-mono-code text-xs">
              <button
                type="button"
                onClick={() => setDifficulty('beginner')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  difficulty === 'beginner'
                    ? 'bg-[#ee9800]/20 border-[#ee9800] text-[#ffb95f]'
                    : 'bg-[#0c0e14] border-[#2f364a] text-[#b9cacb] hover:bg-[#282a30]'
                }`}
              >
                <span className="font-bold">초급 (Beginner)</span>
                <span className="text-[10px] text-[#849495]">
                  메이저/마이너 3화음 &amp; 펜타토닉 (1~5프렛)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('intermediate')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  difficulty === 'intermediate'
                    ? 'bg-[#ee9800]/20 border-[#ee9800] text-[#ffb95f]'
                    : 'bg-[#0c0e14] border-[#2f364a] text-[#b9cacb] hover:bg-[#282a30]'
                }`}
              >
                <span className="font-bold">중급 (Intermediate)</span>
                <span className="text-[10px] text-[#849495]">
                  초급 + 7th 코드 &amp; CAGED 시스템 (1~12프렛)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDifficulty('advanced')}
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  difficulty === 'advanced'
                    ? 'bg-[#ee9800]/20 border-[#ee9800] text-[#ffb95f]'
                    : 'bg-[#0c0e14] border-[#2f364a] text-[#b9cacb] hover:bg-[#282a30]'
                }`}
              >
                <span className="font-bold">고급 (Advanced)</span>
                <span className="text-[10px] text-[#849495]">
                  모드 스케일 &amp; 텐션 코드 (24프렛 완전 스팬)
                </span>
              </button>
            </div>
          </div>

          {/* Quick Actions & Tests */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono-code text-[#b9cacb] font-semibold">
              오디오 엔진 진단 &amp; 데이터 관리:
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono-code text-xs">
              <button
                type="button"
                onClick={testAudioTone}
                className="py-2.5 px-3 rounded-lg bg-[#282a30] hover:bg-[#33343b] text-[#00f0ff] font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">volume_up</span>
                <span>DSP 사운드 출력 테스트</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="py-2.5 px-3 rounded-lg bg-[#282a30] hover:bg-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
                <span>로컬 데이터 초기화</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1e1f26] border-t border-[#2f364a] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#00f0ff] text-[#00363a] font-mono-code text-xs font-bold hover:scale-105 transition-all"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
