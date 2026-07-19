import { Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface FileUploadZoneProps {
  onDrop: (files: File[]) => void;
  onFileSelect: (files: File[]) => void;
}

export function FileUploadZone({ onDrop, onFileSelect }: FileUploadZoneProps) {
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFiles = Array.from(e.dataTransfer.files);
    onDrop(droppedFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onFileSelect(selectedFiles);
    }
  };

  return (
    <Card
      className="p-12 border-2 border-dashed border-slate-700/50 bg-slate-800/30 text-center cursor-pointer hover:border-indigo-500/50 transition"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        onChange={handleChange}
        className="hidden"
        id="file-input"
        accept=".pdf,.docx,.xlsx,.csv,.txt"
      />
      <label htmlFor="file-input" className="cursor-pointer">
        <Upload className="w-12 h-12 text-indigo-600 opacity-50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-1">Drop files here or click to browse</h3>
        <p className="text-slate-400 text-sm">Supported: PDF, DOCX, XLSX, CSV, TXT (max 50MB)</p>
      </label>
    </Card>
  );
}