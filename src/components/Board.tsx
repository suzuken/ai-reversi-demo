import React from 'react';
import Cell from './Cell';
import { CellValue } from '../types';

interface BoardProps {
  board: CellValue[][];
  validMoves: [number, number][];
  onCellClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, validMoves, onCellClick }) => {
  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        row.map((cell, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={cell}
            isValidMove={isValidMove(rowIndex, colIndex)}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      ))}
    </div>
  );
};

export default Board;
