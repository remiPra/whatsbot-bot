const express = require('express');
const router = express.Router();

// POST /api/messages/send
router.post('/send', async (req, res) => {
  try {
    const { to, message } = req.body;
    
    console.log(`📤 Tentative d'envoi vers: ${to}`);
    console.log(`💬 Message: ${message}`);
    
    // Vérifier que WhatsApp est connecté
    if (!global.whatsappClient || !global.whatsappClient.info) {
      console.error('❌ WhatsApp non connecté');
      return res.status(503).json({
        success: false,
        message: 'WhatsApp non connecté'
      });
    }
    
    // Formater le numéro (important !)
    let phoneNumber = to.replace(/\D/g, ''); // Garder que les chiffres
    if (!phoneNumber.startsWith('33')) {
      phoneNumber = '33' + phoneNumber.substring(1); // Remplacer 0 par 33
    }
    phoneNumber = phoneNumber + '@c.us'; // Format WhatsApp
    
    console.log(`📱 Numéro formaté: ${phoneNumber}`);
    
    // Envoyer le message
    const result = await global.whatsappClient.sendMessage(phoneNumber, message);
    
    console.log('✅ Message envoyé avec succès:', result);
    
    res.json({
      success: true,
      message: 'Message envoyé avec succès',
      messageId: result.id
    });
    
  } catch (error) {
    console.error('❌ Erreur envoi message:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message',
      error: error.message
    });
  }
});

module.exports = router;