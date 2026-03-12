import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    // GitHub OAuth (requires GITHUB_ID and GITHUB_SECRET in env)
    GithubProvider({
      clientId: process.env.GITHUB_ID || '',
      clientSecret: process.env.GITHUB_SECRET || '',
    }),
    
    // Google OAuth (requires GOOGLE_ID and GOOGLE_SECRET in env)
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET || '',
    }),
    
    // Demo credentials for testing
    CredentialsProvider({
      name: 'Demo Account',
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'demo' },
        password: { label: 'Password', type: 'password', placeholder: 'demo' }
      },
      async authorize(credentials) {
        // Demo user - in production, verify against database
        if (credentials?.username === 'demo' && credentials?.password === 'demo') {
          return {
            id: '1',
            name: 'Demo User',
            email: 'demo@globalpulse.com',
          }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'global-pulse-secret-key-change-in-production',
})

export { handler as GET, handler as POST }
