import { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);

  const api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const sendMessage = async (to, message) => {
    setLoading(true);
    try {
      const response = await api.post('/messages/send', { to, message });
      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const getMessages = async (params = {}) => {
    const response = await api.get('/messages', { params });
    return response.data;
  };

  const getStats = async () => {
    const response = await api.get('/stats');
    return response.data;
  };

  const getContacts = async () => {
    const response = await api.get('/contacts');
    return response.data;
  };

  const syncContacts = async () => {
    const response = await api.post('/contacts/sync');
    return response.data;
  };

  return {
    loading,
    sendMessage,
    getMessages,
    getStats,
    getContacts,
    syncContacts
  };
};