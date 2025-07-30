#!/bin/bash

# Script pour nettoyer le cache Next.js et démarrer proprement
echo "🧹 Nettoyage du cache Next.js..."

# Arrêter tous les processus Next.js en cours
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Supprimer les dossiers de cache
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo

echo "✅ Cache nettoyé"

# Attendre un peu pour s'assurer que tout est fermé
sleep 2

echo "🚀 Démarrage du serveur de développement..."
npm run dev