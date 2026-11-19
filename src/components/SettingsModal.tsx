import React from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Cpu,
  Users,
  Grid,
  Gem,
  Repeat,
  ArrowRight
} from 'lucide-react';
import { BoardShape, TurnRule } from '../utils/gameLogic';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shape: BoardShape;
  onSelectShape: (shape: BoardShape) => void;
  turnRule: TurnRule;
  onSelectTurnRule: (rule: TurnRule) => void;
  gridSize: number;
  onSelectGridSize: (size: number) => void;
  theme: 'wood' | 'marble' | 'obsidian';
  onSelectTheme: (theme: 'wood' | 'marble' | 'obsidian') => void;
  isAiMode: boolean;
  onToggleAiMode: (ai: boolean) => void;
  aiDifficulty: 'novice' | 'tactician' | 'grandmaster';
  onSelectAiDifficulty: (diff: 'novice' | 'tactician' | 'grandmaster') => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestartMatch: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  shape,
  onSelectShape,
  turnRule,
  onSelectTurnRule,
  gridSize,
  onSelectGridSize,
  theme,
  onSelectTheme,
  isAiMode,
  onToggleAiMode,
  aiDifficulty,
  onSelectAiDifficulty,
  isMuted,
  onToggleMute,
  onRestartMatch
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl text-stone-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-serif-luxury text-amber-300">
              Paramètres du Jeu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* 1. Mode Losange Doré vs Quadrillage Classique */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Forme du Plateau
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectShape('square')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  shape === 'square'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5 mb-1 text-amber-400" />
                <span className="text-xs font-bold">Classique</span>
                <span className="text-[10px] text-stone-400">Grille carrée</span>
              </button>

              <button
                onClick={() => onSelectShape('diamond')}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all overflow-hidden ${
                  shape === 'diamond'
                    ? 'bg-amber-500/20 border-yellow-400 text-amber-200 shadow-[0_0_18px_rgba(234,179,8,0.3)] ring-1 ring-yellow-400/50'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-white'
                }`}
              >
                <div className="absolute top-1 right-1 px-1 py-0.2 rounded bg-yellow-500/30 text-yellow-300 text-[8px] font-bold uppercase tracking-tighter">
                  Nouveau
                </div>
                <Gem className="w-5 h-5 mb-1 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-200">Losange Doré</span>
                <span className="text-[10px] text-stone-400">Escalier + 4 coins d'or</span>
              </button>
            </div>
          </div>

          {/* 2. Règle de Capture: Combo vs Tour par Tour Strict */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Règle de Capture
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectTurnRule('combo')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  turnRule === 'combo'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-white'
                }`}
              >
                <Repeat className="w-4 h-4 mb-1 text-amber-400" />
                <span className="text-xs font-bold">Enchaînement</span>
                <span className="text-[10px] text-stone-400">Capture = Rejouer (Combo)</span>
              </button>

              <button
                onClick={() => onSelectTurnRule('strict_turns')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  turnRule === 'strict_turns'
                    ? 'bg-sky-600/30 border-sky-400 text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.2)] ring-1 ring-sky-400/50'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-white'
                }`}
              >
                <ArrowRight className="w-4 h-4 mb-1 text-sky-400" />
                <span className="text-xs font-bold text-sky-300">Tour par Tour</span>
                <span className="text-[10px] text-stone-400">1 trait par joueur (Sans combo)</span>
              </button>
            </div>
          </div>

          {/* 3. Adversaire : Pass & Play vs IA */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Mode de jeu
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleAiMode(false)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  !isAiMode
                    ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                2 Joueurs (Pass)
              </button>
              <button
                onClick={() => onToggleAiMode(true)}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  isAiMode
                    ? 'bg-sky-600/30 border-sky-500 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.2)]'
                    : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4" />
                Contre l'IA
              </button>
            </div>
          </div>

          {/* 4. Difficulté de l'IA (si IA active) */}
          {isAiMode && (
            <div className="p-2.5 rounded-2xl bg-stone-950/50 border border-stone-800">
              <label className="text-xs font-semibold text-sky-400 uppercase tracking-wider block mb-1.5">
                Niveau de l'intelligence artificielle
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'novice', label: 'Novice' },
                  { id: 'tactician', label: 'Tacticien' },
                  { id: 'grandmaster', label: 'Maître' }
                ].map(lvl => (
                  <button
                    key={lvl.id}
                    onClick={() => onSelectAiDifficulty(lvl.id as any)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-medium border transition-all ${
                      aiDifficulty === lvl.id
                        ? 'bg-sky-600 border-sky-400 text-white shadow-md'
                        : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-white'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Taille de la Grille */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-amber-400" />
                Dimension du plateau
              </label>
              <span className="text-xs text-amber-400 font-semibold">
                {shape === 'diamond'
                  ? `Losange Rayon ${gridSize} (${gridSize === 2 ? 13 : gridSize === 3 ? 25 : gridSize === 4 ? 41 : 61} cases)`
                  : `${gridSize}×${gridSize} (${gridSize * gridSize} cases)`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {shape === 'square'
                ? [
                    { size: 3, label: '3×3', desc: 'Rapide' },
                    { size: 4, label: '4×4', desc: 'Classique' },
                    { size: 5, label: '5×5', desc: 'Stratège' },
                    { size: 6, label: '6×6', desc: 'Grand M.' }
                  ].map(opt => (
                    <button
                      key={opt.size}
                      onClick={() => onSelectGridSize(opt.size)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all ${
                        gridSize === opt.size
                          ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                    >
                      <span className="text-sm font-bold font-serif-luxury">{opt.label}</span>
                      <span className="text-[10px] text-stone-500 mt-0.5">{opt.desc}</span>
                    </button>
                  ))
                : [
                    { size: 2, label: 'Rayon 2', desc: '13 cases' },
                    { size: 3, label: 'Rayon 3', desc: '25 cases' },
                    { size: 4, label: 'Rayon 4', desc: '41 cases' },
                    { size: 5, label: 'Rayon 5', desc: '61 cases' }
                  ].map(opt => (
                    <button
                      key={opt.size}
                      onClick={() => onSelectGridSize(opt.size)}
                      className={`flex flex-col items-center py-2 px-1 rounded-xl border text-center transition-all ${
                        gridSize === opt.size
                          ? 'bg-amber-600/30 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                          : 'bg-stone-800/60 border-stone-700 text-stone-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold font-serif-luxury">{opt.label}</span>
                      <span className="text-[10px] text-stone-500 mt-0.5">{opt.desc}</span>
                    </button>
                  ))}
            </div>
          </div>

          {/* 6. Esthétique & Textures */}
          <div>
            <label className="text-xs font-semibold text-stone-400 uppercase tracking-wider block mb-2">
              Écrin & Texture du Plateau
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSelectTheme('wood')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  theme === 'wood'
                    ? 'border-amber-500 bg-amber-950/40 text-amber-300 shadow-md ring-1 ring-amber-500'
                    : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-white'
                }`}
              >
                <div className="w-full h-7 rounded-lg mb-1.5 texture-wood wood-border" />
                <span className="text-xs font-semibold block">Bois Noble</span>
                <span className="text-[10px] text-stone-500">Noyer ciré</span>
              </button>

              <button
                onClick={() => onSelectTheme('marble')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  theme === 'marble'
                    ? 'border-slate-300 bg-slate-800/40 text-slate-200 shadow-md ring-1 ring-slate-300'
                    : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-white'
                }`}
              >
                <div className="w-full h-7 rounded-lg mb-1.5 texture-marble marble-border" />
                <span className="text-xs font-semibold block">Marbre</span>
                <span className="text-[10px] text-stone-500">Carrare pur</span>
              </button>

              <button
                onClick={() => onSelectTheme('obsidian')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  theme === 'obsidian'
                    ? 'border-amber-400 bg-neutral-900/60 text-amber-300 shadow-md ring-1 ring-amber-400'
                    : 'border-stone-800 bg-stone-800/40 text-stone-400 hover:text-white'
                }`}
              >
                <div className="w-full h-7 rounded-lg mb-1.5 texture-obsidian obsidian-border" />
                <span className="text-xs font-semibold block">Obsidienne</span>
                <span className="text-[10px] text-stone-500">Or & Noir</span>
              </button>
            </div>
          </div>

          {/* 7. Effets Sonores */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-950/50 border border-stone-800">
            <div className="flex items-center gap-2.5">
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-stone-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-amber-400" />
              )}
              <div>
                <div className="text-xs font-semibold text-stone-200">Sons Procéduraux Tactiles</div>
                <div className="text-[10px] text-stone-500">Claquement bois/marbre & cloches</div>
              </div>
            </div>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                !isMuted
                  ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                  : 'bg-stone-800 border-stone-700 text-stone-400'
              }`}
            >
              {!isMuted ? 'Activé' : 'Muet'}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-2">
          <button
            onClick={() => {
              onRestartMatch();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold tracking-wide uppercase transition-all shadow-lg text-xs cursor-pointer"
          >
            Lancer Nouveau Match
          </button>
          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition-all text-xs cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
