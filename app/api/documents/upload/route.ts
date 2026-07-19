import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFile } from "@/lib/file-parser";

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const projectId = formData.get("projectId") as string;
    const file = formData.get("file") as File;

    if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    if (!file) return NextResponse.json({ error: "File is required" }, { status: 400 });

    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });

    const MAX_FILE_SIZE = 52428800;
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 });

    const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv", "text/plain"];
    if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "File type not supported. Allowed: PDF, DOCX, DOC, XLS, XLSX, CSV, TXT" }, { status: 400 });

    console.log(`Parsing file: ${file.name}`);
    const parsedContent = await parseFile(file);

    const document = await prisma.document.create({
      data: { projectId, originalName: file.name, storageUrl: `file://${file.name}`, contentType: file.type, fileSize: file.size, extractedText: parsedContent.text, status: "UPLOADED" },
      include: { _count: { select: { insights: true } } }
    });

    return NextResponse.json({ document, message: "File uploaded successfully. Ready for analysis." }, { status: 201 });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
