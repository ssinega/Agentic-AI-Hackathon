"use client";

import { useState, useCallback } from "react";
import { ApiClient } from "@/lib/api-client";
import { Project } from "@/types";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiClient.get<Project[]>("/projects");
      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        setError(response.error || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (name: string, description?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiClient.post<Project>("/projects", { name, description });
      if (response.success && response.data) {
        setProjects((prev) => [...prev, response.data!]);
        return response.data;
      } else {
        setError(response.error || "Failed to create project");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiClient.delete(`/projects/${id}`);
      if (response.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        setError(response.error || "Failed to delete project");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    deleteProject,
  };
}
