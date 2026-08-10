import React from 'react';
import './AboutModal.css';

const RulesModal = ({ onClose }) => {
  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner top-left" />
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner top-right" />
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner bottom-left" />
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner bottom-right" />

        <button className="about-close-btn" onClick={onClose}>✕</button>

        <div className="about-header">
          <img src="/logo.jpg" alt="Logo" className="about-logo" />
          <h2>RULES OF THE GAME</h2>
        </div>

        <div className="about-scroll-body">
          <section>
            <h3>1. The Host</h3>
            <p>One person joins as the <strong>Host</strong>. The Host controls clue selection, manages the game board, and judges player answers as correct or incorrect.</p>
          </section>

          <section>
            <h3>2. The Players</h3>
            <p>All other participants join as <strong>Players</strong>. When a clue is revealed, players must buzz in quickly on their device. The first to buzz in gets the right to answer.</p>
          </section>

          <section>
            <h3>3. Scoring</h3>
            <p>Correct answers award the clue's dollar value. Incorrect answers deduct that dollar amount and reopen the buzzer for other players to attempt.</p>
          </section>

          <section>
            <h3>4. Winning</h3>
            <p>The game continues across board categories. The player with the highest total score at the end of the round claims victory!</p>
          </section>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="pill-btn" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
