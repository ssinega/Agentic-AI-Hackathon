import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/personas
 * Retrieve personas for a project
 * Query params:
 *   - projectId: Required - filter by project
 *   - sortBy: Sort field (confidence, documentCount, createdAt)
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
    const sortBy = searchParams.get("sortBy") || "confidence";
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
    const validSortFields = ["confidence", "documentCount", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "confidence";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const personas = await prisma.persona.findMany({
      where: { projectId },
      include: {
        _count: {
          select: {
            reports: true,
          },
        },
      },
      orderBy: {
        [sortField]: order,
      },
    });

    // Parse JSON fields for response
    const formattedPersonas = personas.map((persona) => ({
      ...persona,
      goals: JSON.parse(persona.goals || "[]"),
      painPoints: JSON.parse(persona.painPoints || "[]"),
    }));

    return NextResponse.json({ personas: formattedPersonas });
  } catch (error: any) {
    console.error("GET personas error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch personas" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/personas
 * Create a new persona
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, name, role, description, goals, painPoints, behavior, segment, confidence, documentCount } = body;

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

    const persona = await prisma.persona.create({
      data: {
        projectId,
        name,
        role: role || null,
        description: description || null,
        goals: JSON.stringify(Array.isArray(goals) ? goals : []),
        painPoints: JSON.stringify(Array.isArray(painPoints) ? painPoints : []),
        behavior: behavior || null,
        segment: segment || null,
        confidence: confidence || 50,
        documentCount: documentCount || 1,
      },
    });

    // Parse JSON fields for response
    const formattedPersona = {
      ...persona,
      goals: JSON.parse(persona.goals),
      painPoints: JSON.parse(persona.painPoints),
    };

    return NextResponse.json({ persona: formattedPersona }, { status: 201 });
  } catch (error: any) {
    console.error("POST persona error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create persona" },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/personas
 * Update a persona
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
      return NextResponse.json({ error: "Persona ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify persona belongs to project
    const existingPersona = await prisma.persona.findFirst({
      where: { id, projectId },
    });
    if (!existingPersona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Prepare update data
    const data: any = {};

    if (updateData.name) {
      data.name = updateData.name;
    }

    if (updateData.role !== undefined) {
      data.role = updateData.role;
    }

    if (updateData.description !== undefined) {
      data.description = updateData.description;
    }

    if (updateData.goals !== undefined) {
      data.goals = JSON.stringify(Array.isArray(updateData.goals) ? updateData.goals : []);
    }

    if (updateData.painPoints !== undefined) {
      data.painPoints = JSON.stringify(Array.isArray(updateData.painPoints) ? updateData.painPoints : []);
    }

    if (updateData.behavior !== undefined) {
      data.behavior = updateData.behavior;
    }

    if (updateData.segment !== undefined) {
      data.segment = updateData.segment;
    }

    if (updateData.confidence !== undefined) {
      data.confidence = Math.max(0, Math.min(100, updateData.confidence));
    }

    if (updateData.documentCount !== undefined && updateData.documentCount > 0) {
      data.documentCount = updateData.documentCount;
    }

    const persona = await prisma.persona.update({
      where: { id },
      data,
    });

    // Parse JSON fields for response
    const formattedPersona = {
      ...persona,
      goals: JSON.parse(persona.goals),
      painPoints: JSON.parse(persona.painPoints),
    };

    return NextResponse.json({ persona: formattedPersona });
  } catch (error: any) {
    console.error("PUT persona error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update persona" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/personas
 * Delete a persona
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
      return NextResponse.json({ error: "Persona ID and projectId are required" }, { status: 400 });
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Verify persona belongs to project
    const existingPersona = await prisma.persona.findFirst({
      where: { id, projectId },
    });
    if (!existingPersona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    await prisma.persona.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Persona deleted successfully" });
  } catch (error: any) {
    console.error("DELETE persona error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete persona" },
      { status: 500 }
    );
  }
}
