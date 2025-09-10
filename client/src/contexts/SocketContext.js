import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Establish connection
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      setSocket(newSocket);

      // Announce user's presence to the server
      newSocket.emit('join', user.id);

      // Clean up on disconnect or user change
      return () => newSocket.close();
    } else {
      // If user logs out, disconnect the socket
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [user]); // Re-run effect when user object changes

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};