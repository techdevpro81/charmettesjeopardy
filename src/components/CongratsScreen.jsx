import React, { useEffect } from 'react';
import { playOutroMusic, stopThemeMusic, playCorrectSound } from '../utils/sound';
import './CongratsScreen.css';

const CongratsScreen = ({ winners, onRestart }) => {
  useEffect(() => {
    // Play fanfare once and loop outro music in background
    playCorrectSound();
    playOutroMusic();
    return () => {
      stopThemeMusic();
    };
  }, []);

  return (
    <div className="congrats-container">
      {/* Falling CSS Confetti */}
      <div className="confetti-wrapper">
        {[...Array(60)].map((_, i) => {
          const sizeClass = ['small', 'medium', 'large'][Math.floor(Math.random() * 3)];
          const shapeClass = ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)];
          return (
            <div 
              key={i} 
              className={`confetti-piece ${sizeClass} ${shapeClass}`} 
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
                backgroundColor: ['#dfb36c', '#9c0e21', '#ffffff', '#ffd166', '#f25f5c'][Math.floor(Math.random() * 5)]
              }}
            />
          );
        })}
      </div>

      <div className="congrats-card">
        <div className="congrats-logo-container">
          <img src="/logo.jpg" alt="The Charmettes Logo" className="congrats-logo" />
        </div>
        
        <h1 className="congrats-title">Congratulations!</h1>

        {winners && winners.length > 0 ? (
          <div className="winners-list-container">
            {winners.map(w => (
              <div key={w.id} className="winner-display-card">
                <div className="winner-badge">Champion</div>
                <h2 className="winner-name">{w.name}</h2>
                <div className="winner-score-screen">
                  <span className="winner-score-val">${w.score}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-winner-container">
            <h3 className="no-winner-msg">Game Over!</h3>
            <p className="no-winner-details">Thank you for playing. No player finished with a positive score.</p>
          </div>
        )}

        <button className="gala-btn play-again-btn" onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default CongratsScreen;
