import React from 'react';

interface FooterProps {
  onNavigate: (tab: 'fretboard' | 'quiz-mode' | 'chord-scale' | 'analytics') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#0c0e14] border-t border-[#2f364a] py-6 mt-auto">
      <div className="w-full px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono-code text-xs text-[#b9cacb]">
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#65f2b5] shadow-[0_0_8px_#65f2b5]" />
            WebAudio 96kHz Low-Latency
          </span>
          <span className="text-[#3b494b]">|</span>
          <span>DSP Engine v2.4</span>
          <span className="text-[#3b494b]">|</span>
          <span>MIDI Supported</span>
          <span className="text-[#3b494b]">|</span>
          <span>Windows 11 Server Mode</span>
        </div>

        <div className="flex items-center gap-6 flex-wrap justify-center">
          <span>© 2025 become a guitarist. Studio Engine.</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('chord-scale')}
              className="hover:text-[#00f0ff] transition-colors"
            >
              Scale Catalog
            </button>
            <button
              type="button"
              onClick={() => onNavigate('quiz-mode')}
              className="hover:text-[#00f0ff] transition-colors"
            >
              Practice Drills
            </button>
            <button
              type="button"
              onClick={() => onNavigate('analytics')}
              className="hover:text-[#00f0ff] transition-colors"
            >
              Telemetry
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
