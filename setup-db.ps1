#!/usr/bin/env pwsh

# Script pour configurer la base de données SQLite

Write-Host "Génération du client Prisma..."
npx prisma generate

Write-Host "Création de la base de données SQLite..."
npx prisma db push

Write-Host "Configuration terminée!"