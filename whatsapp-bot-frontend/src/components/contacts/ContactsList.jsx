import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Download, 
  RefreshCw, 
  Star, 
  MessageCircle, 
  Phone,
  Mail,
  MoreVertical,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import ContactCard from './ContactCard';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotifications';

const ContactsList = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    favorites: false,
    hasWhatsApp: false
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [selectedContacts, setSelectedContacts] = useState([]);

  const { getContacts, syncContacts } = useApi();
  const { showNotification } = useNotification();

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contacts, filters]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data.contacts || []);
    } catch (error) {
      showNotification('Erreur lors du chargement des contacts', 'error');
      // Données de démonstration en cas d'erreur
      setContacts(generateMockContacts());
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncContacts();
      await loadContacts();
      showNotification('Contacts synchronisés avec succès', 'success');
    } catch (error) {
      showNotification('Erreur lors de la synchronisation', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const applyFilters = () => {
    let filtered = contacts;

    // Recherche textuelle
    if (filters.search) {
      filtered = filtered.filter(contact => 
        contact.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        contact.phone?.includes(filters.search) ||
        contact.email?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtre favoris
    if (filters.favorites) {
      filtered = filtered.filter(contact => contact.isFavorite);
    }

    // Filtre WhatsApp
    if (filters.hasWhatsApp) {
      filtered = filtered.filter(contact => contact.hasWhatsApp);
    }

    setFilteredContacts(filtered);
  };

  const toggleFavorite = (contactId) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId 
        ? { ...contact, isFavorite: !contact.isFavorite }
        : contact
    ));
  };

  const handleContactSelect = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const exportContacts = () => {
    const csvContent = [
      ['Nom', 'Téléphone', 'Email', 'WhatsApp', 'Favori', 'Dernière activité'].join(','),
      ...filteredContacts.map(contact => [
        `"${contact.name || ''}"`,
        contact.phone || '',
        contact.email || '',
        contact.hasWhatsApp ? 'Oui' : 'Non',
        contact.isFavorite ? 'Oui' : 'Non',
        contact.lastSeen ? new Date(contact.lastSeen).toLocaleDateString('fr-FR') : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateMockContacts = () => [
    {
      id: '1',
      name: 'Marie Dupont',
      phone: '+33123456789',
      email: 'marie.dupont@email.com',
      avatar: null,
      hasWhatsApp: true,
      isFavorite: true,
      lastSeen: '2024-06-04T10:30:00Z',
      status: 'En ligne',
      messageCount: 25
    },
    {
      id: '2',
      name: 'Jean Martin',
      phone: '+33987654321',
      email: 'jean.martin@email.com',
      avatar: null,
      hasWhatsApp: true,
      isFavorite: false,
      lastSeen: '2024-06-03T15:45:00Z',
      status: 'Hors ligne',
      messageCount: 12
    },
    {
      id: '3',
      name: 'Sophie Bernard',
      phone: '+33555444333',
      email: 'sophie.bernard@email.com',
      avatar: null,
      hasWhatsApp: false,
      isFavorite: true,
      lastSeen: null,
      status: 'Inconnu',
      messageCount: 0
    }
  ];

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp-primary"></div>
          <span className="ml-3 text-gray-600">Chargement des contacts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête et actions */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-whatsapp-primary" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Contacts WhatsApp
              </h2>
              <p className="text-sm text-gray-600">
                {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} 
                {contacts.length !== filteredContacts.length && ` sur ${contacts.length}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="btn-secondary"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Synchronisation...' : 'Synchroniser'}
            </button>
            
            <button
              onClick={exportContacts}
              className="btn-secondary"
              disabled={filteredContacts.length === 0}
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un contact..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="favoritesFilter"
              checked={filters.favorites}
              onChange={(e) => setFilters({...filters, favorites: e.target.checked})}
              className="w-4 h-4 text-whatsapp-primary border-gray-300 rounded focus:ring-whatsapp-primary"
            />
            <label htmlFor="favoritesFilter" className="text-sm font-medium text-gray-700">
              Favoris uniquement
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="whatsappFilter"
              checked={filters.hasWhatsApp}
              onChange={(e) => setFilters({...filters, hasWhatsApp: e.target.checked})}
              className="w-4 h-4 text-whatsapp-primary border-gray-300 rounded focus:ring-whatsapp-primary"
            />
            <label htmlFor="whatsappFilter" className="text-sm font-medium text-gray-700">
              WhatsApp actif
            </label>
          </div>

          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-whatsapp-primary text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Grille
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-whatsapp-primary text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Liste
            </button>
          </div>
        </div>

        {/* Actions groupées */}
        {selectedContacts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">
                {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} sélectionné{selectedContacts.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button className="text-sm bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-50">
                  Envoyer message
                </button>
                <button 
                  onClick={() => setSelectedContacts([])}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Désélectionner
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste/Grille des contacts */}
      <div className="card">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun contact trouvé
            </h3>
            <p className="text-gray-500 mb-4">
              {contacts.length === 0 
                ? 'Aucun contact synchronisé. Lancez une synchronisation pour importer vos contacts WhatsApp.'
                : 'Essayez de modifier vos filtres de recherche.'
              }
            </p>
            {contacts.length === 0 && (
              <button
                onClick={handleSync}
                className="btn-primary"
                disabled={syncing}
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Synchroniser les contacts
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-3'
          }>
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                viewMode={viewMode}
                isSelected={selectedContacts.includes(contact.id)}
                onSelect={() => handleContactSelect(contact.id)}
                onToggleFavorite={() => toggleFavorite(contact.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactsList;