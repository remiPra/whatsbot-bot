import React from 'react';
import { MessageCircle, Wifi, WifiOff, AlertCircle } from 'lucide-react';

const Header = ({ connectionStatus }) => {
  const getStatusConfig = () => {
    switch (connectionStatus?.status) {
      case 'connected':
        return {
          icon: <Wifi className="w-4 h-4" />,
          text: 'Connecté',
          dotColor: 'bg-green-500',
          bgColor: 'bg-green-50 text-green-700'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-4 h-4" />,
          text: 'Déconnecté',
          dotColor: 'bg-red-500',
          bgColor: 'bg-red-50 text-red-700'
        };
      default:
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          text: 'Connexion...',
          dotColor: 'bg-yellow-500',
          bgColor: 'bg-yellow-50 text-yellow-700'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-whatsapp-primary to-whatsapp-secondary rounded-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                WhatsApp Bot
              </h1>
              <p className="text-sm text-gray-500">
                Dashboard de contrôle
              </p>
            </div>
          </div>

          {/* Status */}
          <div className={`flex items-center gap-3 px-4 py-2 rounded-full ${statusConfig.bgColor}`}>
            <div className={`status-dot ${statusConfig.dotColor}`} />
            {statusConfig.icon}
            <span className="font-medium">
              {statusConfig.text}
            </span>
            {connectionStatus?.uptime && (
              <span className="text-xs opacity-75">
                • {connectionStatus.uptime}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;