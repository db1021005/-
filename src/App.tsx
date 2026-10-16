/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DifficultyLevel, NoteName, TuningId } from './types/guitar';
import { Header } from './components/Header';
import { InteractiveFretboardView } from './components/InteractiveFretboardView';
import { QuizModeView } from './components/QuizModeView';
import { ChordScaleCatalogView } from './components/ChordScaleCatalogView';
import { AnalyticsView } from './components/AnalyticsView';
import { Footer } from './components/Footer';
import { ServerStatusModal } from './components/ServerStatusModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'fretboard' | 'quiz-mode' | 'chord-scale' | 'analytics'>('fretboard');
  const [currentTuning, setCurrentTuning] = useState<TuningId>('standard');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);

  // Cross-view presets when launching quiz
  const [quizPresetRoot, setQuizPresetRoot] = useState<NoteName | undefined>(undefined);
  const [quizPresetHarmonyKey, setQuizPresetHarmonyKey] = useState<string | undefined>(undefined);

  // Navigate to quiz with specific key
  const handleLaunchQuizWithKey = (root: NoteName, harmonyKey: string) => {
    setQuizPresetRoot(root);
    setQuizPresetHarmonyKey(harmonyKey);
    setActiveTab('quiz-mode');
  };

  // Navigate to fretboard with formula from catalog
  const handleSelectFormulaFromCatalog = (root: NoteName, formulaId: string) => {
    setActiveTab('fretboard');
  };

  return (
    <div className="min-h-screen bg-[#111319] text-[#e2e2eb] flex flex-col font-['Inter',sans-serif]">
      {/* Fixed App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTuning={currentTuning}
        setCurrentTuning={setCurrentTuning}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        onOpenServerModal={() => setIsServerModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-16 bg-[#111319]">
        {activeTab === 'fretboard' && (
          <InteractiveFretboardView
            currentTuning={currentTuning}
            difficulty={difficulty}
            onLaunchQuizWithKey={handleLaunchQuizWithKey}
          />
        )}

        {activeTab === 'quiz-mode' && (
          <QuizModeView
            currentTuning={currentTuning}
            difficulty={difficulty}
            presetRoot={quizPresetRoot}
            presetHarmonyKey={quizPresetHarmonyKey}
          />
        )}

        {activeTab === 'chord-scale' && (
          <ChordScaleCatalogView
            onSelectFormula={handleSelectFormulaFromCatalog}
            userDifficulty={difficulty}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            currentTuning={currentTuning}
            onReviewMistakeQuiz={() => setActiveTab('quiz-mode')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={setActiveTab} />

      {/* Windows 11 Web Server Console & User Profile Modal */}
      <ServerStatusModal
        isOpen={isServerModalOpen}
        onClose={() => setIsServerModalOpen(false)}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
      />
    </div>
  );
}
