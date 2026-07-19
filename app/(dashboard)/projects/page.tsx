"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { ProjectModal } from "@/components/ProjectModal";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects();


  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleCreateProject = async (name: string, description?: string) => {
    await createProject(name, description);
    setShowModal(false);
  };

  const handleEditProject = async (name: string, description?: string) => {
    if (editingProject) {
      await updateProject(editingProject.id, name, description);
      setEditingProject(null);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setDeleteConfirm(null);
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    COMPLETED: "bg-green-500/10 text-green-400 border-green-500/30",
    ARCHIVED: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  };

  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const totalDocuments = projects.reduce((acc, p) => acc + (p._count?.documents || 0), 0);

  if (authLoading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Manage your research projects and campaigns</p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Projects</p>
          <p className="text-3xl font-bold text-white mt-2">{projects.length}</p>
          <p className="text-xs text-indigo-400 mt-2">All time</p>
        </Card>
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Active</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{activeProjects}</p>
          <p className="text-xs text-slate-500 mt-2">In progress</p>
        </Card>
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Documents</p>
          <p className="text-3xl font-bold text-white mt-2">{totalDocuments}</p>
          <p className="text-xs text-slate-500 mt-2">Across all projects</p>
        </Card>
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Insights</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">
            {projects.reduce((acc, p) => acc + (p._count?.insights || 0), 0)}
          </p>
          <p className="text-xs text-slate-500 mt-2">Extracted</p>
        </Card>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-slate-800/50 border-slate-700/50">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 text-sm"
        />
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-500/10 border border-red-500/30">
          <p className="text-red-400 text-sm">{error}</p>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="space-y-4">
        {loading && projects.length === 0 ? (
          <Card className="p-12 bg-slate-800/50 border-slate-700/50 text-center">
            <p className="text-slate-400">Loading projects...</p>
          </Card>
        ) : filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div key={project.id}>
              <Card className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition">
                <div className="flex items-start justify-between mb-4">
                  <Link href={`/projects/${project.id}`} className="flex-1 cursor-pointer hover:opacity-80">
                    <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">{project.description || "No description"}</p>
                  </Link>
                  <Badge
                    variant="outline"
                    className={`text-xs border ${statusColors[project.status || "ACTIVE"]} shrink-0 ml-4`}
                  >
                    {(project.status || "ACTIVE").charAt(0).toUpperCase() + (project.status || "ACTIVE").slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Documents</p>
                    <p className="text-lg font-semibold text-white">{project._count?.documents || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Insights</p>
                    <p className="text-lg font-semibold text-indigo-400">{project._count?.insights || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Themes</p>
                    <p className="text-lg font-semibold text-purple-400">{project._count?.themes || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Personas</p>
                    <p className="text-lg font-semibold text-emerald-400">{project._count?.personas || 0}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div className="text-xs text-slate-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                      onClick={() => router.push(`/projects/${project.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white"
                      onClick={() => setEditingProject(project)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-red-400"
                      onClick={() => setDeleteConfirm(project.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Delete Confirmation */}
              {deleteConfirm === project.id && (
                <Card className="p-4 bg-red-500/10 border border-red-500/30 mt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-red-400 text-sm">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirm(null)}
                        className="border-slate-600 text-slate-300"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteProject(project.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          ))
        ) : (
          <Card className="p-12 bg-slate-800/50 border-slate-700/50 text-center">
            <p className="text-slate-400 mb-4">
              {projects.length === 0 ? "No projects yet. Create one to get started!" : "No projects match your search"}
            </p>
            {projects.length === 0 && (
              <Button
                onClick={() => {
                  setEditingProject(null);
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={showModal || !!editingProject}
        onClose={() => {
          setShowModal(false);
          setEditingProject(null);
        }}
        onSubmit={editingProject ? handleEditProject : handleCreateProject}
        initialData={editingProject}
        title={editingProject ? "Edit Project" : "Create New Project"}
        submitLabel={editingProject ? "Update" : "Create"}
        isLoading={loading}
      />
    </div>
  );
}
