import { getSession } from "next-auth/react";
import { Session } from "next-auth";

// Extend the Session type to include accessToken
declare module "next-auth" {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string | null;
    };
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await getSession();
  
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    "Content-Type": "application/json",
  };
  
  // Add authorization header if user is logged in
  if (session) {
    headers.Authorization = `Bearer ${session.user?.accessToken || ""}`;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}