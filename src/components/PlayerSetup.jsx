import React, { useState, useEffect } from 'react';
import './PlayerSetup.css';
import { socket } from '../socket';

const PlayerSetup = ({ gameState }) => {
  const [playerName, setPlayerName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleError = (msg) => {
      setErrorMsg(msg);
      setHasJoined(false);
    };
    socket.on('error', handleError);
    return () => socket.off('error', handleError);
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    socket.emit('joinGame', { name: playerName.trim(), isHost });
    setHasJoined(true);
    setErrorMsg('');
  };

  const handleStart = () => {
    socket.emit('startGame');
  };

  const myPlayer = gameState?.players?.find(p => p.id === socket.id);
  const amIHost = myPlayer?.isHost;

  if (hasJoined) {
    return (
      <div className="player-setup-container heritage-intro-screen animated-intro-bg">
        <div className="player-setup-card">
          <img src="/gold-rose-trans.png" alt="Rose" className="setup-corner top-left" />
          <img src="/gold-rose-trans.png" alt="Rose" className="setup-corner top-right" />
          <img src="/gold-rose-trans.png" alt="Rose" className="setup-corner bottom-left" />
          <img src="/gold-rose-trans.png" alt="Rose" className="setup-corner bottom-right" />
          
          <h2 className="setup-title">LOBBY</h2>
          
          <div className="lobby-players">
            <h3>Players in Lobby:</h3>
            <ul>
              {gameState?.players?.map(p => (
                <li key={p.id}>
                  {p.name} {p.isHost ? '(HOST)' : ''} {p.id === socket.id ? '(You)' : ''}
                </li>
              ))}
            </ul>
          </div>

          <div className="button-group" style={{ marginTop: '25px' }}>
            {amIHost ? (
              <button className="start-game-btn" onClick={handleStart} disabled={gameState.players.length < 2}>
                START GAME
              </button>
            ) : (
              <p className="waiting-msg" style={{ fontSize: '16pt', color: '#e6c687' }}>Waiting for host to start the game...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="player-setup-container heritage-intro-screen animated-intro-bg">
      <div className="player-setup-card">
        <img src="/gold-rose-trans.png" alt="Rose" className="setup-corner top-left" />
        <img src="/gold-rose-trans.png" alt="Rose" className="setup-corner top-right" />
        <img src="/gold-rose-trans.png" alt="Rose" className="setup-corner bottom-left" />
        <img src="/gold-rose-trans.png" alt="Rose" className="setup-corner bottom-right" />
        
        <h2 className="setup-title">JOIN GAME</h2>
        <form className="setup-form" onSubmit={handleJoin}>
          {errorMsg && <div className="error-message" style={{ color: '#ff5277', fontSize: '16pt', marginBottom: '10px' }}>{errorMsg}</div>}
          <div className="input-group">
            <label htmlFor="playerNameInput">Your Name</label>
            <input 
              id="playerNameInput"
              type="text" 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
              required
            />
          </div>
          
          <div className="checkbox-group">
            <input 
              type="checkbox" 
              id="isHost"
              checked={isHost}
              onChange={(e) => setIsHost(e.target.checked)}
            />
            <label htmlFor="isHost">I am the Host</label>
          </div>

          <button type="submit" className="start-game-btn" style={{ marginTop: '15px' }}>
            JOIN LOBBY
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlayerSetup;
