import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/personas/[id]
 * Retrieve a single persona with full details
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
      return NextResponse.json({ error: "Persona ID is required" }, { status: 400 });
    }

    const persona = await prisma.persona.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            userId: true,
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

    if (!persona) {
      return NextResponse.json({ error: "Persona not found" }, { status: 404 });
    }

    // Verify user owns the project
    if (persona.project.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse JSON fields for response
    const formattedPersona = {
      ...persona,
      goals: JSON.parse(persona.goals || "[]"),
      painPoints: JSON.parse(persona.painPoints || "[]"),
    };

    return NextResponse.json({ persona: formattedPersona });
  } catch (error: any) {
    console.error("GET persona error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch persona" },
      { status: 500 }
    );
  }
}
