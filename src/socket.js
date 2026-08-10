import { io } from 'socket.io-client';

const envUrl = import.meta.env.VITE_SOCKET_URL;
const useHttpApi = String(import.meta.env.VITE_USE_HTTP_API).toLowerCase() === 'true';
const port = 3001;
const host = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const localFallback = `${protocol}//${host}:${port}`;
const URL = envUrl || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? localFallback : window.location.origin);

function createHttpSocket() {
  const listeners = {};
  const clientId = crypto?.randomUUID?.() ?? `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  const notify = (eventName, payload) => {
    (listeners[eventName] || []).forEach((listener) => listener(payload));
  };

  const trigger = async (eventName, payload = undefined) => {
    const response = await fetch(`${apiBase}/api/game`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventName, payload, clientId })
    });

    const data = await response.json();
    if (data?.error) {
      notify('error', data.error);
      return data;
    }

    if (data?.state) {
      notify('gameStateUpdate', data.state);
    }

    if (data?.event) {
      notify(data.event, data.payload || {});
    }

    return data;
  };

  const poll = async () => {
    const response = await fetch(`${apiBase}/api/game?clientId=${clientId}`);
    if (!response.ok) return;
    const data = await response.json();
    if (data?.state) {
      notify('gameStateUpdate', data.state);
    }
  };

  setInterval(poll, 1000);

  return {
    id: clientId,
    on(eventName, callback) {
      listeners[eventName] = listeners[eventName] || [];
      listeners[eventName].push(callback);
    },
    off(eventName, callback) {
      if (!listeners[eventName]) return;
      listeners[eventName] = listeners[eventName].filter((listener) => listener !== callback);
    },
    emit(eventName, payload) {
      return trigger(eventName, payload);
    }
  };
}

export const socket = useHttpApi ? createHttpSocket() : io(URL, {
  transports: ['websocket', 'polling']
});