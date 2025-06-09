// routes/contacts.js
const express = require('express');
const router = express.Router();

// GET /api/contacts - Récupérer tous les contacts
router.get('/', async (req, res) => {
  try {
    // Vérifier que WhatsApp est connecté
    if (!global.whatsappClient || !global.whatsappClient.info) {
      return res.status(503).json({
        success: false,
        message: 'WhatsApp non connecté'
      });
    }

    // Récupérer les contacts depuis WhatsApp
    const contacts = await global.whatsappClient.getContacts();
    
    // Filtrer et formater les contacts
    const formattedContacts = contacts
      .filter(contact => contact.isMyContact || contact.name) // Garder seulement les vrais contacts
      .map(contact => ({
        id: contact.id._serialized,
        name: contact.name || contact.pushname || contact.verifiedName,
        phone: contact.number,
        pushname: contact.pushname,
        isMyContact: contact.isMyContact,
        profilePicUrl: contact.profilePicUrl,
        isGroup: contact.isGroup,
        isWAContact: contact.isWAContact
      }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Trier par nom

    console.log(`📋 ${formattedContacts.length} contacts retournés sur ${contacts.length} total`);

    res.json({
      success: true,
      contacts: formattedContacts, // ← Important : "contacts" pas "data"
      total: formattedContacts.length,
      message: `${formattedContacts.length} contacts trouvés`
    });

  } catch (error) {
    console.error('❌ Erreur récupération contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contacts',
      error: error.message
    });
  }
});

module.exports = router;