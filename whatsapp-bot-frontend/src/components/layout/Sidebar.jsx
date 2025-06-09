import React from 'react';
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Settings,
  Send
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Paramètres',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`nav-tab w-full text-left ${
                activeTab === tab.id ? 'active' : ''
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Quick Action */}
        <div className="mt-8 p-4 bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary rounded-xl text-white">
          <h3 className="font-semibold mb-2">Envoi rapide</h3>
          <p className="text-sm mb-3 opacity-90">
            Envoyer un message rapidement
          </p>
          <button 
            onClick={() => setActiveTab('messages')}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Nouveau message
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;