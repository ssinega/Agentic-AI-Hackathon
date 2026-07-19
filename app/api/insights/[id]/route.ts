import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/insights/[id]
 * Retrieve a single insight with full details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Insight ID is required" }, { status: 400 });
    }

    const insight = await prisma.insight.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        document: {
          select: {
            id: true,
            originalName: true,
          },
        },
        themes: {
          select: {
            id: true,
            name: true,
          },
        },
        opportunities: {
          select: {
            id: true,
            title: true,
            score: true,
          },
        },
        reports: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!insight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    // Verify user owns the project
    if (insight.project.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error("GET insight error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch insight" },
      { status: 500 }
    );
  }
}
