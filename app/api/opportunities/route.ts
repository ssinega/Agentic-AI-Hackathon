import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/opportunities
 * Retrieve opportunities for a project
 * Query params:
 *   - projectId: Required - filter by project
 *   - impactLevel: Filter by impact level (low, medium, high)
 *   - minScore: Filter by minimum score (0-100)
 *   - sortBy: Sort field (score, roi, frequency, createdAt)
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
    const impactLevel = searchParams.get("impactLevel");
    const minScore = searchParams.get("minScore");
    const sortBy = searchParams.get("sortBy") || "score";
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

    if (impactLevel && ["low", "medium", "high"].includes(impactLevel)) {
      where.impactLevel = impactLevel;
    }

    if (minScore) {
      where.score = { gte: parseInt(minScore) };
    }

    // Build sort order
    const validSortFields = ["score", "roi", "frequency", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "score";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const opportunities = await prisma.opportunity.findMany({
      where,
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

    return NextResponse.json({ opportunities });
  } catch (error: any) {
    console.error("GET opportunities error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/opportunities
 * Create a new opportunity
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, title, description, score, roi, businessValue, timeToImplement, impactLevel, confidence, frequency } = body;

    if (!projectId || !title || !description) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, title, description" },
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

    // Validate impactLevel enum
    const validImpactLevels = ["low", "medium", "high"];
    if (impactLevel && !validImpactLevels.includes(impactLevel)) {
      return NextResponse.json({ error: "Invalid impactLevel value" }, { status: 400 });
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        projectId,
        title,
        description,
        score: score || 50,
        roi: roi || 0,
        businessValue: businessValue || null,
        timeToImplement: timeToImplement || null,
        impactLevel: impactLevel || "medium",
        confidence: confidence || 50,
        frequency: frequency || 1,
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

    return NextResponse.json({ opportunity }, { status: 201 });
  } catch (error: any) {
    console.error("POST opportunity error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create opportunity" },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/opportunities
 * Update an opportunity
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
      return NextResponse.json({ error: "Opportunity ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify opportunity belongs to project
    const existingOpportunity = await prisma.opportunity.findFirst({
      where: { id, projectId },
    });
    if (!existingOpportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    // Prepare update data
    const data: any = {};

    if (updateData.title) {
      data.title = updateData.title;
    }

    if (updateData.description) {
      data.description = updateData.description;
    }

    if (updateData.score !== undefined) {
      data.score = Math.max(0, Math.min(100, updateData.score));
    }

    if (updateData.roi !== undefined) {
      data.roi = Math.max(0, Math.min(100, updateData.roi));
    }

    if (updateData.businessValue !== undefined) {
      data.businessValue = updateData.businessValue;
    }

    if (updateData.timeToImplement !== undefined) {
      data.timeToImplement = updateData.timeToImplement;
    }

    if (updateData.impactLevel && ["low", "medium", "high"].includes(updateData.impactLevel)) {
      data.impactLevel = updateData.impactLevel;
    }

    if (updateData.confidence !== undefined) {
      data.confidence = Math.max(0, Math.min(100, updateData.confidence));
    }

    if (updateData.frequency !== undefined && updateData.frequency > 0) {
      data.frequency = updateData.frequency;
    }

    const opportunity = await prisma.opportunity.update({
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

    return NextResponse.json({ opportunity });
  } catch (error: any) {
    console.error("PUT opportunity error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update opportunity" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/opportunities
 * Delete an opportunity
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
      return NextResponse.json({ error: "Opportunity ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify opportunity belongs to project
    const existingOpportunity = await prisma.opportunity.findFirst({
      where: { id, projectId },
    });
    if (!existingOpportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    await prisma.opportunity.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Opportunity deleted successfully" });
  } catch (error: any) {
    console.error("DELETE opportunity error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete opportunity" },
      { status: 500 }
    );
  }
}
