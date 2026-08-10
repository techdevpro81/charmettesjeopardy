import React from 'react';
import './AboutModal.css'; 

const LeaderboardModal = ({ players, onClose }) => {
  // Filter out host, sort by score descending
  const sortedPlayers = [...players]
    .filter(p => !p.isHost)
    .sort((a, b) => b.score - a.score);

  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner top-left" />
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner top-right" />
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner bottom-left" />
        <img src="/gold-rose-trans.png" alt="Rose" className="about-corner bottom-right" />

        <button className="about-close-btn" onClick={onClose}>✕</button>

        <div className="about-header">
          <img src="/logo.jpg" alt="Logo" className="about-logo" />
          <h2>LEADERBOARD</h2>
        </div>

        <div className="about-scroll-body">
          {sortedPlayers.length === 0 ? (
            <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#e6c687' }}>No players have joined yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '1.2rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #c59b4e', color: '#e6c687' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'center' }}>Rank</th>
                  <th style={{ padding: '12px 10px', textAlign: 'left' }}>Player</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {sortedPlayers.map((p, index) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(197, 155, 78, 0.3)' }}>
                    <td style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 'bold' }}>#{index + 1}</td>
                    <td style={{ padding: '14px 10px', textAlign: 'left' }}>{p.name}</td>
                    <td style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 'bold', color: '#e6c687' }}>${p.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '25px' }}>
          <button className="pill-btn" onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
