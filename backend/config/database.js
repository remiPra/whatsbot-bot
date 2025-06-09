const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const DB_PATH = process.env.DB_PATH || "./database.sqlite";

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error("❌ Erreur connexion DB:", err);
          reject(err);
        } else {
          console.log("✅ Base de données connectée");
          this.initTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async initTables() {
    const tables = [
      // Table des messages
      `CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_number TEXT NOT NULL,
                to_number TEXT,
                body TEXT NOT NULL,
                type TEXT DEFAULT 'received',
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                chat_id TEXT,
                contact_name TEXT,
                is_group BOOLEAN DEFAULT 0,
                media_type TEXT,
                status TEXT DEFAULT 'delivered'
            )`,

      // Table des contacts
      `CREATE TABLE IF NOT EXISTS contacts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                number TEXT UNIQUE NOT NULL,
                name TEXT,
                profile_pic TEXT,
                last_seen DATETIME,
                is_blocked BOOLEAN DEFAULT 0,
                is_favorite BOOLEAN DEFAULT 0,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

      // Table des groupes
      `CREATE TABLE IF NOT EXISTS groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                group_id TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                participants_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )`,

      // Table de configuration
      `CREATE TABLE IF NOT EXISTS config (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,

      // Table des templates de messages
      `CREATE TABLE IF NOT EXISTS message_templates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                usage_count INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
    ];

    for (const tableSQL of tables) {
      await this.run(tableSQL);
    }

    // Insérer la configuration par défaut
    await this.insertDefaultConfig();

    console.log("📊 Tables de base de données initialisées");
  }

  async insertDefaultConfig() {
    const defaultConfigs = [
      ["auto_reply", "true"],
      ["save_messages", "true"],
      ["admin_numbers", "[]"],
      ["bot_name", "WhatsApp Bot"],
      ["welcome_message", "Bonjour ! Comment puis-je vous aider ?"],
    ];

    for (const [key, value] of defaultConfigs) {
      await this.run(
        "INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)",
        [key, value]
      );
    }
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) console.error("Erreur fermeture DB:", err);
        else console.log("✅ Base de données fermée");
        resolve();
      });
    });
  }
}

// Instance globale
const database = new Database();

// Initialisation automatique
database.connect().catch(console.error);

module.exports = database;
