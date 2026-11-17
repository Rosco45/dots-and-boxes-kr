import { describe, it, expect } from 'vitest';
import {
  createInitialBoard,
  makeMove,
  getBestMoveAI,
  getAdjacentBoxes,
  countBoxEdges
} from './gameLogic';

describe('Dots and Boxes Game Logic - Advanced Scenarios', () => {
  it('creates an empty board of size 3x3 with correct edges', () => {
    const board = createInitialBoard(3, 3);
    expect(board.rows).toBe(3);
    expect(board.cols).toBe(3);
    expect(board.edges.size).toBe(24);
    expect(board.scores.player1).toBe(0);
    expect(board.scores.player2).toBe(0);
    expect(board.currentPlayer).toBe('player1');
  });

  it('switches turn when no box is completed', () => {
    const board = createInitialBoard(3, 3);
    const b1 = makeMove(board, 'h-0-0');
    expect(b1.currentPlayer).toBe('player2');
    expect(b1.scores.player1).toBe(0);
  });

  it('awards point and lets player replay when closing a box', () => {
    let board = createInitialBoard(2, 2);
    // Box (0, 0) edges: h-0-0, v-0-0, v-0-1, h-1-0
    board = makeMove(board, 'h-0-0'); // p1
    board = makeMove(board, 'v-0-0'); // p2
    board = makeMove(board, 'v-0-1'); // p1

    // Player 2 closes the 4th side: h-1-0
    const b4 = makeMove(board, 'h-1-0');
    expect(b4.scores.player2).toBe(1);
    expect(b4.boxes[0][0].owner).toBe('player2');
    // Player 2 keeps their turn
    expect(b4.currentPlayer).toBe('player2');
  });

  it('awards 2 points and re-play on double box closure', () => {
    let board = createInitialBoard(2, 2);
    // Let's set up box (0,0) and box (0,1) sharing edge v-0-1
    // Box (0,0) needs: h-0-0, v-0-0, h-1-0
    // Box (0,1) needs: h-0-1, v-0-2, h-1-1
    board = makeMove(board, 'h-0-0'); // p1
    board = makeMove(board, 'v-0-0'); // p2
    board = makeMove(board, 'h-1-0'); // p1
    board = makeMove(board, 'h-0-1'); // p2
    board = makeMove(board, 'v-0-2'); // p1
    board = makeMove(board, 'h-1-1'); // p2

    // Now, placing v-0-1 simultaneously completes BOTH box (0,0) and box (0,1)
    const doubleMove = makeMove(board, 'v-0-1');
    expect(doubleMove.scores.player1).toBe(2);
    expect(doubleMove.boxes[0][0].owner).toBe('player1');
    expect(doubleMove.boxes[0][1].owner).toBe('player1');
    expect(doubleMove.currentPlayer).toBe('player1');
  });

  it('AI chooses available moves correctly', () => {
    const board = createInitialBoard(3, 3);
    const aiMove = getBestMoveAI(board, 'tactician');
    expect(aiMove).not.toBeNull();
    expect(typeof aiMove).toBe('string');
    expect(board.edges.get(aiMove!)?.owner).toBeNull();
  });
});
