"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { FileList } from "@/components/upload/FileList";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

import { addDocument, getDocuments, deleteDocument } from "@/lib/storage";
import { generateAllMockDataFromDocuments } from "@/lib/mock-data-generator";


export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [uploadedCount, setUploadedCount] = useState(0);

  // Load uploaded files on mount
  useEffect(() => {
    try {
      const stored = getDocuments();
      const formattedFiles = stored.map((doc) => ({
        id: doc.id,
        name: doc.originalName,
        size: (doc.fileSize / 1024 / 1024).toFixed(2),
        status: "completed",
        uploadedAt: new Date(doc.uploadedAt).toLocaleString(),
        type: doc.fileType,
      }));
      setUploadedFiles(formattedFiles);
      setUploadedCount(formattedFiles.length);
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  }, []);

  const handleFileDrop = (droppedFiles: File[]) => {
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileName(file.name);

        try {
          // Simulate initial progress
          for (let p = 0; p <= 40; p += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            setProgress(p);
          }


          // Store document
          addDocument(file);

          // Update progress to completion
          for (let p = 50; p <= 100; p += 10) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            setProgress(p);
          }

          // Reset progress for next file
          await new Promise((resolve) => setTimeout(resolve, 300));
          setProgress(0);
        } catch (fileError) {
          console.error(`Error uploading file ${file.name}:`, fileError);
          setProgress(0);
          // Continue with next file
          continue;
        }
      }

      try {
        // Generate mock data from all documents
        generateAllMockDataFromDocuments();
      } catch (dataError) {
        console.error("Error generating mock data:", dataError);
      }

      // Add uploaded files to display
      const newUploadedFiles = files.map((file) => ({
        id: `file_${Date.now()}_${Math.random()}`,
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2),
        status: "completed",
        uploadedAt: new Date().toLocaleString(),
        type: file.type,
      }));

      setUploadedFiles((prev) => [...newUploadedFiles, ...prev]);
      setUploadedCount((prev) => prev + newUploadedFiles.length);
      setFiles([]);
      setProgress(0);
      setCurrentFileName("");
    } catch (error) {
      console.error("Upload error:", error);
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };


  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteUploaded = (id: string) => {
    deleteDocument(id);
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    setUploadedCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Upload Documents</h1>
        <p className="text-slate-400 mt-1">Upload research documents, PDFs, and data files for analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          {files.length === 0 && (
            <FileUploadZone onDrop={handleFileDrop} onFileSelect={handleFileSelect} />
          )}

          {/* Staged Files */}
          {files.length > 0 && (
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">Ready to Upload ({files.length} files)</h3>
              <div className="space-y-2 mb-6">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{file.name}</p>
                      <p className="text-slate-400 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              {uploading && files.length > 0 ? (
                <UploadProgress fileName={currentFileName} progress={progress} status="uploading" />
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      `Start Upload (${files.length})`
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFiles([])}
                    className="border-slate-600 text-slate-300 hover:text-white"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Upload Zone Again */}
          {files.length > 0 && (
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h3 className="text-sm text-slate-400 mb-4">Add more files?</h3>
              <FileUploadZone onDrop={handleFileDrop} onFileSelect={handleFileSelect} />
            </Card>
          )}
        </div>

        {/* Upload Stats */}
        <div className="space-y-4">
          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Upload Status</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Pending</span>
                <span className="text-white font-semibold">{files.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uploaded</span>
                <span className="text-white font-semibold">{uploadedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Files</span>
                <span className="text-white font-semibold">{files.length + uploadedCount}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Supported Formats</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>✓ PDF Documents</li>
              <li>✓ Word Files (.docx)</li>
              <li>✓ Excel Spreadsheets (.xlsx)</li>
              <li>✓ CSV Files</li>
              <li>✓ Text Files (.txt)</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Recently Uploaded ({uploadedFiles.length} files)
          </h3>
          <FileList
            files={uploadedFiles}
            onRemove={handleDeleteUploaded}
          />
        </Card>
      )}

      {/* Empty State */}
      {uploadedFiles.length === 0 && files.length === 0 && (
        <Card className="p-12 bg-slate-800/50 border-slate-700/50 border-dashed text-center">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
          <p className="text-slate-400">No files uploaded yet</p>
          <p className="text-slate-500 text-sm">Start by uploading your first document above</p>
        </Card>
      )}
    </div>
  );
}
