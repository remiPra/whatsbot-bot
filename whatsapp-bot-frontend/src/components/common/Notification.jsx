import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNotification } from '../../hooks/useNotification';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  const getNotificationConfig = (type) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: <XCircle className="w-5 h-5" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      default:
        return {
          icon: <Info className="w-5 h-5" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => {
        const config = getNotificationConfig(notification.type);
        
        return (
          <div
            key={notification.id}
            className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg animate-slide-in`}
          >
            <div className="flex items-start gap-3">
              <div className={config.iconColor}>
                {config.icon}
              </div>
              
              <div className="flex-1">
                <p className={`${config.textColor} text-sm font-medium`}>
                  {notification.message}
                </p>
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                className={`${config.textColor} hover:opacity-70 transition-opacity`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationContainer;