"use client";

import { useState, useCallback } from "react";
import { ApiClient } from "@/lib/api-client";
import { Insight } from "@/types";

export function useInsights(projectId: string) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (filters?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ projectId, ...filters });
      const response = await ApiClient.get<Insight[]>(`/insights?${queryParams.toString()}`);
      if (response.success && response.data) {
        setInsights(response.data);
      } else {
        setError(response.error || "Failed to fetch insights");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  return {
    insights,
    loading,
    error,
    fetchInsights,
  };
}
