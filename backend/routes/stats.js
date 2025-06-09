const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: 'Stats route OK!' });
});

router.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            totals: { messages: 0, contacts: 0 },
            whatsapp: { connected: false }
        },
        message: 'Endpoint stats OK'
    });
});

module.exports = router;