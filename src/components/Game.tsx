import React, { useState, useEffect } from 'react';
import Board from './Board';
import {
  CellValue,
  Player,
  Difficulty,
  GameState,
  createInitialBoard,
  isValidMove,
  getFlippableCells,
  getValidMoves,
  calculateScore,
  getOppositeColor,
  findBestMove,
  findBestMoveExpert,
} from '../types';
import '../Game.css';

const Game: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [gameStarted, setGameStarted] = useState(false);
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
      let bestMove: [number, number];
      let thinkingTime = 1000;
      
      if (difficulty === 'beginner') {
        // 入門級: ランダム選択
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        bestMove = validMoves[randomIndex];
        thinkingTime = 500;
      } else if (difficulty === 'easy') {
        // 簡単モード: 最も多くの石を裏返せる手を選ぶ
        bestMove = validMoves[0];
        let maxFlips = 0;

        validMoves.forEach(([row, col]) => {
          const flips = getFlippableCells(gameState.board, row, col, color).length;
          if (flips > maxFlips) {
            maxFlips = flips;
            bestMove = [row, col];
          }
        });
        thinkingTime = 800;
      } else if (difficulty === 'hard') {
        // 難しいモード: ミニマックスアルゴリズムで最善手を探索
        bestMove = findBestMove(gameState.board, color, 4);
        thinkingTime = 1200;
      } else if (difficulty === 'expert') {
        // 鬼神級: 強化されたミニマックスで深い探索
        const emptyCount = gameState.board.flat().filter(cell => cell === 'empty').length;
        const depth = emptyCount <= 20 ? 8 : 6; // 終盤では深く読む
        bestMove = findBestMoveExpert(gameState.board, color, depth);
        thinkingTime = 1500;
      }

      setTimeout(() => {
        makeMove(bestMove[0], bestMove[1], color);
      }, thinkingTime);
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

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setGameStarted(true);
    setGameState({
      board: createInitialBoard(),
      currentPlayer: 'human',
      gameOver: false,
      blackCount: 2,
      whiteCount: 2,
    });
  };

  if (!gameStarted) {
    return (
      <div className="game">
        <h1>リバーシ</h1>
        <div className="difficulty-selection">
          <h2>難易度を選択してください</h2>
          <div className="difficulty-buttons">
            <button 
              onClick={() => handleDifficultyChange('beginner')}
              className="difficulty-button beginner"
            >
              入門級
              <div className="difficulty-description">ランダム選択</div>
            </button>
            <button 
              onClick={() => handleDifficultyChange('easy')}
              className="difficulty-button easy"
            >
              かんたん
              <div className="difficulty-description">貪欲アルゴリズム</div>
            </button>
            <button 
              onClick={() => handleDifficultyChange('hard')}
              className="difficulty-button hard"
            >
              むずかしい
              <div className="difficulty-description">ミニマックス4手先</div>
            </button>
            <button 
              onClick={() => handleDifficultyChange('expert')}
              className="difficulty-button expert"
            >
              鬼神級
              <div className="difficulty-description">強化AI 6-8手先</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
