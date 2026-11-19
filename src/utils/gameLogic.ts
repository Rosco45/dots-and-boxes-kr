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
  isInitial?: boolean; // corner edge pre-allocated
}

export interface Box {
  row: number;
  col: number;
  isValid: boolean;
  owner: Player | null;
  edges: string[]; // 4 edge IDs: top, right, bottom, left
  captureOrder?: number;
  isInitialCorner?: boolean;
}

export interface GameMove {
  edgeId: string;
  player: Player;
  boxesCompleted: { row: number; col: number }[];
  timestamp: number;
}

export type BoardShape = 'square' | 'diamond';
export type TurnRule = 'combo' | 'strict_turns';

export interface BoardState {
  shape: BoardShape;
  turnRule: TurnRule;
  radius?: number;
  rows: number;
  cols: number;
  totalBoxes: number;
  edges: Map<string, Edge>;
  boxes: (Box | null)[][];
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
 * Checks if a box coordinate is valid within the chosen shape
 */
export function isBoxValidInShape(
  r: number,
  c: number,
  shape: BoardShape,
  rows: number,
  cols: number,
  radius?: number
): boolean {
  if (shape === 'square') {
    return r >= 0 && r < rows && c >= 0 && c < cols;
  }
  // Diamond (Losange en escalier / Manhattan distance)
  const rad = radius ?? Math.floor(rows / 2);
  const midR = rad;
  const midC = rad;
  return Math.abs(r - midR) + Math.abs(c - midC) <= rad;
}

/**
 * Creates initial board state supporting Square and Losange Doré (Diamond)
 */
export function createInitialBoard(
  size: number = 4,
  shape: BoardShape = 'square',
  turnRule: TurnRule = 'combo'
): BoardState {
  const edges = new Map<string, Edge>();
  let rows: number;
  let cols: number;
  let radius: number | undefined;

  if (shape === 'square') {
    rows = size;
    cols = size;
  } else {
    // Diamond mode: size is the radius or bounding size
    radius = size <= 6 ? size : Math.floor(size / 2);
    // ensure radius is at least 2
    if (radius < 2) radius = 2;
    rows = 2 * radius + 1;
    cols = 2 * radius + 1;
  }

  // 1. Identify valid boxes
  const boxes: (Box | null)[][] = [];
  let totalBoxes = 0;

  for (let r = 0; r < rows; r++) {
    boxes[r] = [];
    for (let c = 0; c < cols; c++) {
      if (isBoxValidInShape(r, c, shape, rows, cols, radius)) {
        const top = `h-${r}-${c}`;
        const bottom = `h-${r + 1}-${c}`;
        const left = `v-${r}-${c}`;
        const right = `v-${r}-${c + 1}`;
        boxes[r][c] = {
          row: r,
          col: c,
          isValid: true,
          owner: null,
          edges: [top, right, bottom, left]
        };
        totalBoxes++;
      } else {
        boxes[r][c] = null;
      }
    }
  }

  // 2. Register only edges that border at least one valid box
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const box = boxes[r][c];
      if (box && box.isValid) {
        // Horizontal top edge
        const hTop = `h-${r}-${c}`;
        if (!edges.has(hTop)) {
          edges.set(hTop, { id: hTop, type: 'horizontal', row: r, col: c, owner: null });
        }
        // Horizontal bottom edge
        const hBottom = `h-${r + 1}-${c}`;
        if (!edges.has(hBottom)) {
          edges.set(hBottom, { id: hBottom, type: 'horizontal', row: r + 1, col: c, owner: null });
        }
        // Vertical left edge
        const vLeft = `v-${r}-${c}`;
        if (!edges.has(vLeft)) {
          edges.set(vLeft, { id: vLeft, type: 'vertical', row: r, col: c, owner: null });
        }
        // Vertical right edge
        const vRight = `v-${r}-${c + 1}`;
        if (!edges.has(vRight)) {
          edges.set(vRight, { id: vRight, type: 'vertical', row: r, col: c + 1, owner: null });
        }
      }
    }
  }

  const scores: Record<Player, number> = { player1: 0, player2: 0 };

  // 3. In Diamond mode ("Losange Doré"), the 4 corners are automatically attributed!
  // Top (0, mid) & Left (mid, 0) -> Player 1 (2 points)
  // Bottom (2*mid, mid) & Right (mid, 2*mid) -> Player 2 (2 points)
  if (shape === 'diamond' && radius !== undefined) {
    const mid = radius;
    const cornerDefs: { r: number; c: number; player: Player; order: number }[] = [
      { r: 0, c: mid, player: 'player1', order: 1 },        // Top
      { r: mid, c: 0, player: 'player1', order: 2 },        // Left
      { r: 2 * mid, c: mid, player: 'player2', order: 3 },  // Bottom
      { r: mid, c: 2 * mid, player: 'player2', order: 4 }   // Right
    ];

    cornerDefs.forEach(({ r, c, player, order }) => {
      const box = boxes[r]?.[c];
      if (box) {
        box.owner = player;
        box.captureOrder = order;
        box.isInitialCorner = true;
        scores[player]++;

        // Pre-fill and lock all 4 sides of the corner box
        box.edges.forEach(edgeId => {
          const edge = edges.get(edgeId);
          if (edge) {
            edge.owner = player;
            edge.isInitial = true;
          }
        });
      }
    });
  }

  return {
    shape,
    turnRule,
    radius,
    rows,
    cols,
    totalBoxes,
    edges,
    boxes,
    currentPlayer: 'player1',
    scores,
    moves: [],
    isGameOver: false,
    winner: null,
    comboCount: 0,
    lastCapture: null
  };
}

