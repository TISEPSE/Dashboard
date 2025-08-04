# Configuration Google OAuth pour Dashboard

## 🔧 Configuration Google Cloud Console

### 1. Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Nommez-le "Dashboard" ou un nom de votre choix

### 2. Activer les APIs nécessaires
1. Navigation → APIs & Services → Library
2. Activez les APIs suivantes :
   - **Google+ API** (pour l'authentification)
   - **Google Calendar API** (pour le calendrier)
   - **Google Fit API** (pour les données de santé)

### 3. Configurer l'écran de consentement OAuth
1. Navigation → APIs & Services → OAuth consent screen
2. Choisissez "External" si vous n'avez pas de domaine Google Workspace
3. Remplissez les informations :
   - **App name** : Dashboard
   - **User support email** : votre email
   - **Developer contact** : votre email
4. **Scopes** : Ajoutez les scopes nécessaires :
   ```
   openid
   email
   profile
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/fitness.activity.read
   https://www.googleapis.com/auth/fitness.body.read
   https://www.googleapis.com/auth/fitness.location.read
   https://www.googleapis.com/auth/fitness.heart_rate.read
   https://www.googleapis.com/auth/fitness.sleep.read
   ```

### 4. Créer les identifiants OAuth 2.0
1. Navigation → APIs & Services → Credentials
2. Cliquez "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type : **Web application**
4. Name : "Dashboard Web Client"
5. **Authorized JavaScript origins** :
   ```
   http://localhost:3000
   ```
6. **Authorized redirect URIs** :
   ```
   http://localhost:3000/api/auth/google
   ```

### 5. Récupérer les clés
Après création, vous obtiendrez :
- **Client ID** : `1021413974264-xxxxxxxx.apps.googleusercontent.com`
- **Client Secret** : `GOCSPX-xxxxxxxx`

### 6. Mettre à jour .env.local
```env
GOOGLE_CLIENT_ID=1021413974264-a24448s2or14o72r4fbf71sj6ejo0c6l.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-nextauth-key-for-dashboard-app-2024
```

### 7. Pour la production
Quand vous déployez en production, ajoutez aussi :
- **JavaScript origins** : `https://votre-domaine.com`
- **Redirect URIs** : `https://votre-domaine.com/api/auth/google`

## ⚠️ Erreurs courantes

### redirect_uri_mismatch
- Vérifiez que l'URL dans Google Cloud Console correspond exactement
- Pas de slash final dans l'URL
- Protocole correct (http pour dev, https pour prod)

### access_denied
- Vérifiez que l'app est en mode "External"
- Ajoutez votre email dans les "Test users" si en mode "Testing"

### invalid_client
- Vérifiez que le GOOGLE_CLIENT_ID est correct
- Vérifiez que le domaine est autorisé