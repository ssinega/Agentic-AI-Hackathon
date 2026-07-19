import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { File } from "lucide-react";

interface Upload {
  id: string;
  name: string;
  size: string;
  date: string;
  status: "completed" | "processing" | "failed";
}

interface RecentUploadsProps {
  uploads: Upload[];
}

export function RecentUploads({ uploads }: RecentUploadsProps) {
  const statusColors = {
    completed: "bg-emerald-500/10 text-emerald-400",
    processing: "bg-amber-500/10 text-amber-400",
    failed: "bg-red-500/10 text-red-400",
  };

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Uploads</h2>
      <div className="space-y-3">
        {uploads.map((upload) => (
          <div key={upload.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <File className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-white font-medium text-sm">{upload.name}</p>
                <p className="text-slate-500 text-xs">{upload.date}</p>
              </div>
            </div>
            <Badge className={`text-xs capitalize ${statusColors[upload.status]}`}>
              {upload.status}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}