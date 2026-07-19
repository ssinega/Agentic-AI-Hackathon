"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Download } from "lucide-react";
import { getInsights } from "@/lib/storage";
import { InsightType, Sentiment } from "@/types";

export default function InsightsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const stored = getInsights();
    setInsights(stored);
  }, []);

  const filteredInsights = insights
    .filter((insight) => {
      const matchesSearch = insight.content
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        filterType === "all" ||
        insight.type.replace(/_/g, " ").toLowerCase() ===
          filterType.toLowerCase();
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === "frequency") return b.frequency - a.frequency;
      if (sortBy === "sentiment") return (b.confidence || 0) - (a.confidence || 0);
      return 0;
    });

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case Sentiment.POSITIVE:
        return "bg-green-500/10 text-green-400 border-green-500/30";
      case Sentiment.NEGATIVE:
        return "bg-red-500/10 text-red-400 border-red-500/30";
      default:
        return "bg-slate-500/10 text-slate-300 border-slate-500/30";
    }
  };

  const typeOptions = [
    "all",
    ...Object.values(InsightType).map((t) =>
      t
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    ),
  ];

  const positiveCount = insights.filter((i) => i.sentiment === Sentiment.POSITIVE)
    .length;
  const negativeCount = insights.filter((i) => i.sentiment === Sentiment.NEGATIVE)
    .length;
  const neutralCount = insights.filter((i) => i.sentiment === Sentiment.NEUTRAL)
    .length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Insights</h1>
        <p className="text-slate-400 mt-1">Key findings and patterns from your research data</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Insights</p>
          <p className="text-3xl font-bold text-white mt-2">{insights.length}</p>
          <p className="text-xs text-indigo-400 mt-2">{insights.length > 0 ? "+All" : "Upload files"}</p>
        </Card>
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Positive</p>
          <p className="text-3xl font-bold text-green-400 mt-2">{positiveCount}</p>
          <p className="text-xs text-slate-500 mt-2">High confidence</p>
        </Card>
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Neutral</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">{neutralCount}</p>
          <p className="text-xs text-slate-500 mt-2">Requires validation</p>
        </Card>
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Negative</p>
          <p className="text-3xl font-bold text-red-400 mt-2">{negativeCount}</p>
          <p className="text-xs text-slate-500 mt-2">Needs attention</p>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card className="p-4 bg-slate-800/50 border-slate-700/50 sticky top-6">
            <h3 className="text-sm font-semibold text-white mb-4">Filters</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-2">By Type</p>
                <div className="space-y-2">
                  {typeOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                        filterType === type
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                      }`}
                    >
                      {type === "all" ? "All Types" : type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-2">Sort By</p>
                <div className="space-y-2">
                  {["recent", "frequency", "sentiment"].map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                        sortBy === sort
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                      }`}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search insights..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Insights List */}
          <div className="space-y-3">
            {filteredInsights.length > 0 ? (
              filteredInsights.map((insight) => (
                <Card
                  key={insight.id}
                  className="p-4 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-white font-medium">{insight.content}</p>
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                        <Badge variant="outline" className="text-xs">
                          {insight.type
                            .split("_")
                            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ")}
                        </Badge>
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs border ${getSentimentColor(insight.sentiment)}`}
                        >
                          {(insight.sentiment || "neutral")
                            .charAt(0)
                            .toUpperCase() +
                            (insight.sentiment || "neutral").slice(1)}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          Confidence: {insight.confidence}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-400">
                        {insight.frequency}
                      </div>
                      <p className="text-xs text-slate-500">Count</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 bg-slate-800/50 border-slate-700/50 text-center">
                <p className="text-slate-400">
                  {insights.length === 0
                    ? "No insights yet. Upload documents to get started!"
                    : "No insights match your filters"}
                </p>
              </Card>
            )}
          </div>

          {/* Load More */}
          {filteredInsights.length > 0 && (
            <Button variant="outline" className="w-full border-slate-600 text-slate-300">
              Load More Insights
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
