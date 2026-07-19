"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function usePersonas(projectId?: string) {
  const { user } = useAuth();
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPersonas = useCallback(async () => {
    if (!user || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/personas?projectId=${projectId}`, {
        headers: { "x-user-id": user.id },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch personas");
      }
      const data = await response.json();
      setPersonas(data.personas || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Error fetching personas:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    if (projectId && user) {
      fetchPersonas();
    }
  }, [projectId, user, fetchPersonas]);

  return {
    personas,
    loading,
    error,
    fetchPersonas,
  };
}
