import { io } from 'socket.io-client';

// Use the page protocol/host so the client tries the correct scheme.
// If testing from another device, set host to your machine IP (e.g., '192.168.1.5').
const port = 3001;
const host = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
const URL = `${protocol}//${host}:${port}`;

export const socket = io(URL, { transports: ['websocket', 'polling'] });