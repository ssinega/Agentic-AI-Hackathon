"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useReports(projectId?: string) {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!user || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports?projectId=${projectId}`, {
        headers: { "x-user-id": user.id },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }
      const data = await response.json();
      setReports(data.reports || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Error fetching reports:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  const generateReport = useCallback(async () => {
    if (!user || !projectId) return null;
    setGenerating(true);
    setError(null);
    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
        },
        body: JSON.stringify({ projectId }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate report");
      }
      const data = await response.json();
      setReports((prev) => [data.report, ...prev]);
      return data.report;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Error generating report:", errorMsg);
      return null;
    } finally {
      setGenerating(false);
    }
  }, [user, projectId]);

  const deleteReport = useCallback(
    async (id: string) => {
      if (!user) return false;
      setError(null);
      try {
        const response = await fetch(`/api/reports/${id}`, {
          method: "DELETE",
          headers: { "x-user-id": user.id },
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to delete report");
        }
        setReports((prev) => prev.filter((r) => r.id !== id));
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred";
        setError(errorMsg);
        console.error("Error deleting report:", errorMsg);
        return false;
      }
    },
    [user]
  );

  useEffect(() => {
    if (projectId && user) {
      fetchReports();
    }
  }, [projectId, user, fetchReports]);

  return {
    reports,
    loading,
    generating,
    error,
    fetchReports,
    generateReport,
    deleteReport,
  };
}
