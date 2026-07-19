"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useOpportunities(projectId?: string) {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async () => {
    if (!user || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/opportunities?projectId=${projectId}`, {
        headers: { "x-user-id": user.id },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch opportunities");
      }
      const data = await response.json();
      setOpportunities(data.opportunities || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Error fetching opportunities:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  useEffect(() => {
    if (projectId && user) {
      fetchOpportunities();
    }
  }, [projectId, user, fetchOpportunities]);

  return {
    opportunities,
    loading,
    error,
    fetchOpportunities,
  };
}
