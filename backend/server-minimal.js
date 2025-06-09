const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ success: true, message: 'Server OK' });
});

// Tout ce qui marche déjà
const messagesRoutes = require('./routes/messages');
const contactsRoutes = require('./routes/contacts');
const statsRoutes = require('./routes/stats');
const cors = require('cors');
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// JSON
app.use(express.json());
app.use('/api/messages', messagesRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/stats', statsRoutes);
// CORS - À placer AVANT toutes les autres routes
// AUTORISER ABSOLUMENT TOUT !!!

const database = require('./config/database');
const whatsappService = require('./services/whatsappService');

console.log('✅ Tout chargé - maintenant test du serveur...');

app.listen(3001, async () => {
    console.log('🚀 Serveur démarré sur http://localhost:3001');
    
    // TEST 4C : Initialiser WhatsApp APRÈS le démarrage du serveur
    console.log('🔄 Test initialisation WhatsApp...');
    try {
        await whatsappService.initialize();
        console.log('✅ WhatsApp initialisé avec succès !');
    } catch (error) {
        console.error('❌ Erreur initialisation WhatsApp:', error.message);
        console.error('Stack complet:', error.stack);
    }
});