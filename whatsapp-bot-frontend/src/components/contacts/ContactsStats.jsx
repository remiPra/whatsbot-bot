import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MessageCircle, 
  Star, 
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';

const ContactsStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    withWhatsApp: 0,
    favorites: 0,
    recentlyActive: 0,
    messagesSent: 0,
    messagesReceived: 0,
    topContacts: [],
    activityByMonth: []
  });

  useEffect(() => {
    // Simuler le chargement des statistiques
    loadStats();
  }, []);

  const loadStats = () => {
    // Données simulées
    setStats({
      total: 156,
      withWhatsApp: 142,
      favorites: 12,
      recentlyActive: 45,
      messagesSent: 1247,
      messagesReceived: 892,
      topContacts: [
        { name: 'Marie Dupont', messages: 89, phone: '+33123456789' },
        { name: 'Jean Martin', messages: 67, phone: '+33987654321' },
        { name: 'Sophie Bernard', messages: 43, phone: '+33555444333' },
        { name: 'Pierre Dubois', messages: 38, phone: '+33111222333' },
        { name: 'Lucie Moreau', messages: 29, phone: '+33444555666' }
      ],
      activityByMonth: [
        { month: 'Jan', sent: 145, received: 89 },
        { month: 'Fév', sent: 178, received: 123 },
        { month: 'Mar', sent: 203, received: 156 },
        { month: 'Avr', sent: 189, received: 134 },
        { month: 'Mai', sent: 234, received: 189 },
        { month: 'Juin', sent: 298, received: 201 }
      ]
    });
  };

const StatCard = ({ icon, title, value, subtitle, color = 'blue' }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-${color}-100`}>
              {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600` })}
            </div>
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const getWhatsAppPercentage = () => {
    return stats.total > 0 ? Math.round((stats.withWhatsApp / stats.total) * 100) : 0;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-whatsapp-primary" />
          <h2 className="text-2xl font-bold text-gray-800">
            Statistiques des contacts
          </h2>
        </div>
        <p className="text-gray-600">
          Analysez l'activité et l'engagement de vos contacts WhatsApp.
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users />}
          title="Total contacts"
          value={stats.total.toLocaleString()}
          subtitle="Tous vos contacts"
          color="blue"
        />
        
        <StatCard
          icon={<MessageCircle />}
          title="WhatsApp actif"
          value={stats.withWhatsApp.toLocaleString()}
          subtitle={`${getWhatsAppPercentage()}% du total`}
          color="green"
        />
        
        <StatCard
          icon={<Star />}
          title="Favoris"
          value={stats.favorites.toLocaleString()}
          subtitle="Contacts favoris"
          color="yellow"
        />
        
        <StatCard
          icon={<TrendingUp />}
          title="Actifs récemment"
          value={stats.recentlyActive.toLocaleString()}
          subtitle="Cette semaine"
          color="purple"
        />
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition WhatsApp */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-whatsapp-primary" />
            Répartition des contacts
          </h3>
          
          <div className="space-y-4">
            {/* WhatsApp actif */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Avec WhatsApp</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{stats.withWhatsApp}</span>
                <span className="text-sm text-gray-500 ml-2">({getWhatsAppPercentage()}%)</span>
              </div>
            </div>
            
            {/* Barre de progression WhatsApp */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getWhatsAppPercentage()}%` }}
              ></div>
            </div>

            {/* Sans WhatsApp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                <span className="text-gray-700">Sans WhatsApp</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{stats.total - stats.withWhatsApp}</span>
                <span className="text-sm text-gray-500 ml-2">({100 - getWhatsAppPercentage()}%)</span>
              </div>
            </div>

            {/* Favoris */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-gray-700">Contacts favoris</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{stats.favorites}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({Math.round((stats.favorites / stats.total) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top contacts */}
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-whatsapp-primary" />
            Contacts les plus actifs
          </h3>
          
          <div className="space-y-4">
            {stats.topContacts.map((contact, index) => (
              <div key={contact.phone} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-xs text-gray-500">{contact.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{contact.messages}</p>
                  <p className="text-xs text-gray-500">messages</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité mensuelle */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-whatsapp-primary" />
          Activité des 6 derniers mois
        </h3>
        
        <div className="space-y-6">
          {/* Statistiques globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-blue-800">Messages envoyés</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.messagesSent.toLocaleString()}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Messages reçus</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.messagesReceived.toLocaleString()}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-purple-800">Total échanges</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {(stats.messagesSent + stats.messagesReceived).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Graphique simplifié */}
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Envoyés</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Reçus</span>
              </div>
            </div>
            
            {stats.activityByMonth.map((month, index) => {
              const maxValue = Math.max(...stats.activityByMonth.map(m => Math.max(m.sent, m.received)));
              const sentWidth = (month.sent / maxValue) * 100;
              const receivedWidth = (month.received / maxValue) * 100;
              
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 w-12">{month.month}</span>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Envoyés: {month.sent}</span>
                      <span>Reçus: {month.received}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${sentWidth}%` }}
                      ></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${receivedWidth}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Actions rapides</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-secondary justify-center">
            <Users className="w-4 h-4" />
            Synchroniser contacts
          </button>
          
          <button className="btn-secondary justify-center">
            <MessageCircle className="w-4 h-4" />
            Message groupé
          </button>
          
          <button className="btn-secondary justify-center">
            <Star className="w-4 h-4" />
            Gérer les favoris
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactsStats;