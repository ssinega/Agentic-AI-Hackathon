"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Download, Eye, Trash2, AlertCircle, Loader } from "lucide-react";
import { useReports } from "@/hooks/useReports";
import { useAuth } from "@/hooks/useAuth";

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const projectId = searchParams.get("projectId");
  
  // Redirect to projects if no projectId
  useEffect(() => {
    if (!authLoading && !projectId) {
      router.push("/projects");
    }
  }, [authLoading, projectId, router]);

  const { reports, generating, loading, error, generateReport, deleteReport } = useReports(projectId || undefined);

  const [showPreview, setShowPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);


  const handleGenerateReport = async () => {
    await generateReport();
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
      link.download = `report-${report.id}-${new Date().getTime()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Failed to download report");
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6 bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const thisMonthReports = reports.filter(
    (r) => new Date(r.createdAt).getMonth() === new Date().getMonth()
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">Generate and download research analysis reports</p>
        </div>
        <Button
          onClick={handleGenerateReport}
          disabled={generating}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Generate Report
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Reports</p>
          <p className="text-3xl font-bold text-white mt-2">{reports.length}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">This Month</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">{thisMonthReports}</p>
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

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </Card>
      )}

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
        {loading && reports.length === 0 ? (
          <Card className="p-12 bg-slate-800/50 border-slate-700/50 text-center">
            <p className="text-slate-400">Loading reports...</p>
          </Card>
        ) : reports.length > 0 ? (
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
                      {report.format ? report.format.toUpperCase() : "JSON"}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {report.status ? `Status: ${report.status}` : "Ready"}
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
                    onClick={() => deleteReport(report.id)}
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
              disabled={generating}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Your First Report
                </>
              )}
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
