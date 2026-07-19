import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReport } from "@/lib/report-generator";

/**
 * GET /api/reports
 * Retrieve reports for a project
 * Query params:
 *   - projectId: Required - filter by project
 *   - status: Filter by status (PENDING, GENERATING, COMPLETED, FAILED)
 *   - reportType: Filter by report type (EXECUTIVE_SUMMARY, FULL_ANALYSIS)
 *   - sortBy: Sort field (generatedAt, createdAt)
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
    const status = searchParams.get("status");
    const reportType = searchParams.get("reportType");
    const sortBy = searchParams.get("sortBy") || "generatedAt";
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

    if (status && ["PENDING", "GENERATING", "COMPLETED", "FAILED"].includes(status)) {
      where.status = status;
    }

    if (reportType && ["EXECUTIVE_SUMMARY", "FULL_ANALYSIS"].includes(reportType)) {
      where.reportType = reportType;
    }

    // Build sort order
    const validSortFields = ["generatedAt", "createdAt"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "generatedAt";
    const order = sortOrder === "asc" ? "asc" : "desc";

    const reports = await prisma.report.findMany({
      where,
      include: {
        insights: {
          select: {
            id: true,
            content: true,
            type: true,
          },
          take: 5,
        },
        themes: {
          select: {
            id: true,
            name: true,
          },
          take: 5,
        },
        personas: {
          select: {
            id: true,
            name: true,
          },
          take: 5,
        },
        opportunities: {
          select: {
            id: true,
            title: true,
            score: true,
          },
          take: 5,
        },
        _count: {
          select: {
            insights: true,
            themes: true,
            personas: true,
            opportunities: true,
          },
        },
      },
      orderBy: {
        [sortField]: order,
      },
    });

    // Parse content JSON for response
    const formattedReports = reports.map((report) => ({
      ...report,
      content: report.content ? JSON.parse(report.content) : null,
      exportFormats: report.exportFormats ? JSON.parse(report.exportFormats) : [],
    }));

    return NextResponse.json({ reports: formattedReports });
  } catch (error: any) {
    console.error("GET reports error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reports
 * Generate a new report
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, title, reportType } = body;

    if (!projectId || !title) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, title" },
        { status: 400 }
      );
    }

    // Verify user owns the project
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: {
        insights: true,
        themes: true,
        personas: true,
        opportunities: true,
      },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found or access denied" }, { status: 403 });
    }

    // Validate reportType
    const validReportTypes = ["EXECUTIVE_SUMMARY", "FULL_ANALYSIS"];
    const finalReportType = (reportType && validReportTypes.includes(reportType)) ? reportType : "EXECUTIVE_SUMMARY";

    // Create report with PENDING status
    let report = await prisma.report.create({
      data: {
        projectId,
        title,
        reportType: finalReportType,
        status: "GENERATING",
        content: JSON.stringify({}),
        exportFormats: JSON.stringify(["json", "html"]),
      },
    });

    // Generate report asynchronously
    try {
      const reportData = await generateReport(projectId, finalReportType);

      // Update report with generated content
      report = await prisma.report.update({
        where: { id: report.id },
        data: {
          content: JSON.stringify(reportData.content),
          status: "COMPLETED",
          exportFormats: JSON.stringify(reportData.exportFormats || ["json", "html"]),
        },
        include: {
          insights: {
            select: {
              id: true,
              content: true,
              type: true,
            },
            take: 5,
          },
          themes: {
            select: {
              id: true,
              name: true,
            },
            take: 5,
          },
          personas: {
            select: {
              id: true,
              name: true,
            },
            take: 5,
          },
          opportunities: {
            select: {
              id: true,
              title: true,
              score: true,
            },
            take: 5,
          },
          _count: {
            select: {
              insights: true,
              themes: true,
              personas: true,
              opportunities: true,
            },
          },
        },
      });
    } catch (error: any) {
      console.error("Error generating report:", error);

      // Update report status to FAILED
      report = await prisma.report.update({
        where: { id: report.id },
        data: {
          status: "FAILED",
          content: JSON.stringify({
            error: "Failed to generate report",
            message: error.message,
          }),
        },
      });
    }

    // Parse content JSON for response
    const formattedReport = {
      ...report,
      content: report.content ? JSON.parse(report.content) : null,
      exportFormats: report.exportFormats ? JSON.parse(report.exportFormats) : [],
    };

    return NextResponse.json({ report: formattedReport }, { status: 201 });
  } catch (error: any) {
    console.error("POST report error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create report" },
      { status: 400 }
    );
  }
}
