import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/themes/[id]
 * Retrieve a single theme with full details including related insights
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
      return NextResponse.json({ error: "Theme ID is required" }, { status: 400 });
    }

    const theme = await prisma.theme.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        insights: {
          select: {
            id: true,
            content: true,
            type: true,
            severity: true,
            frequency: true,
            confidence: true,
          },
        },
        reports: {
          select: {
            id: true,
            title: true,
          },
        },
        _count: {
          select: {
            insights: true,
            reports: true,
          },
        },
      },
    });

    if (!theme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    // Verify user owns the project
    if (theme.project.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ theme });
  } catch (error: any) {
    console.error("GET theme error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch theme" },
      { status: 500 }
    );
  }
}
