export type CellValue = 'black' | 'white' | 'empty';
export type Player = 'human' | 'computer';

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
