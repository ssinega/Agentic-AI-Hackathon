import { NextRequest, NextResponse } from "next/server";
import { createProjectSchema, updateProjectSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/projects
 * Retrieve all projects for the current user or a specific project by ID
 * Query params:
 *   - id: Retrieve a specific project
 *   - status: Filter by status (ACTIVE, ARCHIVED)
 *   - sortBy: Sort field (createdAt, updatedAt, name)
 *   - sortOrder: Sort order (asc, desc)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("id");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // If specific project ID requested
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          userId, // Ensure user owns this project
        },
        include: {
          documents: {
            select: {
              id: true,
              originalName: true,
              status: true,
              uploadedAt: true,
            },
          },
          insights: {
            select: {
              id: true,
              type: true,
              content: true,
              severity: true,
              confidence: true,
              frequency: true,
            },
            take: 10,
          },
          themes: {
            select: {
              id: true,
              name: true,
              frequency: true,
              impact: true,
            },
          },
          personas: {
            select: {
              id: true,
              name: true,
              role: true,
              confidence: true,
            },
          },
          opportunities: {
            select: {
              id: true,
              title: true,
              score: true,
              roi: true,
              impactLevel: true,
            },
            take: 5,
            orderBy: { score: "desc" as const },
          },
          reports: {
            select: {
              id: true,
              title: true,
              status: true,
              generatedAt: true,
            },
            take: 5,
            orderBy: { generatedAt: "desc" as const },
          },
          _count: {
            select: {
              documents: true,
              insights: true,
              themes: true,
              personas: true,
              opportunities: true,
              reports: true,
              chatMessages: true,
            },
          },
        },
      });

      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }

      return NextResponse.json({ project });
    }

    // Build filter conditions
    const where: any = { userId };
    if (status && ["ACTIVE", "ARCHIVED"].includes(status)) {
      where.status = status;
    }

    // Build sort order
    const validSortFields = ["createdAt", "updatedAt", "name"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const order = sortOrder === "asc" ? "asc" : "desc";

    // Fetch all projects for user
    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            documents: true,
            insights: true,
            themes: true,
            personas: true,
            opportunities: true,
            reports: true,
          },
        },
      },
      orderBy: {
        [sortField]: order,
      },
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("GET projects error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...validated,
        userId,
        status: "ACTIVE",
        tags: JSON.stringify([]),
        collaboratorIds: JSON.stringify([userId]), // Add creator as collaborator
      },
      include: {
        _count: {
          select: {
            documents: true,
            insights: true,
            themes: true,
            personas: true,
            opportunities: true,
            reports: true,
          },
        },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error("POST project error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create project" },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/projects
 * Update a project by ID passed in query or body
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Verify user owns this project
    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Validate update data
    const validated = updateProjectSchema.parse(updateData);

    const project = await prisma.project.update({
      where: { id },
      data: validated,
      include: {
        _count: {
          select: {
            documents: true,
            insights: true,
            themes: true,
            personas: true,
            opportunities: true,
            reports: true,
          },
        },
      },
    });

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("PATCH project error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update project" },
      { status: 400 }
    );
  }
}

/**
 * PUT /api/projects
 * Full update of a project including status, tags, and collaborators
 */
export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Verify user owns this project
    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Prepare update data
    const data: any = {};

    if (updateData.name) {
      data.name = updateData.name;
    }
    if (updateData.description !== undefined) {
      data.description = updateData.description;
    }
    if (updateData.status) {
      if (!["ACTIVE", "ARCHIVED"].includes(updateData.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      data.status = updateData.status;
    }
    if (updateData.tags) {
      data.tags = JSON.stringify(Array.isArray(updateData.tags) ? updateData.tags : []);
    }
    if (updateData.collaboratorIds) {
      data.collaboratorIds = JSON.stringify(
        Array.isArray(updateData.collaboratorIds) ? updateData.collaboratorIds : []
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            documents: true,
            insights: true,
            themes: true,
            personas: true,
            opportunities: true,
            reports: true,
          },
        },
      },
    });

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("PUT project error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update project" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/projects
 * Delete a project by ID passed in query or body
 */
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
    }

    // Verify user owns this project
    const existingProject = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete project (cascade delete handled by Prisma)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error: any) {
    console.error("DELETE project error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
