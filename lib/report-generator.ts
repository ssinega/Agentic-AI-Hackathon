/**
 * Report generation utility
 * Aggregates insights, themes, personas, and opportunities into a comprehensive report
 */

import { prisma } from "@/lib/prisma";

export interface ReportContent {
  title: string;
  generatedAt: string;
  projectId: string;
  summary: string;
  executiveSummary?: string;
  statistics: {
    totalInsights: number;
    totalThemes: number;
    totalPersonas: number;
    totalOpportunities: number;
    avgInsightConfidence: number;
    avgOpportunityScore: number;
  };
  topPainPoints: Array<{
    content: string;
    frequency: number;
    severity: string;
    confidence: number;
  }>;
  topThemes: Array<{
    name: string;
    description?: string;
    frequency: number;
    impact?: string;
  }>;
  topPersonas: Array<{
    name: string;
    role?: string;
    confidence: number;
    segment?: string;
  }>;
  topOpportunities: Array<{
    title: string;
    description: string;
    score: number;
    roi: number;
    impactLevel?: string;
  }>;
  recommendations?: string[];
  trends?: string[];
}

/**
 * Generate a comprehensive report from project data
 */
export async function generateReport(
  projectId: string,
  reportType: "EXECUTIVE_SUMMARY" | "FULL_ANALYSIS"
): Promise<{
  content: ReportContent;
  exportFormats: string[];
}> {
  try {
    // Fetch all project data
    const insights = await prisma.insight.findMany({
      where: { projectId },
      orderBy: { frequency: "desc" },
    });

    const themes = await prisma.theme.findMany({
      where: { projectId },
      orderBy: { frequency: "desc" },
    });

    const personas = await prisma.persona.findMany({
      where: { projectId },
      orderBy: { confidence: "desc" },
    });

    const opportunities = await prisma.opportunity.findMany({
      where: { projectId },
      orderBy: { score: "desc" },
    });

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    // Calculate statistics
    const avgInsightConfidence =
      insights.length > 0
        ? Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)
        : 0;

    const avgOpportunityScore =
      opportunities.length > 0
        ? Math.round(opportunities.reduce((sum, o) => sum + o.score, 0) / opportunities.length)
        : 0;

    // Extract top pain points
    const topPainPoints = insights
      .filter((i) => i.type === "PAIN_POINT")
      .slice(0, 10)
      .map((i) => ({
        content: i.content,
        frequency: i.frequency,
        severity: i.severity,
        confidence: i.confidence,
      }));

    // Extract top themes
    const topThemes = themes.slice(0, 8).map((t) => ({
      name: t.name,
      description: t.description || undefined,
      frequency: t.frequency,
      impact: t.impact || undefined,
    }));

    // Extract top personas
    const topPersonas = personas.slice(0, 5).map((p) => ({
      name: p.name,
      role: p.role || undefined,
      confidence: p.confidence,
      segment: p.segment || undefined,
    }));

    // Extract top opportunities
    const topOpportunities = opportunities.slice(0, 10).map((o) => ({
      title: o.title,
      description: o.description,
      score: o.score,
      roi: o.roi,
      impactLevel: o.impactLevel || undefined,
    }));

    // Generate summary text
    const summaryParts: string[] = [];

    if (insights.length > 0) {
      const painPointCount = insights.filter((i) => i.type === "PAIN_POINT").length;
      const featureRequestCount = insights.filter((i) => i.type === "FEATURE_REQUEST").length;

      summaryParts.push(
        `This analysis is based on ${insights.length} insights extracted from project research, including ${painPointCount} pain points and ${featureRequestCount} feature requests.`
      );
    }

    if (themes.length > 0) {
      summaryParts.push(
        `We identified ${themes.length} key themes with an average frequency of ${Math.round(themes.reduce((sum, t) => sum + t.frequency, 0) / themes.length)} mentions each.`
      );
    }

    if (personas.length > 0) {
      summaryParts.push(
        `${personas.length} distinct user personas were generated with an average confidence of ${Math.round(personas.reduce((sum, p) => sum + p.confidence, 0) / personas.length)}%.`
      );
    }

    if (opportunities.length > 0) {
      const highScoringOpps = opportunities.filter((o) => o.score >= 70).length;
      summaryParts.push(
        `${opportunities.length} business opportunities were identified, with ${highScoringOpps} scoring 70 or higher.`
      );
    }

    const summary = summaryParts.join(" ");

    // Generate recommendations based on top opportunities and pain points
    const recommendations: string[] = [];

    if (topOpportunities.length > 0) {
      recommendations.push(
        `1. Prioritize implementation of "${topOpportunities[0].title}" - it has the highest opportunity score of ${topOpportunities[0].score} and estimated ROI of ${topOpportunities[0].roi}%.`
      );

      if (topOpportunities.length > 1) {
        recommendations.push(
          `2. Follow with "${topOpportunities[1].title}" to build momentum and capitalize on secondary opportunities.`
        );
      }
    }

    if (topPainPoints.length > 0) {
      recommendations.push(
        `3. Address the top pain point: "${topPainPoints[0].content}" which was mentioned ${topPainPoints[0].frequency} times with ${topPainPoints[0].confidence}% confidence.`
      );
    }

    if (themes.length > 0) {
      const topTheme = themes[0];
      recommendations.push(
        `4. Focus on the "${topTheme.name}" theme which appears to be a critical area affecting ${topTheme.frequency} insights.`
      );
    }

    recommendations.push(
      "5. Use the detailed data in this report to inform product roadmap and prioritization decisions."
    );

    // Generate trends analysis
    const trends: string[] = [];

    // Analyze sentiment trends
    const positiveInsights = insights.filter((i) => i.sentiment === "POSITIVE").length;
    const negativeInsights = insights.filter((i) => i.sentiment === "NEGATIVE").length;
    const positivePercent = Math.round((positiveInsights / insights.length) * 100) || 0;

    if (positivePercent > 60) {
      trends.push("Overall sentiment is positive, indicating strong customer satisfaction.");
    } else if (positivePercent < 30) {
      trends.push("Significant negative sentiment detected - immediate attention to pain points is recommended.");
    } else {
      trends.push("Sentiment is mixed, reflecting both satisfaction and areas for improvement.");
    }

    // Analyze theme trends
    const increasingThemes = themes.filter((t) => t.trend === "increasing").length;
    if (increasingThemes > themes.length * 0.5) {
      trends.push("Most themes show increasing trends, suggesting growing customer interest in these areas.");
    }

    // Analyze opportunity concentration
    const highImpactOpps = opportunities.filter((o) => o.impactLevel === "high").length;
    if (highImpactOpps > 0) {
      trends.push(`${highImpactOpps} high-impact opportunities identified - these should be prioritized.`);
    }

    // Build report content
    const reportContent: ReportContent = {
      title: `${reportType === "EXECUTIVE_SUMMARY" ? "Executive Summary" : "Full Analysis"} Report`,
      generatedAt: new Date().toISOString(),
      projectId,
      summary,
      statistics: {
        totalInsights: insights.length,
        totalThemes: themes.length,
        totalPersonas: personas.length,
        totalOpportunities: opportunities.length,
        avgInsightConfidence: avgInsightConfidence,
        avgOpportunityScore: avgOpportunityScore,
      },
      topPainPoints,
      topThemes,
      topPersonas,
      topOpportunities,
      recommendations,
      trends,
    };

    // If executive summary, include condensed version
    if (reportType === "EXECUTIVE_SUMMARY") {
      reportContent.executiveSummary = generateExecutiveSummary(reportContent);
    }

    return {
      content: reportContent,
      exportFormats: ["json", "html", "pdf"],
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}

/**
 * Generate condensed executive summary text
 */
function generateExecutiveSummary(report: ReportContent): string {
  const lines: string[] = [
    "EXECUTIVE SUMMARY",
    "================",
    "",
    report.summary,
    "",
    "KEY METRICS:",
    `• Total Insights Analyzed: ${report.statistics.totalInsights}`,
    `• Themes Identified: ${report.statistics.totalThemes}`,
    `• User Personas: ${report.statistics.totalPersonas}`,
    `• Business Opportunities: ${report.statistics.totalOpportunities}`,
    "",
    "TOP PRIORITY ACTIONS:",
  ];

  report.recommendations?.slice(0, 3).forEach((rec) => {
    lines.push(`• ${rec}`);
  });

  lines.push("");
  lines.push("KEY INSIGHTS:");

  if (report.topPainPoints.length > 0) {
    lines.push(`• Most Critical Issue: "${report.topPainPoints[0].content}"`);
  }

  if (report.topOpportunities.length > 0) {
    lines.push(`• Highest Opportunity: "${report.topOpportunities[0].title}" (Score: ${report.topOpportunities[0].score})`);
  }

  if (report.topThemes.length > 0) {
    lines.push(`• Primary Theme: "${report.topThemes[0].name}"`);
  }

  return lines.join("\n");
}
