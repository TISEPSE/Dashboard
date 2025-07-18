# Configuration Neon PostgreSQL

## Étapes pour configurer votre base de données Neon :

### 1. Récupérer l'URL de connexion Neon
- Connectez-vous à votre console Neon (https://console.neon.tech)
- Sélectionnez votre projet
- Allez dans "Connection String"
- Copiez l'URL qui ressemble à :
  ```
  postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```

### 2. Configurer les variables d'environnement

#### Pour le développement local (.env.local) :
```bash
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

#### Pour Vercel :
- Allez sur votre projet Vercel
- Settings > Environment Variables
- Ajoutez :
  - `DATABASE_URL` avec votre URL Neon
  - `POSTGRES_PRISMA_URL` avec votre URL Neon (si nécessaire)

### 3. Synchroniser le schéma avec Neon
```bash
npx prisma db push
```

### 4. Vérifier la connexion
```bash
npx prisma studio
```

## Troubleshooting

Si vous avez des erreurs de connexion :
1. Vérifiez que l'URL est correcte
2. Assurez-vous que `sslmode=require` est présent
3. Vérifiez que votre IP est autorisée (Neon autorise toutes les IPs par défaut)
4. Redémarrez votre serveur Next.js après avoir changé les variables d'environnement