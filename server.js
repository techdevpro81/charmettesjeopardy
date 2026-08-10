import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { jeopardyRound } from './src/data/questions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

const app = express();
app.use(cors());

if (existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for local dev
    methods: ["GET", "POST"]
  }
});

// --- Game State ---
let gameState = {
  phase: 'SETUP', // 'SETUP', 'PLAYING', 'GAMEOVER'
  players: [], // { id, name, score, isHost, hasBuzzed }
  activeClue: null, // { categoryName, value }
  buzzedPlayerId: null, // ID of the player who buzzed first
  chatMessages: [
    { id: 1, sender: 'System', text: 'Welcome to The Charmettes, Incorporated Jeopardy!' }
  ],
  boardState: {} // e.g., 'PHILANTHROPY-200': 'played' (to keep track of disabled clues)
};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send initial state to the newly connected client
  socket.emit('gameStateUpdate', gameState);

  socket.on('joinGame', ({ name, isHost }) => {
    // Check if host already exists if trying to join as host
    if (isHost && gameState.players.find(p => p.isHost)) {
      socket.emit('error', 'A host already exists for this game.');
      return;
    }

    const newPlayer = {
      id: socket.id,
      name,
      score: 0,
      isHost,
      hasBuzzed: false
    };

    gameState.players.push(newPlayer);
    
    gameState.chatMessages.push({
      id: Date.now(),
      sender: 'System',
      text: `${name} has joined the game${isHost ? ' as Host' : ''}.`
    });

    io.emit('gameStateUpdate', gameState);
  });

  socket.on('startGame', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && player.isHost) {
      gameState.phase = 'PLAYING';
      
      gameState.chatMessages.push({
        id: Date.now(),
        sender: 'System',
        text: `The Host has started the game! Good luck!`
      });

      io.emit('gameStateUpdate', gameState);
    }
  });

  socket.on('selectClue', ({ categoryName, value }) => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && player.isHost) {
      const category = jeopardyRound.find(c => c.name === categoryName);
      const question = category?.questions.find(q => q.value === value);

      gameState.activeClue = {
        id: question?.id,
        categoryName,
        value,
        clue: question?.clue || 'No clue text available.',
        answer: question?.answer || ''
      };
      gameState.buzzedPlayerId = null;
      // Reset buzzers for all players
      gameState.players.forEach(p => p.hasBuzzed = false);
      
      gameState.chatMessages.push({
        id: Date.now(),
        sender: 'System',
        text: `Host selected ${categoryName} for $${value}.`
      });

      io.emit('gameStateUpdate', gameState);
    }
  });

  socket.on('buzzIn', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && !player.isHost && gameState.activeClue && !gameState.buzzedPlayerId) {
      // First person to buzz gets locked in
      gameState.buzzedPlayerId = socket.id;
      player.hasBuzzed = true;
      
      gameState.chatMessages.push({
        id: Date.now(),
        sender: 'System',
        text: `${player.name} buzzed in!`
      });

      io.emit('gameStateUpdate', gameState);
    }
  });

  socket.on('resolveAnswer', ({ playerId, isCorrect }) => {
    const hostPlayer = gameState.players.find(p => p.id === socket.id);
    if (hostPlayer && hostPlayer.isHost && gameState.activeClue) {
      const targetPlayer = gameState.players.find(p => p.id === playerId);
      if (targetPlayer) {
        if (isCorrect) {
          targetPlayer.score += gameState.activeClue.value;
          const wonAmount = gameState.activeClue.value;
          
          // If correct, clue is done
          gameState.boardState[`${gameState.activeClue.categoryName}-${gameState.activeClue.value}`] = 'played';
          gameState.activeClue = null;
          gameState.buzzedPlayerId = null;
          
          gameState.chatMessages.push({
            id: Date.now(),
            sender: 'System',
            text: `${targetPlayer.name} answered correctly and won $${wonAmount}!`
          });
          io.emit('answerResolved', { playerId, isCorrect, playerName: targetPlayer.name, value: wonAmount });
          io.emit('gameStateUpdate', gameState);
        } else {
          targetPlayer.score -= gameState.activeClue.value;
          // If incorrect, open buzzer back up to others
          gameState.buzzedPlayerId = null;
          
          gameState.chatMessages.push({
            id: Date.now(),
            sender: 'System',
            text: `${targetPlayer.name} answered incorrectly. Buzzer is open!`
          });

          io.emit('answerResolved', { playerId, isCorrect, playerName: targetPlayer.name, value: gameState.activeClue.value });
          io.emit('gameStateUpdate', gameState);
        }
      }
    }
  });

  socket.on('closeClue', () => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && player.isHost) {
      if (gameState.activeClue) {
        // Mark as played even if nobody got it right, if host decides to close it
        gameState.boardState[`${gameState.activeClue.categoryName}-${gameState.activeClue.value}`] = 'played';
      }
      gameState.activeClue = null;
      gameState.buzzedPlayerId = null;
      io.emit('gameStateUpdate', gameState);
    }
  });

  socket.on('sendChat', (text) => {
    const player = gameState.players.find(p => p.id === socket.id);
    if (player && text.trim()) {
      gameState.chatMessages.push({
        id: Date.now(),
        sender: player.name,
        text: text.trim()
      });
      io.emit('gameStateUpdate', gameState);
    }
  });

  socket.on('resetGame', () => {
    // Anyone clicking LEAVE GAME resets the entire game for everyone
    gameState = {
      phase: 'SETUP',
      players: [],
      activeClue: null,
      buzzedPlayerId: null,
      chatMessages: [
        { id: Date.now(), sender: 'System', text: 'The game has been reset.' }
      ],
      boardState: {}
    };
    io.emit('gameStateUpdate', gameState);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const playerIndex = gameState.players.findIndex(p => p.id === socket.id);
    if (playerIndex !== -1) {
      const player = gameState.players[playerIndex];
      gameState.players.splice(playerIndex, 1);
      
      gameState.chatMessages.push({
        id: Date.now(),
        sender: 'System',
        text: `${player.name} left the game.`
      });

      // If host leaves, maybe game over or wait? Simple approach: just emit update
      io.emit('gameStateUpdate', gameState);
    }
  });
});

const PORT = process.env.PORT || 3001;

if (existsSync(distPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/socket.io') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Multiplayer Server running on port ${PORT}`);
});
