import React, { useState, useEffect } from 'react';
import './App.css';
import IntroScreen from './components/IntroScreen';
import PlayerSetup from './components/PlayerSetup';
import Board from './components/Board';
import FinalJeopardy from './components/FinalJeopardy';
import CongratsScreen from './components/CongratsScreen';
import AboutModal from './components/AboutModal';
import RulesModal from './components/RulesModal';
import HelpModal from './components/HelpModal';
import LeaderboardModal from './components/LeaderboardModal';
import { stopThemeMusic, playClueNarration, stopClueNarration, playCorrectSound, playIncorrectSound, toggleMute, getIsMuted } from './utils/sound';
import { socket } from './socket';

function App() {
  const [localScreen, setLocalScreen] = useState('intro'); // 'intro', 'setup', 'game'
  const [gameState, setGameState] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [showAbout, setShowAbout] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isMutedState, setIsMutedState] = useState(getIsMuted());

  const myPlayer = gameState?.players.find(p => p.id === socket.id);
  const amIHost = myPlayer?.isHost;
  const activeClue = gameState?.activeClue;

  const handleToggleMute = () => {
    const muted = toggleMute();
    setIsMutedState(muted);
  };

  useEffect(() => {
    socket.on('gameStateUpdate', (newState) => {
      setGameState(newState);
      if (newState.phase === 'PLAYING' && localScreen !== 'game') {
        setLocalScreen('game');
        stopThemeMusic();
      } else if (newState.phase === 'SETUP' && localScreen === 'game') {
        setLocalScreen('intro'); // Go all the way back when game resets
      }
    });

    socket.on('answerResolved', ({ playerId, isCorrect }) => {
      if (isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('answerResolved');
    };
  }, [localScreen]);

  useEffect(() => {
    if (activeClue && activeClue.clue) {
      playClueNarration(activeClue.id, activeClue.clue);
    } else {
      stopClueNarration();
    }
  }, [activeClue?.id, activeClue?.clue]);

  const handleStartIntro = () => {
    setLocalScreen('setup');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    socket.emit('sendChat', chatInput.trim());
    setChatInput('');
  };

  if (!gameState) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Connecting to Server...</div>;
  }

  // Render initial screens
  if (localScreen === 'intro') {
    return <IntroScreen onStart={handleStartIntro} />;
  }

  if (localScreen === 'setup' && gameState.phase === 'SETUP') {
    return <PlayerSetup gameState={gameState} />;
  }

  if (gameState.phase === 'GAMEOVER') {
    return <CongratsScreen winners={gameState.players} />;
  }

  // --- Main Game Rendering ---
  return (
    <div className="heritage-app-container">


      {/* Top Navigation Links Bar */}
      <div className="heritage-nav-bar">
        <span>WELCOME</span> | <span onClick={() => setShowAbout(true)} style={{cursor:'pointer'}}>ABOUT THE CHARMETTES</span> | <span className="active-nav">GAME ROOM</span> | <span onClick={() => setShowLeaderboard(true)} style={{cursor:'pointer'}}>LEADERBOARD</span> | <button onClick={handleToggleMute} style={{ background: isMutedState ? '#842029' : 'rgba(35, 3, 11, 0.85)', color: isMutedState ? '#ffb3c1' : '#e6c687', border: '1px solid #c59b4e', borderRadius: '15px', padding: '4px 12px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Georgia, serif', fontWeight: 'bold' }}>{isMutedState ? '🔇 SOUND MUTED' : '🔊 SOUND ON'}</button>
      </div>

      {/* Main Game Stage */}
      <div className="heritage-game-body">
        {/* Left Side: Game Board */}
        <div className="board-area">
          {/* Main Board with filigree frame */}
          <div className="rose-frame-wrapper">
            <img src="/gold-rose-trans.png" alt="Rose" className="sculpted-rose-corner top-left" />
            <img src="/gold-rose-trans.png" alt="Rose" className="sculpted-rose-mid top-mid" />
            <img src="/gold-rose-trans.png" alt="Rose" className="sculpted-rose-corner top-right" />
            <img src="/gold-rose-trans.png" alt="Rose" className="sculpted-rose-corner bottom-left" />
            <img src="/gold-rose-trans.png" alt="Rose" className="sculpted-rose-mid bottom-mid" />
            <img src="/gold-rose-trans.png" alt="Rose" className="sculpted-rose-corner bottom-right" />

            {activeClue ? (
              // If there's an active clue, display clue text, answer (for host), and buzzer controls
              <div className="active-clue-screen">
                <h2 style={{ color: '#e6c687', fontSize: '1.5rem', marginBottom: '8px' }}>
                  {activeClue.categoryName} - ${activeClue.value}
                </h2>

                <div className="clue-content" style={{ margin: '10px 0', padding: '16px', background: 'rgba(15, 2, 6, 0.85)', borderRadius: '10px', border: '2px solid #c59b4e', maxWidth: '700px', boxShadow: '0 8px 25px rgba(0,0,0,0.8)' }}>
                  <p style={{ fontSize: '1.15rem', color: '#ffffff', lineHeight: '1.35', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    "{activeClue.clue}"
                  </p>
                  {amIHost && activeClue.answer && (
                    <div style={{ marginTop: '10px', color: '#e6c687', fontStyle: 'italic', fontSize: '1rem', borderTop: '1px dashed rgba(230,198,135,0.5)', paddingTop: '8px' }}>
                      <strong>Answer:</strong> {activeClue.answer}
                    </div>
                  )}
                </div>

                {amIHost ? (
                  <div className="host-controls">
                    {gameState.buzzedPlayerId ? (
                      <div className="buzzer-status">
                        <h3 style={{ color: '#e6c687', fontSize: '1.1rem', marginBottom: '8px' }}>
                          Player Buzzed: <span style={{ color: '#fff', textDecoration: 'underline' }}>{gameState.players.find(p => p.id === gameState.buzzedPlayerId)?.name}</span>
                        </h3>
                        <div className="judge-buttons">
                          <button className="correct-btn" onClick={() => { stopClueNarration(); socket.emit('resolveAnswer', { playerId: gameState.buzzedPlayerId, isCorrect: true }); }}>Correct (+${activeClue.value})</button>
                          <button className="incorrect-btn" onClick={() => socket.emit('resolveAnswer', { playerId: gameState.buzzedPlayerId, isCorrect: false })}>Incorrect (-${activeClue.value})</button>
                        </div>
                      </div>
                    ) : (
                      <div className="buzzer-status">
                        <p style={{ color: 'rgba(230,198,135,0.8)', fontSize: '0.95rem', marginBottom: '10px' }}>Waiting for players to buzz in on their devices...</p>
                        <button className="close-clue-btn" onClick={() => { stopClueNarration(); socket.emit('closeClue'); }}>Close Clue (No Answer)</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="player-buzzer">
                    {gameState.buzzedPlayerId ? (
                       gameState.buzzedPlayerId === socket.id ? 
                       <h3 style={{color: '#4CAF50', fontSize: '1.2rem', textShadow: '0 0 10px rgba(76,175,80,0.5)'}}>You buzzed in! Speak your answer to the host.</h3> :
                       <h3 style={{color: '#F44336', fontSize: '1.1rem'}}>{gameState.players.find(p => p.id === gameState.buzzedPlayerId)?.name} buzzed first!</h3>
                    ) : (
                      myPlayer?.hasBuzzed ? 
                      <h3 style={{color: '#888', fontSize: '1rem'}}>You answered incorrectly for this clue.</h3> :
                      <button className="buzz-btn" onClick={() => socket.emit('buzzIn')}>BUZZ IN!</button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              // Normal board view when no clue is active
              <Board 
                onClueClick={(cat, val) => amIHost && socket.emit('selectClue', { categoryName: cat, value: val })} 
                boardState={gameState.boardState}
                amIHost={amIHost}
              />
            )}
          </div>
        </div>

        {/* Right Side: Game Info Sidebar */}
        <div className="heritage-sidebar">
          <div className="sidebar-header">
            GAME IN PROGRESS
          </div>
          
          {/* Player Status / Leaderboard */}
          <div className="sidebar-section">
            <h3 className="section-title">PLAYER SCORES</h3>
            <div className="player-status-box" style={{ padding: '10px' }}>
              {gameState.players.filter(p => !p.isHost).map(p => (
                <div key={p.id} className="status-row">
                  <span className="label" style={{flex: 1}}>{p.name}</span>
                  <span className="val-score">${p.score}</span>
                </div>
              ))}
              {gameState.players.filter(p => !p.isHost).length === 0 && (
                <div style={{color: 'gray'}}>No players joined.</div>
              )}
            </div>
          </div>

          {/* Current Category */}
          <div className="sidebar-section category-info">
            <h3 className="section-title">CURRENT CATEGORY</h3>
            <div className="current-category-card">
              <div className="cat-title">{activeClue ? activeClue.categoryName : 'AWAITING SELECTION'}</div>
              <div className="cat-value">{activeClue ? `$${activeClue.value}` : '---'}</div>
            </div>
          </div>

          {/* Chat / Feed */}
          <div className="sidebar-section chat-feed">
            <h3 className="section-title">CHAT/FEED</h3>
            <div className="chat-window">
              {gameState.chatMessages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.sender === 'System' ? 'system-msg' : ''}`}>
                  <span className="msg-sender">{msg.sender}:</span> {msg.text}
                </div>
              ))}
            </div>
            <form className="chat-input-container" onSubmit={handleSendChat}>
              <input 
                type="text" 
                placeholder="Type a chat..." 
                className="chat-input"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)} 
              />
              <button type="submit" className="chat-send-btn">➤</button>
            </form>
          </div>
        </div>
      </div>

      <div className="heritage-footer-bar">
        <div className="action-buttons">
          <button className="pill-btn" onClick={() => socket.emit('resetGame')}>LEAVE GAME</button>
          <button className="pill-btn" onClick={() => setShowRules(true)}>RULES</button>
          <button className="pill-btn" onClick={() => setShowHelp(true)}>HELP</button>
        </div>
        <div className="copyright-text">
          © 2024 THE CHARMETTES, INCORPORATED | ALL RIGHTS RESERVED
        </div>
      </div>
      
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showLeaderboard && <LeaderboardModal players={gameState.players} onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}

export default App;
