"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Share2, Edit2, Download, MoreVertical } from "lucide-react";



export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const project = {
    id: projectId,
    name: "Product Market Fit Study",
    description: "Comprehensive research on market positioning and customer fit analysis",
    status: "active",
    progress: 85,
    documents: 24,
    insights: 157,
    personas: 6,
    opportunities: 12,
    createdAt: "2024-03-01",
    lastModified: "2024-03-15",
    team: [
      { id: 1, name: "John Doe", role: "Owner" },
      { id: 2, name: "Jane Smith", role: "Contributor" },
      { id: 3, name: "Mike Johnson", role: "Viewer" },
    ],
  };

  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "documents", label: "Documents" },
    { id: "insights", label: "Insights" },
    { id: "team", label: "Team" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-3xl font-bold text-white">{project.name}</h1>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          <p className="text-slate-400 ml-11">{project.description}</p>
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
          <p className="text-slate-400 text-xs">Progress</p>
          <p className="text-2xl font-bold text-white mt-1">{project.progress}%</p>
          <div className="w-full bg-slate-700/50 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-xs">Documents</p>
          <p className="text-2xl font-bold text-white mt-1">{project.documents}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-xs">Insights</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{project.insights}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-xs">Personas</p>
          <p className="text-2xl font-bold text-purple-400 mt-1">{project.personas}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-xs">Opportunities</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{project.opportunities}</p>
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
              <h3 className="text-lg font-semibold text-white mb-4">Project Timeline</h3>
              <div className="space-y-4">
                {[
                  { milestone: "Initial Research", progress: 100, date: "Mar 1 - Mar 5" },
                  { milestone: "Data Collection", progress: 100, date: "Mar 6 - Mar 10" },
                  { milestone: "Analysis & Insights", progress: 85, date: "Mar 11 - Mar 20" },
                  { milestone: "Report Generation", progress: 60, date: "Mar 21 - Mar 31" },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">{item.milestone}</span>
                      <span className="text-xs text-slate-500">{item.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Key Findings */}
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Key Findings</h3>
              <div className="space-y-3">
                {[
                  "78% of target market seeks better UX",
                  "Price sensitivity highest in SMB segment",
                  "Integration capabilities key differentiator",
                  "Customer support is critical success factor",
                  "Mobile-first approach gaining importance",
                ].map((finding, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                    <p className="text-slate-300">{finding}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Project Info */}
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">Project Information</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="text-slate-400">Created</p>
                  <p className="text-white">{new Date(project.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Last Modified</p>
                  <p className="text-white">{new Date(project.lastModified).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>

            {/* Team Members */}
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">Team ({project.team.length})</h4>
              <div className="space-y-2">
                {project.team.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-xs font-medium">{member.name}</p>
                      <p className="text-slate-500 text-xs">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-3 border-slate-600 text-slate-300 hover:text-white text-xs">
                Add Team Member
              </Button>
            </Card>

            {/* Actions */}
            <Card className="p-4 bg-slate-800/50 border-slate-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:text-white justify-start">
                  <Download className="w-3 h-3 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm" className="w-full border-slate-600 text-slate-300 hover:text-white justify-start">
                  <Share2 className="w-3 h-3 mr-2" />
                  Share Project
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Project Documents</h3>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-white text-sm">research_document_0{index + 1}.pdf</p>
                  <p className="text-slate-500 text-xs">2.4 MB • Uploaded 3 days ago</p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  View
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Top Insights</h3>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                <p className="text-white text-sm">Insight #{index + 1}</p>
                <p className="text-slate-400 text-xs mt-1">
                  Key finding extracted from the analysis with high confidence
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
          <div className="space-y-3">
            {project.team.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{member.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-slate-500 text-xs">{member.role}</p>
                  </div>
                </div>
                <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
                  {member.role}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
