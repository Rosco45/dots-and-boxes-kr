import React from 'react';
import { X, Trophy, ShieldCheck, Zap, HelpCircle } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl text-stone-200 overflow-hidden">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-serif-luxury text-amber-300">
              Règles de la Pipopipette
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-sm text-stone-300">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-800/50 border border-stone-700/50">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">1. Tracer un segment</p>
              <p className="text-xs text-stone-400 mt-0.5">
                À tour de rôle, chaque joueur relie deux points adjacents (horizontalement ou verticalement).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-800/50 border border-stone-700/50">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">2. Fermer un carré (Capture)</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Le joueur qui pose le 4ᵉ côté d’une case la capture, marque 1 point et <strong className="text-amber-300">doit rejouer immédiatement</strong> !
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-800/50 border border-stone-700/50">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">3. Victoire Impériale</p>
              <p className="text-xs text-stone-400 mt-0.5">
                La partie se termine lorsque toute la grille est complétée. Le joueur qui possède le plus grand nombre de carrés remporte la partie.
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Pro-tip */}
        <div className="mt-4 p-3 rounded-2xl bg-amber-950/30 border border-amber-600/30 text-xs text-amber-200">
          💡 <strong className="text-amber-300">Astuce tactique :</strong> Évitez de poser le 3ᵉ côté d'une case si vous ne pouvez pas la fermer vous-même, sous peine de l'offrir sur un plateau d'argent à votre adversaire !
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold tracking-wide uppercase transition-all shadow-lg text-sm"
        >
          J'ai compris, Que le duel commence
        </button>
      </div>
    </div>
  );
};
