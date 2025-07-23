import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      try {
        if (account) {
          console.log('🔑 Token reçu:', { 
            access_token: account.access_token ? 'Présent' : 'Absent',
            refresh_token: account.refresh_token ? 'Présent' : 'Absent',
            scope: account.scope 
          })
          token.accessToken = account.access_token
          token.refreshToken = account.refresh_token
          token.accessTokenExpires = account.expires_at
        }
        if (user) {
          token.id = user.id
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
        
        console.log('📋 Session créée:', {
          accessToken: session.accessToken ? 'Présent' : 'Absent',
          userId: session.user.id,
          expires: session.accessTokenExpires
        })
        
        return session
      } catch (error) {
        console.error("Session callback error:", error)
        return session
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-key",
  debug: false, // Désactive les logs de debug
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }
