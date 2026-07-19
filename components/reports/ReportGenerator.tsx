import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useState } from "react";

export function ReportGenerator() {
  const [reportName, setReportName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate report generation
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert("Report generated successfully!");
  };

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm max-w-md">
      <h2 className="text-lg font-semibold text-white mb-4">Generate Report</h2>
      <div className="space-y-4">
        <div>
          <Label className="text-slate-200">Report Name</Label>
          <Input
            type="text"
            placeholder="Q1 Research Summary"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="mt-1 bg-slate-700/50 border-slate-600"
          />
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!reportName || isGenerating}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </div>
    </Card>
  );
}