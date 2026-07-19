"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, getSession } from "@/lib/auth";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error fetching user");
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  return { user, loading, error };
}

export function useSession() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSessionData() {
      try {
        const sess = await getSession();
        setSession(sess);
      } finally {
        setLoading(false);
      }
    }

    getSessionData();
  }, []);

  return { session, loading };
}
