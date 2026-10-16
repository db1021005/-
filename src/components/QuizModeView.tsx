import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DifficultyLevel, NoteName, QuizQuestion, TuningId } from '../types/guitar';
import { CHROMATIC_NOTES, TUNINGS, getFretNote, HARMONY_CATALOG } from '../data/musicTheory';
import { soundEngine } from '../audio/synth';
import { recordQuizAttempt } from '../utils/storage';

interface QuizModeViewProps {
  currentTuning: TuningId;
  difficulty: DifficultyLevel;
  presetRoot?: NoteName;
  presetHarmonyKey?: string;
}

export const QuizModeView: React.FC<QuizModeViewProps> = ({
  currentTuning,
  difficulty,
  presetRoot,
  presetHarmonyKey,
}) => {
  const tuningConfig = TUNINGS[currentTuning];

  // Quiz modes:
  // 1. pos_to_note: "5번 줄 3프렛은 무슨 음일까요?" (4 choices)
  // 2. note_to_fret: "2번 줄에서 C음이 있는 프렛을 선택하세요" (interactive fretboard click)
  // 3. harmony_theory: "C Maj7의 3도음(E)을 지판에서 찾으세요"
  const [quizType, setQuizType] = useState<'pos_to_note' | 'click_fret' | 'harmony_theory'>('pos_to_note');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [roundOver, setRoundOver] = useState(false);

  // Maximum frets according to difficulty
  const maxFret = difficulty === 'beginner' ? 5 : difficulty === 'intermediate' ? 12 : 24;

  // Generate 10 questions for a round
  const generateQuestions = useCallback((): QuizQuestion[] => {
    const list: QuizQuestion[] = [];
    const strings = tuningConfig.strings;

    for (let i = 0; i < 10; i++) {
      const qMode =
        quizType === 'click_fret'
          ? 'note_to_position'
          : quizType === 'harmony_theory'
          ? 'chord_tone'
          : 'position_to_note';

      const randStr = strings[Math.floor(Math.random() * strings.length)];
      const randFret = Math.floor(Math.random() * (maxFret + 1));
      const noteData = getFretNote(randStr, randFret);

      if (qMode === 'position_to_note') {
        // 4 Multiple choice options
        const otherNotes = CHROMATIC_NOTES.filter((n) => n !== noteData.note);
        const shuffledOthers = [...otherNotes].sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [noteData.note, ...shuffledOthers].sort(() => 0.5 - Math.random());

        list.push({
          id: `q_${i}`,
          mode: 'position_to_note',
          difficulty,
          prompt: `${randStr.str}번 줄 ${randFret === 0 ? '개방현(Nut)' : `${randFret}프렛`}은 무슨 음일까요?`,
          subPrompt: `현재 튜닝: ${tuningConfig.name}`,
          targetString: randStr.str,
          targetFret: randFret,
          targetNote: noteData.note,
          options,
          correctAnswerNote: noteData.note,
          explanation: `${randStr.str}번 줄 개방현(${randStr.openNote})에서 ${randFret}프렛 떨어진 위치는 [${noteData.note}]입니다.`,
        });
      } else if (qMode === 'note_to_position') {
        list.push({
          id: `q_${i}`,
          mode: 'note_to_position',
          difficulty,
          prompt: `지판의 ${randStr.str}번 줄에서 [${noteData.note}] 음을 클릭하세요!`,
          subPrompt: `0프렛(개방현)부터 ${maxFret}프렛 사이에서 찾아보세요.`,
          targetString: randStr.str,
          targetFret: randFret,
          targetNote: noteData.note,
          correctAnswerPositions: [{ stringNum: randStr.str, fret: randFret }],
          explanation: `${randStr.str}번 줄 ${randFret}프렛의 음이 바로 [${noteData.note}]입니다.`,
        });
      } else {
        // Chord Tone question
        const root = presetRoot || CHROMATIC_NOTES[Math.floor(Math.random() * CHROMATIC_NOTES.length)];
        const chordKey = presetHarmonyKey || (difficulty === 'beginner' ? 'Major' : 'Maj7');
        const chordFormula = HARMONY_CATALOG[chordKey] || HARMONY_CATALOG['Major'];

        const rootIdx = CHROMATIC_NOTES.indexOf(root);
        const randIntervalIdx = Math.floor(Math.random() * chordFormula.intervals.length);
        const targetIv = chordFormula.intervals[randIntervalIdx];
        const targetPitch = CHROMATIC_NOTES[(rootIdx + targetIv) % 12];
        const targetDegree = chordFormula.labels[randIntervalIdx];

        const otherNotes = CHROMATIC_NOTES.filter((n) => n !== targetPitch);
        const shuffledOthers = [...otherNotes].sort(() => 0.5 - Math.random()).slice(0, 3);
        const options = [targetPitch, ...shuffledOthers].sort(() => 0.5 - Math.random());

        list.push({
          id: `q_${i}`,
          mode: 'chord_tone',
          difficulty,
          prompt: `[${root} ${chordFormula.name}] 코드의 ${targetDegree}도 음은 무엇일까요?`,
          subPrompt: `화성학 구조: ${chordFormula.quality}`,
          targetNote: targetPitch,
          targetInterval: targetDegree,
          options,
          correctAnswerNote: targetPitch,
          explanation: `${root} ${chordFormula.name}에서 ${targetDegree}도 화성 구성음은 [${targetPitch}]입니다.`,
        });
      }
    }
    return list;
  }, [quizType, tuningConfig, maxFret, difficulty, presetRoot, presetHarmonyKey]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);

  // Start round
  useEffect(() => {
    const qList = generateQuestions();
    setQuestions(qList);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCombo(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setRoundOver(false);
    setTimeLeft(15);
    setIsTimerPaused(false);
  }, [generateQuestions]);

  const currentQ = questions[currentQuestionIndex];

  // Timer countdown
  useEffect(() => {
    if (roundOver || isTimerPaused || !currentQ) return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimerPaused, roundOver, currentQ]);

  const handleTimeout = () => {
    if (!currentQ || feedback) return;
    setIsTimerPaused(true);
    soundEngine.playWrongSound();
    setCombo(0);
    setFeedback({
      isCorrect: false,
      text: `시간 초과! 정답은 [${currentQ.correctAnswerNote || `${currentQ.targetFret}프렛`}]입니다.`,
    });
    recordQuizAttempt(
      {
        timestamp: Date.now(),
        questionId: currentQ.id,
        mode: currentQ.mode,
        targetNote: currentQ.targetNote || '',
        stringNum: currentQ.targetString,
        fret: currentQ.targetFret,
        userAnswer: '시간 초과',
        isCorrect: false,
      },
      currentQ.prompt,
      currentQ.correctAnswerNote || `${currentQ.targetFret}프렛`,
      currentQ.explanation
    );
  };

  // Submit Multiple Choice Answer
  const handleSelectOption = (chosen: NoteName) => {
    if (feedback || isTimerPaused || !currentQ) return;
    setSelectedAnswer(chosen);
    setIsTimerPaused(true);

    const isCorrect = chosen === currentQ.correctAnswerNote;
    if (isCorrect) {
      soundEngine.playCorrectSound();
      const points = 100 + combo * 20 + timeLeft * 5;
      setScore((s) => s + points);
      setCombo((c) => {
        const next = c + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setFeedback({
        isCorrect: true,
        text: `정답입니다! (+${points}점)`,
      });
    } else {
      soundEngine.playWrongSound();
      setCombo(0);
      setFeedback({
        isCorrect: false,
        text: `오답입니다! 정답은 [${currentQ.correctAnswerNote}]입니다.`,
      });
    }

    recordQuizAttempt(
      {
        timestamp: Date.now(),
        questionId: currentQ.id,
        mode: currentQ.mode,
        targetNote: currentQ.targetNote || '',
        stringNum: currentQ.targetString,
        fret: currentQ.targetFret,
        userAnswer: chosen,
        isCorrect,
      },
      currentQ.prompt,
      currentQ.correctAnswerNote || '',
      currentQ.explanation
    );
  };

  // Submit Interactive Fretboard Click
  const handleFretClick = (stringNum: number, fret: number) => {
    if (feedback || isTimerPaused || !currentQ) return;
    const sConf = tuningConfig.strings.find((s) => s.str === stringNum);
    if (!sConf) return;
    const clickedNote = getFretNote(sConf, fret);
    soundEngine.playPluck(clickedNote.frequency, 1.0);

    const isCorrect =
      stringNum === currentQ.targetString && clickedNote.note === currentQ.targetNote;

    setSelectedAnswer(`${stringNum}:${fret}`);
    setIsTimerPaused(true);

    if (isCorrect) {
      soundEngine.playCorrectSound();
      const points = 150 + combo * 25 + timeLeft * 5;
      setScore((s) => s + points);
      setCombo((c) => {
        const next = c + 1;
        if (next > maxCombo) setMaxCombo(next);
        return next;
      });
      setFeedback({
        isCorrect: true,
        text: `정답입니다! ${stringNum}번 줄 ${fret}프렛은 [${clickedNote.note}]입니다.`,
      });
    } else {
      soundEngine.playWrongSound();
      setCombo(0);
      setFeedback({
        isCorrect: false,
        text: `오답입니다! 클릭한 음은 [${clickedNote.note}]였습니다. 목표 음은 [${currentQ.targetNote}]입니다.`,
      });
    }

    recordQuizAttempt(
      {
        timestamp: Date.now(),
        questionId: currentQ.id,
        mode: currentQ.mode,
        targetNote: currentQ.targetNote || '',
        stringNum,
        fret,
        userAnswer: `${clickedNote.note} (${stringNum}현 ${fret}F)`,
        isCorrect,
      },
      currentQ.prompt,
      `${currentQ.targetNote} (${currentQ.targetString}현 ${currentQ.targetFret}F)`,
      currentQ.explanation
    );
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setFeedback(null);
      setTimeLeft(15);
      setIsTimerPaused(false);
    } else {
      setRoundOver(true);
    }
  };

  // Restart Round
  const restartRound = () => {
    const qList = generateQuestions();
    setQuestions(qList);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCombo(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setRoundOver(false);
    setTimeLeft(15);
    setIsTimerPaused(false);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-4 py-8">
      {/* Quiz Header & Mode Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
            <span className="text-[11px] font-mono-code text-[#00dbe9] uppercase tracking-wider font-bold">
              Practice Drills · 10 Questions Round
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[#e2e2eb]">지판 암기 &amp; 화성학 훈련 퀴즈</h2>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#0c0e14] p-1 rounded-lg border border-[#2f364a] text-xs font-mono-code">
          <button
            type="button"
            onClick={() => setQuizType('pos_to_note')}
            className={`px-3 py-1.5 rounded transition-all ${
              quizType === 'pos_to_note'
                ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-[#b9cacb] hover:text-[#e2e2eb]'
            }`}
          >
            프렛 위치 맞추기
          </button>
          <button
            type="button"
            onClick={() => setQuizType('click_fret')}
            className={`px-3 py-1.5 rounded transition-all ${
              quizType === 'click_fret'
                ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-[#b9cacb] hover:text-[#e2e2eb]'
            }`}
          >
            지판에서 직접 찾기
          </button>
          <button
            type="button"
            onClick={() => setQuizType('harmony_theory')}
            className={`px-3 py-1.5 rounded transition-all ${
              quizType === 'harmony_theory'
                ? 'bg-[#00f0ff] text-[#00363a] font-bold shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                : 'text-[#b9cacb] hover:text-[#e2e2eb]'
            }`}
          >
            코드톤 화성학 퀴즈
          </button>
        </div>
      </div>

      {/* Round Complete Modal / Card */}
      {roundOver ? (
        <div className="bg-[#191b22] border border-[#2f364a] rounded-2xl p-8 text-center shadow-2xl flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#00f0ff]/10 flex items-center justify-center text-[#00f0ff] ring-2 ring-[#00f0ff]/40">
            <span className="material-symbols-outlined text-4xl">emoji_events</span>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-bold text-[#e2e2eb]">라운드 종료! 수고하셨습니다</h3>
            <p className="text-sm text-[#b9cacb]">
              오늘의 훈련 결과가 학습 통계 및 오답 노트에 저장되었습니다.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-md bg-[#0c0e14] p-4 rounded-xl border border-[#2f364a]/60">
            <div className="flex flex-col">
              <span className="text-[11px] font-mono-code text-[#b9cacb]">최종 점수</span>
              <span className="text-2xl font-bold text-[#ffb95f] font-mono-code">{score}점</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono-code text-[#b9cacb]">최대 콤보</span>
              <span className="text-2xl font-bold text-[#00f0ff] font-mono-code">
                {maxCombo}연속
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-mono-code text-[#b9cacb]">난이도</span>
              <span className="text-2xl font-bold text-[#65f2b5] font-mono-code uppercase">
                {difficulty === 'beginner' ? '초급' : difficulty === 'intermediate' ? '중급' : '고급'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={restartRound}
              className="px-6 py-3 rounded-xl bg-[#00f0ff] text-[#00363a] font-mono-code text-sm font-bold shadow-[0_0_16px_rgba(0,240,255,0.4)] hover:scale-105 transition-all"
            >
              새 라운드 시작하기
            </button>
          </div>
        </div>
      ) : (
        currentQ && (
          <div className="bg-[#191b22] border border-[#2f364a] rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            {/* Question HUD Strip */}
            <div className="flex items-center justify-between border-b border-[#2f364a]/50 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-[#282a30] text-[#00f0ff] font-mono-code text-xs font-bold">
                  Q {currentQuestionIndex + 1} / 10
                </span>
                {combo > 1 && (
                  <span className="px-2.5 py-1 rounded bg-[#ee9800]/20 text-[#ffb95f] font-mono-code text-xs font-bold animate-bounce">
                    🔥 {combo} COMBO!
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 font-mono-code text-xs">
                <div className="flex items-center gap-1.5 text-[#ffb95f]">
                  <span className="material-symbols-outlined text-[16px]">stars</span>
                  <span className="font-bold">{score}점</span>
                </div>
                {/* Timer ring indicator */}
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded font-bold ${
                    timeLeft <= 5 ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-[#0c0e14] text-[#00f0ff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">timer</span>
                  <span>{timeLeft}s</span>
                </div>
              </div>
            </div>

            {/* Prompt Box */}
            <div className="flex flex-col gap-1.5 text-center py-4">
              <h3 className="text-xl sm:text-2xl font-bold text-[#e2e2eb]">{currentQ.prompt}</h3>
              {currentQ.subPrompt && (
                <span className="text-xs text-[#b9cacb] font-mono-code">{currentQ.subPrompt}</span>
              )}
            </div>

            {/* Mode 1 & 3: Multiple Choice Buttons */}
            {currentQ.options && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto w-full">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswer === opt;
                  const isAnswer = opt === currentQ.correctAnswerNote;

                  let btnStyle = 'bg-[#0c0e14] text-[#e2e2eb] hover:bg-[#282a30] border-[#2f364a]';
                  if (feedback) {
                    if (isAnswer) {
                      btnStyle = 'bg-[#65f2b5] text-[#003824] border-[#65f2b5] font-bold shadow-[0_0_12px_rgba(16,185,129,0.5)]';
                    } else if (isSelected && !isAnswer) {
                      btnStyle = 'bg-red-500/30 text-red-300 border-red-500';
                    } else {
                      btnStyle = 'opacity-40 bg-[#0c0e14] text-[#849495] border-[#2f364a]';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={Boolean(feedback)}
                      onClick={() => handleSelectOption(opt)}
                      className={`h-16 rounded-xl font-mono-code text-xl font-bold border transition-all flex items-center justify-center ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Mode 2: Interactive Fretboard Click Area */}
            {quizType === 'click_fret' && (
              <div className="w-full overflow-x-auto pb-2 pt-1 fretboard-scrollbar">
                <div className="min-w-[780px] bg-[#0c0e14] p-3 rounded-xl border border-[#2f364a] flex flex-col gap-1.5 select-none">
                  {tuningConfig.strings.map((strConfig) => {
                    const isTargetString = strConfig.str === currentQ.targetString;
                    return (
                      <div
                        key={strConfig.str}
                        className={`flex items-center h-8 rounded px-1 transition-opacity ${
                          isTargetString ? 'bg-[#1e1f26] ring-1 ring-[#00f0ff]/40' : 'opacity-40'
                        }`}
                      >
                        <span className="w-10 font-mono-code text-xs font-bold text-[#ffb95f]">
                          {strConfig.openNote}
                          {strConfig.str}
                        </span>
                        <div className="flex-1 flex justify-between">
                          {Array.from({ length: maxFret + 1 }, (_, f) => f).map((fret) => {
                            const isClicked = selectedAnswer === `${strConfig.str}:${fret}`;
                            return (
                              <button
                                key={fret}
                                type="button"
                                disabled={Boolean(feedback) || !isTargetString}
                                onClick={() => handleFretClick(strConfig.str, fret)}
                                className={`flex-1 h-7 mx-0.5 rounded text-[11px] font-mono-code font-bold transition-all flex items-center justify-center border ${
                                  isClicked
                                    ? feedback?.isCorrect
                                      ? 'bg-[#65f2b5] text-[#003824] border-[#65f2b5]'
                                      : 'bg-red-500 text-white border-red-500'
                                    : 'bg-[#282a30] text-[#e2e2eb] hover:bg-[#00f0ff] hover:text-[#00363a] border-[#2f364a]/50'
                                }`}
                              >
                                {fret === 0 ? 'Nut' : fret}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Answer Feedback Banner */}
            {feedback && (
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn ${
                  feedback.isCorrect
                    ? 'bg-[#65f2b5]/15 border-[#65f2b5]/40 text-[#6ffbbe]'
                    : 'bg-red-500/15 border-red-500/40 text-red-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-2xl">
                    {feedback.isCorrect ? 'check_circle' : 'cancel'}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{feedback.text}</span>
                    <span className="text-xs text-[#b9cacb] mt-0.5">{currentQ.explanation}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-5 py-2 rounded-lg bg-[#00f0ff] text-[#00363a] font-mono-code text-xs font-bold hover:scale-105 transition-all self-end sm:self-center"
                >
                  {currentQuestionIndex < questions.length - 1 ? '다음 문제 →' : '결과 보기 →'}
                </button>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};
