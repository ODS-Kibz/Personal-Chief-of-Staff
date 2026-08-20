import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        grant_type: "refresh_token",
        refresh_token: String(token.refreshToken ?? ""),
      }),
    });
    const refreshed = await response.json() as { access_token?: string; expires_in?: number; refresh_token?: string };
    if (!response.ok || !refreshed.access_token) throw new Error("Google token refresh failed");
    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + (refreshed.expires_in ?? 3600) * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = account.expires_at ? account.expires_at * 1000 : Date.now() + 3600 * 1000;
        token.refreshToken = account.refresh_token;
        return token;
      }
      if (Date.now() < Number(token.accessTokenExpires ?? 0) - 60_000) return token;
      if (!token.refreshToken) return { ...token, error: "RefreshAccessTokenError" };
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      (session as typeof session & { accessToken?: string }).accessToken = token.accessToken as string | undefined;
      (session as typeof session & { authError?: string }).authError = token.error as string | undefined;
      return session;
    },
  },
};
