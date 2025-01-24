export type CellValue = 'black' | 'white' | 'empty';
export type Player = 'human' | 'computer';
export type Difficulty = 'easy' | 'hard';

// 各マスの重要度を表す評価テーブル
export const POSITION_WEIGHTS = [
  [120, -20, 20,  5,  5, 20, -20, 120],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [ 20,  -5, 15,  3,  3, 15,  -5,  20],
  [  5,  -5,  3,  3,  3,  3,  -5,   5],
  [  5,  -5,  3,  3,  3,  3,  -5,   5],
  [ 20,  -5, 15,  3,  3, 15,  -5,  20],
  [-20, -40, -5, -5, -5, -5, -40, -20],
  [120, -20, 20,  5,  5, 20, -20, 120]
];

// 盤面の評価関数
export const evaluateBoard = (board: CellValue[][], color: CellValue): number => {
  let score = 0;
  const opponent = getOppositeColor(color);

  // 終盤かどうかを判断（空きマスが10個以下）
  const emptyCount = board.flat().filter(cell => cell === 'empty').length;
  const isEndgame = emptyCount <= 10;

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === color) {
        // 終盤は石数を重視
        if (isEndgame) {
          score += 100;
        } else {
          score += POSITION_WEIGHTS[row][col];
        }
      } else if (board[row][col] === opponent) {
        if (isEndgame) {
          score -= 100;
        } else {
          score -= POSITION_WEIGHTS[row][col];
        }
      }
    }
  }

  // 有効手の数を評価に加える（終盤以外）
  if (!isEndgame) {
    const myMoves = getValidMoves(board, color).length;
    const opponentMoves = getValidMoves(board, opponent).length;
    score += (myMoves - opponentMoves) * 10;
  }

  return score;
};

// ミニマックスアルゴリズムによる最善手の探索
export const findBestMove = (
  board: CellValue[][],
  color: CellValue,
  depth: number
): [number, number] => {
  const validMoves = getValidMoves(board, color);
  if (validMoves.length === 0) return [-1, -1];

  let bestScore = -Infinity;
  let bestMove = validMoves[0];

  for (const [row, col] of validMoves) {
    const newBoard = board.map(row => [...row]);
    const flips = getFlippableCells(newBoard, row, col, color);
    newBoard[row][col] = color;
    flips.forEach(([r, c]) => {
      newBoard[r][c] = color;
    });

    const score = minimax(newBoard, depth - 1, false, color, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      bestMove = [row, col];
    }
  }

  return bestMove;
};

// ミニマックスアルゴリズム（アルファベータ枝刈り付き）
const minimax = (
  board: CellValue[][],
  depth: number,
  isMaximizing: boolean,
  originalColor: CellValue,
  alpha: number,
  beta: number
): number => {
  if (depth === 0) {
    return evaluateBoard(board, originalColor);
  }

  const currentColor = isMaximizing ? originalColor : getOppositeColor(originalColor);
  const validMoves = getValidMoves(board, currentColor);

  if (validMoves.length === 0) {
    return evaluateBoard(board, originalColor);
  }

  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const [row, col] of validMoves) {
    const newBoard = board.map(row => [...row]);
    const flips = getFlippableCells(newBoard, row, col, currentColor);
    newBoard[row][col] = currentColor;
    flips.forEach(([r, c]) => {
      newBoard[r][c] = currentColor;
    });

    const score = minimax(newBoard, depth - 1, !isMaximizing, originalColor, alpha, beta);

    if (isMaximizing) {
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, bestScore);
    } else {
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) break;
  }

  return bestScore;
};

export interface GameState {
  board: CellValue[][];
  currentPlayer: Player;
  gameOver: boolean;
  blackCount: number;
  whiteCount: number;
}

export const BOARD_SIZE = 8;

export const createInitialBoard = (): CellValue[][] => {
  const board = Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill('empty')
  );
  
  // 初期配置
  const center = BOARD_SIZE / 2;
  board[center - 1][center - 1] = 'white';
  board[center - 1][center] = 'black';
  board[center][center - 1] = 'black';
  board[center][center] = 'white';
  
  return board;
};

export const getOppositeColor = (color: CellValue): CellValue => {
  if (color === 'empty') return 'empty';
  return color === 'black' ? 'white' : 'black';
};

export const isValidMove = (board: CellValue[][], row: number, col: number, color: CellValue): boolean => {
  if (board[row][col] !== 'empty') return false;

  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  return directions.some(([dx, dy]) => {
    let x = row + dx;
    let y = col + dy;
    let hasOpposite = false;

    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      if (board[x][y] === 'empty') return false;
      if (board[x][y] === color) return hasOpposite;
      hasOpposite = true;
      x += dx;
      y += dy;
    }
    return false;
  });
};

export const getFlippableCells = (board: CellValue[][], row: number, col: number, color: CellValue): [number, number][] => {
  const flippableCells: [number, number][] = [];
  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  directions.forEach(([dx, dy]) => {
    const tempFlips: [number, number][] = [];
    let x = row + dx;
    let y = col + dy;

    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      if (board[x][y] === 'empty') break;
      if (board[x][y] === color) {
        flippableCells.push(...tempFlips);
        break;
      }
      tempFlips.push([x, y]);
      x += dx;
      y += dy;
    }
  });

  return flippableCells;
};

export const getValidMoves = (board: CellValue[][], color: CellValue): [number, number][] => {
  const validMoves: [number, number][] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (isValidMove(board, row, col, color)) {
        validMoves.push([row, col]);
      }
    }
  }
  
  return validMoves;
};

export const calculateScore = (board: CellValue[][]): { black: number; white: number } => {
  let black = 0;
  let white = 0;

  board.forEach(row => {
    row.forEach(cell => {
      if (cell === 'black') black++;
      if (cell === 'white') white++;
    });
  });

  return { black, white };
};
