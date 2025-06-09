import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MessageCircle, 
  Send, 
  MessageSquareText,
  Calendar,
  User,
  Trash2,
  Eye
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotifications';

const MessageHistory = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  const { getMessages } = useApi();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [messages, filters]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages();
      setMessages(data.messages || []);
    } catch (error) {
      showNotification('Erreur lors du chargement des messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = messages;

    // Recherche textuelle
    if (filters.search) {
      filtered = filtered.filter(msg => 
        msg.content?.toLowerCase().includes(filters.search.toLowerCase()) ||
        msg.from?.includes(filters.search) ||
        msg.to?.includes(filters.search)
      );
    }

    // Filtre par type
    if (filters.type) {
      filtered = filtered.filter(msg => msg.type === filters.type);
    }

    // Filtre par date
    if (filters.dateFrom) {
      filtered = filtered.filter(msg => 
        new Date(msg.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(msg => 
        new Date(msg.timestamp) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    setFilteredMessages(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportMessages = () => {
    const csvContent = [
      ['Date', 'Type', 'De', 'Vers', 'Message', 'Statut'].join(','),
      ...filteredMessages.map(msg => [
        new Date(msg.timestamp).toLocaleString('fr-FR'),
        msg.type === 'sent' ? 'Envoyé' : 'Reçu',
        msg.from || '-',
        msg.to || '-',
        `"${msg.content?.replace(/"/g, '""') || ''}"`,
        msg.status || 'Inconnu'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `messages_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Il y a moins d\'1h';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const getMessageTypeIcon = (type) => {
    switch (type) {
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'received':
        return <MessageSquareText className="w-4 h-4 text-green-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      'sent': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Envoyé' },
      'delivered': { bg: 'bg-green-100', text: 'text-green-800', label: 'Livré' },
      'read': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Lu' },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', label: 'Échec' },
    };
    
    const config = configs[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inconnu' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-primary"></div>
          <span className="ml-3 text-gray-600">Chargement des messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres et actions */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <History className="w-6 h-6 text-whatsapp-primary" />
            Historique des messages
          </h2>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={exportMessages}
              className="btn-secondary"
              disabled={filteredMessages.length === 0}
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="input-field"
          >
            <option value="">Tous les types</option>
            <option value="sent">Envoyés</option>
            <option value="received">Reçus</option>
          </select>

          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="input-field"
            placeholder="Date début"
          />

          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="input-field"
            placeholder="Date fin"
          />
        </div>
      </div>

      {/* Liste des messages */}
      <div className="card">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun message trouvé
            </h3>
            <p className="text-gray-500">
              {messages.length === 0 
                ? 'Aucun message dans l\'historique'
                : 'Essayez de modifier vos filtres'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message, index) => (
              <div
                key={message.id || index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* En-tête du message */}
                    <div className="flex items-center gap-3 mb-2">
                      {getMessageTypeIcon(message.type)}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span className="font-medium">
                          {message.type === 'sent' 
                            ? `Vers: ${message.to}` 
                            : `De: ${message.from}`
                          }
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {formatTimestamp(message.timestamp)}
                      </div>

                      {getStatusBadge(message.status)}
                    </div>

                    {/* Contenu du message */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-2">
                      <p className="text-gray-800 line-clamp-2">
                        {message.content || 'Message sans contenu'}
                      </p>
                    </div>

                    {/* Métadonnées */}
                    {message.mediaType && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-200 px-2 py-1 rounded">
                          {message.mediaType}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="p-2 text-gray-400 hover:text-whatsapp-primary hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="Voir les détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal détails du message */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  Détails du message
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Fermer</span>
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Type</label>
                    <div className="flex items-center gap-2 mt-1">
                      {getMessageTypeIcon(selectedMessage.type)}
                      <span className="capitalize">{selectedMessage.type}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Statut</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedMessage.status)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">
                    {selectedMessage.type === 'sent' ? 'Destinataire' : 'Expéditeur'}
                  </label>
                  <p className="mt-1 text-gray-800">
                    {selectedMessage.type === 'sent' ? selectedMessage.to : selectedMessage.from}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Date et heure</label>
                  <p className="mt-1 text-gray-800">
                    {new Date(selectedMessage.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Message</label>
                  <div className="mt-1 bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedMessage.content || 'Aucun contenu'}
                    </p>
                  </div>
                </div>

                {selectedMessage.mediaType && (
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Type de média</label>
                    <p className="mt-1 text-gray-800">{selectedMessage.mediaType}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageHistory;