export type Player = 'player1' | 'player2';

export interface PlayerConfig {
  id: Player;
  name: string;
  color: string;
  secondaryColor: string;
  glowColor: string;
  avatar: string;
  badge: string;
}

export type EdgeType = 'horizontal' | 'vertical';

export interface Edge {
  id: string; // e.g. "h-0-0" or "v-0-0"
  type: EdgeType;
  row: number;
  col: number;
  owner: Player | null;
}

export interface Box {
  row: number;
  col: number;
  owner: Player | null;
  edges: string[]; // 4 edge IDs: top, right, bottom, left
  captureOrder?: number;
}

export interface GameMove {
  edgeId: string;
  player: Player;
  boxesCompleted: { row: number; col: number }[];
  timestamp: number;
}

export interface BoardState {
  rows: number;
  cols: number;
  edges: Map<string, Edge>;
  boxes: Box[][];
  currentPlayer: Player;
  scores: Record<Player, number>;
  moves: GameMove[];
  isGameOver: boolean;
  winner: Player | 'draw' | null;
  comboCount: number;
  lastCapture: { row: number; col: number; player: Player } | null;
}

export const DEFAULT_PLAYERS: Record<Player, PlayerConfig> = {
  player1: {
    id: 'player1',
    name: 'Joueur I',
    color: '#d97706', // Imperial Amber / Gold
    secondaryColor: '#fef08a',
    glowColor: 'rgba(217, 119, 6, 0.6)',
    avatar: '👑',
    badge: 'Or Impérial'
  },
  player2: {
    id: 'player2',
    name: 'Joueur II',
    color: '#0284c7', // Royal Sapphire / Azure
    secondaryColor: '#bae6fd',
    glowColor: 'rgba(2, 132, 199, 0.6)',
    avatar: '⚔️',
    badge: 'Saphir Royal'
  }
};

/**
 * Creates initial board state
 */
export function createInitialBoard(rows: number = 4, cols: number = 4): BoardState {
  const edges = new Map<string, Edge>();
  const boxes: Box[][] = [];

  // Initialize horizontal edges: (rows + 1) rows, cols per row
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c < cols; c++) {
      const id = `h-${r}-${c}`;
      edges.set(id, { id, type: 'horizontal', row: r, col: c, owner: null });
    }
  }

  // Initialize vertical edges: rows, (cols + 1) per row
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const id = `v-${r}-${c}`;
      edges.set(id, { id, type: 'vertical', row: r, col: c, owner: null });
    }
  }

  // Initialize boxes
  for (let r = 0; r < rows; r++) {
    boxes[r] = [];
    for (let c = 0; c < cols; c++) {
      const top = `h-${r}-${c}`;
      const bottom = `h-${r + 1}-${c}`;
      const left = `v-${r}-${c}`;
      const right = `v-${r}-${c + 1}`;
      boxes[r][c] = {
        row: r,
        col: c,
        owner: null,
        edges: [top, right, bottom, left]
      };
    }
  }

  return {
    rows,
    cols,
    edges,
    boxes,
    currentPlayer: 'player1',
    scores: { player1: 0, player2: 0 },
    moves: [],
    isGameOver: false,
    winner: null,
    comboCount: 0,
    lastCapture: null
  };
}

/**
 * Checks which boxes are completed by an edge
 */
export function getAdjacentBoxes(edgeId: string, rows: number, cols: number): { r: number; c: number }[] {
  const [type, rStr, cStr] = edgeId.split('-');
  const r = parseInt(rStr, 10);
  const c = parseInt(cStr, 10);
  const adj: { r: number; c: number }[] = [];

  if (type === 'h') {
    // Top box
    if (r > 0) adj.push({ r: r - 1, c });
    // Bottom box
    if (r < rows) adj.push({ r, c });
  } else {
    // Left box
    if (c > 0) adj.push({ r, c: c - 1 });
    // Right box
    if (c < cols) adj.push({ r, c });
  }

  return adj;
}

/**
 * Checks how many edges are completed for a box
 */
export function countBoxEdges(box: Box, edges: Map<string, Edge>): number {
  let count = 0;
  for (const edgeId of box.edges) {
    if (edges.get(edgeId)?.owner) {
      count++;
    }
  }
  return count;
}

/**
 * Plays a move on the board
 */
