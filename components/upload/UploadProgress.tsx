import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "failed";
}

export function UploadProgress({
  fileName,
  progress,
  status,
}: UploadProgressProps) {
  const statusColors = {
    pending: "bg-slate-500/10 text-slate-400",
    uploading: "bg-amber-500/10 text-amber-400",
    completed: "bg-emerald-500/10 text-emerald-400",
    failed: "bg-red-500/10 text-red-400",
  };

  return (
    <Card className="p-4 bg-slate-800/50 border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-white font-medium text-sm">{fileName}</p>
          <p className="text-slate-500 text-xs">{progress}%</p>
        </div>
        <Badge className={`text-xs capitalize ${statusColors[status]}`}>
          {status}
        </Badge>
      </div>
      <div className="w-full bg-slate-700/50 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </Card>
  );
}