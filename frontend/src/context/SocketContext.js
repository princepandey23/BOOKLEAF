import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketRef.current = io('http://localhost:5000');
      if (user.role === 'admin') {
        socketRef.current.emit('join_room', 'admin_room');
      } else {
        socketRef.current.emit('join_room', `author_${user._id}`);
      }
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user]);

  const joinTicketRoom = (ticketId) => {
    if (socketRef.current) socketRef.current.emit('join_room', `ticket_${ticketId}`);
  };

  const onEvent = (event, handler) => {
    if (socketRef.current) socketRef.current.on(event, handler);
  };

  const offEvent = (event, handler) => {
    if (socketRef.current) socketRef.current.off(event, handler);
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, joinTicketRoom, onEvent, offEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
