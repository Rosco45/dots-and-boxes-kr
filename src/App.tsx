import React, { useState, useEffect, useCallback } from 'react';
import {
  BoardState,
  DEFAULT_PLAYERS,
  Player,
  createInitialBoard,
  makeMove,
  getBestMoveAI
} from './utils/gameLogic';
import { soundEngine } from './utils/audio';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { SettingsModal } from './components/SettingsModal';
import { RulesModal } from './components/RulesModal';
import { GameOverModal } from './components/GameOverModal';
import {
  Sliders,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Crown,
  Undo2,
  Sparkles,
  Trophy
} from 'lucide-react';

export function App() {
  const [gridSize, setGridSize] = useState<number>(4);
  const [theme, setTheme] = useState<'wood' | 'marble' | 'obsidian'>('wood');
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [aiDifficulty, setAiDifficulty] = useState<'novice' | 'tactician' | 'grandmaster'>('tactician');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);

  // Board state
  const [board, setBoard] = useState<BoardState>(() => createInitialBoard(4, 4));
  const [history, setHistory] = useState<BoardState[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Floating notifications / tips
  const [statusMessage, setStatusMessage] = useState<string>('À vous de jouer, reliez 2 points.');

  // Automatically trigger GameOverModal when game finishes
  useEffect(() => {
    if (board.isGameOver) {
      setShowGameOverModal(true);
    } else {
      setShowGameOverModal(false);
    }
  }, [board.isGameOver]);

  // Handle Mute toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  // Reset or restart match
  const startNewMatch = useCallback((size: number = gridSize) => {
    soundEngine.playClick();
    const freshBoard = createInitialBoard(size, size);
    setBoard(freshBoard);
    setHistory([]);
    setIsAiThinking(false);
    setShowGameOverModal(false);
    setStatusMessage('La partie commence ! Reliez 2 points.');
  }, [gridSize]);

  // Handle human move
  const handleEdgeClick = (edgeId: string) => {
    if (board.isGameOver || isAiThinking) return;
    if (isAiMode && board.currentPlayer === 'player2') return;

    soundEngine.playSegment(theme);

    // Save previous state for undo
    setHistory(prev => [...prev, board]);

    const nextBoard = makeMove(board, edgeId);
    
    // Check if box was completed
    if (nextBoard.scores[board.currentPlayer] > board.scores[board.currentPlayer]) {
      soundEngine.playBoxCaptured(nextBoard.comboCount);
      setStatusMessage(`Case capturée ! ${players[board.currentPlayer].name} rejoue !`);
    } else {
      const nextPName = isAiMode && nextBoard.currentPlayer === 'player2' ? "l'IA" : players[nextBoard.currentPlayer].name;
      setStatusMessage(`Au tour de ${nextPName}.`);
    }

    setBoard(nextBoard);
  };

  // Handle Undo
  const handleUndo = () => {
    if (history.length === 0 || isAiThinking || board.isGameOver) return;
    soundEngine.playClick();
    
    // In AI mode, undo until it is player1's turn again
    if (isAiMode) {
      let targetIndex = -1;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].currentPlayer === 'player1') {
          targetIndex = i;
          break;
        }
      }
      if (targetIndex !== -1) {
        setBoard(history[targetIndex]);
        setHistory(prev => prev.slice(0, targetIndex));
        setStatusMessage('Coup annulé.');
        return;
      }
    }

    // Standard 1-step undo for 2-player mode
    const prevBoard = history[history.length - 1];
    setBoard(prevBoard);
    setHistory(prev => prev.slice(0, prev.length - 1));
    setStatusMessage('Coup annulé.');
  };

  // AI Turn handler with smooth realistic delay
  useEffect(() => {
    if (!isAiMode || board.isGameOver) return;

    if (board.currentPlayer === 'player2') {
      setIsAiThinking(true);
      setStatusMessage("L'IA analyse le plateau de jeu...");

      const timer = setTimeout(() => {
        const bestMove = getBestMoveAI(board, aiDifficulty);
        if (bestMove) {
          soundEngine.playSegment(theme);
          const nextBoard = makeMove(board, bestMove);

          if (nextBoard.scores.player2 > board.scores.player2) {
            soundEngine.playBoxCaptured(nextBoard.comboCount);
            setStatusMessage("L'IA capture une case et enchaîne !");
          } else {
            setStatusMessage('À votre tour de jouer !');
          }

          setBoard(nextBoard);
        }
        setIsAiThinking(false);
      }, 650);

      return () => clearTimeout(timer);
    }
  }, [board, isAiMode, aiDifficulty, theme]);

  return (
    <div className="min-h-full w-full flex flex-col justify-between overflow-x-hidden bg-stone-950 text-stone-100 selection:bg-amber-500/30">
      {/* Top Luxury Navigation Header */}
      <header className="w-full max-w-md mx-auto pt-3 px-4 pb-1 flex items-center justify-between border-b border-stone-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-md flex items-center justify-center">
            <Crown className="w-4 h-4 text-stone-950" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider font-serif-luxury text-stone-100 flex items-center gap-1.5">
              <span>Dots &amp; Boxes</span>
              <span className="text-[10px] text-amber-400 font-sans font-semibold tracking-normal px-1 py-0.2 bg-amber-500/10 rounded border border-amber-500/20">
                by K.R
              </span>
            </h1>
            <p className="text-[10px] text-stone-400 font-serif-luxury tracking-wide">
              Pipopipette Stratégique
            </p>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            aria-label="Son"
            className="p-2 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-900 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsRulesOpen(true);
            }}
            aria-label="Règles"
            className="p-2 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-900 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              setIsSettingsOpen(true);
            }}
            aria-label="Paramètres"
            className="p-2 rounded-xl text-stone-400 hover:text-amber-300 hover:bg-stone-900 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Game Screen */}
      <main className="flex-1 flex flex-col justify-center items-center py-2 max-w-lg mx-auto w-full">
        {/* Dynamic Score Board */}
        <div className="w-full mb-1">
          <ScoreBoard
            board={board}
            players={players}
            isAiPlaying={isAiMode}
            aiDifficulty={
              aiDifficulty === 'novice'
                ? 'Novice'
                : aiDifficulty === 'tactician'
                ? 'Tacticien'
                : 'Maître'
            }
          />
        </div>

        {/* Status / Tactical Feedback Toast */}
        <div className="my-1.5 px-3 py-1 rounded-full bg-stone-900/80 border border-stone-800 text-[11px] text-stone-300 flex items-center gap-1.5 shadow-sm">
          {board.isGameOver && !showGameOverModal ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowGameOverModal(true);
              }}
              className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Partie terminée • Revoir le podium &amp; score
            </button>
          ) : isAiThinking ? (
            <span className="flex items-center gap-1 text-sky-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              L'IA réfléchit...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              {statusMessage}
            </span>
          )}
        </div>

        {/* Tactile Textured Game Board */}
        <GameBoard
          board={board}
          onEdgeClick={handleEdgeClick}
          theme={theme}
          players={players}
          isAiTurn={isAiThinking}
        />

        {/* Bottom Game Controls (Undo & Reset) */}
        <div className="w-full max-w-xs px-4 mt-2 flex items-center justify-center gap-3">
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isAiThinking || board.isGameOver}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              history.length > 0 && !isAiThinking && !board.isGameOver
                ? 'bg-stone-900 border-stone-700 text-stone-300 hover:text-white hover:border-stone-500'
                : 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            Annuler
          </button>

          <button
            onClick={() => startNewMatch()}
            className="flex-1 py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Recommencer
          </button>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="w-full text-center py-2 text-[10px] text-stone-500 border-t border-stone-900">
        <p className="tracking-wide">
          <span className="font-serif-luxury text-stone-400">Dots &amp; Boxes</span> (by K.R) &bull; Édition Tactique Mobile
        </p>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gridSize={gridSize}
        onSelectGridSize={(size) => {
          setGridSize(size);
          startNewMatch(size);
          setIsSettingsOpen(false);
        }}
        theme={theme}
        onSelectTheme={setTheme}
        isAiMode={isAiMode}
        onToggleAiMode={(ai) => {
          setIsAiMode(ai);
          startNewMatch();
        }}
        aiDifficulty={aiDifficulty}
        onSelectAiDifficulty={setAiDifficulty}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onRestartMatch={() => startNewMatch()}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <GameOverModal
        isOpen={showGameOverModal}
        onClose={() => setShowGameOverModal(false)}
        board={board}
        players={players}
        isAiPlaying={isAiMode}
        onRestart={() => startNewMatch()}
        onOpenSettings={() => {
          soundEngine.playClick();
          setShowGameOverModal(false);
          setIsSettingsOpen(true);
        }}
      />
    </div>
  );
}
export default App;
