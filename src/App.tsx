import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CardSlot } from './components/CardSlot';
import { NumberCard } from './components/NumberCard';
import { Timer } from './components/Timer';
import { evaluateEquation } from './game/evaluateEquation';
import { generatePuzzle } from './game/generatePuzzle';
import { scoreForCorrectAnswer } from './game/scoring';
import { difficultyConfig, type Difficulty, type Puzzle } from './game/types';
import {
  emptyBestScores,
  loadBestScores,
  saveBestScore,
  type BestScores,
} from './services/scoreStorage';

type Screen = 'home' | 'game' | 'paused' | 'results';
type Feedback = 'idle' | 'correct' | 'incorrect';
const EMPTY_SLOTS: [string | null, string | null, string | null] = [null, null, null];

const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' } as const;

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [puzzle, setPuzzle] = useState<Puzzle>(() => generatePuzzle('medium'));
  const [slots, setSlots] = useState<[string | null, string | null, string | null]>(EMPTY_SLOTS);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState(0);
  const [remainingMs, setRemainingMs] = useState(60_000);
  const [feedback, setFeedback] = useState<Feedback>('idle');
  const [bestScores, setBestScores] = useState<BestScores>(emptyBestScores);
  const [newBest, setNewBest] = useState(false);
  const endAtRef = useRef(0);
  const feedbackTimeoutRef = useRef<number | undefined>(undefined);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
  );

  useEffect(() => setBestScores(loadBestScores()), []);

  const finishGame = useCallback(() => {
    setScreen('results');
    setRemainingMs(0);
    setBestScores((current) => {
      const isBest = score > current[difficulty];
      setNewBest(isBest);
      return saveBestScore(difficulty, score);
    });
  }, [difficulty, score]);

  useEffect(() => {
    if (screen !== 'game') return;
    const update = () => {
      const next = Math.max(0, endAtRef.current - Date.now());
      setRemainingMs(next);
      if (next === 0) finishGame();
    };
    update();
    const interval = window.setInterval(update, 100);
    return () => window.clearInterval(interval);
  }, [screen, finishGame]);

  useEffect(() => () => window.clearTimeout(feedbackTimeoutRef.current), []);

  function startGame() {
    window.clearTimeout(feedbackTimeoutRef.current);
    setPuzzle(generatePuzzle(difficulty));
    setSlots([...EMPTY_SLOTS]);
    setScore(0);
    setSolved(0);
    setRemainingMs(60_000);
    setFeedback('idle');
    setNewBest(false);
    endAtRef.current = Date.now() + 60_000;
    setScreen('game');
  }

  function pause() {
    setRemainingMs(Math.max(0, endAtRef.current - Date.now()));
    setScreen('paused');
  }

  function resume() {
    endAtRef.current = Date.now() + remainingMs;
    setScreen('game');
  }

  function placeCard(cardId: string, targetIndex?: number) {
    if (feedback === 'correct') return;
    setSlots((current) => {
      const currentIndex = current.indexOf(cardId);
      const destination = targetIndex ?? selectedSlot ?? current.findIndex((id) => id === null);
      if (destination < 0 || destination > 2) return current;
      const next = [...current] as [string | null, string | null, string | null];
      const displaced = next[destination];
      if (currentIndex >= 0) next[currentIndex] = displaced;
      next[destination] = cardId;
      return next;
    });
    setSelectedSlot(null);
    setFeedback('idle');
  }

  function handleSlot(index: number) {
    if (slots[index]) {
      setSlots(
        (current) =>
          current.map((id, slotIndex) => (slotIndex === index ? null : id)) as typeof current,
      );
      setFeedback('idle');
    } else setSelectedSlot(index);
  }

  function handleDragEnd(event: DragEndEvent) {
    const overId = event.over?.id.toString();
    if (!overId?.startsWith('slot-')) return;
    placeCard(event.active.id.toString(), Number(overId.replace('slot-', '')));
  }

  function submit() {
    if (slots.some((id) => id === null) || feedback === 'correct' || remainingMs <= 0) return;
    const values = slots.map((id) => puzzle.cards.find((card) => card.id === id)!.value) as [
      number,
      number,
      number,
    ];
    if (evaluateEquation(values, puzzle.operators) === puzzle.target) {
      setFeedback('correct');
      setScore((value) => value + scoreForCorrectAnswer(difficulty));
      setSolved((value) => value + 1);
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setPuzzle(generatePuzzle(difficulty));
        setSlots([...EMPTY_SLOTS]);
        setFeedback('idle');
      }, 420);
    } else {
      setFeedback('incorrect');
      feedbackTimeoutRef.current = window.setTimeout(() => setFeedback('idle'), 650);
    }
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <motion.section
            className="screen home-screen"
            key="home"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <div className="brand-mark">
              <span>+</span>
              <span>×</span>
            </div>
            <p className="eyebrow">A 60-second brain sprint</p>
            <h1>
              Card
              <br />
              <span>Operator</span>
            </h1>
            <p className="home-copy">Pick three cards. Make the target. Beat your best.</p>
            <div className="difficulty-card">
              <div className="section-label">
                <span>Choose your mode</span>
                <span>Best: {bestScores[difficulty].toLocaleString()}</span>
              </div>
              <div className="difficulty-tabs" role="radiogroup" aria-label="Difficulty">
                {(Object.keys(difficultyConfig) as Difficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={difficulty === level}
                    className={difficulty === level ? 'active' : ''}
                    onClick={() => setDifficulty(level)}
                  >
                    <strong>{difficultyConfig[level].label}</strong>
                    <small>
                      {level === 'easy' ? '+' : level === 'medium' ? '+  −' : '+  −  ×'}
                    </small>
                  </button>
                ))}
              </div>
            </div>
            <motion.button
              className="primary-button"
              type="button"
              onClick={startGame}
              whileTap={{ scale: 0.97 }}
            >
              Play now <span>→</span>
            </motion.button>
            <p className="gesture-hint">
              <span>↕</span> Drag cards or tap to place
            </p>
          </motion.section>
        )}

        {(screen === 'game' || screen === 'paused') && (
          <motion.section
            className="screen game-screen"
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="game-header">
              <button className="icon-button" type="button" onClick={pause} aria-label="Pause game">
                Ⅱ
              </button>
              <div className="score-block">
                <small>Score</small>
                <strong>{score.toLocaleString()}</strong>
              </div>
              <Timer remainingMs={remainingMs} />
            </header>
            <div className="mode-chip">{difficultyConfig[difficulty].label} mode</div>
            <section className="target-panel">
              <span>Make this number</span>
              <motion.strong
                key={puzzle.id}
                initial={{ scale: 0.65, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                {puzzle.target}
              </motion.strong>
              <div className="target-glow" />
            </section>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <div className="equation" aria-label="Equation builder">
                <CardSlot
                  index={0}
                  card={puzzle.cards.find((c) => c.id === slots[0])}
                  selected={selectedSlot === 0}
                  feedback={feedback}
                  onClick={() => handleSlot(0)}
                />
                <span className="operator">{symbols[puzzle.operators[0]]}</span>
                <CardSlot
                  index={1}
                  card={puzzle.cards.find((c) => c.id === slots[1])}
                  selected={selectedSlot === 1}
                  feedback={feedback}
                  onClick={() => handleSlot(1)}
                />
                <span className="operator">{symbols[puzzle.operators[1]]}</span>
                <CardSlot
                  index={2}
                  card={puzzle.cards.find((c) => c.id === slots[2])}
                  selected={selectedSlot === 2}
                  feedback={feedback}
                  onClick={() => handleSlot(2)}
                />
              </div>
              <div className={`feedback-message ${feedback}`} role="status" aria-live="polite">
                {feedback === 'correct'
                  ? `Perfect! +${scoreForCorrectAnswer(difficulty)}`
                  : feedback === 'incorrect'
                    ? 'Not quite — try another order'
                    : 'Build the equation'}
              </div>
              <div className="card-tray">
                {puzzle.cards.map((card) => {
                  const used = slots.includes(card.id);
                  return (
                    <div className={used ? 'card-space used' : 'card-space'} key={card.id}>
                      {!used && <NumberCard card={card} onClick={() => placeCard(card.id)} />}
                    </div>
                  );
                })}
              </div>
            </DndContext>
            <button
              className="primary-button check-button"
              type="button"
              disabled={slots.some((id) => !id) || feedback === 'correct'}
              onClick={submit}
            >
              Check answer <span>✓</span>
            </button>
            <p className="solved-count">
              {solved} {solved === 1 ? 'puzzle' : 'puzzles'} solved
            </p>
            {feedback === 'correct' && (
              <div className="confetti" aria-hidden="true">
                {Array.from({ length: 12 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
            )}
            {screen === 'paused' && (
              <motion.div
                className="pause-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="pause-card"
                  initial={{ scale: 0.9, y: 16 }}
                  animate={{ scale: 1, y: 0 }}
                >
                  <div className="pause-icon">Ⅱ</div>
                  <p className="eyebrow">Take a breath</p>
                  <h2>Game paused</h2>
                  <p>Your score and time are safe.</p>
                  <button className="primary-button" type="button" onClick={resume}>
                    Resume game <span>▶</span>
                  </button>
                  <button className="text-button" type="button" onClick={() => setScreen('home')}>
                    Quit to home
                  </button>
                </motion.div>
              </motion.div>
            )}
          </motion.section>
        )}

        {screen === 'results' && (
          <motion.section
            className="screen results-screen"
            key="results"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="result-badge">{newBest ? '★' : '✓'}</div>
            <p className="eyebrow">{newBest ? 'New personal best' : 'Round complete'}</p>
            <h2>Time's up!</h2>
            <div className="final-score">
              <span>Final score</span>
              <strong>{score.toLocaleString()}</strong>
            </div>
            <div className="result-stats">
              <div>
                <strong>{solved}</strong>
                <span>Solved</span>
              </div>
              <div>
                <strong>{difficultyConfig[difficulty].label}</strong>
                <span>Mode</span>
              </div>
              <div>
                <strong>{bestScores[difficulty].toLocaleString()}</strong>
                <span>Best</span>
              </div>
            </div>
            <button className="primary-button" type="button" onClick={startGame}>
              Play again <span>↻</span>
            </button>
            <button className="text-button" type="button" onClick={() => setScreen('home')}>
              Back to home
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
