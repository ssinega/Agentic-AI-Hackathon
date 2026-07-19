import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/opportunities/[id]
 * Retrieve a single opportunity with full details
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
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }

    const opportunity = await prisma.opportunity.findUnique({
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

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    // Verify user owns the project
    if (opportunity.project.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ opportunity });
  } catch (error: any) {
    console.error("GET opportunity error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch opportunity" },
      { status: 500 }
    );
  }
}
