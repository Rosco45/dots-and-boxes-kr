import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BoardState, DEFAULT_PLAYERS } from '../utils/gameLogic';
import { soundEngine } from '../utils/audio';
import { Trophy, RotateCcw, Sliders, Award, Sparkles, X } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: BoardState;
  players: typeof DEFAULT_PLAYERS;
  isAiPlaying: boolean;
  onRestart: () => void;
  onOpenSettings: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  board,
  players,
  isAiPlaying,
  onRestart,
  onOpenSettings
}) => {
  const { winner, scores, moves } = board;

  useEffect(() => {
    if (board.isGameOver && isOpen) {
      soundEngine.playVictory();
      // Launch luxury gold/sky confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#d97706', '#38bdf8', '#ffffff']
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#f59e0b', '#0284c7']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#f59e0b', '#0284c7']
        });
      }, 300);
    }
  }, [board.isGameOver, isOpen]);

  if (!isOpen || !board.isGameOver) return null;

  const isDraw = winner === 'draw';
  const winnerConfig = winner && winner !== 'draw' ? players[winner] : null;
  const isWinnerAi = isAiPlaying && winner === 'player2';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-stone-900 border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center text-stone-100">
        {/* Close button to view board */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Trophy Aura */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center mb-4">
          <div className="w-full h-full bg-stone-950 rounded-[14px] flex items-center justify-center">
            {isDraw ? (
              <Award className="w-8 h-8 text-amber-400" />
            ) : (
              <span className="text-3xl">{winnerConfig?.avatar}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          Fin de la Partie
          <Sparkles className="w-3.5 h-3.5" />
        </div>

        <h2 className="text-2xl font-bold font-serif-luxury text-stone-100 mb-2">
          {isDraw
            ? 'Match Nul Impérial !'
            : isWinnerAi
            ? "L'IA Triomphe !"
            : `Victoire de ${winnerConfig?.name} !`}
        </h2>

        <p className="text-xs text-stone-400 mb-6">
          {isDraw
            ? 'Une égalité parfaite digne des plus grands stratèges.'
            : `Félicitations pour cette remarquable domination du plateau.`}
        </p>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-stone-950/60 p-3 rounded-2xl border border-stone-800">
          <div className="text-center p-2 rounded-xl bg-amber-950/20 border border-amber-900/30">
            <div className="text-xs text-amber-200 font-medium mb-1">
              {players.player1.name}
            </div>
            <div className="text-2xl font-bold font-serif-luxury text-amber-400">
              {scores.player1} <span className="text-xs font-normal text-stone-400">cases</span>
            </div>
          </div>

          <div className="text-center p-2 rounded-xl bg-sky-950/20 border border-sky-900/30">
            <div className="text-xs text-sky-200 font-medium mb-1">
              {isAiPlaying ? "L'IA" : players.player2.name}
            </div>
            <div className="text-2xl font-bold font-serif-luxury text-sky-400">
              {scores.player2} <span className="text-xs font-normal text-stone-400">cases</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:brightness-110 text-stone-950 font-bold uppercase tracking-wider text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Revanche Immédiate
          </button>

          <button
            onClick={onOpenSettings}
            className="w-full py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-stone-700 hover:border-amber-500/50"
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            Options &amp; Taille de Grille
          </button>
        </div>
      </div>
    </div>
  );
};
