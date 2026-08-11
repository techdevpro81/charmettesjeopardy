const GAME_STATE_KEY = 'jeopardy:gameState';

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

export function sanitizeState(state) {
  return {
    ...state,
    players: state.players.map(({ sessionToken, lastSeen, ...player }) => player)
  };
}
