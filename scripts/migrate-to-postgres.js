#!/usr/bin/env node

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const sqliteDbPath = path.join(process.cwd(), 'prisma', 'dev.db')

async function migrateFavorites() {
  console.log('🚀 Début de la migration SQLite → PostgreSQL')
  
  // Vérifier si la base SQLite existe
  if (!fs.existsSync(sqliteDbPath)) {
    console.log('ℹ️ Aucune base SQLite trouvée, migration ignorée')
    return
  }
  
  // Connexion à SQLite
  const sqlitePrisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${sqliteDbPath}`
      }
    }
  })
  
  // Connexion à PostgreSQL
  const postgresPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
  
  try {
    // Lire les données de SQLite
    console.log('📖 Lecture des favoris depuis SQLite...')
    const favorites = await sqlitePrisma.cryptoFavorite.findMany()
    console.log(`📊 ${favorites.length} favoris trouvés`)
    
    if (favorites.length === 0) {
      console.log('✅ Aucun favori à migrer')
      return
    }
    
    // Transférer vers PostgreSQL
    console.log('📝 Transfer vers PostgreSQL...')
    for (const favorite of favorites) {
      try {
        await postgresPrisma.cryptoFavorite.upsert({
          where: {
            symbol_userId: {
              symbol: favorite.symbol,
              userId: favorite.userId || 'anonymous'
            }
          },
          update: {
            name: favorite.name,
            updatedAt: new Date()
          },
          create: {
            id: favorite.id,
            symbol: favorite.symbol,
            name: favorite.name,
            userId: favorite.userId || 'anonymous',
            createdAt: favorite.createdAt,
            updatedAt: favorite.updatedAt
          }
        })
        console.log(`✅ Migré: ${favorite.name} (${favorite.symbol})`)
      } catch (error) {
        console.log(`⚠️ Déjà existant: ${favorite.name} (${favorite.symbol})`)
      }
    }
    
    console.log('🎉 Migration terminée avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    await sqlitePrisma.$disconnect()
    await postgresPrisma.$disconnect()
  }
}

// Exécuter la migration
migrateFavorites().catch(console.error)