/**
 * Checks which valid boxes are adjacent to an edge
 */
export function getAdjacentBoxes(
  edgeId: string,
  rows: number,
  cols: number,
  boxes?: (Box | null)[][]
): { r: number; c: number }[] {
  const [type, rStr, cStr] = edgeId.split('-');
  const r = parseInt(rStr, 10);
  const c = parseInt(cStr, 10);
  const candidates: { r: number; c: number }[] = [];

  if (type === 'h') {
    if (r > 0) candidates.push({ r: r - 1, c });
    if (r < rows) candidates.push({ r, c });
  } else {
    if (c > 0) candidates.push({ r, c: c - 1 });
    if (c < cols) candidates.push({ r, c });
  }

  if (!boxes) return candidates;

  // Filter only existing and valid boxes
  return candidates.filter(({ r: cr, c: cc }) => {
    const box = boxes[cr]?.[cc];
    return Boolean(box && box.isValid);
  });
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
  const newBoxes = board.boxes.map(row =>
    row.map(b => (b ? { ...b, edges: [...b.edges] } : null))
  );
  const newScores = { ...board.scores };
  const currentP = board.currentPlayer;

  // Assign edge to current player
  newEdges.set(edgeId, { ...edge, owner: currentP });

  // Check adjacent valid boxes for completion
  const adjacent = getAdjacentBoxes(edgeId, board.rows, board.cols, newBoxes);
  const boxesCompleted: { row: number; col: number }[] = [];

  for (const { r, c } of adjacent) {
    const box = newBoxes[r]?.[c];
    if (box && !box.owner) {
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

    // Strict Turn Rule: Turn passes to next player even if a box is captured!
    if (board.turnRule === 'strict_turns') {
      nextPlayer = currentP === 'player1' ? 'player2' : 'player1';
      newCombo = 0;
    } else {
      // Classic Combo Rule: The player keeps their turn
      nextPlayer = currentP;
    }
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
  const totalCaptured = newScores.player1 + newScores.player2;
  const isGameOver = totalCaptured >= board.totalBoxes;

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
 * AI Logic for Dots and Boxes (Both Square and Diamond, Combo and Strict Turns)
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
    if (Math.random() < 0.6) {
      for (const id of availableEdges) {
        const adj = getAdjacentBoxes(id, board.rows, board.cols, board.boxes);
        for (const { r, c } of adj) {
          const box = board.boxes[r]?.[c];
          if (box && !box.owner && countBoxEdges(box, board.edges) === 3) {
            return id;
          }
        }
      }
    }
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
    const adj = getAdjacentBoxes(id, board.rows, board.cols, board.boxes);
    let completesCount = 0;
    let creates3SidedBox = false;

    for (const { r, c } of adj) {
      const box = board.boxes[r]?.[c];
      if (box && !box.owner) {
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
      riskyMoves.push({ id, penalty: 1 });
    }
  }

  // Priority 1: Take any box completion!
  if (capturingMoves.length > 0) {
    return capturingMoves[0];
  }

  // Priority 2: Safe moves
  if (safeMoves.length > 0) {
    return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }

  // Priority 3: Forced sacrifice. Pick the move that minimizes opponent's capture chain
  if (riskyMoves.length > 0) {
    riskyMoves.sort((a, b) => a.penalty - b.penalty);
    return riskyMoves[0].id;
  }

  return availableEdges[0];
}
