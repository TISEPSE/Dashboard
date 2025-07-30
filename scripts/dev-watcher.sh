#!/bin/bash

# Script de surveillance pour redémarrer automatiquement en cas de plantage
echo "🔄 Démarrage du watcher Next.js avec auto-recovery..."

while true; do
    echo "🚀 Lancement du serveur Next.js..."
    
    # Nettoyer le cache avant chaque démarrage
    rm -rf .next 2>/dev/null || true
    
    # Démarrer Next.js
    npm run dev
    
    # Si le processus se termine, attendre un peu et nettoyer
    echo "⚠️  Serveur arrêté. Nettoyage et redémarrage dans 3 secondes..."
    sleep 3
    
    # Tuer tous les processus Next.js qui pourraient trainer
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "next-server" 2>/dev/null || true
    
    # Nettoyer les caches
    rm -rf .next
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf .turbo 2>/dev/null || true
    
    echo "🧹 Cache nettoyé, redémarrage..."
done