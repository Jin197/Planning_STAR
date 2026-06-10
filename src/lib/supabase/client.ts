"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase cote navigateur.
 * Retourne null si les variables d'env ne sont pas configurees,
 * ce qui permet a l'app de tourner en mode "demo / preview" sans backend.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
