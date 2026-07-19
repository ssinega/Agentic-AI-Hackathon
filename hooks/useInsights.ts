"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useInsights(projectId?: string) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(
    async (filters?: Record<string, any>) => {
      if (!user || !projectId) return;
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({ projectId, ...filters });
        const response = await fetch(`/api/insights?${queryParams.toString()}`, {
          headers: { "x-user-id": user.id },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch insights");
        }
        const data = await response.json();
        setInsights(data.insights || []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred";
        setError(errorMsg);
        console.error("Error fetching insights:", errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [user, projectId]
  );

  useEffect(() => {
    if (projectId && user) {
      fetchInsights();
    }
  }, [projectId, user, fetchInsights]);

  return {
    insights,
    loading,
    error,
    fetchInsights,
  };
}
