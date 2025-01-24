import React from 'react';
import { CellValue } from '../types';

interface CellProps {
  value: CellValue;
  isValidMove: boolean;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ value, isValidMove, onClick }) => {
  return (
    <div 
      className={`cell ${isValidMove ? 'valid-move' : ''}`}
      onClick={onClick}
    >
      {value !== 'empty' && (
        <div className={`disc ${value}`} />
      )}
    </div>
  );
};

export default Cell;
