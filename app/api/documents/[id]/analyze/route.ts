import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  extractInsightsFromText,
  saveInsightsToDatabase,
} from "@/lib/insight-extractor";
import {
  generateThemesFromInsights,
  generatePersonasFromInsights,
  generateOpportunitiesFromInsights,
} from "@/lib/ai-processor";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get("x-user-id");
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const documentId = params.id;
    if (!documentId)
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { project: true },
    });
    if (!document)
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );

    if (document.project.userId !== userId)
      return NextResponse.json({ error: "Access denied" }, { status: 403 });

    // Update document status to PROCESSING
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "PROCESSING" },
    });

    console.log(`[ANALYZE] Starting analysis for document ${documentId}`);

    // Step 1: Extract text if not already done
    let extractedText = document.extractedText;
    if (!extractedText || extractedText.trim().length === 0) {
      console.log(`[ANALYZE] No extracted text found, re-parsing document...`);

      // Re-parse the document to extract text
      // Note: In production, you'd retrieve the file from storage
      // For now, we assume text was pre-extracted during upload
      throw new Error(
        "Document text has not been extracted. Please re-upload the document."
      );
    }

    console.log(
      `[ANALYZE] Extracted text length: ${extractedText.length} characters`
    );

    // Step 2: Extract insights from text
    console.log(
      `[ANALYZE] Extracting insights using AI processor (OpenAI or fallback)...`
    );
    const insights = await extractInsightsFromText(extractedText, documentId);
    console.log(
      `[ANALYZE] Extracted: ${insights.painPoints.length} pain points, ${insights.featureRequests.length} feature requests, ${insights.quotes.length} quotes`
    );

    // Step 3: Save insights to database
    console.log(`[ANALYZE] Saving insights to database...`);
    await saveInsightsToDatabase(document.projectId, documentId, insights);

    // Step 4: Auto-generate themes from insights
    console.log(
      `[ANALYZE] Auto-generating themes from ${insights.themes.length} extracted themes...`
    );
    const generatedThemeCount = await generateThemesFromInsights(
      document.projectId,
      insights
    );
    console.log(`[ANALYZE] Generated/updated ${generatedThemeCount} themes`);

    // Step 5: Auto-generate personas from insights
    console.log(
      `[ANALYZE] Auto-generating personas from ${insights.personas.length} extracted personas...`
    );
    const generatedPersonaCount = await generatePersonasFromInsights(
      document.projectId,
      insights
    );
    console.log(`[ANALYZE] Generated/updated ${generatedPersonaCount} personas`);

    // Step 6: Auto-generate opportunities from insights
    console.log(
      `[ANALYZE] Auto-generating opportunities from insights...`
    );
    const generatedOpportunityCount =
      await generateOpportunitiesFromInsights(document.projectId, insights);
    console.log(
      `[ANALYZE] Generated/updated ${generatedOpportunityCount} opportunities`
    );

    // Step 7: Update document status to COMPLETED
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: { status: "COMPLETED", processedAt: new Date() },
      include: {
        insights: {
          select: {
            id: true,
            type: true,
            content: true,
            confidence: true,
          },
        },
      },
    });

    console.log(
      `[ANALYZE] Document analysis completed successfully. Total insights: ${updatedDocument.insights.length}`
    );

    return NextResponse.json(
      {
        document: updatedDocument,
        analysis: {
          insightCount: updatedDocument.insights.length,
          painPointCount: insights.painPoints.length,
          quoteCount: insights.quotes.length,
          featureRequestCount: insights.featureRequests.length,
          generatedThemeCount,
          generatedPersonaCount,
          generatedOpportunityCount,
          sentiment: insights.sentiment,
          extractedTextLength: extractedText.length,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[ANALYZE] Document analysis error:", error);
    try {
      await prisma.document.update({
        where: { id: params.id },
        data: { status: "FAILED" },
      });
    } catch (updateError) {
      console.error("[ANALYZE] Failed to update document status:", updateError);
    }
    return NextResponse.json(
      {
        error: error.message || "Failed to analyze document",
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
