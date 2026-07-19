"use client";

import { useState, useCallback } from "react";
import { UploadProgress } from "@/types";

export function useUpload() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(
    async (file: File, projectId: string) => {
      setIsUploading(true);


      // Add file to uploads
      setUploads((prev) => [
        ...prev,
        {
          fileName: file.name,
          progress: 0,
          status: "pending",
        },
      ]);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);

      try {
        const xhr = new XMLHttpRequest();

        // Track progress
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setUploads((prev) =>
              prev.map((u) =>
                u.fileName === file.name
                  ? { ...u, progress, status: "uploading" as const }
                  : u
              )
            );
          }
        });

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            setUploads((prev) =>
              prev.map((u) =>
                u.fileName === file.name
                  ? { ...u, progress: 100, status: "completed" as const }
                  : u
              )
            );
          } else {
            setUploads((prev) =>
              prev.map((u) =>
                u.fileName === file.name
                  ? {
                      ...u,
                      status: "error" as const,
                      error: "Upload failed",
                    }
                  : u
              )
            );
          }
          setIsUploading(false);
        });

        // Handle error
        xhr.addEventListener("error", () => {
          setUploads((prev) =>
            prev.map((u) =>
              u.fileName === file.name
                ? {
                    ...u,
                    status: "error" as const,
                    error: "Network error",
                  }
                : u
            )
          );
          setIsUploading(false);
        });

        xhr.open("POST", "/api/documents/upload");
        xhr.send(formData);
      } catch (err) {
        setUploads((prev) =>
          prev.map((u) =>
            u.fileName === file.name
              ? {
                  ...u,
                  status: "error" as const,
                  error: err instanceof Error ? err.message : "Error uploading file",
                }
              : u
          )
        );
        setIsUploading(false);
      }
    },
    []
  );

  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  return {
    uploads,
    isUploading,
    uploadFile,
    clearUploads,
  };
}
