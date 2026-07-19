/**
 * In-memory storage layer for DiscoveryOS
 * This provides a mock database using localStorage (browser) and memory (server)
 */

import {
  Document,
  Insight,
  Persona,
  Theme,
  Opportunity,
  Report,
} from "@/types";

// Types for storage
export interface StorageData {
  documents: Document[];
  insights: Insight[];
  personas: Persona[];
  themes: Theme[];
  opportunities: Opportunity[];
  reports: Report[];
}

// Initialize storage
const STORAGE_KEY = "discoveryos_data";

// In-memory storage (server-side)
let memoryStorage: StorageData = {
  documents: [],
  insights: [],
  personas: [],
  themes: [],
  opportunities: [],
  reports: [],
};

/**
 * Get all data from storage
 */
export function getAllData(): StorageData {
  try {
    if (typeof window !== "undefined") {
      // Client-side
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : memoryStorage;
      } catch (storageError) {
        console.error("localStorage read error:", storageError);
        return memoryStorage;
      }
    }
  } catch (error) {
    console.error("Storage error:", error);
  }
  return memoryStorage;
}

/**
 * Save all data to storage
 */
export function saveAllData(data: StorageData): void {
  memoryStorage = data;
  try {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (storageError) {
        console.error("localStorage write error:", storageError);
        // Continue with memory storage
      }
    }
  } catch (error) {
    console.error("Storage save error:", error);
  }
}

/**
 * Add a document
 */
export function addDocument(file: File): Document {
  const data = getAllData();
  const doc: Document = {
    id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId: "default",
    originalName: file.name,
    filePath: `file://${file.name}`,
    fileType: file.type,
    fileSize: file.size,
    uploadedAt: new Date(),
  };
  data.documents.push(doc);
  saveAllData(data);
  return doc;
}

/**
 * Get all documents
 */
export function getDocuments(): Document[] {
  return getAllData().documents;
}

/**
 * Delete a document
 */
export function deleteDocument(docId: string): void {
  const data = getAllData();
  data.documents = data.documents.filter((d) => d.id !== docId);
  saveAllData(data);
}

/**
 * Add an insight
 */
export function addInsight(insight: Omit<Insight, "id" | "extractedAt">): Insight {
  const data = getAllData();
  const newInsight: Insight = {
    ...insight,
    id: `insight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    extractedAt: new Date(),
  };
  data.insights.push(newInsight);
  saveAllData(data);
  return newInsight;
}

/**
 * Get all insights
 */
export function getInsights(): Insight[] {
  return getAllData().insights;
}

/**
 * Add a persona
 */
export function addPersona(persona: Omit<Persona, "id" | "createdAt">): Persona {
  const data = getAllData();
  const newPersona: Persona = {
    ...persona,
    id: `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };
  data.personas.push(newPersona);
  saveAllData(data);
  return newPersona;
}

/**
 * Get all personas
 */
export function getPersonas(): Persona[] {
  return getAllData().personas;
}

/**
 * Add a theme
 */
export function addTheme(theme: Omit<Theme, "id">): Theme {
  const data = getAllData();
  const newTheme: Theme = {
    ...theme,
    id: `theme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  data.themes.push(newTheme);
  saveAllData(data);
  return newTheme;
}

/**
 * Get all themes
 */
export function getThemes(): Theme[] {
  return getAllData().themes;
}

/**
 * Add an opportunity
 */
export function addOpportunity(opportunity: Omit<Opportunity, "id" | "createdAt">): Opportunity {
  const data = getAllData();
  const newOpportunity: Opportunity = {
    ...opportunity,
    id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  };
  data.opportunities.push(newOpportunity);
  saveAllData(data);
  return newOpportunity;
}

/**
 * Get all opportunities
 */
export function getOpportunities(): Opportunity[] {
  return getAllData().opportunities;
}

/**
 * Add a report
 */
export function addReport(report: Omit<Report, "id">): Report {
  const data = getAllData();
  const newReport: Report = {
    ...report,
    id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  data.reports.push(newReport);
  saveAllData(data);
  return newReport;
}

/**
 * Get all reports
 */
export function getReports(): Report[] {
  return getAllData().reports;
}

/**
 * Clear all data (for testing)
 */
export function clearAllData(): void {
  const emptyData: StorageData = {
    documents: [],
    insights: [],
    personas: [],
    themes: [],
    opportunities: [],
    reports: [],
  };
  saveAllData(emptyData);
}

/**
 * Get dashboard statistics
 */
export function getDashboardStats() {
  const data = getAllData();
  return {
    totalDocuments: data.documents.length,
    totalInsights: data.insights.length,
    totalPersonas: data.personas.length,
    totalThemes: data.themes.length,
    totalOpportunities: data.opportunities.length,
    totalReports: data.reports.length,
  };
}
