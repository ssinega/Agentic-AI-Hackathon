import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/documents/[id]
 * Retrieve a specific document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const documentId = params.id;
    if (!documentId)
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        project: true,
        insights: true,
      },
    });

    if (!document)
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );

    // Verify user owns the project
    if (document.project.userId !== userId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error("GET document error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id]
 * Delete a specific document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const documentId = params.id;
    if (!documentId)
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { project: true },
    });

    if (!document)
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );

    // Verify user owns the project
    if (document.project.userId !== userId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    // Delete document (insights will be cascade deleted or set to null per schema rules)
    await prisma.document.delete({
      where: { id: documentId },
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
