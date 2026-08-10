import React, { useState, useEffect } from 'react';
import { playThemeMusic, stopThemeMusic, playClueNarration, stopClueNarration } from '../utils/sound';
import './FinalJeopardy.css';

const FinalJeopardy = ({ players, setPlayers, data, onGameOver }) => {
  const [phase, setPhase] = useState('WAGER'); // WAGER, REVEAL_CLUE, THINKING, REVEAL_ANSWER
  const [wagers, setWagers] = useState({});
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (phase === 'REVEAL_CLUE' && data && data.id) {
      playClueNarration(data.id);
    } else {
      stopClueNarration();
    }
    return () => {
      stopClueNarration();
    };
  }, [phase, data?.id]);

  useEffect(() => {
    let interval = null;
    if (phase === 'THINKING') {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            stopThemeMusic();
            setPhase('REVEAL_ANSWER');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase]);

  const handleWagerChange = (e) => {
    const p = players[activePlayerIndex];
    setWagers({
      ...wagers,
      [p.id]: parseInt(e.target.value) || 0
    });
  };

  const handleNextWager = () => {
    if (activePlayerIndex < players.length - 1) {
      setActivePlayerIndex(activePlayerIndex + 1);
    } else {
      setPhase('REVEAL_CLUE');
    }
  };

  const startThinking = () => {
    setTimer(30);
    setPhase('THINKING');
    playThemeMusic();
  };

  const handleScore = (pId, isCorrect) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === pId) {
        const wager = wagers[pId] || 0;
        return { ...p, score: isCorrect ? p.score + wager : p.score - wager };
      }
      return p;
    }));
  };

  return (
    <div className="final-jeopardy">
      <h1 className="fj-title">FINAL JEOPARDY!</h1>
      <h2 className="fj-category">{data?.category || "The Founders"}</h2>

      {phase === 'WAGER' && (
        <div className="wager-container">
          <h3>{players[activePlayerIndex]?.name}, enter your wager:</h3>
          <p>Current Score: ${players[activePlayerIndex]?.score || 0}</p>
          <input 
            type="number" 
            value={wagers[players[activePlayerIndex]?.id] ?? ''} 
            onChange={handleWagerChange} 
            min="0"
            max={Math.max(0, players[activePlayerIndex]?.score || 0)}
          />
          <button className="fj-btn" onClick={handleNextWager}>Submit Wager</button>
        </div>
      )}

      {(phase === 'REVEAL_CLUE' || phase === 'THINKING' || phase === 'REVEAL_ANSWER') && (
        <div className="fj-clue-container">
          <p className="fj-clue">{data?.clue}</p>
          
          {phase === 'REVEAL_CLUE' && (
            <button className="fj-btn" onClick={startThinking}>Start Timer</button>
          )}

          {phase === 'THINKING' && (
            <div className="timer-container">
              <div className="timer-clock">{timer}</div>
              <h3 className="thinking-text">Seconds Remaining</h3>
            </div>
          )}

          {phase === 'REVEAL_ANSWER' && (
            <div className="fj-answer-section">
              <p className="fj-answer">{data?.answer}</p>
              
              <div className="fj-scoring">
                {players.map(p => (
                  <div key={p.id} className="fj-player-score">
                    <h4>{p.name} (Wager: ${wagers[p.id] || 0})</h4>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="correct-btn" onClick={() => handleScore(p.id, true)}>+ Correct</button>
                      <button className="incorrect-btn" onClick={() => handleScore(p.id, false)}>- Incorrect</button>
                    </div>
                  </div>
                ))}
              </div>

              <button className="fj-btn finish-btn" onClick={onGameOver}>End Game</button>
            </div>
          )}
        </div>
      )}

      {/* Persistent Scoreboard Podiums */}
      <div className="score-board">
        {players.map(p => {
          const maxScore = Math.max(...players.map(pl => pl.score));
          const isLeader = p.score === maxScore && p.score > 0;
          return (
            <div key={p.id} className={`podium ${isLeader ? 'leader' : ''}`}>
              {isLeader && <div className="podium-leader-indicator">Leader</div>}
              <div className="podium-name">{p.name}</div>
              <div className="podium-score-screen">
                <div className={`podium-score-value ${p.score >= 0 ? 'positive' : 'negative'}`}>
                  {p.score < 0 ? '-' : ''}${Math.abs(p.score)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FinalJeopardy;
