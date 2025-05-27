import { io, Socket } from 'socket.io-client';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

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