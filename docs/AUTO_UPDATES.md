# 🔄 Système de Mises à Jour Automatiques

## Configuration des Mises à Jour Automatiques

### 1. **Publier sur GitHub Releases**

```bash
# Build et publier automatiquement
npm run electron:dist -- --publish=always
```

### 2. **Configuration package.json**
```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "votre-username",
        "repo": "Dashboard"
      }
    ]
  }
}
```

### 3. **Variables d'environnement**
```env
# Fichier .env
GH_TOKEN=votre_github_token_personnel
```

### 4. **Script de publication automatique**
```json
{
  "scripts": {
    "release": "npm run build && npm run electron:dist -- --publish=always",
    "release:draft": "npm run build && npm run electron:dist -- --publish=onTagOrDraft"
  }
}
```

## Comment ça marche

1. **Vous poussez** une nouvelle version sur GitHub
2. **GitHub Actions** (optionnel) build automatiquement
3. **Users reçoivent** une notification de mise à jour
4. **Installation** en 1 clic

## Configuration GitHub Token

1. Aller sur GitHub → Settings → Developer settings → Personal access tokens
2. Créer un token avec permissions `repo`
3. Ajouter `GH_TOKEN=votre_token` dans `.env`

## Test en Local

```bash
# Simuler une mise à jour
npm run electron:dev
# L'app vérifiera automatiquement les mises à jour au démarrage
```