"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Eye, Edit2, Trash2, Archive } from "lucide-react";

export default function ProjectsPage() {
  const [projects] = useState([

    {
      id: "1",
      name: "Product Market Fit Study",
      description: "Comprehensive research on market positioning and customer fit analysis",
      status: "active",
      progress: 85,
      documents: 24,
      insights: 157,
      createdAt: "2024-03-01",
      lastModified: "2024-03-15",
      team: 3,
    },
    {
      id: "2",
      name: "Competitive Analysis Q1",
      description: "Analysis of top 5 competitors and their market strategies",
      status: "active",
      progress: 65,
      documents: 18,
      insights: 92,
      createdAt: "2024-02-15",
      lastModified: "2024-03-14",
      team: 2,
    },
    {
      id: "3",
      name: "Customer Feedback Collection",
      description: "Aggregating and analyzing customer feedback from multiple channels",
      status: "active",
      progress: 45,
      documents: 31,
      insights: 203,
      createdAt: "2024-02-01",
      lastModified: "2024-03-13",
      team: 4,
    },
    {
      id: "4",
      name: "Feature Prioritization",
      description: "Prioritizing product features based on customer needs and market data",
      status: "completed",
      progress: 100,
      documents: 15,
      insights: 67,
      createdAt: "2024-01-15",
      lastModified: "2024-02-28",
      team: 3,
    },
    {
      id: "5",
      name: "Market Entry Strategy",
      description: "Research for market expansion into new geographical regions",
      status: "archived",
      progress: 80,
      documents: 22,
      insights: 145,
      createdAt: "2023-12-01",
      lastModified: "2024-01-30",
      team: 5,
    },
    {
      id: "6",
      name: "User Experience Study",
      description: "Deep dive into UX/UI feedback and usability research",
      status: "active",
      progress: 72,
      documents: 19,
      insights: 128,
      createdAt: "2024-02-20",
      lastModified: "2024-03-12",
      team: 2,
    },
  ]);

  const statusColors: Record<string, string> = {
    active: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    completed: "bg-green-500/10 text-green-400 border-green-500/30",
    archived: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  };

  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const totalDocuments = projects.reduce((acc, p) => acc + p.documents, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">Manage your research projects and campaigns</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Projects</p>
          <p className="text-3xl font-bold text-white mt-2">{projects.length}</p>
          <p className="text-xs text-indigo-400 mt-2">+1 this month</p>
        </Card>
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Active</p>
          <p className="text-3xl font-bold text-blue-400 mt-2">{activeProjects}</p>
          <p className="text-xs text-slate-500 mt-2">In progress</p>
        </Card>
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{completedProjects}</p>
          <p className="text-xs text-slate-500 mt-2">Finished</p>
        </Card>
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Documents</p>
          <p className="text-3xl font-bold text-white mt-2">{totalDocuments}</p>
          <p className="text-xs text-slate-500 mt-2">Across all projects</p>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{project.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs border ${statusColors[project.status]} shrink-0 ml-4`}
                >
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Progress</p>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{project.progress}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Documents</p>
                  <p className="text-lg font-semibold text-white mt-1">{project.documents}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Insights</p>
                  <p className="text-lg font-semibold text-indigo-400 mt-1">{project.insights}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Team Members</p>
                  <p className="text-lg font-semibold text-white mt-1">{project.team}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className="text-xs text-slate-500">
                  Updated {new Date(project.lastModified).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-red-400"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: "Updated", project: "Product Market Fit Study", time: "2 hours ago" },
            { action: "Created", project: "User Experience Study", time: "1 day ago" },
            { action: "Completed", project: "Feature Prioritization", time: "3 days ago" },
            { action: "Shared", project: "Competitive Analysis Q1", time: "1 week ago" },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
              <div>
                <p className="text-white text-sm">
                  <span className="text-indigo-400 font-semibold">{item.action}</span>: {item.project}
                </p>
              </div>
              <p className="text-xs text-slate-500">{item.time}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
