"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useThemes(projectId?: string) {
  const { user } = useAuth();
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterImpact, setFilterImpact] = useState<"all" | "low" | "medium" | "high">("all");
  const [sortBy, setSortBy] = useState<"frequency" | "impact" | "createdAt">("frequency");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchThemes = useCallback(async () => {
    if (!user || !projectId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        projectId,
        sortBy,
        sortOrder,
      });

      const response = await fetch(`/api/themes?${params}`, {
        headers: { "x-user-id": user.id },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch themes");
      }
      const data = await response.json();
      setThemes(data.themes || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Error fetching themes:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user, projectId, sortBy, sortOrder]);

  useEffect(() => {
    if (projectId && user) {
      fetchThemes();
    }
  }, [projectId, user, fetchThemes]);

  // Filter and search themes
  const filteredThemes = themes.filter((theme) => {
    const matchesSearch = theme.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterImpact === "all" || theme.impact === filterImpact;
    return matchesSearch && matchesFilter;
  });

  const searchThemes = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const filterByImpact = useCallback((impact: "all" | "low" | "medium" | "high") => {
    setFilterImpact(impact);
  }, []);

  const updateSort = useCallback(
    (field: "frequency" | "impact" | "createdAt", order: "asc" | "desc") => {
      setSortBy(field);
      setSortOrder(order);
    },
    []
  );

  return {
    themes: filteredThemes,
    allThemes: themes,
    loading,
    error,
    fetchThemes,
    searchThemes,
    filterByImpact,
    updateSort,
    searchTerm,
    filterImpact,
    sortBy,
    sortOrder,
  };
}

