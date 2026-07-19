"use client";

import { useState, useCallback } from "react";
import { UploadProgress } from "@/types";

const SUPPORTED_FORMATS = ["pdf", "docx", "xlsx", "csv", "txt"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function isValidFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Max size is 50MB` };
  }

  // Check file type
  const ext = getFileExtension(file.name);
  if (!SUPPORTED_FORMATS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported format. Supported: ${SUPPORTED_FORMATS.join(", ")}`,
    };
  }

  return { valid: true };
}

export function useUpload() {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: { fileName: string; error: string }[] } => {
      const validFiles: File[] = [];
      const errors: { fileName: string; error: string }[] = [];

      files.forEach((file) => {
        const validation = isValidFile(file);
        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push({
            fileName: file.name,
            error: validation.error || "Invalid file",
          });
        }
      });

      return { valid: validFiles, errors };
    },
    []
  );

  const uploadFile = useCallback(
    async (file: File, projectId: string) => {
      setIsUploading(true);

      // Validate file
      const validation = isValidFile(file);
      if (!validation.valid) {
        setUploads((prev) => [
          ...prev,
          {
            fileName: file.name,
            progress: 0,
            status: "error",
            error: validation.error,
          },
        ]);
        setIsUploading(false);
        return;
      }

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
          if (xhr.status === 200 || xhr.status === 201) {
            setUploads((prev) =>
              prev.map((u) =>
                u.fileName === file.name
                  ? { ...u, progress: 100, status: "completed" as const }
                  : u
              )
            );
          } else {
            const errorData = (() => {
              try {
                return JSON.parse(xhr.responseText);
              } catch {
                return { error: "Upload failed" };
              }
            })();
            setUploads((prev) =>
              prev.map((u) =>
                u.fileName === file.name
                  ? {
                      ...u,
                      status: "error" as const,
                      error: errorData.error || "Upload failed",
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

  const clearUpload = useCallback((fileName: string) => {
    setUploads((prev) => prev.filter((u) => u.fileName !== fileName));
  }, []);

  return {
    uploads,
    isUploading,
    uploadFile,
    clearUploads,
    clearUpload,
    validateFiles,
  };
}

