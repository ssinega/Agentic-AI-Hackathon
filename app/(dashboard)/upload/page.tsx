"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUploadZone } from "@/components/upload/FileUploadZone";
import { UploadProgress } from "@/components/upload/UploadProgress";
import { CheckCircle, AlertCircle, Loader, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function UploadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState("");
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null);

  const urlProjectId = searchParams.get("projectId");
  const [projectId, setProjectId] = useState<string>(urlProjectId || "");
  const [projects, setProjects] = useState<any[]>([]);

  // Load projects on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && authLoading === false) {
      loadProjects();
    }
  }, [user, authLoading, router]);

  // Update projectId if it comes from URL
  useEffect(() => {
    if (urlProjectId) {
      setProjectId(urlProjectId);
    }
  }, [urlProjectId]);

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/projects", {
        headers: { "x-user-id": user?.id || "" },
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        if (data.projects?.length > 0) {
          setProjectId(data.projects[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  // Load uploaded documents
  useEffect(() => {
    if (projectId && user) {
      loadUploadedDocuments();
    }
  }, [projectId, user]);

  const loadUploadedDocuments = async () => {
    try {
      const response = await fetch(
        `/api/documents?projectId=${projectId}`,
        { headers: { "x-user-id": user?.id || "" } }
      );
      if (response.ok) {
        const data = await response.json();
        const formattedFiles = (data.documents || []).map((doc: any) => ({
          id: doc.id,
          name: doc.originalName,
          size: (doc.fileSize / 1024 / 1024).toFixed(2),
          status: doc.status?.toLowerCase() || "uploaded",
          uploadedAt: new Date(doc.uploadedAt).toLocaleString(),
          type: doc.contentType,
        }));
        setUploadedFiles(formattedFiles);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
    }
  };

  const handleFileDrop = (droppedFiles: File[]) => {
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleUpload = async () => {
    if (files.length === 0 || !projectId || !user) return;

    setUploading(true);
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFileName(file.name);

        try {
          // Create FormData
          const formData = new FormData();
          formData.append("file", file);
          formData.append("projectId", projectId);

          // Upload file
          const uploadResponse = await fetch("/api/documents/upload", {
            method: "POST",
            headers: { "x-user-id": user.id },
            body: formData,
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(
              errorData.error || "Upload failed"
            );
          }

          const uploadData = await uploadResponse.json();
          console.log("Document uploaded:", uploadData);

          setProgress(100);

          // Add to uploaded list
          setUploadedFiles((prev) => [
            {
              id: uploadData.document.id,
              name: uploadData.document.originalName,
              size: (uploadData.document.fileSize / 1024 / 1024).toFixed(2),
              status: "uploaded",
              uploadedAt: new Date().toLocaleString(),
              type: uploadData.document.contentType,
            },
            ...prev,
          ]);

          // Reset progress for next file
          await new Promise((resolve) => setTimeout(resolve, 300));
          setProgress(0);
        } catch (fileError) {
          console.error(`Error uploading file ${file.name}:`, fileError);
          setProgress(0);
          alert(
            `Error uploading ${file.name}: ${fileError instanceof Error ? fileError.message : String(fileError)}`
          );
          continue;
        }
      }

      setFiles([]);
      setProgress(0);
      setCurrentFileName("");
    } catch (error) {
      console.error("Upload error:", error);
      alert(
        `Upload failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteUploaded = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": user?.id || "" },
      });
      if (response.ok) {
        setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const handleAnalyzeDocument = async (docId: string) => {
    if (!user) return;

    setAnalyzingDocId(docId);
    try {
      const response = await fetch(`/api/documents/${docId}/analyze`, {
        method: "POST",
        headers: { "x-user-id": user.id },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Analysis failed"
        );
      }

      const analysisData = await response.json();
      console.log("Analysis complete:", analysisData);
      alert(
        `Analysis complete! Generated ${analysisData.analysis.insightCount} insights, ${analysisData.analysis.generatedThemeCount} themes, ${analysisData.analysis.generatedPersonaCount} personas, and ${analysisData.analysis.generatedOpportunityCount} opportunities.`
      );

      // Refresh the document list
      loadUploadedDocuments();
    } catch (error) {
      console.error("Analysis error:", error);
      alert(
        `Analysis failed: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setAnalyzingDocId(null);
    }
  };

  if (authLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Upload Documents</h1>
        <p className="text-slate-400 mt-1">
          Upload research documents, PDFs, and data files for analysis
        </p>
      </div>

      {/* Project Selection */}
      {projects.length > 0 && (
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Project
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Zone */}
          {files.length === 0 && (
            <FileUploadZone
              onDrop={handleFileDrop}
              onFileSelect={handleFileSelect}
            />
          )}

          {/* Staged Files */}
          {files.length > 0 && (
            <Card className="p-6 bg-slate-800/50 border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-4">
                Ready to Upload ({files.length} files)
              </h3>
              <div className="space-y-2 mb-6">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50"
                  >
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">
                        {file.name}
                      </p>
                      <p className="text-slate-400 text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
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
                <UploadProgress
                  fileName={currentFileName}
                  progress={progress}
                  status="uploading"
                />
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={!projectId}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50"
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
              <FileUploadZone
                onDrop={handleFileDrop}
                onFileSelect={handleFileSelect}
              />
            </Card>
          )}
        </div>

        {/* Upload Stats */}
        <div className="space-y-4">
          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">
              Upload Status
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Pending</span>
                <span className="text-white font-semibold">{files.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Uploaded</span>
                <span className="text-white font-semibold">
                  {uploadedFiles.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Files</span>
                <span className="text-white font-semibold">
                  {files.length + uploadedFiles.length}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">
              Supported Formats
            </h3>
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
            Uploaded Documents ({uploadedFiles.length} files)
          </h3>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
              >
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{file.name}</p>
                  <p className="text-slate-400 text-xs">
                    {file.size} MB • {file.uploadedAt}
                  </p>
                  <p className="text-slate-500 text-xs capitalize mt-1">
                    Status: {file.status}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {file.status !== "completed" && file.status !== "processing" && (
                    <Button
                      size="sm"
                      onClick={() => handleAnalyzeDocument(file.id)}
                      disabled={analyzingDocId === file.id}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {analyzingDocId === file.id ? (
                        <>
                          <Loader className="w-3 h-3 mr-1 animate-spin" />
                          Analyzing
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Analyze
                        </>
                      )}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteUploaded(file.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {uploadedFiles.length === 0 && files.length === 0 && (
        <Card className="p-12 bg-slate-800/50 border-slate-700/50 border-dashed text-center">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
          <p className="text-slate-400">No files uploaded yet</p>
          <p className="text-slate-500 text-sm">
            Start by uploading your first document above
          </p>
        </Card>
      )}
    </div>
  );
}
