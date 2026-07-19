/**
 * Mock data generation from uploaded documents
 * Generates realistic insights, personas, themes, and opportunities
 */

import {
  InsightType,
  Sentiment,
  PersonaType,
  PersonaSize,
  OpportunitySeverity,
} from "@/types";
import {
  addInsight,
  addPersona,
  addTheme,
  addOpportunity,
  getDocuments,
  getInsights,
  getPersonas,
  getThemes,
  getOpportunities,
} from "./storage";

// Sample data templates
const PAIN_POINTS = [
  "Difficulty integrating with existing systems",
  "Lack of real-time collaboration features",
  "Steep learning curve for new users",
  "Insufficient customization options",
  "Poor mobile experience",
  "Limited reporting capabilities",
  "High cost of deployment",
  "Inadequate customer support",
  "Scalability concerns",
  "Data security issues",
];

const CUSTOMER_NEEDS = [
  "Better integration with third-party tools",
  "Improved user interface and UX",
  "Enhanced automation capabilities",
  "Real-time analytics and insights",
  "Better collaboration features",
  "Mobile application support",
  "Advanced filtering and search",
  "Custom workflow automation",
  "API access for developers",
  "Comprehensive documentation",
];

const FEATURE_REQUESTS = [
  "Dark mode support",
  "Advanced permission management",
  "Batch import/export functionality",
  "Custom branding options",
  "Webhook support",
  "Advanced scheduling",
  "Multi-language support",
  "Single sign-on (SSO) integration",
  "Advanced reporting",
  "AI-powered suggestions",
];

const THEMES = [
  { name: "Integration & Connectivity", sentiment: "neutral" },
  { name: "User Experience & Design", sentiment: "negative" },
  { name: "Performance & Reliability", sentiment: "neutral" },
  { name: "Data & Analytics", sentiment: "positive" },
  { name: "Security & Compliance", sentiment: "neutral" },
  { name: "Scalability & Growth", sentiment: "positive" },
  { name: "Support & Documentation", sentiment: "negative" },
  { name: "Customization & Flexibility", sentiment: "positive" },
  { name: "Cost & ROI", sentiment: "negative" },
  { name: "Mobile & Remote Access", sentiment: "neutral" },
];

const PERSONAS = [
  {
    name: "Technical Lead",
    role: "VP of Engineering",
    industry: "SaaS",
    frustrations: [
      "Integration with legacy systems",
      "API limitations",
      "Scaling challenges",
    ],
    goals: ["Improve team productivity", "Reduce technical debt"],
    behaviors: ["Late-night deployments", "Heavy automation user"],
  },
  {
    name: "Product Manager",
    role: "Head of Product",
    industry: "E-commerce",
    frustrations: [
      "Lack of real-time data",
      "Reporting limitations",
      "User feedback loop",
    ],
    goals: ["Faster feature releases", "Better product decisions"],
    behaviors: ["Daily metric reviews", "User research enthusiast"],
  },
  {
    name: "Business Analyst",
    role: "Business Operations Manager",
    industry: "Financial Services",
    frustrations: [
      "Manual data entry",
      "Reporting inefficiencies",
      "Cross-team collaboration",
    ],
    goals: ["Automate workflows", "Improve data accuracy"],
    behaviors: ["Excel power user", "Process optimization focused"],
  },
  {
    name: "Sales Manager",
    role: "Director of Sales",
    industry: "Marketing",
    frustrations: [
      "Forecasting inaccuracy",
      "Lead tracking",
      "Team adoption",
    ],
    goals: ["Increase sales efficiency", "Better customer insights"],
    behaviors: ["CRM native", "Commission-driven"],
  },
  {
    name: "Customer Success Lead",
    role: "Head of Customer Success",
    industry: "B2B SaaS",
    frustrations: [
      "Customer retention",
      "Churn prediction",
      "Personalization",
    ],
    goals: ["Reduce churn", "Improve NPS"],
    behaviors: ["Customer-centric", "Regular check-ins"],
  },
];



/**
 * Generate insights from documents
 */
export function generateInsightsFromDocuments(): number {
  const documents = getDocuments();

  if (documents.length === 0) return 0;

  let generatedCount = 0;

  // Generate insights for each document
  for (let d = 0; d < documents.length; d++) {
    // Generate 3-5 insights per document
    const insightCount = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < insightCount; i++) {
      const types = [
        InsightType.CUSTOMER_NEED,
        InsightType.PAIN_POINT,
        InsightType.FEATURE_REQUEST,
        InsightType.FEEDBACK,
      ];
      const type = types[Math.floor(Math.random() * types.length)];

      let content = "";
      const sentiments: Sentiment[] = [
        Sentiment.POSITIVE,
        Sentiment.NEGATIVE,
        Sentiment.NEUTRAL,
      ];

      if (type === InsightType.PAIN_POINT) {
        content = PAIN_POINTS[Math.floor(Math.random() * PAIN_POINTS.length)];
      } else if (type === InsightType.CUSTOMER_NEED) {
        content =
          CUSTOMER_NEEDS[Math.floor(Math.random() * CUSTOMER_NEEDS.length)];
      } else if (type === InsightType.FEATURE_REQUEST) {
        content =
          FEATURE_REQUESTS[Math.floor(Math.random() * FEATURE_REQUESTS.length)];
      } else {
        content = "Customer provided valuable feedback about their experience";
      }

      const sentiment =
        sentiments[Math.floor(Math.random() * sentiments.length)];

      addInsight({
        projectId: "default",
        type,
        content,
        frequency: Math.floor(Math.random() * 20) + 1,
        sentiment,
        confidence: Math.floor(Math.random() * 40) + 60,
      });

      generatedCount++;
    }
  }

  return generatedCount;
}

