const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const database = require('../config/database');

class WhatsAppService {
    constructor() {
        this.client = null;
        this.qrCode = null;
        this.isReady = false;
        this.stats = {
            messagesReceived: 0,
            messagesSent: 0,
            startTime: new Date(),
            lastActivity: null
        };
        this.autoReplyEnabled = true;
        this.messageTemplates = new Map();
        this.scheduledMessages = new Map();
    }

    // 🚀 INITIALISATION
    async initialize() {
        try {
            console.log('🤖 Initialisation du service WhatsApp...');
            
            // Charger la configuration depuis la DB
            await this.loadConfig();
            
            // Créer le client WhatsApp
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: './whatsapp-session'
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--single-process',
                        '--disable-gpu'
                    ]
                }
            });

            // Configuration des événements
            this.setupEventHandlers();
            
            // Démarrer le client
            await this.client.initialize();
            
        } catch (error) {
            console.error('❌ Erreur initialisation WhatsApp:', error);
            throw error;
        }
    }

    // 🎛️ CONFIGURATION DES ÉVÉNEMENTS
    setupEventHandlers() {
        // QR Code pour la première connexion
        this.client.on('qr', (qr) => {
            console.log('\n📱 QR CODE GÉNÉRÉ - Scannez avec WhatsApp:');
            qrcode.generate(qr, { small: true });
            
            this.qrCode = qr;
            
            // Diffuser le QR via Socket.io
            if (global.io) {
                global.io.emit('qr-code', { qr });
            }
        });

        // Client prêt
        this.client.on('ready', async () => {
            console.log('🎉 WhatsApp Client connecté !');
            this.isReady = true;
            this.qrCode = null;
            global.whatsappClient = this.client;
            
            try {
                // Récupérer les informations de base
                await this.syncContactsAndChats();
                
                // Diffuser l'état connecté
                if (global.io) {
                    global.io.emit('whatsapp-status', {
                        connected: true,
                        timestamp: new Date().toISOString()
                    });
                }
                
                // Charger les templates de messages
                await this.loadMessageTemplates();
                
                console.log('✅ Service WhatsApp prêt !');
                
            } catch (error) {
                console.error('❌ Erreur lors de l\'initialisation:', error);
            }
        });

        // Réception de messages
        this.client.on('message', async (msg) => {
            try {
                await this.handleIncomingMessage(msg);
            } catch (error) {
                console.error('❌ Erreur traitement message:', error);
            }
        });

        // Changement d'état
        this.client.on('change_state', (state) => {
            console.log('🔄 État WhatsApp:', state);
            
            if (global.io) {
                global.io.emit('whatsapp-state', { state });
            }
        });

        // Déconnexion
        this.client.on('disconnected', (reason) => {
            console.log('🔌 WhatsApp déconnecté:', reason);
            this.isReady = false;
            global.whatsappClient = null;
            
            if (global.io) {
                global.io.emit('whatsapp-status', {
                    connected: false,
                    reason,
                    timestamp: new Date().toISOString()
                });
            }
        });

        // Erreur d'authentification
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Échec authentification WhatsApp:', msg);
            
            if (global.io) {
                global.io.emit('auth-failure', { message: msg });
            }
        });
    }

    // 📨 GESTION DES MESSAGES ENTRANTS
    async handleIncomingMessage(msg) {
        // Ignorer ses propres messages
        if (msg.fromMe) return;

        this.stats.messagesReceived++;
        this.stats.lastActivity = new Date();

        const contact = await msg.getContact();
        const chat = await msg.getChat();
        
        // Sauvegarder le message en DB avec vérifications
        try {
            await this.saveMessage({
                from_number: msg.from || 'unknown',
                body: msg.body || '',
                type: 'received',
                chat_id: chat.id._serialized || null,
                contact_name: contact.pushname || contact.name || null,
                is_group: chat.isGroup || false,
                media_type: msg.hasMedia ? msg.type : null
            });
        } catch (error) {
            console.error('❌ Erreur sauvegarde message:', error);
        }

        // Diffuser le message via Socket.io
        if (global.io) {
            global.io.emit('new-message', {
                id: msg.id._serialized,
                from: msg.from,
                body: msg.body,
                timestamp: msg.timestamp,
                contact: {
                    name: contact.pushname || contact.name,
                    number: contact.number
                },
                chat: {
                    name: chat.name,
                    isGroup: chat.isGroup
                }
            });
        }

        // Traiter les commandes et réponses automatiques
        if (this.autoReplyEnabled) {
            await this.processAutoReply(msg);
        }

        console.log(`📨 Message reçu de ${contact.name || msg.from}: ${msg.body}`);
    }

    // 🤖 RÉPONSES AUTOMATIQUES
    async processAutoReply(msg) {
        const content = msg.body.toLowerCase().trim();
        const contact = await msg.getContact();
        
        // Commandes spéciales
        if (content === 'ping') {
            await this.sendMessage(msg.from, '🏓 Pong ! Bot actif.');
            return;
        }

        if (content === 'aide' || content === 'help') {
            const helpMessage = `🤖 COMMANDES DISPONIBLES:

📌 GÉNÉRALES:
- ping - Test du bot
- aide - Cette aide
- heure - Heure actuelle
- info - Info du chat
- joke - Blague aléatoire

⚙️ UTILITAIRES:
- météo [ville] - Météo
- citation - Citation inspirante
- template [nom] - Utiliser un template`;

            await this.sendMessage(msg.from, helpMessage);
            return;
        }

        if (content === 'heure') {
            const now = new Date().toLocaleString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            await this.sendMessage(msg.from, `🕐 ${now}`);
            return;
        }

        if (content === 'info') {
            const chat = await msg.getChat();
            let info = `ℹ️ INFORMATIONS:\n\n`;
            info += `📛 Nom: ${chat.name || 'Chat privé'}\n`;
            info += `🆔 ID: ${chat.id._serialized}\n`;
            info += `👥 Type: ${chat.isGroup ? 'Groupe' : 'Privé'}\n`;
            
            if (chat.isGroup) {
                info += `👨‍👩‍👧‍👦 Participants: ${chat.participants.length}`;
            }
            
            await this.sendMessage(msg.from, info);
            return;
        }

        if (content === 'joke') {
            const jokes = [
                "Pourquoi les plongeurs plongent-ils toujours en arrière ? Parce que sinon, ils tombent dans le bateau ! 😂",
                "Que dit un escargot quand il croise une limace ? 'Regarde, un nudiste !' 🐌",
                "Comment appelle-t-on un chat tombé dans un pot de peinture ? Un chat-mallow ! 🎨",
            ];
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            await this.sendMessage(msg.from, randomJoke);
            return;
        }

        if (content === 'citation') {
            const quotes = [
                "La vie est comme une bicyclette, il faut avancer pour ne pas perdre l'équilibre. - Einstein",
                "Le succès, c'est tomber sept fois et se relever huit. - Proverbe japonais",
                "L'avenir appartient à ceux qui croient à la beauté de leurs rêves. - Eleanor Roosevelt"
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            await this.sendMessage(msg.from, `💫 ${randomQuote}`);
            return;
        }

        // Templates personnalisés
        if (content.startsWith('template ')) {
            const templateName = content.replace('template ', '').trim();
            const template = this.messageTemplates.get(templateName);
            
            if (template) {
                await this.sendMessage(msg.from, template.content);
                // Incrémenter le compteur d'usage
                try {
                    await database.run(
                        'UPDATE message_templates SET usage_count = usage_count + 1 WHERE name = ?',
                        [templateName]
                    );
                } catch (error) {
                    console.error('❌ Erreur mise à jour template:', error);
                }
            } else {
                await this.sendMessage(msg.from, `❌ Template "${templateName}" non trouvé.`);
            }
            return;
        }

        // Salutations automatiques
        if (content.includes('bonjour') || content.includes('salut') || content.includes('hello')) {
            const welcomeMsg = await this.getConfigValue('welcome_message');
            await this.sendMessage(msg.from, `👋 ${welcomeMsg || 'Bonjour ! Comment puis-je vous aider ?'}`);
            return;
        }

        // Remerciements
        if (content.includes('merci') || content.includes('thank you')) {
            await this.sendMessage(msg.from, '😊 De rien ! N\'hésitez pas si vous avez besoin d\'aide.');
            return;
        }
    }

    // 📤 ENVOYER UN MESSAGE
    async sendMessage(to, content, options = {}) {
        try {
            if (!this.isReady) {
                throw new Error('Client WhatsApp non connecté');
            }

            const chatId = to.includes('@') ? to : `${to}@c.us`;
            const message = await this.client.sendMessage(chatId, content, options);
            
            this.stats.messagesSent++;
            this.stats.lastActivity = new Date();

            // Sauvegarder en DB
            try {
                await this.saveMessage({
                    from_number: 'bot',
                    to_number: to,
                    body: content,
                    type: 'sent',
                    chat_id: chatId,
                    status: 'sent'
                });
            } catch (error) {
                console.error('❌ Erreur sauvegarde message envoyé:', error);
            }

            // Diffuser via Socket.io
            if (global.io) {
                global.io.emit('message-sent', {
                    to,
                    content,
                    timestamp: new Date().toISOString(),
                    messageId: message.id._serialized
                });
            }

            console.log(`📤 Message envoyé à ${to}: ${content}`);
            return message;

        } catch (error) {
            console.error('❌ Erreur envoi message:', error);
            throw error;
        }
    }

    // 📎 ENVOYER UN MÉDIA
    async sendMedia(to, mediaPath, caption = '') {
        try {
            if (!this.isReady) {
                throw new Error('Client WhatsApp non connecté');
            }

            const media = MessageMedia.fromFilePath(mediaPath);
            const chatId = to.includes('@') ? to : `${to}@c.us`;
            
            const message = await this.client.sendMessage(chatId, media, { caption });
            
            this.stats.messagesSent++;
            
            console.log(`📎 Média envoyé à ${to}`);
            return message;

        } catch (error) {
            console.error('❌ Erreur envoi média:', error);
            throw error;
        }
    }

    // 👥 RÉCUPÉRER LES CONTACTS (VERSION CORRIGÉE)
    async getContacts() {
        try {
            if (!this.isReady) return [];
            
            const contacts = await this.client.getContacts();
            return contacts
                .filter(contact => {
                    // Filtrer les contacts qui ont un numéro valide
                    return contact.number && 
                           contact.number.trim() !== '' && 
                           /\d/.test(contact.number); // Au moins un chiffre
                })
                .map(contact => ({
                    id: contact.id._serialized,
                    name: contact.name || contact.pushname || null,
                    number: contact.number.trim(),
                    isMyContact: contact.isMyContact,
                    profilePicUrl: contact.profilePicUrl || null
                }));
        } catch (error) {
            console.error('❌ Erreur récupération contacts:', error);
            return [];
        }
    }

    // 💬 RÉCUPÉRER LES CHATS
    async getChats() {
        try {
            if (!this.isReady) return [];
            
            const chats = await this.client.getChats();
            return chats.map(chat => ({
                id: chat.id._serialized,
                name: chat.name || 'Chat sans nom',
                isGroup: chat.isGroup || false,
                participantsCount: chat.isGroup ? (chat.participants ? chat.participants.length : 0) : 1,
                lastMessage: chat.lastMessage ? {
                    body: chat.lastMessage.body || '',
                    timestamp: chat.lastMessage.timestamp
                } : null,
                unreadCount: chat.unreadCount || 0
            }));
        } catch (error) {
            console.error('❌ Erreur récupération chats:', error);
            return [];
        }
    }

    // 📊 SYNCHRONISER CONTACTS ET CHATS (VERSION CORRIGÉE)
    async syncContactsAndChats() {
        try {
            console.log('🔄 Synchronisation des contacts et chats...');
            
            const contacts = await this.getContacts();
            const chats = await this.getChats();
            
            // Sauvegarder les contacts avec vérifications
            let contactsSaved = 0;
            for (const contact of contacts) {
                // Double vérification du numéro
                if (!contact.number || contact.number.trim() === '' || !/\d/.test(contact.number)) {
                    console.log(`⚠️ Contact ignoré (numéro invalide): ${contact.name || contact.id}`);
                    continue;
                }

                try {
                    await database.run(`
                        INSERT OR REPLACE INTO contacts 
                        (number, name, profile_pic, last_seen) 
                        VALUES (?, ?, ?, ?)
                    `, [
                        contact.number,
                        contact.name || 'Contact sans nom',
                        contact.profilePicUrl,
                        new Date().toISOString()
                    ]);
                    contactsSaved++;
                } catch (error) {
                    console.error(`❌ Erreur sauvegarde contact ${contact.name || contact.number}:`, error.message);
                }
            }

            // Sauvegarder les groupes avec vérifications
            const groups = chats.filter(chat => chat.isGroup);
            let groupsSaved = 0;
            for (const group of groups) {
                if (!group.id) {
                    console.log(`⚠️ Groupe ignoré (pas d'ID): ${group.name}`);
                    continue;
                }

                try {
                    await database.run(`
                        INSERT OR REPLACE INTO groups 
                        (group_id, name, participants_count) 
                        VALUES (?, ?, ?)
                    `, [
                        group.id,
                        group.name,
                        group.participantsCount
                    ]);
                    groupsSaved++;
                } catch (error) {
                    console.error(`❌ Erreur sauvegarde groupe ${group.name}:`, error.message);
                }
            }

            console.log(`✅ ${contactsSaved}/${contacts.length} contacts et ${groupsSaved}/${groups.length} groupes synchronisés`);
            
        } catch (error) {
            console.error('❌ Erreur synchronisation:', error.message);
            // Ne pas faire planter le service
        }
    }

    // 💾 SAUVEGARDER UN MESSAGE (VERSION CORRIGÉE)
    async saveMessage(messageData) {
        try {
            // Vérifications des données obligatoires
            const fromNumber = messageData.from_number || 'unknown';
            const body = messageData.body || '';
            const type = messageData.type || 'unknown';
            
            await database.run(`
                INSERT INTO messages 
                (from_number, to_number, body, type, chat_id, contact_name, is_group, media_type, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                fromNumber,
                messageData.to_number || null,
                body,
                type,
                messageData.chat_id || null,
                messageData.contact_name || null,
                messageData.is_group ? 1 : 0,
                messageData.media_type || null,
                messageData.status || 'delivered'
            ]);
        } catch (error) {
            console.error('❌ Erreur sauvegarde message:', error.message);
            // Ne pas faire planter pour ça
        }
    }

    // 📝 CHARGER LES TEMPLATES
    async loadMessageTemplates() {
        try {
            const templates = await database.all('SELECT * FROM message_templates');
            this.messageTemplates.clear();
            
            templates.forEach(template => {
                this.messageTemplates.set(template.name, template);
            });
            
            console.log(`📝 ${templates.length} templates de messages chargés`);
        } catch (error) {
            console.error('❌ Erreur chargement templates:', error);
        }
    }

    // ⚙️ CONFIGURATION
    async loadConfig() {
        try {
            const autoReply = await database.get('SELECT value FROM config WHERE key = ?', ['auto_reply']);
            this.autoReplyEnabled = autoReply ? autoReply.value === 'true' : true;
            
            console.log(`⚙️ Configuration chargée - Auto-reply: ${this.autoReplyEnabled}`);
        } catch (error) {
            console.error('❌ Erreur chargement config:', error);
        }
    }

    async getConfigValue(key) {
        try {
            const result = await database.get('SELECT value FROM config WHERE key = ?', [key]);
            return result ? result.value : null;
        } catch (error) {
            console.error('❌ Erreur récupération config:', error);
            return null;
        }
    }

    async setConfigValue(key, value) {
        try {
            await database.run(
                'INSERT OR REPLACE INTO config (key, value, updated_at) VALUES (?, ?, ?)',
                [key, value, new Date().toISOString()]
            );
        } catch (error) {
            console.error('❌ Erreur sauvegarde config:', error);
        }
    }

    // 📊 STATISTIQUES
    getStats() {
        return {
            ...this.stats,
            isConnected: this.isReady,
            uptime: Date.now() - this.stats.startTime.getTime()
        };
    }

    // 🔌 DÉCONNEXION
    async disconnect() {
        try {
            if (this.client) {
                await this.client.destroy();
                console.log('✅ Client WhatsApp déconnecté');
            }
        } catch (error) {
            console.error('❌ Erreur déconnexion:', error);
        }
    }

    // 📱 GETTERS
    getQRCode() {
        return this.qrCode;
    }

    isConnected() {
        return this.isReady;
    }

    getClient() {
        return this.client;
    }
}

// Instance unique (Singleton)
const whatsappService = new WhatsAppService();

module.exports = whatsappService;