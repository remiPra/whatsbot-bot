const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes de base
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API WhatsApp Bot operationnelle !',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Test des routes une par une
try {
    console.log('🔄 Chargement des routes...');
    
    // Charger messages
    const messagesRoutes = require('./routes/messages');
    app.use('/api/messages', messagesRoutes);
    console.log('✅ Routes messages chargees');
    
    // Charger contacts
    const contactsRoutes = require('./routes/contacts');
    app.use('/api/contacts', contactsRoutes);
    console.log('✅ Routes contacts chargees');
    
    // Charger stats
    const statsRoutes = require('./routes/stats');
    app.use('/api/stats', statsRoutes);
    console.log('✅ Routes stats chargees');
    
} catch (error) {
    console.error('❌ Erreur chargement routes:', error.message);
    console.log('🔧 Utilisation du mode degrade sans routes...');
}

// Route de test simple
app.post('/api/test/send', (req, res) => {
    const { number, message } = req.body;
    
    if (!number || !message) {
        return res.status(400).json({
            error: 'Paramètres manquants',
            required: ['number', 'message']
        });
    }

    res.json({
        success: true,
        message: 'Test OK ! (WhatsApp pas encore connecte)',
        data: { to: number, content: message }
    });
});

// 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route non trouvee',
        path: req.originalUrl,
        availableRoutes: [
            'GET /api/health',
            'POST /api/test/send',
            'GET /api/messages/test',
            'GET /api/contacts/test',
            'GET /api/stats/test'
        ]
    });
});

// Gestion d'erreurs
app.use((error, req, res, next) => {
    console.error('❌ Erreur serveur:', error);
    res.status(500).json({
        error: 'Erreur interne',
        message: error.message
    });
});

// Demarrage
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`\n🌟 SERVEUR DeMARRe !`);
    console.log(`🌐 API: http://localhost:${PORT}`);
    console.log(`🔍 Test: http://localhost:${PORT}/api/health`);
    console.log(`📱 Routes test:`);
    console.log(`   - GET  /api/messages/test`);
    console.log(`   - GET  /api/contacts/test`);
    console.log(`   - GET  /api/stats/test`);
    console.log(`   - POST /api/test/send\n`);
});

module.exports = app;