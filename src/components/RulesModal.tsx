import React from 'react';
import { X, Trophy, ShieldCheck, Zap, HelpCircle, Gem, ArrowRight } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-5 shadow-2xl text-stone-200 max-h-[90vh] overflow-y-auto">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold font-serif-luxury text-amber-300">
              Règles de la Pipopipette
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-3.5 space-y-3 text-xs text-stone-300">
          {/* Base Rules */}
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-800/50 border border-stone-700/50">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">1. Tracer un segment</p>
              <p className="text-stone-400 mt-0.5">
                À tour de rôle, chaque joueur relie deux points adjacents (horizontalement ou verticalement).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-800/50 border border-stone-700/50">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">2. Fermer un carré (Capture)</p>
              <p className="text-stone-400 mt-0.5">
                Poser le 4ᵉ côté d’une case la capture et rapporte 1 point.
              </p>
            </div>
          </div>

          {/* New Modes Section */}
          <div className="p-3 rounded-2xl bg-amber-950/20 border border-yellow-500/30">
            <div className="flex items-center gap-1.5 font-bold text-yellow-300 mb-1">
              <Gem className="w-4 h-4 text-yellow-400" />
              Nouveau : Mode Losange Doré (Escalier)
            </div>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              Inspiré du carnet Seyès, le plateau s'organise en <strong className="text-yellow-200">losange en escalier</strong>. Les <strong className="text-yellow-200">4 coins extrêmes</strong> (Haut, Gauche, Bas, Droite) sont fermés et attribués automatiquement dès le départ :
            </p>
            <ul className="list-disc list-inside mt-1 text-[11px] text-amber-200/90 space-y-0.5">
              <li>Coins Haut &amp; Gauche : Joueur 1 (2 points)</li>
              <li>Coins Bas &amp; Droite : Joueur 2 / IA (2 points)</li>
            </ul>
          </div>

          <div className="p-3 rounded-2xl bg-sky-950/20 border border-sky-500/30">
            <div className="flex items-center gap-1.5 font-bold text-sky-300 mb-1">
              <ArrowRight className="w-4 h-4 text-sky-400" />
              Règle : Tour par Tour Strict (Sans combo)
            </div>
            <p className="text-stone-300 leading-relaxed text-[11px]">
              En mode <strong className="text-sky-200">Tour par Tour Strict</strong>, chaque joueur place exactement 1 trait à chaque tour. Même si vous capturez une case, vous marquez le point mais la main passe immédiatement à l'adversaire !
            </p>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-800/50 border border-stone-700/50">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">3. Condition de Victoire</p>
              <p className="text-stone-400 mt-0.5">
                La partie se termine lorsque toute la grille est remplie. Le joueur détenant le plus de cases triomphe.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-bold tracking-wide uppercase transition-all shadow-lg text-xs cursor-pointer"
        >
          C'est compris, Place au Jeu
        </button>
      </div>
    </div>
  );
};
