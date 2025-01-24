import React, { useState, useEffect } from 'react';
import Board from './Board';
import {
  CellValue,
  Player,
  GameState,
  createInitialBoard,
  isValidMove,
  getFlippableCells,
  getValidMoves,
  calculateScore,
  getOppositeColor,
} from '../types';
import '../Game.css';

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    currentPlayer: 'human',
    gameOver: false,
    blackCount: 2,
    whiteCount: 2,
  });

  const getCurrentColor = (player: Player): CellValue => {
    return player === 'human' ? 'black' : 'white';
  };

  const makeMove = (row: number, col: number, color: CellValue) => {
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[row][col] = color;

    const flippableCells = getFlippableCells(newBoard, row, col, color);
    flippableCells.forEach(([r, c]) => {
      newBoard[r][c] = color;
    });

    const { black, white } = calculateScore(newBoard);
    const hasValidMoves = getValidMoves(newBoard, getOppositeColor(color)).length > 0;

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: hasValidMoves ? (prev.currentPlayer === 'human' ? 'computer' : 'human') : prev.currentPlayer,
      gameOver: !hasValidMoves && getValidMoves(newBoard, color).length === 0,
      blackCount: black,
      whiteCount: white,
    }));
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameState.gameOver || gameState.currentPlayer !== 'human') return;

    const color = getCurrentColor(gameState.currentPlayer);
    if (isValidMove(gameState.board, row, col, color)) {
      makeMove(row, col, color);
    }
  };

  const computerMove = () => {
    const color = getCurrentColor('computer');
    const validMoves = getValidMoves(gameState.board, color);
    
    if (validMoves.length > 0) {
      // 簡単な戦略: 最も多くの石を裏返せる手を選ぶ
      let bestMove = validMoves[0];
      let maxFlips = 0;

      validMoves.forEach(([row, col]) => {
        const flips = getFlippableCells(gameState.board, row, col, color).length;
        if (flips > maxFlips) {
          maxFlips = flips;
          bestMove = [row, col];
        }
      });

      setTimeout(() => {
        makeMove(bestMove[0], bestMove[1], color);
      }, 1000);
    }
  };

  useEffect(() => {
    if (gameState.currentPlayer === 'computer' && !gameState.gameOver) {
      computerMove();
    }
  }, [gameState.currentPlayer, gameState.gameOver]);

  const validMoves = gameState.currentPlayer === 'human'
    ? getValidMoves(gameState.board, getCurrentColor('human'))
    : [];

  return (
    <div className="game">
      <div className="score">
        <div className="score-item">
          <div className="score-disc black" />
          <span>{gameState.blackCount}</span>
        </div>
        <div className="score-item">
          <div className="score-disc white" />
          <span>{gameState.whiteCount}</span>
        </div>
      </div>

      <div className="status">
        {gameState.gameOver ? (
          `ゲーム終了! ${
            gameState.blackCount > gameState.whiteCount
              ? '黒の勝ち'
              : gameState.blackCount < gameState.whiteCount
              ? '白の勝ち'
              : '引き分け'
          }`
        ) : (
          `${gameState.currentPlayer === 'human' ? 'あなた' : 'コンピュータ'}の番です`
        )}
      </div>

      <Board
        board={gameState.board}
        validMoves={validMoves}
        onCellClick={handleCellClick}
      />
    </div>
  );
};

export default Game;
