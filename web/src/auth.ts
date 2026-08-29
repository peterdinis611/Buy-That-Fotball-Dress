import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { login } from "@/lib/api/auth";

class InvalidCredentials extends CredentialsSignin {
  code = "invalid_credentials";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 72 * 60 * 60,
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "").trim();
        const password = String(credentials?.password ?? "");
        if (!username || !password) throw new InvalidCredentials();

        try {
          const user = await login(username, password);
          if (!user?.token) throw new InvalidCredentials();

          return {
            id: user.id,
            email: user.email,
            name: user.displayName || user.username,
            username: user.username,
            displayName: user.displayName,
            accessToken: user.token,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) throw error;
          throw new InvalidCredentials();
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.username = user.username;
        token.displayName = user.displayName;
        token.email = user.email;
      }
      return token;
    },
    session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.sub ?? "";
      session.user.username = token.username ?? "";
      session.user.displayName = token.displayName ?? session.user.name ?? "";
      session.user.email = token.email ?? "";
      return session;
    },
  },
});
