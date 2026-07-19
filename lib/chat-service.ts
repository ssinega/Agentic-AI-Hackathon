/**
 * Intelligent chat service that queries the mock data
 */

import {
  getInsights,
  getPersonas,
  getThemes,
  getOpportunities,
  getDocuments,
} from "./storage";
import { InsightType, Sentiment } from "@/types";

export interface ChatResponse {
  content: string;
  relatedData?: {
    type: string;
    items: any[];
  };
}

/**
 * Process user query and generate intelligent response
 */
export function processChatQuery(query: string): ChatResponse {
  const lowerQuery = query.toLowerCase();

  // Check what the user is asking about
  if (
    lowerQuery.includes("pain point") ||
    lowerQuery.includes("problem") ||
    lowerQuery.includes("issue")
  ) {
    return generatePainPointsResponse();
  }

  if (
    lowerQuery.includes("opportunity") ||
    lowerQuery.includes("potential") ||
    lowerQuery.includes("growth")
  ) {
    return generateOpportunitiesResponse();
  }

  if (
    lowerQuery.includes("persona") ||
    lowerQuery.includes("user") ||
    lowerQuery.includes("customer")
  ) {
    return generatePersonasResponse();
  }

  if (
    lowerQuery.includes("theme") ||
    lowerQuery.includes("topic") ||
    lowerQuery.includes("trend")
  ) {
    return generateThemesResponse();
  }

  if (
    lowerQuery.includes("sentiment") ||
    lowerQuery.includes("positive") ||
    lowerQuery.includes("negative")
  ) {
    return generateSentimentResponse();
  }

  if (
    lowerQuery.includes("summary") ||
    lowerQuery.includes("overview") ||
    lowerQuery.includes("total")
  ) {
    return generateSummaryResponse();
  }

  if (lowerQuery.includes("recommend") || lowerQuery.includes("suggest")) {
    return generateRecommendationsResponse();
  }

  // Default response
  return generateDefaultResponse(query);
}

function generatePainPointsResponse(): ChatResponse {
  const insights = getInsights().filter(
    (i) => i.type === InsightType.PAIN_POINT
  );

  if (insights.length === 0) {
    return {
      content:
        "I haven't identified any pain points yet. Upload customer documents to start extracting insights.",
    };
  }

  const topPainPoints = insights
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  let content = `Based on the research, I've identified **${insights.length} pain points**. Here are the top concerns:\n\n`;

  topPainPoints.forEach((point, idx) => {
    content += `${idx + 1}. **${point.content}** (mentioned ${point.frequency} times, ${point.confidence}% confidence)\n`;
  });

  content +=
    "\n\nThese pain points represent the most critical issues affecting your customers. Addressing them should be a priority for improving satisfaction and retention.";

  return {
    content,
    relatedData: {
      type: "pain_points",
      items: topPainPoints,
    },
  };
}

function generateOpportunitiesResponse(): ChatResponse {
  const opportunities = getOpportunities().sort((a, b) => b.score - a.score);

  if (opportunities.length === 0) {
    return {
      content:
        "I haven't identified opportunities yet. Upload research to analyze potential improvements.",
    };
  }

  const topOpportunities = opportunities.slice(0, 5);
  let content = `I've identified **${opportunities.length} key opportunities**. Here are the most promising:\n\n`;

  topOpportunities.forEach((opp, idx) => {
    content += `${idx + 1}. **${opp.title}** (Score: ${opp.score}, Severity: ${opp.severity})\n`;
    if (opp.revenue) {
      content += `   Revenue Potential: ${opp.revenue}\n`;
    }
  });

  const totalScore = opportunities.reduce((sum, o) => sum + (o.score || 0), 0);
  content += `\n\nTotal opportunity score: **${totalScore}**. These represent significant potential for product improvement and revenue growth.`;

  return {
    content,
    relatedData: {
      type: "opportunities",
      items: topOpportunities,
    },
  };
}

function generatePersonasResponse(): ChatResponse {
  const personas = getPersonas();

  if (personas.length === 0) {
    return {
      content:
        "No personas have been generated yet. Upload customer research to create user personas automatically.",
    };
  }

  let content = `I've generated **${personas.length} user personas** based on the research:\n\n`;

  personas.forEach((persona, idx) => {
    content += `**${idx + 1}. ${persona.name}** (${persona.type})\n`;
    if (persona.role) {
      content += `   Role: ${persona.role}\n`;
    }
    if (persona.goals) {
      content += `   Goals: ${persona.goals}\n`;
    }
  });

  content +=
    "\n\nThese personas represent different user segments with distinct needs and motivations. Use them to guide product decisions and marketing strategies.";

  return {
    content,
    relatedData: {
      type: "personas",
      items: personas,
    },
  };
}

function generateThemesResponse(): ChatResponse {
  const themes = getThemes();

  if (themes.length === 0) {
    return {
      content:
        "No themes have been extracted yet. Upload documents to identify common topics.",
    };
  }

  const topThemes = themes
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  let content = `I've identified **${themes.length} key themes** in your research. The most frequent are:\n\n`;

  topThemes.forEach((theme, idx) => {
    content += `${idx + 1}. **${theme.name}** (${theme.frequency} mentions)\n`;
    if (theme.description) {
      content += `   ${theme.description}\n`;
    }
  });

  content +=
    "\n\nThese themes represent clusters of related insights that appear frequently across your research data.";

  return {
    content,
    relatedData: {
      type: "themes",
      items: topThemes,
    },
  };
}

