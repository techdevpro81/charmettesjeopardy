import { io } from 'socket.io-client';

const envUrl = import.meta.env.VITE_SOCKET_URL;
const port = 3001;
const host = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const localFallback = `${protocol}//${host}:${port}`;
const URL = envUrl || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? localFallback : window.location.origin);

export const socket = io(URL, {
  transports: ['websocket', 'polling']
});