import { describe, it, expect } from 'vitest';
import {
  createInitialBoard,
  makeMove,
  getBestMoveAI,
  getAdjacentBoxes,
  countBoxEdges
} from './gameLogic';

describe('Dots and Boxes Game Logic - Classic & Losange Doré', () => {
  it('creates an empty board of size 3x3 in square mode', () => {
    const board = createInitialBoard(3, 'square', 'combo');
    expect(board.rows).toBe(3);
    expect(board.cols).toBe(3);
    expect(board.edges.size).toBe(24);
    expect(board.totalBoxes).toBe(9);
    expect(board.scores.player1).toBe(0);
    expect(board.scores.player2).toBe(0);
    expect(board.currentPlayer).toBe('player1');
  });

  it('switches turn when no box is completed', () => {
    const board = createInitialBoard(3, 'square', 'combo');
    const b1 = makeMove(board, 'h-0-0');
    expect(b1.currentPlayer).toBe('player2');
    expect(b1.scores.player1).toBe(0);
  });

  it('awards point and lets player replay in COMBO mode', () => {
    let board = createInitialBoard(2, 'square', 'combo');
    board = makeMove(board, 'h-0-0'); // p1
    board = makeMove(board, 'v-0-0'); // p2
    board = makeMove(board, 'v-0-1'); // p1

    // Player 2 closes the 4th side: h-1-0
    const b4 = makeMove(board, 'h-1-0');
    expect(b4.scores.player2).toBe(1);
    expect(b4.boxes[0][0]?.owner).toBe('player2');
    // Player 2 keeps their turn in combo mode
    expect(b4.currentPlayer).toBe('player2');
  });

  it('STRICT TURNS MODE: player captures box but turn passes immediately to opponent', () => {
    let board = createInitialBoard(2, 'square', 'strict_turns');
    board = makeMove(board, 'h-0-0'); // p1
    board = makeMove(board, 'v-0-0'); // p2
    board = makeMove(board, 'v-0-1'); // p1

    // Player 2 closes the 4th side: h-1-0
    const b4 = makeMove(board, 'h-1-0');
    expect(b4.scores.player2).toBe(1);
    expect(b4.boxes[0][0]?.owner).toBe('player2');
    // In strict turns mode, turn passes to player1 immediately!
    expect(b4.currentPlayer).toBe('player1');
  });

  it('LOSANGE DORÉ MODE: initializes stepped diamond with 4 corner boxes pre-allocated', () => {
    // Radius = 2 -> 5x5 bounding grid, 13 boxes total
    const board = createInitialBoard(2, 'diamond', 'combo');
    expect(board.shape).toBe('diamond');
    expect(board.totalBoxes).toBe(13); // 1 + 3 + 5 + 3 + 1

    // 4 corners should be pre-attributed:
    // Player 1 has Top (0, 2) and Left (2, 0) -> 2 points
    // Player 2 has Bottom (4, 2) and Right (2, 4) -> 2 points
    expect(board.scores.player1).toBe(2);
    expect(board.scores.player2).toBe(2);

    expect(board.boxes[0][2]?.owner).toBe('player1'); // Top
    expect(board.boxes[2][0]?.owner).toBe('player1'); // Left
    expect(board.boxes[4][2]?.owner).toBe('player2'); // Bottom
    expect(board.boxes[2][4]?.owner).toBe('player2'); // Right

    // Corner edges should be pre-owned
    expect(board.edges.get('h-0-2')?.owner).toBe('player1');
    expect(board.edges.get('h-1-2')?.owner).toBe('player1');
    expect(board.edges.get('v-0-2')?.owner).toBe('player1');
    expect(board.edges.get('v-0-3')?.owner).toBe('player1');

    // Radius 3 (7x7) -> 1 + 3 + 5 + 7 + 5 + 3 + 1 = 25 boxes
    const boardR3 = createInitialBoard(3, 'diamond', 'combo');
    expect(boardR3.totalBoxes).toBe(25);
    expect(boardR3.scores.player1).toBe(2);
    expect(boardR3.scores.player2).toBe(2);
  });

  it('AI chooses available non-corner moves in diamond mode', () => {
    const board = createInitialBoard(2, 'diamond', 'combo');
    const aiMove = getBestMoveAI(board, 'tactician');
    expect(aiMove).not.toBeNull();
    // Move must not be already taken
    expect(board.edges.get(aiMove!)?.owner).toBeNull();
  });
});
