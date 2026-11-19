import React, { useState, useEffect, useCallback } from 'react';
import {
  BoardState,
  DEFAULT_PLAYERS,
  Player,
  BoardShape,
  TurnRule,
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
  Trophy,
  Gem
} from 'lucide-react';

export function App() {
  const [shape, setShape] = useState<BoardShape>('diamond');
  const [turnRule, setTurnRule] = useState<TurnRule>('strict_turns');
  const [gridSize, setGridSize] = useState<number>(3); // Radius 3 for diamond (25 cases)
  const [theme, setTheme] = useState<'wood' | 'marble' | 'obsidian'>('wood');
  const [isAiMode, setIsAiMode] = useState<boolean>(true);
  const [aiDifficulty, setAiDifficulty] = useState<'novice' | 'tactician' | 'grandmaster'>('tactician');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [players, setPlayers] = useState(DEFAULT_PLAYERS);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [showGameOverModal, setShowGameOverModal] = useState<boolean>(false);

  // Board state - initialized in Losange Doré & Strict Turns
  const [board, setBoard] = useState<BoardState>(() => createInitialBoard(3, 'diamond', 'strict_turns'));
  const [history, setHistory] = useState<BoardState[]>([]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Status notification message
  const [statusMessage, setStatusMessage] = useState<string>(
    'Losange Doré actif ! Les 4 coins sont attribués (2 pts chacun). À vous de jouer !'
  );

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
  const startNewMatch = useCallback(
    (
      size: number = gridSize,
      targetShape: BoardShape = shape,
      targetRule: TurnRule = turnRule
    ) => {
      soundEngine.playClick();
      const freshBoard = createInitialBoard(size, targetShape, targetRule);
      setBoard(freshBoard);
      setHistory([]);
      setIsAiThinking(false);
      setShowGameOverModal(false);

      if (targetShape === 'diamond') {
        setStatusMessage(
          targetRule === 'strict_turns'
            ? 'Losange Doré (Tour par Tour) ! Les 4 coins sont attribués. À vous !'
            : 'Losange Doré (Combo) ! Les 4 coins sont attribués. Reliez 2 points.'
        );
      } else {
        setStatusMessage(
          targetRule === 'strict_turns'
            ? 'Partie en Tour par Tour strict lancée ! Reliez 2 points.'
            : 'La partie commence ! Reliez 2 points.'
        );
      }
    },
    [gridSize, shape, turnRule]
  );

  // Handle human move
  const handleEdgeClick = (edgeId: string) => {
    if (board.isGameOver || isAiThinking) return;
    if (isAiMode && board.currentPlayer === 'player2') return;

    soundEngine.playSegment(theme);

    // Save previous state for undo
    setHistory(prev => [...prev, board]);

    const nextBoard = makeMove(board, edgeId);
    const scoreDiff = nextBoard.scores[board.currentPlayer] - board.scores[board.currentPlayer];

    if (scoreDiff > 0) {
      soundEngine.playBoxCaptured(nextBoard.comboCount || 1);
      if (board.turnRule === 'strict_turns') {
        const nextP =
          isAiMode && nextBoard.currentPlayer === 'player2'
            ? "l'IA"
            : players[nextBoard.currentPlayer].name;
        setStatusMessage(`Case capturée (+${scoreDiff} pt) ! Au tour de ${nextP}.`);
      } else {
        setStatusMessage(`Case capturée ! ${players[board.currentPlayer].name} rejoue !`);
      }
    } else {
      const nextPName =
        isAiMode && nextBoard.currentPlayer === 'player2'
          ? "l'IA"
          : players[nextBoard.currentPlayer].name;
      setStatusMessage(`Au tour de ${nextPName}.`);
    }

    setBoard(nextBoard);
  };

  // Handle Undo
  const handleUndo = () => {
    if (history.length === 0 || isAiThinking || board.isGameOver) return;
    soundEngine.playClick();

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
          const aiDiff = nextBoard.scores.player2 - board.scores.player2;

          if (aiDiff > 0) {
            soundEngine.playBoxCaptured(nextBoard.comboCount || 1);
            if (board.turnRule === 'strict_turns') {
              setStatusMessage("L'IA capture une case ! C'est à votre tour (Tour par tour).");
            } else {
              setStatusMessage("L'IA capture une case et enchaîne !");
            }
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
      <header className="w-full max-w-md mx-auto pt-2.5 px-3 pb-1 flex items-center justify-between border-b border-stone-800/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 p-0.5 shadow-md flex items-center justify-center">
            {shape === 'diamond' ? (
              <Gem className="w-4 h-4 text-stone-950" />
            ) : (
              <Crown className="w-4 h-4 text-stone-950" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider font-serif-luxury text-stone-100 flex items-center gap-1.5">
              <span>Dots &amp; Boxes</span>
              <span className="text-[10px] text-amber-400 font-sans font-semibold tracking-normal px-1 py-0.2 bg-amber-500/10 rounded border border-amber-500/20">
                by K.R
              </span>
            </h1>
            <p className="text-[10px] text-stone-400 font-serif-luxury tracking-wide">
              {shape === 'diamond' ? 'Édition Losange Doré' : 'Pipopipette Stratégique'}
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
      <main className="flex-1 flex flex-col justify-center items-center py-1 max-w-lg mx-auto w-full">
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
        <div className="my-1 px-3 py-1 rounded-full bg-stone-900/80 border border-stone-800 text-[11px] text-stone-300 flex items-center gap-1.5 shadow-sm text-center max-w-[94%] mx-auto">
          {board.isGameOver && !showGameOverModal ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                setShowGameOverModal(true);
              }}
              className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-semibold cursor-pointer mx-auto"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Partie terminée • Revoir le podium &amp; score
            </button>
          ) : isAiThinking ? (
            <span className="flex items-center justify-center gap-1 text-sky-400 font-medium mx-auto">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              L'IA réfléchit...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1.5 mx-auto">
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
        <div className="w-full max-w-xs px-4 mt-1 flex items-center justify-center gap-3">
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
      <footer className="w-full text-center py-1.5 text-[10px] text-stone-500 border-t border-stone-900">
        <p className="tracking-wide">
          <span className="font-serif-luxury text-stone-400">Dots &amp; Boxes</span> (by K.R) &bull; Mode Losange Doré &bull; Mobile-First
        </p>
      </footer>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        shape={shape}
        onSelectShape={(newShape) => {
          setShape(newShape);
          const defaultSize = newShape === 'diamond' ? 3 : 4;
          setGridSize(defaultSize);
          startNewMatch(defaultSize, newShape, turnRule);
          setIsSettingsOpen(false);
        }}
        turnRule={turnRule}
        onSelectTurnRule={(newRule) => {
          setTurnRule(newRule);
          startNewMatch(gridSize, shape, newRule);
          setIsSettingsOpen(false);
        }}
        gridSize={gridSize}
        onSelectGridSize={(size) => {
          setGridSize(size);
          startNewMatch(size, shape, turnRule);
          setIsSettingsOpen(false);
        }}
        theme={theme}
        onSelectTheme={setTheme}
        isAiMode={isAiMode}
        onToggleAiMode={(ai) => {
          setIsAiMode(ai);
          startNewMatch(gridSize, shape, turnRule);
        }}
        aiDifficulty={aiDifficulty}
        onSelectAiDifficulty={setAiDifficulty}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onRestartMatch={() => startNewMatch(gridSize, shape, turnRule)}
      />

      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      <GameOverModal
        isOpen={showGameOverModal}
        onClose={() => setShowGameOverModal(false)}
        board={board}
        players={players}
        isAiPlaying={isAiMode}
        onRestart={() => startNewMatch(gridSize, shape, turnRule)}
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
