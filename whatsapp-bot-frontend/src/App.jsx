import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);

  // Configuration API
  const API_BASE = 'http://localhost:3001/api';

  // Charger les contacts depuis l'API
  useEffect(() => {
    loadContacts();
  }, []);
const loadContacts = async () => {
  try {
    setLoadingContacts(true);
    console.log('🔄 Chargement des contacts...');
    
    // Utiliser fetch au lieu d'axios pour éviter les problèmes CORS
    const response = await fetch(`${API_BASE}/contacts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📋 Données reçues:', data);
    
    if (data.success && Array.isArray(data.contacts)) {
      setContacts(data.contacts);
      console.log(`✅ ${data.contacts.length} contacts chargés`);
      showNotification(`${data.contacts.length} contacts chargés !`, 'success');
    } else {
      console.warn('⚠️ Pas de contacts dans la réponse');
      setContacts([]);
      showNotification('Aucun contact disponible', 'warning');
    }
    
  } catch (error) {
    console.error('❌ Erreur complète:', error);
    showNotification(`Erreur: ${error.message}`, 'error');
    
    // Données de test en fallback
    const mockContacts = [
      { 
        id: '1', 
        name: 'Olivier (Test)', 
        phone: '+33123456789', 
        pushname: 'Olivier Frère',
        isMyContact: true 
      }
    ];
    setContacts(mockContacts);
    showNotification('Utilisation des données de test', 'warning');
  } finally {
    setLoadingContacts(false);
  }
};
  // Filtrer les contacts selon la recherche
  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm) ||
    contact.pushname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir les initiales pour l'avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Envoyer le message via API
  const sendMessage = async () => {
    if (!selectedContact || !message.trim()) {
      showNotification('Veuillez sélectionner un contact et saisir un message', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE}/messages/send`, {
        to: selectedContact.phone,
        message: message.trim()
      });

      if (response.data.success) {
        showNotification(`Message envoyé à ${selectedContact.name || selectedContact.pushname} !`, 'success');
        setMessage('');
        console.log('Message envoyé avec succès:', response.data);
      } else {
        showNotification('Erreur lors de l\'envoi du message', 'error');
      }
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      showNotification(
        error.response?.data?.message || 'Erreur lors de l\'envoi du message', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // Afficher une notification
  const showNotification = (msg, type) => {
    setNotification({ message: msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Formater le numéro de téléphone
  const formatPhone = (phone) => {
    if (!phone) return '';
    // Retirer @c.us si présent
    const cleanPhone = phone.replace('@c.us', '');
    // Ajouter + si pas présent
    return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  };

  // Templates de messages
  const messageTemplates = [
    'Salut ! Comment tu vas ?',
    'Merci pour ton message. Je reviens vers toi rapidement.',
    'Peux-tu m\'appeler quand tu as un moment ?',
    'Bonjour ! J\'espère que tout va bien.',
    'Merci beaucoup ! À bientôt 😊'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl">📱</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                WhatsApp Bot
              </h1>
              <p className="text-gray-600">
                Envoyez des messages à vos contacts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* SECTION CONTACTS */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                👥 Contacts
              </h2>
              <button
                onClick={loadContacts}
                disabled={loadingContacts}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loadingContacts ? '🔄' : '↻'} Actualiser
              </button>
            </div>

            {/* Barre de recherche */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher un contact (ex: Olivier)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>
              {searchTerm && (
                <p className="text-sm text-gray-500 mt-2">
                  {filteredContacts.length} contact(s) trouvé(s)
                </p>
              )}
            </div>

            {/* Liste des contacts */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loadingContacts ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des contacts...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">🔍</span>
                  <p className="font-medium">Aucun contact trouvé</p>
                  <p className="text-sm">
                    {searchTerm ? 'Modifiez votre recherche' : 'Aucun contact disponible'}
                  </p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id || contact.phone}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedContact?.phone === contact.phone
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {getInitials(contact.name || contact.pushname)}
                      </div>
                      
                      {/* Infos contact */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {contact.name || contact.pushname || 'Contact sans nom'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {formatPhone(contact.phone)}
                        </p>
                        {contact.isMyContact && (
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mt-1">
                            Contact
                          </span>
                        )}
                      </div>

                      {/* Indicateur sélection */}
                      {selectedContact?.phone === contact.phone && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* SECTION MESSAGE */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              💬 Envoyer un Message
            </h2>

            {/* Contact sélectionné */}
            {selectedContact ? (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(selectedContact.name || selectedContact.pushname)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      {selectedContact.name || selectedContact.pushname || 'Contact sans nom'}
                    </h3>
                    <p className="text-gray-600">
                      {formatPhone(selectedContact.phone)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center">
                <span className="text-4xl mb-3 block">👆</span>
                <p className="text-gray-600 font-medium">
                  Sélectionnez d'abord un contact
                </p>
              </div>
            )}

            {/* Zone de saisie du message */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Votre message :
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tapez votre message ici..."
                rows={6}
                disabled={!selectedContact}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500 resize-none"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Message à envoyer</span>
                <span className={message.length > 1000 ? 'text-red-500 font-medium' : ''}>
                  {message.length} caractères
                </span>
              </div>
            </div>

            {/* Templates rapides */}
            {selectedContact && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  ⚡ Templates rapides :
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {messageTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(template)}
                      className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton d'envoi */}
            <button
              onClick={sendMessage}
              disabled={!selectedContact || !message.trim() || loading}
              className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 ${
                !selectedContact || !message.trim() || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  📤 Envoyer le message
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 animate-bounce">
            <div className={`px-6 py-4 rounded-xl shadow-lg text-white font-semibold ${
              notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {notification.type === 'success' ? '✅' : '❌'}
                </span>
                {notification.message}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;