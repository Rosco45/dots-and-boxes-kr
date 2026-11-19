import React from 'react';
import { BoardState, DEFAULT_PLAYERS } from '../utils/gameLogic';

interface ScoreBoardProps {
  board: BoardState;
  players: typeof DEFAULT_PLAYERS;
  isAiPlaying: boolean;
  aiDifficulty: string;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  board,
  players,
  isAiPlaying,
  aiDifficulty
}) => {
  const { scores, currentPlayer, rows, cols, totalBoxes, shape, turnRule } = board;
  const p1Score = scores.player1;
  const p2Score = scores.player2;
  const claimedBoxes = p1Score + p2Score;
  const remainingBoxes = Math.max(0, totalBoxes - claimedBoxes);

  const p1Percent = totalBoxes > 0 ? (p1Score / totalBoxes) * 100 : 0;
  const p2Percent = totalBoxes > 0 ? (p2Score / totalBoxes) * 100 : 0;

  const p1Active = currentPlayer === 'player1' && !board.isGameOver;
  const p2Active = currentPlayer === 'player2' && !board.isGameOver;

  return (
    <div className="w-full max-w-md mx-auto px-3">
      {/* Cards for Player 1 & Player 2 */}
      <div className="grid grid-cols-2 gap-3 items-stretch">
        {/* Player 1 Card */}
        <div
          className={`relative overflow-hidden rounded-2xl p-3 transition-all duration-300 border ${
            p1Active
              ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.25)] scale-[1.02]'
              : 'bg-stone-900/50 border-stone-800/80 opacity-75'
          }`}
        >
          {p1Active && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
          )}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">{players.player1.avatar}</span>
              <span className="font-semibold text-xs tracking-wider uppercase text-amber-200">
                {players.player1.name}
              </span>
            </div>
            {p1Active && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium animate-pulse">
                Au tour
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="text-3xl font-extrabold text-amber-400 font-serif-luxury tracking-tight">
              {p1Score}
            </div>
            <div className="text-xs text-stone-400 font-medium">
              {Math.round(p1Percent)}%
            </div>
          </div>
        </div>

        {/* Player 2 / AI Card */}
        <div
          className={`relative overflow-hidden rounded-2xl p-3 transition-all duration-300 border ${
            p2Active
              ? 'bg-sky-950/40 border-sky-500/70 shadow-[0_0_20px_rgba(14,165,233,0.25)] scale-[1.02]'
              : 'bg-stone-900/50 border-stone-800/80 opacity-75'
          }`}
        >
          {p2Active && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-pulse" />
          )}
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">
                {isAiPlaying ? '🤖' : players.player2.avatar}
              </span>
              <span className="font-semibold text-xs tracking-wider uppercase text-sky-200">
                {isAiPlaying ? `IA (${aiDifficulty})` : players.player2.name}
              </span>
            </div>
            {p2Active && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 font-medium animate-pulse">
                Au tour
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <div className="text-3xl font-extrabold text-sky-400 font-serif-luxury tracking-tight">
              {p2Score}
            </div>
            <div className="text-xs text-stone-400 font-medium">
              {Math.round(p2Percent)}%
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Dominance Bar & Remaining Counter */}
      <div className="mt-2.5 px-1">
        <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
          <span>
            {remainingBoxes} case{remainingBoxes > 1 ? 's' : ''} restante{remainingBoxes > 1 ? 's' : ''}
          </span>
          <span className="font-serif-luxury text-amber-200/90 tracking-wide">
            {shape === 'diamond' ? `Losange • ${totalBoxes} cases` : `Grille ${rows}×${cols}`}
            <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-stone-800 text-stone-300">
              {turnRule === 'strict_turns' ? 'Tour/Tour' : 'Combo'}
            </span>
          </span>
        </div>
        <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
            style={{ width: `${p1Percent}%` }}
          />
          <div className="h-full bg-transparent flex-1" />
          <div
            className="h-full bg-gradient-to-l from-sky-600 to-sky-400 transition-all duration-500"
            style={{ width: `${p2Percent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
