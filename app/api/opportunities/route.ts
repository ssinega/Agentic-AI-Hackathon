import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = request.nextUrl.searchParams.get("projectId");

    // Verify user owns the project if projectId is provided
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
      });
      if (!project) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const opportunities = await prisma.opportunity.findMany({
      where: projectId ? { projectId } : {},
      orderBy: { score: "desc" },
    });

    return NextResponse.json({ opportunities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}