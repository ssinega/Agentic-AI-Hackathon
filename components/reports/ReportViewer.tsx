import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Download, Eye } from "lucide-react";

interface ReportViewerProps {
  title: string;
  content: string;
  generatedDate: string;
}

export function ReportViewer({ title, content, generatedDate }: ReportViewerProps) {
  return (
    <Card className="p-8 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-slate-400 text-sm">Generated on {generatedDate}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      <div className="prose prose-invert max-w-none">
        <p className="text-slate-300 whitespace-pre-wrap">{content}</p>
      </div>
    </Card>
  );
}