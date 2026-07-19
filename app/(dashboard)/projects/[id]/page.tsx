"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Share2, Edit2, Download, MoreVertical } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchProjectDetails() {
      if (!user || !projectId) return;
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/projects?id=${projectId}`, {
          headers: {
            "x-user-id": user.id,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }
        const data = await response.json();
        setProject(data.project);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchProjectDetails();
    }
  }, [user, projectId]);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "documents", label: "Documents" },
    { id: "insights", label: "Insights" },
    { id: "team", label: "Team" },
  ];

  if (authLoading || loading) {
    return <div className="p-8 text-white">Loading project details...</div>;
  }

  if (error || !project) {
    return (
      <div className="p-8 space-y-4">
        <Button onClick={() => router.push("/projects")} className="flex items-center gap-2 border-slate-700 bg-slate-800 text-white">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Button>
        <Card className="p-6 bg-red-500/10 border border-red-500/30">
          <p className="text-red-400">{error || "Project not found"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-slate-400 hover:text-white"
              onClick={() => router.push("/projects")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          <p className="text-slate-400 ml-11">{project.description || "No description provided."}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="border-slate-600 text-slate-300 hover:text-white">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-slate-600 text-slate-300 hover:text-white">
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-slate-600 text-slate-300 hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-xs">Status</p>
          <p className="text-2xl font-bold text-white mt-1 capitalize">{project.status.toLowerCase()}</p>
          <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
              style={{ width: project.status === "ACTIVE" ? "50%" : "100%" }}
            ></div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-xs">Documents</p>
          <p className="text-2xl font-bold text-white mt-1">{project.documents?.length || 0}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-xs">Insights</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{project.insights?.length || 0}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-xs">Personas</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{project.personas?.length || 0}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-xs">Opportunities</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{project.opportunities?.length || 0}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-700/50">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className="border-b-2 rounded-none"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Timeline */}
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Project Overview</h3>
              <p className="text-slate-300 text-sm">
                This project contains {project.documents?.length || 0} document(s), resulting in {project.insights?.length || 0} extracted customer insight(s). 
                From these insights, we have formulated {project.personas?.length || 0} customer segment personas and mapped out {project.opportunities?.length || 0} product opportunity areas.
              </p>
            </Card>

            {/* Key Findings Preview */}
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Insights Summary</h3>
              <div className="space-y-3">
                {project.insights && project.insights.length > 0 ? (
                  project.insights.slice(0, 3).map((insight: any) => (
                    <div key={insight.id} className="flex gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                      <p className="text-slate-300 text-sm">{insight.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-sm">No insights available yet. Go to Upload to add files.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar info */}
          <div className="space-y-4">
            {/* Project Info */}
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">Project Information</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-slate-400">Created At</p>
                  <p className="text-white">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Last Updated</p>
                  <p className="text-white">{new Date(project.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Project Documents</h3>
            <Button onClick={() => router.push(`/upload?projectId=${projectId}`)} className="bg-indigo-600 hover:bg-indigo-750 text-white font-semibold py-1.5 px-3 text-xs">
              Upload New
            </Button>
          </div>
          <div className="space-y-3">
            {project.documents && project.documents.length > 0 ? (
              project.documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="text-white text-sm">{doc.originalName}</p>
                    <p className="text-slate-500 text-xs">
                      {(doc.fileSize / 1024).toFixed(1)} KB • Uploaded {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={doc.status === "COMPLETED" ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-blue-500/10 text-blue-400 border-blue-500/30"}>
                    {doc.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No documents uploaded yet.</p>
            )}
          </div>
        </Card>
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Extracted Insights</h3>
          <div className="space-y-3">
            {project.insights && project.insights.length > 0 ? (
              project.insights.map((insight: any) => (
                <div key={insight.id} className="p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs uppercase bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                      {insight.type.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-slate-500">Mentions: {insight.frequency}</span>
                  </div>
                  <p className="text-white text-sm">{insight.content}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No insights extracted yet.</p>
            )}
          </div>
        </Card>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{user?.name || user?.email?.split("@")[0]}</p>
                  <p className="text-slate-500 text-xs">{user?.email}</p>
                </div>
              </div>
              <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                Owner
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
