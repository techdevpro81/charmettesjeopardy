const GAME_STATE_KEY = 'jeopardy:gameState';
const STALE_THRESHOLD_MS = 15_000; // 15 seconds without polling = stale

export function defaultGameState() {
  return {
    phase: 'SETUP',
    players: [],
    activeClue: null,
    buzzedPlayerId: null,
    chatMessages: [
      { id: 1, sender: 'System', text: 'Welcome to The Charmettes, Incorporated Jeopardy!' }
    ],
    boardState: {}
  };
}

let memoryState = defaultGameState();

function kvConfigured() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKv() {
  if (!kvConfigured()) return null;
  const { kv } = await import('@vercel/kv');
  return kv;
}

export async function loadGameState() {
  const kv = await getKv();
  if (kv) {
    const state = await kv.get(GAME_STATE_KEY);
    return state || defaultGameState();
  }
  return memoryState;
}

export async function saveGameState(state) {
  const kv = await getKv();
  if (kv) {
    await kv.set(GAME_STATE_KEY, state);
  } else {
    memoryState = state;
  }
}

/**
 * Mark a player as active (heartbeat) by updating their lastSeen timestamp.
 */
export function touchPlayer(state, clientId) {
  const player = state.players.find((p) => p.id === clientId);
  if (player) {
    player.lastSeen = Date.now();
  }
}

/**
 * Remove players who haven't polled in STALE_THRESHOLD_MS.
 * Returns true if any players were pruned.
 */
export function pruneStale(state) {
  const now = Date.now();
  const before = state.players.length;
  state.players = state.players.filter((p) => {
    if (!p.lastSeen) return true; // keep players without lastSeen (just joined)
    return now - p.lastSeen < STALE_THRESHOLD_MS;
  });

  // If the buzzed player was pruned, clear the buzzer
  if (state.buzzedPlayerId && !state.players.find((p) => p.id === state.buzzedPlayerId)) {
    state.buzzedPlayerId = null;
  }

  return state.players.length < before;
}

export function sanitizeState(state) {
  return {
    ...state,
    players: state.players.map(({ sessionToken, lastSeen, ...player }) => player)
  };
}
