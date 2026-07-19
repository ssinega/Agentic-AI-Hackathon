import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get("projectId");

    // Verify user owns the project if projectId is provided
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const documents = await prisma.document.findMany({
      where: projectId ? { projectId } : {},
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.projectId || !body.originalName || !body.fileType || !body.fileSize) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: body.projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const document = await prisma.document.create({
      data: {
        projectId: body.projectId,
        originalName: body.originalName,
        filePath: body.filePath || `uploaded_${Date.now()}`,
        fileType: body.fileType,
        fileSize: body.fileSize,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create document" },
      { status: 400 }
    );
  }
}