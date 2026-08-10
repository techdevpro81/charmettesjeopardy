import React from 'react';
import './AboutModal.css'; 

const HelpModal = ({ onClose }) => {
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
          <h2>FREQUENTLY ASKED QUESTIONS</h2>
        </div>

        <div className="about-scroll-body">
          <section>
            <h3>Q: I can't click on any clues. Why?</h3>
            <p>A: Only the player designated as the <strong>Host</strong> has permission to select clues from the Jeopardy board. Players must wait for the Host to pick a clue.</p>
          </section>

          <section>
            <h3>Q: How do I buzz in?</h3>
            <p>A: Once the Host opens a clue, a prominent red <strong>BUZZ IN</strong> button appears on your player screen. Tap or click it quickly to lock in first!</p>
          </section>

          <section>
            <h3>Q: What happens if I get a question wrong?</h3>
            <p>A: If marked incorrect by the Host, your score is reduced by the clue's value, and the buzzer opens back up for remaining players.</p>
          </section>

          <section>
            <h3>Q: How do we end or restart the game?</h3>
            <p>A: Anyone can click the <strong>LEAVE GAME</strong> button at the bottom of the screen to reset the game and return everyone to the main lobby.</p>
          </section>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button className="pill-btn" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
