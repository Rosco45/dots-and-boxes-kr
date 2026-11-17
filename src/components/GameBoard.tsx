import React, { useState } from 'react';
import { BoardState, DEFAULT_PLAYERS, Player } from '../utils/gameLogic';
import { soundEngine } from '../utils/audio';

interface GameBoardProps {
  board: BoardState;
  onEdgeClick: (edgeId: string) => void;
  theme: 'wood' | 'marble' | 'obsidian';
  players: typeof DEFAULT_PLAYERS;
  isAiTurn: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onEdgeClick,
  theme,
  players,
  isAiTurn
}) => {
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const { rows, cols } = board;

  // Board dimensions calculation:
  // Using an SVG or dynamic coordinate system ensures 100% pixel-perfect scaling on mobile
  const cellSize = 72; // virtual coordinate units per box
  const padding = 36;
  const totalWidth = cols * cellSize + padding * 2;
  const totalHeight = rows * cellSize + padding * 2;

  // Theme-specific styling variables
  const isMarble = theme === 'marble';
  const isObsidian = theme === 'obsidian';

  const dotFill = isMarble
    ? 'url(#goldRivetMarble)'
    : isObsidian
    ? 'url(#goldRivetObsidian)'
    : 'url(#goldRivetWood)';

  const dotShadow = isMarble ? 'rgba(71, 85, 105, 0.4)' : 'rgba(0, 0, 0, 0.7)';
  const unplayedLineColor = isMarble
    ? 'rgba(148, 163, 184, 0.25)'
    : isObsidian
    ? 'rgba(255, 255, 255, 0.08)'
    : 'rgba(217, 119, 6, 0.15)';

  const handleEdgeInteract = (edgeId: string) => {
    if (isAiTurn || board.isGameOver) return;
    const edge = board.edges.get(edgeId);
    if (edge && !edge.owner) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(15);
      }
      onEdgeClick(edgeId);
    }
  };

  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none flex items-center justify-center p-2">
      {/* Decorative Outer Luxury Frame */}
      <div
        className={`relative w-full rounded-3xl p-3 md:p-4 transition-all duration-500 ${
          isMarble
            ? 'texture-marble marble-border'
            : isObsidian
            ? 'texture-obsidian obsidian-border'
            : 'texture-wood wood-border'
        }`}
      >
        {/* Subtle Inlaid Corner Rivets */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[inset_0_1px_1px_#ffffff,0_1px_2px_#000000] opacity-80" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[inset_0_1px_1px_#ffffff,0_1px_2px_#000000] opacity-80" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[inset_0_1px_1px_#ffffff,0_1px_2px_#000000] opacity-80" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[inset_0_1px_1px_#ffffff,0_1px_2px_#000000] opacity-80" />

        {/* SVG Board */}
        <svg
          viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          className="w-full h-auto drop-shadow-md touch-none"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Realistic Inlaid Gold Rivet for Wood */}
            <radialGradient id="goldRivetWood" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="85%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </radialGradient>

            {/* Polished Platinum/Gold Rivet for Marble */}
            <radialGradient id="goldRivetMarble" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="85%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </radialGradient>

            {/* Glowing Amber Rivet for Obsidian */}
            <radialGradient id="goldRivetObsidian" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="85%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </radialGradient>

            {/* Player 1 Box Fill Texture */}
            <radialGradient id="player1Fill" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#d97706" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#92400e" stopOpacity="0.9" />
            </radialGradient>

            {/* Player 2 Box Fill Texture */}
            <radialGradient id="player2Fill" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0.9" />
            </radialGradient>

            {/* Drop Shadow filter for captured boxes */}
            <filter id="boxShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* 1. Captured Boxes Layer */}
          {board.boxes.map((row, r) =>
            row.map((box, c) => {
              const x = padding + c * cellSize;
              const y = padding + r * cellSize;
              const boxMargin = 5;
              const bWidth = cellSize - boxMargin * 2;
              const bHeight = cellSize - boxMargin * 2;
              const isCaptured = Boolean(box.owner);
              const ownerConfig = box.owner ? players[box.owner] : null;

              if (!isCaptured) return null;

              return (
                <g key={`box-${r}-${c}`} className="animate-stamp">
                  {/* Embossed Luxury Plaque */}
                  <rect
                    x={x + boxMargin}
                    y={y + boxMargin}
                    width={bWidth}
                    height={bHeight}
                    rx={8}
                    fill={box.owner === 'player1' ? 'url(#player1Fill)' : 'url(#player2Fill)'}
                    stroke={box.owner === 'player1' ? '#fef08a' : '#bae6fd'}
                    strokeWidth={1.5}
                    filter="url(#boxShadow)"
                    className="transition-all duration-300"
                  />
                  {/* Subtle inner bevel */}
                  <rect
                    x={x + boxMargin + 2}
                    y={y + boxMargin + 2}
                    width={bWidth - 4}
                    height={bHeight - 4}
                    rx={6}
                    fill="none"
                    stroke={box.owner === 'player1' ? 'rgba(254, 240, 138, 0.4)' : 'rgba(186, 230, 253, 0.4)'}
                    strokeWidth={1}
                  />
                  {/* Monogram / Royal Seal Icon */}
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 6}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="22"
                    className="select-none pointer-events-none drop-shadow"
                  >
                    {ownerConfig?.avatar}
                  </text>
                  {/* Capture Order Number Badge */}
                  {box.captureOrder && (
                    <text
                      x={x + cellSize - boxMargin - 5}
                      y={y + boxMargin + 10}
                      textAnchor="end"
                      fontSize="9"
                      fontWeight="bold"
                      fill={box.owner === 'player1' ? '#fef08a' : '#e0f2fe'}
                      className="opacity-80 select-none pointer-events-none"
                    >
                      #{box.captureOrder}
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* 2. Grid Guide Lines (Subtle background paths) */}
          {Array.from(board.edges.values()).map(edge => {
            const isHoriz = edge.type === 'horizontal';
            const x1 = isHoriz
              ? padding + edge.col * cellSize
              : padding + edge.col * cellSize;
            const y1 = isHoriz
              ? padding + edge.row * cellSize
              : padding + edge.row * cellSize;
            const x2 = isHoriz
              ? padding + (edge.col + 1) * cellSize
              : padding + edge.col * cellSize;
            const y2 = isHoriz
              ? padding + edge.row * cellSize
              : padding + (edge.row + 1) * cellSize;

            if (edge.owner) return null;

            return (
              <line
                key={`guide-${edge.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={unplayedLineColor}
                strokeWidth={2}
                strokeDasharray="2, 6"
                strokeLinecap="round"
                className="pointer-events-none"
              />
            );
          })}

          {/* 3. Played & Hovered Segments */}
          {Array.from(board.edges.values()).map(edge => {
            const isHoriz = edge.type === 'horizontal';
            const x1 = isHoriz
              ? padding + edge.col * cellSize
              : padding + edge.col * cellSize;
            const y1 = isHoriz
              ? padding + edge.row * cellSize
              : padding + edge.row * cellSize;
            const x2 = isHoriz
              ? padding + (edge.col + 1) * cellSize
              : padding + edge.col * cellSize;
            const y2 = isHoriz
              ? padding + edge.row * cellSize
              : padding + (edge.row + 1) * cellSize;

            const isOwned = Boolean(edge.owner);
            const isHovered = hoveredEdge === edge.id && !isOwned && !isAiTurn && !board.isGameOver;
            const ownerConfig = edge.owner ? players[edge.owner] : null;

            return (
              <g key={`edge-group-${edge.id}`}>
                {/* Visible Inlaid Segment Line */}
                {isOwned && (
                  <>
                    {/* Shadow / Inlay Depth */}
                    <line
                      x1={x1}
                      y1={y1 + 1}
                      x2={x2}
                      y2={y2 + 1}
                      stroke="rgba(0,0,0,0.4)"
                      strokeWidth={6}
                      strokeLinecap="round"
                    />
                    {/* Glowing Metallic Beam */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={ownerConfig?.color}
                      strokeWidth={5}
                      strokeLinecap="round"
                      style={{
                        filter: `drop-shadow(0 0 4px ${ownerConfig?.glowColor})`
                      }}
                    />
                    {/* Central Highlight Specular Line */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={ownerConfig?.secondaryColor}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      className="opacity-90"
                    />
                  </>
                )}

                {/* Hover Preview for Active Player */}
                {isHovered && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={players[board.currentPlayer].color}
                    strokeWidth={4}
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                    className="opacity-70 animate-pulse pointer-events-none"
                  />
                )}

                {/* Generous Mobile Touch / Tap Target (Hitbox) */}
                {!isOwned && !board.isGameOver && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="transparent"
                    strokeWidth={36} // 36px wide hitbox for effortless finger tapping on mobile
                    strokeLinecap="round"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredEdge(edge.id)}
                    onMouseLeave={() => setHoveredEdge(null)}
                    onClick={() => handleEdgeInteract(edge.id)}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      handleEdgeInteract(edge.id);
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* 4. Dots / Rivets Matrix (Drawn on top of lines for realistic metallic overlap) */}
          {Array.from({ length: rows + 1 }).map((_, r) =>
            Array.from({ length: cols + 1 }).map((_, c) => {
              const cx = padding + c * cellSize;
              const cy = padding + r * cellSize;
              return (
                <g key={`dot-${r}-${c}`} className="pointer-events-none">
                  {/* Dot Ambient Shadow */}
                  <circle cx={cx} cy={cy + 1.5} r={7.5} fill={dotShadow} />
                  {/* Metal Rivet Body */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6.5}
                    fill={dotFill}
                    stroke={isMarble ? '#94a3b8' : '#78350f'}
                    strokeWidth={1}
                  />
                  {/* Micro Specular Highlight */}
                  <circle
                    cx={cx - 2}
                    cy={cy - 2}
                    r={2}
                    fill="#ffffff"
                    opacity={0.7}
                  />
                </g>
              );
            })
          )}
        </svg>

        {/* Dynamic Combo Floating Banner if active */}
        {board.comboCount > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500/90 text-stone-950 font-bold text-xs tracking-wider uppercase shadow-lg border border-amber-300 animate-bounce">
            Combo x{board.comboCount} ! Rejoue !
          </div>
        )}
      </div>
    </div>
  );
};
