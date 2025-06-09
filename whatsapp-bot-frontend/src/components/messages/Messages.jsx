import React, { useState } from 'react';
import SendMessage from './SendMessage';
import MessageHistory from './MessageHistory';
import Templates from './Templates';
import { MessageSquare, History,   FileText as Template,  // Template n'existe pas
 } from 'lucide-react';

const Messages = () => {
  const [activeSection, setActiveSection] = useState('send');

  const sections = [
    {
      id: 'send',
      label: 'Envoyer',
      icon: <MessageSquare className="w-4 h-4" />,
      component: <SendMessage />
    },
    {
      id: 'history',
      label: 'Historique',
      icon: <History className="w-4 h-4" />,
      component: <MessageHistory />
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: <Template className="w-4 h-4" />,
      component: <Templates />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Navigation des sections */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex space-x-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeSection === section.id
                  ? 'bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu actif */}
      <div className="animate-fade-in">
        {sections.find(s => s.id === activeSection)?.component}
      </div>
    </div>
  );
};

export default Messages;