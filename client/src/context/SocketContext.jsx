import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

// Module-level token store so SocketContext can read the latest access token
let _latestToken = null;
export const setSocketToken = (token) => { _latestToken = token; };

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user || !_latestToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || '';

    const socket = io(socketUrl, {
      auth: { token: _latestToken },
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socketRef.current = socket;

    if (user.role === 'driver') {
      socket.emit('driver_available');
    }

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  // Re-connect whenever the user or token changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, _latestToken]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
