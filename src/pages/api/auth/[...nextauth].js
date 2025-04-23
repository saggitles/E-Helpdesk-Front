import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "john@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add your authentication logic here
        // This is where you would validate against your database
        
        // Example implementation:
        // const res = await fetch("/your-api/auth", {
        //   method: 'POST',
        //   body: JSON.stringify(credentials),
        //   headers: { "Content-Type": "application/json" }
        // })
        // const user = await res.json()
        
        // For testing purposes, allow a demo user:
        if (credentials?.email === "demo@example.com" && credentials?.password === "password") {
          return {
            id: "1",
            name: "Demo User",
            email: "demo@example.com",
            roles: ["Guest"]
          }
        }
        
        // If you return null then the user won't be signed in
        return null
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Skip domain restriction for credentials login
      if (account.provider === "credentials") {
        return true;
      }
      
      // Domain restriction for Google login
      const allowedDomains = [
        "tolintelligence.com",
        "forkliftiq360.com",
        "collectiveintelligence.com.au",
        "ciiquk.com"
      ];
      
      if (user.email) {
        const domain = user.email.split('@')[1];
        if (allowedDomains.includes(domain)) {
          return true;
        }
        // Return a URL instead of false to redirect with custom error
        return '/login?error=DomainNotAllowed&email=' + encodeURIComponent(user.email);
      }
      return '/login?error=InvalidEmail';
    },
    // Other callbacks remain the same
  },
    

  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);