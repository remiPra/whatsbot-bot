import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    status: 'connecting',
    uptime: null
  });
  const [stats, setStats] = useState({});

  useEffect(() => {
    const newSocket = io('http://localhost:3001');

    newSocket.on('connect', () => {
      console.log('🔌 Connecté au serveur');
      setConnectionStatus(prev => ({ ...prev, status: 'connected' }));
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Déconnecté du serveur');
      setConnectionStatus(prev => ({ ...prev, status: 'disconnected' }));
    });

    newSocket.on('whatsapp-status', (data) => {
      setConnectionStatus({
        status: data.connected ? 'connected' : 'disconnected',
        uptime: data.uptime || null
      });
    });

    newSocket.on('stats-update', (data) => {
      setStats(data);
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return { socket, connectionStatus, stats };
};