/**
 * Generate personas from documents
 */
export function generatePersonasFromDocuments(): number {
  const documents = getDocuments();
  const existingPersonas = getPersonas();

  if (documents.length === 0 || existingPersonas.length > 0) return 0;

  let generatedCount = 0;

  // Generate 3-5 personas
  const personaCount = Math.floor(Math.random() * 3) + 3;

  for (let i = 0; i < personaCount && i < PERSONAS.length; i++) {
    const template = PERSONAS[i];
    const size: PersonaSize = [
      PersonaSize.LARGE,
      PersonaSize.MEDIUM,
      PersonaSize.SMALL,
    ][Math.floor(Math.random() * 3)];

    addPersona({
      projectId: "default",
      type:
        i === 0
          ? PersonaType.PRIMARY
          : i === 1
            ? PersonaType.SECONDARY
            : PersonaType.TERTIARY,
      name: template.name,
      role: template.role,
      description: `A ${size} persona representing ${template.industry} professionals`,
      frustrations: template.frustrations.join(", "),
      goals: template.goals.join(", "),
      behaviors: template.behaviors.join(", "),
      size,
    });

    generatedCount++;
  }

  return generatedCount;
}

/**
 * Generate themes from documents
 */
export function generateThemesFromDocuments(): number {
  const documents = getDocuments();
  const existingThemes = getThemes();

  if (documents.length === 0 || existingThemes.length > 0) return 0;

  let generatedCount = 0;

  // Generate themes
  THEMES.forEach((themeTemplate) => {
    addTheme({
      projectId: "default",
      name: themeTemplate.name,
      description: `Clustered theme from customer research: ${themeTemplate.name}`,
      frequency: Math.floor(Math.random() * 50) + 10,
      relatedInsights: getInsights()
        .slice(0, Math.floor(Math.random() * 5) + 2)
        .map((i) => i.id),
      createdAt: new Date(),
    });

    generatedCount++;
  });

  return generatedCount;
}

/**
 * Generate opportunities from insights
 */
export function generateOpportunitiesFromDocuments(): number {
  const documents = getDocuments();
  const insights = getInsights();
  const existingOpportunities = getOpportunities();

  if (documents.length === 0 || insights.length === 0 || existingOpportunities.length > 0) {
    return 0;
  }

  let generatedCount = 0;

  // Generate opportunities from pain points and needs
  const painPoints = insights.filter(
    (i) => i.type === InsightType.PAIN_POINT
  );
  const needs = insights.filter((i) => i.type === InsightType.CUSTOMER_NEED);

  const opportunities = [...painPoints, ...needs].slice(0, 10);

  opportunities.forEach((insight) => {
    const severity: OpportunitySeverity = [
      OpportunitySeverity.HIGH,
      OpportunitySeverity.MEDIUM,
      OpportunitySeverity.LOW,
    ][Math.floor(Math.random() * 3)];

    const score = Math.floor(Math.random() * 30) + 70;
    const revenue = severity === OpportunitySeverity.HIGH ? "$500K-$1M" : severity === OpportunitySeverity.MEDIUM ? "$100K-$500K" : "$10K-$100K";

    addOpportunity({
      projectId: "default",
      title: insight.content,
      description: `Opportunity identified from customer ${insight.type} feedback. ${severity === OpportunitySeverity.HIGH ? "This is a critical issue affecting multiple customers." : "Address to improve customer satisfaction."}`,
      frequency: insight.frequency,
      severity,
      revenue,
      confidence: insight.confidence,
      score,
    });

    generatedCount++;
  });

  return generatedCount;
}

/**
 * Generate all mock data from documents
 */
export function generateAllMockDataFromDocuments() {
  const results = {
    insights: generateInsightsFromDocuments(),
    personas: generatePersonasFromDocuments(),
    themes: generateThemesFromDocuments(),
    opportunities: generateOpportunitiesFromDocuments(),
  };

  return results;
}

/**
 * Get data summary
 */
export function getDataSummary() {
  const documents = getDocuments();
  const insights = getInsights();
  const personas = getPersonas();
  const themes = getThemes();
  const opportunities = getOpportunities();

  return {
    documents: documents.length,
    insights: insights.length,
    personas: personas.length,
    themes: themes.length,
    opportunities: opportunities.length,
    totalDataPoints:
      documents.length +
      insights.length +
      personas.length +
      themes.length +
      opportunities.length,
  };
}
