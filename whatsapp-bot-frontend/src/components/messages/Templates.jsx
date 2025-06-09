import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Save,
  X,
  MessageSquare
} from 'lucide-react';
import { useNotification } from '../../hooks/useNotifications';

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'general'
  });

  const { showNotification } = useNotification();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    // Simuler le chargement depuis le localStorage ou API
    const savedTemplates = JSON.parse(localStorage.getItem('whatsapp-templates') || '[]');
    if (savedTemplates.length === 0) {
      // Templates par défaut
      const defaultTemplates = [
        {
          id: '1',
          name: 'Salutation professionnelle',
          content: 'Bonjour {nom},\n\nJ\'espère que vous allez bien. Je vous contacte concernant...',
          category: 'professional',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Confirmation RDV',
          content: 'Bonjour,\n\nJe confirme notre rendez-vous prévu le {date} à {heure}.\n\nÀ bientôt !',
          category: 'appointment',
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Remerciement',
          content: 'Merci beaucoup pour votre temps et votre confiance !\n\nN\'hésitez pas si vous avez des questions.',
          category: 'general',
          createdAt: new Date().toISOString()
        }
      ];
      setTemplates(defaultTemplates);
      localStorage.setItem('whatsapp-templates', JSON.stringify(defaultTemplates));
    } else {
      setTemplates(savedTemplates);
    }
  };

  const saveTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem('whatsapp-templates', JSON.stringify(newTemplates));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.content.trim()) {
      showNotification('Veuillez remplir tous les champs', 'error');
      return;
    }

    if (editingTemplate) {
      // Modifier un template existant
      const updatedTemplates = templates.map(t => 
        t.id === editingTemplate.id 
          ? { ...editingTemplate, ...formData, updatedAt: new Date().toISOString() }
          : t
      );
      saveTemplates(updatedTemplates);
      showNotification('Template modifié avec succès', 'success');
      setEditingTemplate(null);
    } else {
      // Créer un nouveau template
      const newTemplate = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      saveTemplates([...templates, newTemplate]);
      showNotification('Template créé avec succès', 'success');
      setIsCreating(false);
    }

    setFormData({ name: '', content: '', category: 'general' });
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category
    });
    setIsCreating(true);
  };

  const handleDelete = (templateId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      const filteredTemplates = templates.filter(t => t.id !== templateId);
      saveTemplates(filteredTemplates);
      showNotification('Template supprimé', 'success');
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    showNotification('Template copié dans le presse-papiers', 'success');
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setFormData({ name: '', content: '', category: 'general' });
  };

  const categories = {
    general: { label: 'Général', color: 'bg-blue-100 text-blue-800' },
    professional: { label: 'Professionnel', color: 'bg-green-100 text-green-800' },
    appointment: { label: 'Rendez-vous', color: 'bg-purple-100 text-purple-800' },
    marketing: { label: 'Marketing', color: 'bg-orange-100 text-orange-800' },
    support: { label: 'Support', color: 'bg-red-100 text-red-800' }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Template className="w-6 h-6 text-whatsapp-primary" />
            <h2 className="text-2xl font-bold text-gray-800">
              Templates de messages
            </h2>
          </div>
          
          <button
            onClick={() => setIsCreating(true)}
            className="btn-primary"
            disabled={isCreating}
          >
            <Plus className="w-4 h-4" />
            Nouveau template
          </button>
        </div>

        <p className="text-gray-600">
          Créez et gérez vos templates de messages pour gagner du temps. 
          Utilisez des variables comme {'{nom}'}, {'{date}'}, {'{heure}'} pour personnaliser vos messages.
        </p>
      </div>

      {/* Formulaire de création/édition */}
      {isCreating && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {editingTemplate ? 'Modifier le template' : 'Nouveau template'}
            </h3>
            <button
              onClick={cancelEdit}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du template
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Salutation professionnelle"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="input-field"
                >
                  {Object.entries(categories).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contenu du message
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                placeholder="Tapez votre template ici... Utilisez {nom}, {date}, {heure} pour les variables"
                rows={8}
                className="input-field resize-y"
                required
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Variables disponibles: {'{nom}'}, {'{date}'}, {'{heure}'}</span>
                <span>{formData.content.length} caractères</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button type="submit" className="btn-primary">
                <Save className="w-4 h-4" />
                {editingTemplate ? 'Sauvegarder' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des templates */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Templates existants ({templates.length})
        </h3>

        {templates.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              Aucun template
            </h4>
            <p className="text-gray-500 mb-4">
              Créez votre premier template pour commencer
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Créer un template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                {/* En-tête du template */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">
                      {template.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categories[template.category]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {categories[template.category]?.label || template.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(template.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleCopy(template.content)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Copier"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-gray-400 hover:text-whatsapp-primary hover:bg-green-50 rounded-lg transition-colors duration-200"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Contenu du template */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-700 text-sm line-clamp-4 whitespace-pre-wrap">
                    {template.content}
                  </p>
                </div>

                {/* Aperçu des variables */}
                {template.content.match(/{[^}]+}/g) && (
                  <div className="mt-3 text-xs text-gray-500">
                    Variables détectées: {template.content.match(/{[^}]+}/g).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;