const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Fixing Prisma client configuration...');

// Supprimer le dossier .prisma généré
const prismaClientPath = path.join(__dirname, 'node_modules', '.prisma');
if (fs.existsSync(prismaClientPath)) {
  console.log('📁 Removing old Prisma client...');
  fs.rmSync(prismaClientPath, { recursive: true, force: true });
}

// Supprimer le cache Next.js
const nextPath = path.join(__dirname, '.next');
if (fs.existsSync(nextPath)) {
  console.log('📁 Removing Next.js cache...');
  fs.rmSync(nextPath, { recursive: true, force: true });
}

console.log('✅ Cleanup completed!');
console.log('📝 Now run: npm run db:generate');