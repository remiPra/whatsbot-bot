import React, { useState } from 'react';
import ContactsList from './ContactsList';
import ContactsStats from './ContactsStats';
import { Users, BarChart3 } from 'lucide-react';

const Contacts = () => {
  const [activeView, setActiveView] = useState('list');

  const views = [
    {
      id: 'list',
      label: 'Liste des contacts',
      icon: <Users className="w-4 h-4" />,
      component: <ContactsList />
    },
    {
      id: 'stats',
      label: 'Statistiques',
      icon: <BarChart3 className="w-4 h-4" />,
      component: <ContactsStats />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === view.id
                  ? 'bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {view.icon}
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu actif */}
      <div className="animate-fade-in">
        {views.find(v => v.id === activeView)?.component}
      </div>
    </div>
  );
};

export default Contacts;