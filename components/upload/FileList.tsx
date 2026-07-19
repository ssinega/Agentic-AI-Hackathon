import { Button } from "@/components/ui/Button";
import { File, X } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
}

interface FileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-4">Uploaded Files</h2>
      <div className="space-y-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <File className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-white font-medium text-sm">{file.name}</p>
                <p className="text-slate-500 text-xs">{file.size} • {file.date}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(file.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}