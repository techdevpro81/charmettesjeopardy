import { jeopardyRound } from '../src/data/questions.js';
import { loadGameState, saveGameState, defaultGameState, sanitizeState } from './gameStore.js';

function nextId() {
  return Date.now() + Math.random();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let gameState = await loadGameState();
  const clientId = req.query.clientId || req.body?.clientId || `client-${Date.now()}`;

  if (req.method === 'GET') {
    return res.status(200).json({ state: sanitizeState(gameState) });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { event, payload } = req.body || {};

  if (!event) {
    return res.status(400).json({ error: 'Missing event' });
  }

  if (event === 'joinGame') {
    const { name, isHost } = payload || {};
    if (gameState.players.find((p) => p.isHost) && isHost) {
      return res.status(200).json({ error: 'A host already exists for this game.' });
    }

    const newPlayer = {
      id: clientId,
      name,
      score: 0,
      isHost,
      hasBuzzed: false
    };

    gameState.players.push(newPlayer);
    gameState.chatMessages.push({
      id: nextId(),
      sender: 'System',
      text: `${name} has joined the game${isHost ? ' as Host' : ''}.`
    });

    await saveGameState(gameState);
    return res.status(200).json({ state: sanitizeState(gameState) });
  }

  if (event === 'startGame') {
    const player = gameState.players.find((p) => p.id === clientId);
    if (player && player.isHost) {
      gameState.phase = 'PLAYING';
      gameState.chatMessages.push({
        id: nextId(),
        sender: 'System',
        text: 'The Host has started the game! Good luck!'
      });
      await saveGameState(gameState);
      return res.status(200).json({ state: sanitizeState(gameState) });
    }
    return res.status(200).json({ error: 'Only the host can start the game.' });
  }

  if (event === 'selectClue') {
    const { categoryName, value } = payload || {};
    const player = gameState.players.find((p) => p.id === clientId);
    if (player && player.isHost) {
      const category = jeopardyRound.find((c) => c.name === categoryName);
      const question = category?.questions.find((q) => q.value === value);

      gameState.activeClue = {
        id: question?.id,
        categoryName,
        value,
        clue: question?.clue || 'No clue text available.',
        answer: question?.answer || ''
      };
      gameState.buzzedPlayerId = null;
      gameState.players.forEach((p) => {
        p.hasBuzzed = false;
      });

      gameState.chatMessages.push({
        id: nextId(),
        sender: 'System',
        text: `Host selected ${categoryName} for $${value}.`
      });

      await saveGameState(gameState);
      return res.status(200).json({ state: sanitizeState(gameState) });
    }
    return res.status(200).json({ error: 'Only the host can select a clue.' });
  }

  if (event === 'buzzIn') {
    const player = gameState.players.find((p) => p.id === clientId);
    if (player && !player.isHost && gameState.activeClue && !gameState.buzzedPlayerId) {
      gameState.buzzedPlayerId = clientId;
      player.hasBuzzed = true;
      gameState.chatMessages.push({
        id: nextId(),
        sender: 'System',
        text: `${player.name} buzzed in!`
      });
      await saveGameState(gameState);
      return res.status(200).json({ state: sanitizeState(gameState) });
    }
    return res.status(200).json({ state: sanitizeState(gameState) });
  }

  if (event === 'resolveAnswer') {
    const { playerId, isCorrect } = payload || {};
    const hostPlayer = gameState.players.find((p) => p.id === clientId);
    if (hostPlayer && hostPlayer.isHost && gameState.activeClue) {
      const targetPlayer = gameState.players.find((p) => p.id === playerId);
      if (targetPlayer) {
        const clueValue = gameState.activeClue.value;

        if (isCorrect) {
          targetPlayer.score += clueValue;
          gameState.boardState[`${gameState.activeClue.categoryName}-${gameState.activeClue.value}`] = 'played';
          gameState.activeClue = null;
          gameState.buzzedPlayerId = null;
          gameState.chatMessages.push({
            id: nextId(),
            sender: 'System',
            text: `${targetPlayer.name} answered correctly and won $${clueValue}!`
          });
          await saveGameState(gameState);
          return res.status(200).json({ state: sanitizeState(gameState), event: 'answerResolved', payload: { playerId, isCorrect, playerName: targetPlayer.name, value: clueValue } });
        }

        targetPlayer.score -= clueValue;
        gameState.buzzedPlayerId = null;
        gameState.chatMessages.push({
          id: nextId(),
          sender: 'System',
          text: `${targetPlayer.name} answered incorrectly. Buzzer is open!`
        });
        await saveGameState(gameState);
        return res.status(200).json({ state: sanitizeState(gameState), event: 'answerResolved', payload: { playerId, isCorrect, playerName: targetPlayer.name, value: clueValue } });
      }
    }
    return res.status(200).json({ error: 'Only the host can resolve answers.' });
  }

  if (event === 'closeClue') {
    const player = gameState.players.find((p) => p.id === clientId);
    if (player && player.isHost) {
      if (gameState.activeClue) {
        gameState.boardState[`${gameState.activeClue.categoryName}-${gameState.activeClue.value}`] = 'played';
      }
      gameState.activeClue = null;
      gameState.buzzedPlayerId = null;
      await saveGameState(gameState);
      return res.status(200).json({ state: sanitizeState(gameState) });
    }
    return res.status(200).json({ error: 'Only the host can close a clue.' });
  }

  if (event === 'sendChat') {
    const player = gameState.players.find((p) => p.id === clientId);
    if (player && payload?.trim()) {
      gameState.chatMessages.push({
        id: nextId(),
        sender: player.name,
        text: payload.trim()
      });
      await saveGameState(gameState);
      return res.status(200).json({ state: sanitizeState(gameState) });
    }
    return res.status(200).json({ state: sanitizeState(gameState) });
  }

  if (event === 'resetGame') {
    gameState = defaultGameState();
    gameState.chatMessages = [
      { id: nextId(), sender: 'System', text: 'The game has been reset.' }
    ];
    await saveGameState(gameState);
    return res.status(200).json({ state: sanitizeState(gameState) });
  }

  return res.status(200).json({ state: sanitizeState(gameState) });
}
