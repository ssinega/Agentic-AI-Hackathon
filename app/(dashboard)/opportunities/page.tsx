"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, AlertCircle } from "lucide-react";
import { getOpportunities } from "@/lib/storage";
import { OpportunitySeverity } from "@/types";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"score" | "severity" | "frequency">("score");

  useEffect(() => {
    let stored = getOpportunities();

    // Sort based on selection
    if (sortBy === "score") {
      stored = stored.sort((a, b) => b.score - a.score);
    } else if (sortBy === "severity") {
      const severityOrder = {
        [OpportunitySeverity.HIGH]: 0,
        [OpportunitySeverity.MEDIUM]: 1,
        [OpportunitySeverity.LOW]: 2,
      };
      stored = stored.sort((a, b) => severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder]);
    } else if (sortBy === "frequency") {
      stored = stored.sort((a, b) => b.frequency - a.frequency);
    }

    setOpportunities(stored);
  }, [sortBy]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case OpportunitySeverity.HIGH:
        return "bg-red-500/10 text-red-400 border-red-500/30";
      case OpportunitySeverity.MEDIUM:
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case OpportunitySeverity.LOW:
        return "bg-green-500/10 text-green-400 border-green-500/30";
      default:
        return "bg-slate-500/10 text-slate-300 border-slate-500/30";
    }
  };

  const highSeverity = opportunities.filter(
    (o) => o.severity === OpportunitySeverity.HIGH
  ).length;
  const mediumSeverity = opportunities.filter(
    (o) => o.severity === OpportunitySeverity.MEDIUM
  ).length;
  const totalPotential = opportunities.reduce(
    (sum, o) => sum + (o.score || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Opportunities</h1>
          <p className="text-slate-400 mt-1">Ranked opportunities from customer insights</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Opportunity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Opportunities</p>
          <p className="text-3xl font-bold text-white mt-2">{opportunities.length}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">High Priority</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{highSeverity}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Medium Priority</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{mediumSeverity}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Score</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">{totalPotential}</p>
        </Card>
      </div>

      {/* Sorting Controls */}
      <Card className="p-4 bg-slate-800/50 border-slate-700/50">
        <div className="flex items-center justify-between">
          <p className="text-white font-medium">Sort By</p>
          <div className="flex gap-2">
            {["score", "severity", "frequency"].map((sort) => (
              <Button
                key={sort}
                variant={sortBy === sort ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy(sort as any)}
                className={
                  sortBy === sort
                    ? "bg-indigo-600"
                    : "border-slate-600 text-slate-300 hover:text-white"
                }
              >
                {sort.charAt(0).toUpperCase() + sort.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Opportunities List */}
      <div className="space-y-4">
        {opportunities.length > 0 ? (
          opportunities.map((opportunity, idx) => (
            <Card
              key={opportunity.id}
              className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-400">
                      #{idx + 1}
                    </span>
                    <h3 className="text-lg font-semibold text-white">
                      {opportunity.title}
                    </h3>
                  </div>
                  {opportunity.description && (
                    <p className="text-sm text-slate-400">{opportunity.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={`text-xs border ${getSeverityColor(opportunity.severity)}`}
                  >
                    {opportunity.severity}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-slate-400 text-xs mb-1">Score</p>
                  <p className="text-2xl font-bold text-indigo-400">
                    {opportunity.score}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Frequency</p>
                  <p className="text-2xl font-bold text-white">
                    {opportunity.frequency}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {opportunity.confidence}%
                  </p>
                </div>
                {opportunity.revenue && (
                  <div>
                    <p className="text-slate-400 text-xs mb-1">Revenue Potential</p>
                    <p className="text-lg font-bold text-green-400">
                      {opportunity.revenue}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-400">Impact Potential</p>
                  <span className="text-sm font-semibold text-white">
                    {Math.round((opportunity.score / 100) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, opportunity.score)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 bg-slate-800/50 border-slate-700/50 text-center">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
            <p className="text-slate-400">No opportunities identified yet. Upload documents to get started!</p>
          </Card>
        )}
      </div>

      {/* Opportunities Summary */}
      {opportunities.length > 0 && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Opportunities Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Top Opportunity</p>
              <p className="text-white font-semibold">
                {opportunities[0]?.title || "N/A"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Score: {opportunities[0]?.score || 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Avg Score</p>
              <p className="text-white font-semibold">
                {opportunities.length > 0
                  ? Math.round(
                      opportunities.reduce((sum, o) => sum + (o.score || 0), 0) /
                        opportunities.length
                    )
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Impact</p>
              <p className="text-white font-semibold">{totalPotential}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
