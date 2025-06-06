import { io, Socket } from 'socket.io-client';
const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://snake-backend-832287900651.us-central1.run.app';

export const socket: Socket = io(`${SOCKET_URL}/snake`, {
  autoConnect: false,
  reconnectionAttempts: 5,
  reconnectionDelay: 3000,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};