export function makeMove(board: BoardState, edgeId: string): BoardState {
  const edge = board.edges.get(edgeId);
  if (!edge || edge.owner || board.isGameOver) {
    return board;
  }

  // Clone state
  const newEdges = new Map(board.edges);
  const newBoxes = board.boxes.map(row => row.map(b => ({ ...b })));
  const newScores = { ...board.scores };
  const currentP = board.currentPlayer;

  // Assign edge to current player
  newEdges.set(edgeId, { ...edge, owner: currentP });

  // Check adjacent boxes for completion
  const adjacent = getAdjacentBoxes(edgeId, board.rows, board.cols);
  const boxesCompleted: { row: number; col: number }[] = [];

  for (const { r, c } of adjacent) {
    const box = newBoxes[r][c];
    if (!box.owner) {
      const edgeCount = countBoxEdges(box, newEdges);
      if (edgeCount === 4) {
        box.owner = currentP;
        box.captureOrder = board.moves.length + 1;
        boxesCompleted.push({ row: r, col: c });
      }
    }
  }

  let nextPlayer = currentP;
  let newCombo = board.comboCount;
  let lastCapture = board.lastCapture;

  if (boxesCompleted.length > 0) {
    newScores[currentP] += boxesCompleted.length;
    newCombo += boxesCompleted.length;
    lastCapture = {
      row: boxesCompleted[0].row,
      col: boxesCompleted[0].col,
      player: currentP
    };
    // The player keeps their turn when they complete at least one box!
    nextPlayer = currentP;
  } else {
    newCombo = 0;
    // Turn passes to the next player
    nextPlayer = currentP === 'player1' ? 'player2' : 'player1';
  }

  // Record move
  const move: GameMove = {
    edgeId,
    player: currentP,
    boxesCompleted,
    timestamp: Date.now()
  };

  const newMoves = [...board.moves, move];

  // Check game over
  const totalBoxes = board.rows * board.cols;
  const totalCaptured = newScores.player1 + newScores.player2;
  const isGameOver = totalCaptured >= totalBoxes;

  let winner: Player | 'draw' | null = null;
  if (isGameOver) {
    if (newScores.player1 > newScores.player2) {
      winner = 'player1';
    } else if (newScores.player2 > newScores.player1) {
      winner = 'player2';
    } else {
      winner = 'draw';
    }
  }

  return {
    ...board,
    edges: newEdges,
    boxes: newBoxes,
    currentPlayer: nextPlayer,
    scores: newScores,
    moves: newMoves,
    isGameOver,
    winner,
    comboCount: newCombo,
    lastCapture
  };
}

/**
 * AI Logic for Dots and Boxes
 */
export function getBestMoveAI(
  board: BoardState,
  difficulty: 'novice' | 'tactician' | 'grandmaster'
): string | null {
  const availableEdges: string[] = [];
  board.edges.forEach((edge, id) => {
    if (!edge.owner) {
      availableEdges.push(id);
    }
  });

  if (availableEdges.length === 0) return null;

  // Novice: sometimes random, sometimes completes a box
  if (difficulty === 'novice') {
    // Look for winning boxes with 60% probability
    if (Math.random() < 0.6) {
      for (const id of availableEdges) {
        const adj = getAdjacentBoxes(id, board.rows, board.cols);
        for (const { r, c } of adj) {
          const box = board.boxes[r][c];
          if (!box.owner && countBoxEdges(box, board.edges) === 3) {
            return id;
          }
        }
      }
    }
    // Random move
    return availableEdges[Math.floor(Math.random() * availableEdges.length)];
  }

  // Categorize moves:
  // 1. Box-completing moves (score +1 or +2)
  // 2. Safe moves (does not leave any adjacent box with 3 edges)
  // 3. Dangerous moves (leaves an adjacent box with 3 edges, giving it to opponent)
  const capturingMoves: string[] = [];
  const safeMoves: string[] = [];
  const riskyMoves: { id: string; penalty: number }[] = [];

  for (const id of availableEdges) {
    const adj = getAdjacentBoxes(id, board.rows, board.cols);
    let completesCount = 0;
    let creates3SidedBox = false;

    for (const { r, c } of adj) {
      const box = board.boxes[r][c];
      if (!box.owner) {
        const count = countBoxEdges(box, board.edges);
        if (count === 3) {
          completesCount++;
        } else if (count === 2) {
          creates3SidedBox = true;
        }
      }
    }

    if (completesCount > 0) {
      capturingMoves.push(id);
    } else if (!creates3SidedBox) {
      safeMoves.push(id);
    } else {
      // Calculate chain risk: how many boxes would this give away
      riskyMoves.push({ id, penalty: 1 });
    }
  }

  // Priority 1: Take any box completion!
  if (capturingMoves.length > 0) {
    if (difficulty === 'grandmaster') {
      // Grandmaster: evaluate double-cross sacrifice if it's the last 2 boxes of a chain
      // When 2 boxes remain in a chain and there are more chains, taking 2 instead of 4
      // could give control. But for standard play, taking all is top priority.
      return capturingMoves[0];
    }
    return capturingMoves[0];
  }

  // Priority 2: Safe moves
  if (safeMoves.length > 0) {
    // Prefer central or boundary safe moves
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  // Priority 3: Forced sacrifice. Pick the move that minimizes opponent's capture chain
  if (riskyMoves.length > 0) {
    riskyMoves.sort((a, b) => a.penalty - b.penalty);
    return riskyMoves[0].id;
  }

  return availableEdges[0];
}
