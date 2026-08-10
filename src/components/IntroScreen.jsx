import React, { useState, useEffect } from 'react';
import { playIntroMusic, playFullAnnouncerSound } from '../utils/sound';
import './IntroScreen.css';

const IntroScreen = ({ onStart }) => {
  const [curtainsOpened, setCurtainsOpened] = useState(false);

  const handleOpenCurtains = (e) => {
    e.stopPropagation();
    if (!curtainsOpened) {
      playIntroMusic();
      playFullAnnouncerSound();
      setCurtainsOpened(true);
    }
  };

  return (
    <div className={`heritage-intro-screen animated-intro-bg rw-gold-stage ${curtainsOpened ? 'curtains-open' : 'curtains-closed'}`}>
      {/* Red, White, and Gold Opening Show Curtains */}
      <div className="rw-gold-curtains-wrapper">
        <div className="curtain-panel left-panel red-curtain-layer" />
        <div className="curtain-panel left-panel white-curtain-layer" />
        <div className="curtain-panel left-panel gold-curtain-layer" />
        
        <div className="curtain-panel right-panel gold-curtain-layer" />
        <div className="curtain-panel right-panel white-curtain-layer" />
        <div className="curtain-panel right-panel red-curtain-layer" />

        <div className="curtain-gold-fringe-left" />
        <div className="curtain-gold-fringe-right" />

        {/* Center Golden Seal Trigger to Open Curtains */}
        {!curtainsOpened && (
          <div className="curtain-center-trigger-card" onClick={handleOpenCurtains}>
            <div className="trigger-crest-wrapper">
              <img src="/logo.jpg" alt="Charmettes Crest" className="trigger-crest-img" />
            </div>
            <h2 className="trigger-title">THE CHARMETTES INCORPORATED</h2>
            <h1 className="trigger-subtitle">JEOPARDY SHOW</h1>
            <button className="open-curtains-btn">
              ✨ OPEN STAGE CURTAINS ✨
            </button>
            <p className="trigger-prompt-text">Click to open curtains & start the show announcer</p>
          </div>
        )}
      </div>

      {/* Gala Spotlight Beam */}
      <div className="gala-spotlight-beam" />

      {/* Cascading Gold Glitter Confetti */}
      <div className="gold-confetti-container">
        <div className="confetti-particle c1" />
        <div className="confetti-particle c2" />
        <div className="confetti-particle c3" />
        <div className="confetti-particle c4" />
        <div className="confetti-particle c5" />
        <div className="confetti-particle c6" />
        <div className="confetti-particle c7" />
        <div className="confetti-particle c8" />
      </div>

      {/* Background Logo Backdrop */}
      <img src="/logo.jpg" alt="Background Logo" className="heritage-bg-logo animated-logo-pulse" />

      <div className="heritage-stage-container">
        {/* Top Crest & Header Banner */}
        <div className="heritage-header">
          <div className="heritage-top-crest">
            <img src="/logo.jpg" alt="The Charmettes Crest" className="crest-img" />
            <span>THE CHARMETTES INCORPORATED</span>
          </div>
          <div className="heritage-subtitle">THE CHARMETTES INCORPORATED</div>
          <h1 className="heritage-title">
            <img src="/gold-rose-trans.png" alt="Rose" className="gold-rose-icon-img" /> JEOPARDY <img src="/gold-rose-trans.png" alt="Rose" className="gold-rose-icon-img" />
          </h1>
        </div>

        {/* Central Golden Filigree Card */}
        <div className="filigree-frame-card">
          <div className="filigree-corner top-left" />
          <div className="filigree-corner top-right" />
          <div className="filigree-corner bottom-left" />
          <div className="filigree-corner bottom-right" />

          <div className="card-center-logo">
            <img src="/logo.jpg" alt="The Charmettes Logo" className="filigree-logo-img" />
          </div>
        </div>

        {/* Golden Embossed Start Button */}
        <button className="heritage-start-btn" onClick={onStart}>
          <span className="btn-filigree-border" />
          START GAME
        </button>

        <div className="heritage-footer-text">
          © 2024 THE CHARMETTES, INCORPORATED | ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;
