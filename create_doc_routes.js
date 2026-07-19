const fs = require('fs');
const path = require('path');

// Document upload endpoint
const upload_route = `import { NextRequest, NextResponse } from "next/server";
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

    console.log(\`Parsing file: \${file.name}\`);
    const parsedContent = await parseFile(file);

    const document = await prisma.document.create({
      data: { projectId, originalName: file.name, storageUrl: \`file://\${file.name}\`, contentType: file.type, fileSize: file.size, extractedText: parsedContent.text, status: "UPLOADED" },
      include: { _count: { select: { insights: true } } }
    });

    return NextResponse.json({ document, message: "File uploaded successfully. Ready for analysis." }, { status: 201 });
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload file", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
`;

// Document analyze endpoint
const analyze_route = `import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractInsightsFromText, saveInsightsToDatabase } from "@/lib/insight-extractor";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const documentId = params.id;
    if (!documentId) return NextResponse.json({ error: "Document ID is required" }, { status: 400 });

    const document = await prisma.document.findUnique({ where: { id: documentId }, include: { project: true } });
    if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    if (document.project.userId !== userId) return NextResponse.json({ error: "Access denied" }, { status: 403 });
    if (!document.extractedText) return NextResponse.json({ error: "Document text has not been extracted yet" }, { status: 400 });

    await prisma.document.update({ where: { id: documentId }, data: { status: "PROCESSING" } });

    console.log(\`Analyzing document \${documentId}...\`);
    const insights = await extractInsightsFromText(document.extractedText, documentId);

    await saveInsightsToDatabase(document.projectId, documentId, insights);

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: { status: "COMPLETED", processedAt: new Date() },
      include: { insights: { select: { id: true, type: true, content: true, confidence: true } } }
    });

    return NextResponse.json({
      document: updatedDocument,
      insights: {
        painPointCount: insights.painPoints.length,
        quoteCount: insights.quotes.length,
        featureRequestCount: insights.featureRequests.length,
        themeCount: insights.themes.length,
        personaCount: insights.personas.length,
        opportunityCount: insights.opportunities.length,
        sentiment: insights.sentiment
      }
    }, { status: 200 });
  } catch (error: any) {
    console.error("Document analysis error:", error);
    try {
      await prisma.document.update({ where: { id: params.id }, data: { status: "FAILED" } });
    } catch (updateError) {
      console.error("Failed to update document status:", updateError);
    }
    return NextResponse.json({ error: error.message || "Failed to analyze document", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
`;

// Create files
const upload_path = path.join("app", "api", "documents", "upload", "route.ts");
fs.mkdirSync(path.dirname(upload_path), { recursive: true });
fs.writeFileSync(upload_path, upload_route, "utf-8");
console.log(`Created ${upload_path}`);

const analyze_path = path.join("app", "api", "documents", "[id]", "analyze", "route.ts");
fs.mkdirSync(path.dirname(analyze_path), { recursive: true });
fs.writeFileSync(analyze_path, analyze_route, "utf-8");
console.log(`Created ${analyze_path}`);
