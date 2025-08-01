import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Fonction pour rafraîchir le token d'accès
async function refreshAccessToken(token) {
  try {
    const url = "https://oauth2.googleapis.com/token"
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      console.error('❌ Erreur rafraîchissement token:', refreshedTokens)
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Garder l'ancien si pas de nouveau
    }
  } catch (error) {
    console.error('❌ Impossible de rafraîchir le token:', error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.location.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.sleep.read https://www.googleapis.com/auth/fitness.oxygen_saturation.read https://www.googleapis.com/auth/fitness.body_temperature.read",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      try {
        // Connexion initiale
        if (account) {
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.accessTokenExpires = account.expires_at * 1000 // Convertir en millisecondes
        }
        if (user) {
          token.id = user.id
        }

        // Vérifier si le token doit être rafraîchi
        if (Date.now() < token.accessTokenExpires) {
          return token
        }

        // Token expiré, essayer de le rafraîchir
        if (token.refreshToken) {
          return await refreshAccessToken(token)
        }

        return token
      } catch (error) {
        console.error("JWT callback error:", error)
        return token
      }
    },
    async session({ session, token }) {
      try {
        session.accessToken = token.accessToken
        session.refreshToken = token.refreshToken
        session.accessTokenExpires = token.accessTokenExpires
        session.user.id = token.sub || token.id
        session.error = token.error
        
        
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: {
    error: '/auth/error', // Page d'erreur personnalisée
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }
