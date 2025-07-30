const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function initDatabase() {
  try {
    console.log('Initializing database...')
    
    // Force la création de la table en utilisant une requête simple
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "crypto_favorites" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "symbol" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "userId" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Créer un index unique sur symbol + userId
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "crypto_favorites_symbol_userId_key" 
      ON "crypto_favorites"("symbol", "userId")
    `
    
    console.log('Database initialized successfully')
    
    // Test d'insertion
    const testFavorite = await prisma.cryptoFavorite.create({
      data: {
        id: 'test-' + Date.now(),
        symbol: 'BTC',
        name: 'Bitcoin',
        userId: 'test-user'
      }
    })
    
    console.log('Test favorite created:', testFavorite)
    
    // Supprimer le test
    await prisma.cryptoFavorite.delete({
      where: { id: testFavorite.id }
    })
    
    console.log('Test favorite deleted')
    
  } catch (error) {
    console.error('Database initialization failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

initDatabase()