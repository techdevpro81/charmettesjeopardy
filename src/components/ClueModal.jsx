import React, { useState } from 'react';
import { playCorrectSound, playIncorrectSound, playClueNarration, stopClueNarration } from '../utils/sound';
import './ClueModal.css';

const ClueModal = ({ clueData, onClose, onScore, players }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  React.useEffect(() => {
    if (clueData && clueData.id) {
      playClueNarration(clueData.id);
    }
    return () => {
      stopClueNarration();
    };
  }, [clueData?.id]);

  if (!clueData) return null;

  const handleRevealAnswer = () => {
    stopClueNarration();
    setShowAnswer(true);
  };

  const handleScoreClick = (playerId, isCorrect) => {
    if (isCorrect) {
      playCorrectSound();
    } else {
      playIncorrectSound();
    }
    onScore(playerId, clueData.value, isCorrect);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="clue-text">{clueData.clue}</div>
        
        {showAnswer && (
          <div className="answer-text">{clueData.answer}</div>
        )}

        <div className="modal-actions" style={{ flexDirection: 'column', gap: '20px' }}>
          {!showAnswer ? (
            <div>
              <button className="btn btn-reveal" onClick={handleRevealAnswer}>
                Reveal Answer
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              {players.map(p => (
                <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '8px', border: '2px solid #FFCC00' }}>
                  <h3 style={{ color: '#fff', margin: 0 }}>{p.name}</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      className="btn btn-correct" 
                      onClick={() => handleScoreClick(p.id, true)}
                    >
                      +${clueData.value}
                    </button>
                    <button 
                      className="btn btn-incorrect" 
                      onClick={() => handleScoreClick(p.id, false)}
                    >
                      -${clueData.value}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div>
            <button className="btn btn-close" onClick={onClose}>
              Cancel / Nobody (+0)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClueModal;
