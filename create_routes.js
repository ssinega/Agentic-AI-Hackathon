const fs = require('fs');
const path = require('path');

// Create projects [id] route
const projects_id_route = `import { NextRequest, NextResponse } from "next/server";
import { updateProjectSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const projectId = params.id;
    if (!projectId) return NextResponse.json({ error: "Project ID is required" }, { status: 400 });

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        documents: { select: { id: true, originalName: true, status: true, uploadedAt: true, fileSize: true }, orderBy: { uploadedAt: "desc" as const } },
        insights: { select: { id: true, type: true, content: true, severity: true, sentiment: true, confidence: true, frequency: true }, orderBy: { extractedAt: "desc" as const }, take: 20 },
        themes: { select: { id: true, name: true, frequency: true, impact: true }, orderBy: { frequency: "desc" as const } },
        personas: { select: { id: true, name: true, role: true, confidence: true } },
        opportunities: { select: { id: true, title: true, score: true, roi: true, impactLevel: true }, orderBy: { score: "desc" as const }, take: 5 },
        reports: { select: { id: true, title: true, status: true, generatedAt: true }, orderBy: { generatedAt: "desc" as const }, take: 5 },
        _count: { select: { documents: true, insights: true, themes: true, personas: true, opportunities: true, reports: true, chatMessages: true } }
      },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const projectData = { ...project, tags: JSON.parse(project.tags || "[]"), collaboratorIds: JSON.parse(project.collaboratorIds || "[]") };
    return NextResponse.json({ project: projectData });
  } catch (error: any) {
    console.error("GET project error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const projectId = params.id;
    if (!projectId) return NextResponse.json({ error: "Project ID is required" }, { status: 400 });

    const body = await request.json();
    const existingProject = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!existingProject) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const validated = updateProjectSchema.parse(body);
    const project = await prisma.project.update({
      where: { id: projectId },
      data: validated,
      include: { _count: { select: { documents: true, insights: true, themes: true, personas: true, opportunities: true, reports: true } } }
    });

    const projectData = { ...project, tags: JSON.parse(project.tags || "[]"), collaboratorIds: JSON.parse(project.collaboratorIds || "[]") };
    return NextResponse.json({ project: projectData });
  } catch (error: any) {
    console.error("PUT project error:", error);
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const projectId = params.id;
    if (!projectId) return NextResponse.json({ error: "Project ID is required" }, { status: 400 });

    const existingProject = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!existingProject) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    await prisma.project.delete({ where: { id: projectId } });
    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    console.error("DELETE project error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete project" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const projectId = params.id;
    if (!projectId) return NextResponse.json({ error: "Project ID is required" }, { status: 400 });

    const body = await request.json();
    const existingProject = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!existingProject) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const data: any = {};
    if (body.name) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.status) {
      if (!["ACTIVE", "ARCHIVED"].includes(body.status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      data.status = body.status;
    }
    if (body.tags) data.tags = JSON.stringify(Array.isArray(body.tags) ? body.tags : []);
    if (body.collaboratorIds) data.collaboratorIds = JSON.stringify(Array.isArray(body.collaboratorIds) ? body.collaboratorIds : []);

    const project = await prisma.project.update({
      where: { id: projectId },
      data,
      include: { _count: { select: { documents: true, insights: true, themes: true, personas: true, opportunities: true, reports: true } } }
    });

    const projectData = { ...project, tags: JSON.parse(project.tags || "[]"), collaboratorIds: JSON.parse(project.collaboratorIds || "[]") };
    return NextResponse.json({ project: projectData });
  } catch (error: any) {
    console.error("PATCH project error:", error);
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 400 });
  }
}
`;

const file_path = path.join("app", "api", "projects", "[id]", "route.ts");
fs.mkdirSync(path.dirname(file_path), { recursive: true });
fs.writeFileSync(file_path, projects_id_route, "utf-8");
console.log(`Created ${file_path}`);
