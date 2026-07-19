import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/insights
 * Retrieve insights
 * Query params:
 *   - projectId: Required - filter by project
 *   - type: Filter by insight type (PAIN_POINT, FEATURE_REQUEST, COMPLAINT, QUOTE, FEEDBACK, CUSTOM_NEED)
 *   - severity: Filter by severity (LOW, MEDIUM, HIGH)
 *   - sentiment: Filter by sentiment (POSITIVE, NEUTRAL, NEGATIVE)
 *   - documentId: Filter by document
 *   - minConfidence: Filter by minimum confidence (0-100)
 *   - minFrequency: Filter by minimum frequency
 *   - sortBy: Sort field (frequency, confidence, createdAt, extractedAt)
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
    const type = searchParams.get("type");
    const severity = searchParams.get("severity");
    const sentiment = searchParams.get("sentiment");
    const documentId = searchParams.get("documentId");
    const minConfidence = searchParams.get("minConfidence");
    const minFrequency = searchParams.get("minFrequency");
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

    // Build where conditions
    const where: any = { projectId };

    if (type && ["PAIN_POINT", "FEATURE_REQUEST", "COMPLAINT", "QUOTE", "FEEDBACK", "CUSTOM_NEED"].includes(type)) {
      where.type = type;
    }

    if (severity && ["LOW", "MEDIUM", "HIGH"].includes(severity)) {
      where.severity = severity;
    }

    if (sentiment && ["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(sentiment)) {
      where.sentiment = sentiment;
    }

    if (documentId) {
      where.documentId = documentId;
    }

    if (minConfidence) {
      where.confidence = { gte: parseInt(minConfidence) };
    }

    if (minFrequency) {
      where.frequency = { gte: parseInt(minFrequency) };
    }

    // Build sort order
    const validSortFields = ["frequency", "confidence", "createdAt", "extractedAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "frequency";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const insights = await prisma.insight.findMany({
      where,
      include: {
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
      orderBy: {
        [sortField]: order,
      },
    });

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error("GET insights error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/insights
 * Create a new insight (manual or extracted)
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, type, content, severity, sentiment, confidence, frequency, documentId } = body;

    if (!projectId || !type || !content) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, type, content" },
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

    // If documentId provided, verify it belongs to the project
    if (documentId) {
      const document = await prisma.document.findFirst({
        where: { id: documentId, projectId },
      });
      if (!document) {
        return NextResponse.json({ error: "Document not found in this project" }, { status: 404 });
      }
    }

    // Validate enum values
    const validTypes = ["PAIN_POINT", "FEATURE_REQUEST", "COMPLAINT", "QUOTE", "FEEDBACK", "CUSTOM_NEED"];
    const validSeverities = ["LOW", "MEDIUM", "HIGH"];
    const validSentiments = ["POSITIVE", "NEUTRAL", "NEGATIVE"];

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid insight type" }, { status: 400 });
    }

    if (severity && !validSeverities.includes(severity)) {
      return NextResponse.json({ error: "Invalid severity" }, { status: 400 });
    }

    if (sentiment && !validSentiments.includes(sentiment)) {
      return NextResponse.json({ error: "Invalid sentiment" }, { status: 400 });
    }

    const insight = await prisma.insight.create({
      data: {
        projectId,
        type,
        content,
        severity: severity || "MEDIUM",
        sentiment: sentiment || "NEUTRAL",
        confidence: confidence || 50,
        frequency: frequency || 1,
        documentId: documentId || null,
      },
      include: {
        document: {
          select: {
            id: true,
            originalName: true,
          },
        },
      },
    });

    return NextResponse.json({ insight }, { status: 201 });
  } catch (error: any) {
    console.error("POST insight error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create insight" },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/insights
 * Update an insight
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
      return NextResponse.json({ error: "Insight ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify insight belongs to project
    const existingInsight = await prisma.insight.findFirst({
      where: { id, projectId },
    });
    if (!existingInsight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    // Prepare update data
    const data: any = {};

    if (updateData.type && ["PAIN_POINT", "FEATURE_REQUEST", "COMPLAINT", "QUOTE", "FEEDBACK", "CUSTOM_NEED"].includes(updateData.type)) {
      data.type = updateData.type;
    }

    if (updateData.content) {
      data.content = updateData.content;
    }

    if (updateData.severity && ["LOW", "MEDIUM", "HIGH"].includes(updateData.severity)) {
      data.severity = updateData.severity;
    }

    if (updateData.sentiment && ["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(updateData.sentiment)) {
      data.sentiment = updateData.sentiment;
    }

    if (updateData.confidence !== undefined) {
      data.confidence = Math.max(0, Math.min(100, updateData.confidence));
    }

    if (updateData.frequency !== undefined && updateData.frequency > 0) {
      data.frequency = updateData.frequency;
    }

    const insight = await prisma.insight.update({
      where: { id },
      data,
      include: {
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
          },
        },
      },
    });

    return NextResponse.json({ insight });
  } catch (error: any) {
    console.error("PATCH insight error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update insight" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/insights
 * Delete an insight
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
      return NextResponse.json({ error: "Insight ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify insight belongs to project
    const existingInsight = await prisma.insight.findFirst({
      where: { id, projectId },
    });
    if (!existingInsight) {
      return NextResponse.json({ error: "Insight not found" }, { status: 404 });
    }

    await prisma.insight.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Insight deleted successfully" });
  } catch (error: any) {
    console.error("DELETE insight error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete insight" },
      { status: 500 }
    );
  }
}
