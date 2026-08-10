import React from 'react';
import './Board.css';
import { jeopardyRound as questions } from '../data/questions';

const Board = ({ onClueClick, boardState, amIHost }) => {
  return (
    <div className="board">
      {questions.map((q, colIndex) => (
        <div key={`col-${colIndex}`} className="category-column">
          <div className="category-header">
            {q.name}
          </div>
          {[200, 400, 600, 800, 1000].map((val, rowIndex) => {
            const isPlayed = boardState && boardState[`${q.name}-${val}`] === 'played';
            return (
              <div 
                key={`cell-${colIndex}-${rowIndex}`} 
                className={`clue-cell ${isPlayed ? 'answered' : ''}`}
                style={!amIHost ? { cursor: 'default' } : {}}
                onClick={() => {
                  if (!isPlayed && amIHost) {
                    onClueClick(q.name, val);
                  }
                }}
              >
                {!isPlayed ? val : ''}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board;
