"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus } from "lucide-react";
import { getThemes } from "@/lib/storage";

export default function ThemesPage() {
  const [themes, setThemes] = useState<any[]>([]);

  useEffect(() => {
    const stored = getThemes();
    setThemes(stored);
  }, []);

  const getSentimentColor = (theme: any) => {
    // Based on theme name
    if (
      theme.name.toLowerCase().includes("issue") ||
      theme.name.toLowerCase().includes("problem") ||
      theme.name.toLowerCase().includes("complaint")
    ) {
      return "bg-red-500/10 text-red-400 border-red-500/30";
    }
    if (
      theme.name.toLowerCase().includes("opportunity") ||
      theme.name.toLowerCase().includes("growth") ||
      theme.name.toLowerCase().includes("improvement")
    ) {
      return "bg-green-500/10 text-green-400 border-green-500/30";
    }
    return "bg-slate-500/10 text-slate-300 border-slate-500/30";
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Themes</h1>
          <p className="text-slate-400 mt-1">Clustered topics from your research data</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Theme
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Themes</p>
          <p className="text-3xl font-bold text-white mt-2">{themes.length}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Mentions</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">
            {themes.reduce((sum, t) => sum + (t.frequency || 0), 0)}
          </p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Avg Frequency</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            {themes.length > 0
              ? Math.round(themes.reduce((sum, t) => sum + (t.frequency || 0), 0) / themes.length)
              : 0}
          </p>
        </Card>
      </div>

      {/* Themes List */}
      <div className="space-y-4">
        {themes.length > 0 ? (
          themes.map((theme) => (

            <Card
              key={theme.id}
              className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{theme.name}</h3>
                  {theme.description && (
                    <p className="text-sm text-slate-400 mt-1">{theme.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`text-xs border ${getSentimentColor(theme)}`}
                  >
                    {theme.frequency > 0 ? "↑" : "↓"} Trending

                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Frequency</p>
                  <p className="text-2xl font-bold text-white">{theme.frequency}</p>
                  <div className="w-full bg-slate-700/50 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 h-1 rounded-full"
                      style={{
                        width: `${Math.min(100, (theme.frequency / 50) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Related Insights</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {theme.relatedInsights?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Impact</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {Math.round((theme.frequency / Math.max(...themes.map((t) => t.frequency || 0))) * 100) || 0}%
                  </p>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 bg-slate-800/50 border-slate-700/50 text-center">
            <p className="text-slate-400">No themes extracted yet. Upload documents to get started!</p>
          </Card>
        )}
      </div>

      {/* Theme Analytics */}
      {themes.length > 0 && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Theme Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Most Discussed</p>
              <p className="text-white font-semibold">
                {themes.length > 0 ? themes[0]?.name : "N/A"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {themes.length > 0 ? `${themes[0]?.frequency} mentions` : "No data"}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Coverage</p>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
              <p className="text-xs text-slate-500 mt-1">75% of research</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
