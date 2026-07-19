"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/projects", {
        headers: { "x-user-id": user.id },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("Error fetching projects:", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createProject = useCallback(
    async (name: string, description?: string) => {
      if (!user) return null;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id,
          },
          body: JSON.stringify({ name, description }),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to create project");
        }
        const data = await response.json();
        setProjects((prev) => [...prev, data.project]);
        return data.project;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred";
        setError(errorMsg);
        console.error("Error creating project:", errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const updateProject = useCallback(
    async (id: string, name?: string, description?: string) => {
      if (!user) return null;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/projects", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id,
          },
          body: JSON.stringify({ id, name, description }),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to update project");
        }
        const data = await response.json();
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? data.project : p))
        );
        return data.project;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred";
        setError(errorMsg);
        console.error("Error updating project:", errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const deleteProject = useCallback(
    async (id: string) => {
      if (!user) return false;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/projects", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user.id,
          },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to delete project");
        }
        setProjects((prev) => prev.filter((p) => p.id !== id));
        return true;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "An error occurred";
        setError(errorMsg);
        console.error("Error deleting project:", errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Auto-fetch on mount if user is available
  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
