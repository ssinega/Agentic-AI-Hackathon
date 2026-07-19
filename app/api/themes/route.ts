import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/themes
 * Retrieve themes for a project
 * Query params:
 *   - projectId: Required - filter by project
 *   - sortBy: Sort field (frequency, impact, createdAt)
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
    const sortBy = searchParams.get("sortBy") || "frequency";
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

    // Build sort order
    const validSortFields = ["frequency", "impact", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "frequency";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const themes = await prisma.theme.findMany({
      where: { projectId },
      include: {
        insights: {
          select: {
            id: true,
            content: true,
            type: true,
            severity: true,
          },
          take: 5,
        },
        _count: {
          select: {
            insights: true,
            reports: true,
          },
        },
      },
      orderBy: {
        [sortField]: order,
      },
    });

    return NextResponse.json({ themes });
  } catch (error: any) {
    console.error("GET themes error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch themes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/themes
 * Create a new theme
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, name, description, frequency, impact, trend } = body;

    if (!projectId || !name) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, name" },
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

    // Validate impact enum
    const validImpacts = ["low", "medium", "high"];
    if (impact && !validImpacts.includes(impact)) {
      return NextResponse.json({ error: "Invalid impact value" }, { status: 400 });
    }

    const validTrends = ["increasing", "stable", "decreasing"];
    if (trend && !validTrends.includes(trend)) {
      return NextResponse.json({ error: "Invalid trend value" }, { status: 400 });
    }

    const theme = await prisma.theme.create({
      data: {
        projectId,
        name,
        description: description || null,
        frequency: frequency || 1,
        impact: impact || "medium",
        trend: trend || "stable",
      },
      include: {
        insights: {
          select: {
            id: true,
            content: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({ theme }, { status: 201 });
  } catch (error: any) {
    console.error("POST theme error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create theme" },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/themes
 * Update a theme
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, projectId, ...updateData } = body;

    if (!id || !projectId) {
      return NextResponse.json({ error: "Theme ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify theme belongs to project
    const existingTheme = await prisma.theme.findFirst({
      where: { id, projectId },
    });
    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    // Prepare update data
    const data: any = {};

    if (updateData.name) {
      data.name = updateData.name;
    }

    if (updateData.description !== undefined) {
      data.description = updateData.description;
    }

    if (updateData.frequency !== undefined && updateData.frequency > 0) {
      data.frequency = updateData.frequency;
    }

    if (updateData.impact && ["low", "medium", "high"].includes(updateData.impact)) {
      data.impact = updateData.impact;
    }

    if (updateData.trend && ["increasing", "stable", "decreasing"].includes(updateData.trend)) {
      data.trend = updateData.trend;
    }

    const theme = await prisma.theme.update({
      where: { id },
      data,
      include: {
        insights: {
          select: {
            id: true,
            content: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json({ theme });
  } catch (error: any) {
    console.error("PUT theme error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update theme" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/themes
 * Delete a theme
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
      return NextResponse.json({ error: "Theme ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify theme belongs to project
    const existingTheme = await prisma.theme.findFirst({
      where: { id, projectId },
    });
    if (!existingTheme) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    await prisma.theme.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Theme deleted successfully" });
  } catch (error: any) {
    console.error("DELETE theme error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete theme" },
      { status: 500 }
    );
  }
}
