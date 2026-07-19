"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Download, Eye, Trash2 } from "lucide-react";
import { getReports, addReport } from "@/lib/storage";
import { getDataSummary } from "@/lib/mock-data-generator";

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  useEffect(() => {
    const stored = getReports();
    setReports(stored);
  }, []);

  const handleGenerateReport = () => {
    try {
      const summary = getDataSummary();

      const reportContent = {
        title: `Research Analysis Report - ${new Date().toLocaleDateString()}`,
        generatedAt: new Date().toISOString(),
        summary: {
          totalDocuments: summary.documents,
          totalInsights: summary.insights,
          totalPersonas: summary.personas,
          totalThemes: summary.themes,
          totalOpportunities: summary.opportunities,
        },
        description: "Comprehensive analysis of customer research data with insights, personas, themes, and opportunities.",
      };

      const newReport = addReport({
        projectId: "default",
        title: reportContent.title,
        generatedAt: new Date(),
        createdAt: new Date(),
        content: JSON.stringify(reportContent, null, 2),
        format: "json",
      });

      setReports((prev) => [newReport, ...prev]);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const handleDownloadReport = (report: any) => {
    try {
      let dataStr: string;
      try {
        const content = JSON.parse(report.content);
        dataStr = JSON.stringify(content, null, 2);
      } catch {
        dataStr = report.content;
      }
      
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${new Date().getTime()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const handleDeleteReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">Generate and download research analysis reports</p>
        </div>
        <Button
          onClick={handleGenerateReport}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Reports</p>
          <p className="text-3xl font-bold text-white mt-2">{reports.length}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">This Month</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">
            {reports.filter(
              (r) =>
                new Date(r.createdAt).getMonth() === new Date().getMonth()
            ).length}
          </p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Last Generated</p>
          <p className="text-sm font-semibold text-slate-300 mt-2">
            {reports.length > 0
              ? new Date(reports[0].createdAt).toLocaleDateString()
              : "Never"}
          </p>
        </Card>
      </div>

      {/* Report Preview Modal */}
      {showPreview && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Report Preview</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(null)}
              className="text-slate-400"
            >
              ✕
            </Button>
          </div>
          <pre className="bg-slate-900/50 p-4 rounded text-slate-300 text-sm overflow-auto max-h-96">
            {showPreview}
          </pre>
        </Card>
      )}

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length > 0 ? (
          reports.map((report) => (
            <Card
              key={report.id}
              className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Generated {new Date(report.createdAt).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      JSON
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {(report.content.length / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreview(report.content)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadReport(report)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 bg-slate-800/50 border-slate-700/50 text-center">
            <p className="text-slate-400 mb-4">No reports generated yet</p>
            <Button
              onClick={handleGenerateReport}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate Your First Report
            </Button>
          </Card>
        )}
      </div>

      {/* Report Features */}
      <Card className="p-6 bg-slate-800/50 border-slate-700/50">
        <h3 className="text-lg font-semibold text-white mb-4">Report Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-semibold text-white mb-2">✓ Automated Generation</p>
            <p className="text-xs text-slate-400">Generate reports instantly from your research data</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-2">✓ Export Formats</p>
            <p className="text-xs text-slate-400">Download as JSON for easy integration</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-2">✓ Full Analytics</p>
            <p className="text-xs text-slate-400">Includes insights, personas, opportunities, and themes</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
