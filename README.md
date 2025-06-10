# WhatsBot-Bot

Ce dépôt contient un bot WhatsApp avec une API Node.js/Express et une interface web React.

## Fonctionnalités principales

- Connexion à WhatsApp via la librairie **whatsapp-web.js** pour envoyer et recevoir des messages
- Endpoints REST (`/api/messages`, `/api/contacts`, `/api/stats`) exposés par Express
- Réponses automatiques simples et commande `ping`, `aide`, etc.
- Stockage des messages et de la configuration dans une base SQLite
- Interface utilisateur développée avec React, Vite et Tailwind CSS

## Installation rapide

```bash
# Backend
cd backend
npm install
npm run dev   # ou npm start
```

```bash
# Frontend
cd whatsapp-bot-frontend
npm install
npm run dev
```

Accédez ensuite à `http://localhost:5173` (par défaut) pour l’interface.

## Structure du dépôt

- `backend/` – code serveur Express, base de données SQLite et connexion WhatsApp
- `whatsapp-bot-frontend/` – application React utilisant Vite et Tailwind CSS

## Configuration

Les données SQLite sont créées automatiquement (`./database.sqlite`). Les sessions WhatsApp sont stockées dans `backend/whatsapp-session`.

## Scripts utiles

- **Backend** – `npm run dev` démarre le serveur avec nodemon
- **Frontend** – `npm run dev` lance le serveur de développement Vite

## Licence

Ce projet est fourni sans licence spécifique.
