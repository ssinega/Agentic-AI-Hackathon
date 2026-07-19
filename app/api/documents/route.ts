import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/documents
 * Retrieve documents
 * Query params:
 *   - projectId: Filter by project (required for authorization)
 *   - status: Filter by status (UPLOADED, PROCESSING, COMPLETED, FAILED)
 *   - sortBy: Sort field (uploadedAt, processedAt)
 *   - sortOrder: Sort order (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "uploadedAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Build where conditions
    const where: any = { projectId };
    if (status && ["UPLOADED", "PROCESSING", "COMPLETED", "FAILED"].includes(status)) {
      where.status = status;
    }

    // Build sort order
    const validSortFields = ["uploadedAt", "processedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "uploadedAt";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const documents = await prisma.document.findMany({
      where,
      include: {
        _count: {
          select: { insights: true },
        },
      },
      orderBy: {
        [sortField]: order,
      },
    });

    return NextResponse.json({ documents });
  } catch (error: any) {
    console.error("GET documents error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents
 * Create/register a document after file upload
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    const { projectId, originalName, storageUrl, contentType, fileSize } = body;
    if (!projectId || !originalName || !storageUrl || !contentType || fileSize === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, originalName, storageUrl, contentType, fileSize" },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Validate file size (50MB max)
    if (fileSize > 52428800) {
      return NextResponse.json({ error: "File size exceeds 50MB limit" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        projectId,
        originalName,
        storageUrl,
        contentType,
        fileSize,
        status: "UPLOADED",
      },
      include: {
        _count: {
          select: { insights: true },
        },
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error: any) {
    console.error("POST document error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create document" },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/documents
 * Update a document (status, extractedText, etc.)
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, projectId, ...updateData } = body;

    if (!id || !projectId) {
      return NextResponse.json({ error: "Document ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify document belongs to project
    const existingDocument = await prisma.document.findFirst({
      where: { id, projectId },
    });
    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Prepare update data
    const data: any = {};
    if (updateData.status && ["UPLOADED", "PROCESSING", "COMPLETED", "FAILED"].includes(updateData.status)) {
      data.status = updateData.status;
    }
    if (updateData.extractedText !== undefined) {
      data.extractedText = updateData.extractedText;
    }
    if (updateData.processedAt !== undefined) {
      data.processedAt = updateData.processedAt ? new Date(updateData.processedAt) : null;
    }

    const document = await prisma.document.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { insights: true },
        },
      },
    });

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error("PATCH document error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update document" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/documents
 * Delete a document
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, projectId } = body;

    if (!id || !projectId) {
      return NextResponse.json({ error: "Document ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify document belongs to project
    const existingDocument = await prisma.document.findFirst({
      where: { id, projectId },
    });
    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete document (insights will be set to null via SetNull cascade rule)
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Document deleted successfully" });
  } catch (error: any) {
    console.error("DELETE document error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete document" },
      { status: 500 }
    );
  }
}
