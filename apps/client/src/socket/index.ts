import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === 'production' ? '/' : 'http://localhost:8010';
console.log('url', URL);
export const socket = io(URL);
