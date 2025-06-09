import React, { useState } from 'react';
import { 
  Star, 
  MessageCircle, 
  Phone, 
  Mail, 
  MoreVertical,
  User,
  Clock,
  CheckCircle2,
  Circle
} from 'lucide-react';

const ContactCard = ({ 
  contact, 
  viewMode = 'grid', 
  isSelected = false, 
  onSelect, 
  onToggleFavorite 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Jamais vu';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Il y a moins d\'1h';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 168) { // 7 jours
      return `Il y a ${Math.floor(diffInHours / 24)} jour${Math.floor(diffInHours / 24) > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'en ligne':
        return 'bg-green-500';
      case 'absent':
        return 'bg-yellow-500';
      case 'hors ligne':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const handleSendMessage = (e) => {
    e.stopPropagation();
    // Logique pour envoyer un message
    console.log('Envoyer message à:', contact.name);
  };

  const handleCall = (e) => {
    e.stopPropagation();
    window.open(`tel:${contact.phone}`);
  };

  const handleEmail = (e) => {
    e.stopPropagation();
    window.open(`mailto:${contact.email}`);
  };

  if (viewMode === 'list') {
    return (
      <div className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${isSelected ? 'bg-blue-50 border-blue-300' : ''}`}>
        <div className="flex items-center gap-4 flex-1">
          {/* Checkbox de sélection */}
          <button
            onClick={onSelect}
            className="text-gray-400 hover:text-blue-600"
          >
            {isSelected ? (
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          {/* Avatar */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${contact.avatar ? 'bg-gray-200' : 'bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary'}`}>
              {contact.avatar ? (
                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover" />
              ) : (
                getInitials(contact.name)
              )}
            </div>
            {contact.hasWhatsApp && (
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(contact.status)}`} />
            )}
          </div>

          {/* Informations */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-800 truncate">
                {contact.name || 'Contact sans nom'}
              </h3>
              {contact.isFavorite && (
                <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{contact.phone}</span>
              {contact.email && (
                <span className="truncate">{contact.email}</span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatLastSeen(contact.lastSeen)}
              </span>
            </div>
          </div>

          {/* Statistiques */}
          <div className="text-right text-sm text-gray-500">
            <div>{contact.messageCount || 0} messages</div>
            {contact.hasWhatsApp && (
              <div className="text-whatsapp-primary font-medium">WhatsApp</div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              contact.isFavorite 
                ? 'text-yellow-500 hover:bg-yellow-50' 
                : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
            }`}
            title={contact.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star className={`w-4 h-4 ${contact.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {contact.hasWhatsApp && (
            <button
              onClick={handleSendMessage}
              className="p-2 text-gray-400 hover:text-whatsapp-primary hover:bg-green-50 rounded-lg transition-colors duration-200"
              title="Envoyer un message"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleCall}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            title="Appeler"
          >
            <Phone className="w-4 h-4" />
          </button>

          {contact.email && (
            <button
              onClick={handleEmail}
              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
              title="Envoyer un email"
            >
              <Mail className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Vue grille
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}>
      {/* En-tête avec sélection et menu */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onSelect}
          className="text-gray-400 hover:text-blue-600"
        >
          {isSelected ? (
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              <button
                onClick={handleSendMessage}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                disabled={!contact.hasWhatsApp}
              >
                Envoyer message
              </button>
              <button
                onClick={handleCall}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Appeler
              </button>
              {contact.email && (
                <button
                  onClick={handleEmail}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Envoyer email
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avatar et statut */}
      <div className="flex flex-col items-center text-center mb-4">
        <div className="relative mb-3">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold ${contact.avatar ? 'bg-gray-200' : 'bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary'}`}>
            {contact.avatar ? (
              <img src={contact.avatar} alt={contact.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              getInitials(contact.name)
            )}
          </div>
          {contact.hasWhatsApp && (
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${getStatusColor(contact.status)}`} />
          )}
        </div>

        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold text-gray-800 text-center">
            {contact.name || 'Contact sans nom'}
          </h3>
          {contact.isFavorite && (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          )}
        </div>

        <p className="text-sm text-gray-600 mb-1">{contact.phone}</p>
        
        {contact.hasWhatsApp && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            WhatsApp
          </span>
        )}
      </div>

      {/* Informations */}
      <div className="space-y-2 mb-4">
        {contact.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{formatLastSeen(contact.lastSeen)}</span>
        </div>

        {contact.messageCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageCircle className="w-4 h-4" />
            <span>{contact.messageCount} messages échangés</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onToggleFavorite}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
            contact.isFavorite 
              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Star className={`w-4 h-4 mx-auto ${contact.isFavorite ? 'fill-current' : ''}`} />
        </button>

        {contact.hasWhatsApp && (
          <button
            onClick={handleSendMessage}
            className="flex-1 bg-whatsapp-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-whatsapp-secondary transition-colors duration-200"
          >
            <MessageCircle className="w-4 h-4 mx-auto" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ContactCard;