function generateSentimentResponse(): ChatResponse {
  const insights = getInsights();

  const positive = insights.filter((i) => i.sentiment === Sentiment.POSITIVE)
    .length;
  const negative = insights.filter((i) => i.sentiment === Sentiment.NEGATIVE)
    .length;
  const neutral = insights.filter((i) => i.sentiment === Sentiment.NEUTRAL)
    .length;
  const total = insights.length;

  if (total === 0) {
    return {
      content:
        "No sentiment data available. Upload documents to analyze sentiment.",
    };
  }

  const positivePercent = Math.round((positive / total) * 100);
  const negativePercent = Math.round((negative / total) * 100);
  const neutralPercent = Math.round((neutral / total) * 100);

  let content = `Based on **${total} insights**, here's the sentiment breakdown:\n\n`;
  content += `✅ **Positive**: ${positive} insights (${positivePercent}%)\n`;
  content += `⚠️ **Neutral**: ${neutral} insights (${neutralPercent}%)\n`;
  content += `❌ **Negative**: ${negative} insights (${negativePercent}%)\n\n`;

  if (positivePercent > 50) {
    content +=
      "Overall sentiment is **positive**! Customers are generally satisfied with your solution.";
  } else if (negativePercent > 50) {
    content +=
      "Overall sentiment is **negative**. There are significant customer concerns that need attention.";
  } else {
    content +=
      "Overall sentiment is **mixed**. Customers have both positive feedback and concerns.";
  }

  return { content };
}

function generateSummaryResponse(): ChatResponse {
  const documents = getDocuments();
  const insights = getInsights();
  const personas = getPersonas();
  const themes = getThemes();
  const opportunities = getOpportunities();

  let content = `Here's a summary of your research analysis:\n\n`;
  content += `📄 **Documents**: ${documents.length} uploaded\n`;
  content += `💡 **Insights**: ${insights.length} extracted\n`;
  content += `👥 **Personas**: ${personas.length} generated\n`;
  content += `🏷️ **Themes**: ${themes.length} identified\n`;
  content += `📈 **Opportunities**: ${opportunities.length} found\n\n`;

  if (documents.length === 0) {
    content +=
      "Start by uploading customer research documents to generate insights and analysis.";
  } else {
    const avgScore =
      opportunities.length > 0
        ? Math.round(
            opportunities.reduce((sum, o) => sum + (o.score || 0), 0) /
              opportunities.length
          )
        : 0;

    content += `**Key Metrics**:\n`;
    content += `• Total data points: ${documents.length + insights.length + personas.length + themes.length + opportunities.length}\n`;
    content += `• Average opportunity score: ${avgScore}/100\n`;
    content += `• Research completeness: ${Math.round((documents.length + insights.length) / 50) * 10}%\n`;
  }

  return { content };
}

function generateRecommendationsResponse(): ChatResponse {
  const opportunities = getOpportunities().sort((a, b) => b.score - a.score);
  const painPoints = getInsights()
    .filter((i) => i.type === InsightType.PAIN_POINT)
    .sort((a, b) => b.frequency - a.frequency);

  if (opportunities.length === 0 && painPoints.length === 0) {
    return {
      content: "Upload more research data to get personalized recommendations.",
    };
  }

  let content = `Based on your research, here are my **top recommendations**:\n\n`;

  if (opportunities.length > 0) {
    const topOpp = opportunities[0];
    content += `🎯 **Priority #1: Address "${topOpp.title}"**\n`;
    content += `   • Impact Score: ${topOpp.score}/100\n`;
    if (topOpp.revenue) {
      content += `   • Revenue Potential: ${topOpp.revenue}\n`;
    }
    content += "\n";
  }

  if (painPoints.length > 0) {
    const topPain = painPoints[0];
    content += `⚠️ **Critical Issue: ${topPain.content}**\n`;
    content += `   • Mentioned ${topPain.frequency} times\n`;
    content += `   • Confidence: ${topPain.confidence}%\n\n`;
  }

  content +=
    "I recommend focusing on these high-impact areas first to maximize customer satisfaction and business growth.";

  return { content };
}

function generateDefaultResponse(query: string): ChatResponse {
  const insights = getInsights();
  const personas = getPersonas();
  const opportunities = getOpportunities();

  if (insights.length === 0) {
    return {
      content: `To answer "${query}", I need more research data. Please upload customer documents to generate insights and analysis.`,
    };
  }

  const suggestions = [
    `About "${query}": I can help you analyze this across ${insights.length} insights, ${personas.length} personas, and ${opportunities.length} opportunities.`,
    `Regarding "${query}": Based on the research, this relates to several customer pain points and opportunities. Would you like me to elaborate on any specific aspect?`,
    `For "${query}": Looking at the data, I see connections to customer needs and business opportunities. Let me know what aspect interests you most.`,
  ];

  return {
    content:
      suggestions[Math.floor(Math.random() * suggestions.length)] +
      "\n\nYou can ask me about pain points, opportunities, personas, themes, sentiment, or get a summary of your analysis.",
  };
}
