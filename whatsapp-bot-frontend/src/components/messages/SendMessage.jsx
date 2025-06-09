import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../hooks/useNotifications';

const SendMessage = () => {
  const [formData, setFormData] = useState({
    recipient: '',
    message: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useApi();
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.recipient || !formData.message) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      await sendMessage(formData.recipient, formData.message);
      showNotification('Message envoyé avec succès !', 'success');
      setFormData({ recipient: '', message: '' });
    } catch (error) {
      showNotification('Erreur lors de l\'envoi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
          <Send className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">
          Envoyer un message
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destinataire */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📞 Numéro destinataire
          </label>
          <input
            type="tel"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="33123456789"
            className="input-field"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Format international sans le + (ex: 33123456789)
          </p>
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💬 Message
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tapez votre message ici..."
            rows={6}
            className="input-field resize-y"
            disabled={isLoading}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Tapez votre message</span>
            <span>{formData.message.length} caractères</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {isLoading ? 'Envoi...' : 'Envoyer'}
          </button>
          
          <button
            type="button"
            className="btn-secondary"
            disabled={isLoading}
          >
*            Templates
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendMessage;