# 🔍 Comment trouver votre URL de connexion Neon

## Méthode 1 : Via la console Neon (le plus simple)

### Étape 1 : Accéder à Neon
1. Allez sur **https://console.neon.tech**
2. Connectez-vous avec votre compte

### Étape 2 : Sélectionner votre projet
1. Sur la page d'accueil, cliquez sur votre projet (probablement nommé quelque chose comme "dashboard" ou similaire)

### Étape 3 : Trouver la chaîne de connexion
Dans votre projet, cherchez l'une de ces sections :
- **"Connection Details"**
- **"Connection String"** 
- **"Database"** 
- **"Connect"**
- Un onglet avec un icône de prise/plug 🔌

### Étape 4 : Copier l'URL
Vous devriez voir quelque chose comme :
```
postgresql://username:password@ep-something-something.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Méthode 2 : Via Vercel (si déjà configuré)

### Étape 1 : Accéder à Vercel
1. Allez sur **https://vercel.com**
2. Connectez-vous et sélectionnez votre projet "dashboard"

### Étape 2 : Variables d'environnement
1. Cliquez sur **Settings** (en haut)
2. Dans le menu de gauche, cliquez sur **Environment Variables**
3. Cherchez une variable nommée :
   - `DATABASE_URL`
   - `POSTGRES_URL`
   - `NEON_DATABASE_URL`

## Méthode 3 : Via l'onglet Database dans Neon

1. Dans votre console Neon, cherchez un onglet **"Dashboard"** ou **"Database"**
2. Il devrait y avoir une section **"Connection string"** ou **"Connect to your database"**
3. Parfois c'est dans un bouton **"Connect"** ou **"Connection details"**

## Si vous ne trouvez toujours pas :

### Screenshot de ce que vous voyez
Envoyez-moi une capture d'écran de votre console Neon, je pourrai vous guider plus précisément !

### Cherchez ces mots-clés sur la page :
- "Connection"
- "Connect" 
- "Database URL"
- "psql"
- "postgresql://"

## Une fois trouvé :
Copiez l'URL complète et remplacez-la dans votre fichier `.env.local` :
```bash
DATABASE_URL="VOTRE_URL_ICI"
```