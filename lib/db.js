import { sql } from '@vercel/postgres'
import { PrismaClient } from '@prisma/client'

// Configuration pour Vercel Postgres
export { sql }

// Prisma client avec configuration cloud
const globalForPrisma = globalThis

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Fonction pour initialiser la base de données
export async function initDatabase() {
  try {
    // Vérifier la connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base PostgreSQL réussie')
    
    // Créer les tables si elles n'existent pas
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "crypto_favorites" (
        "id" TEXT NOT NULL,
        "symbol" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "userId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "crypto_favorites_pkey" PRIMARY KEY ("id")
      );
    `
    
    // Créer l'index unique
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "crypto_favorites_symbol_userId_key" 
      ON "crypto_favorites"("symbol", "userId");
    `
    
    console.log('✅ Tables créées avec succès')
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base:', error)
  } finally {
    await prisma.$disconnect()
  }
}