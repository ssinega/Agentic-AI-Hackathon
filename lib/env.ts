/**
 * Environment variable validation
 * Ensures all required environment variables are set at runtime
 */

/**
 * Get environment variable with validation
 * @param key - Environment variable key
 * @param defaultValue - Optional default value
 * @throws Error if required variable is missing
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

/**
 * Get optional environment variable
 */
export function getOptionalEnv(key: string, defaultValue: string = ""): string {
  return process.env[key] || defaultValue;
}

/**
 * Validate demo credentials exist (can be from env or defaults)
 */
export function getDemoCredentials() {
  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@example.com";
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "Demo@123456";
  
  return { demoEmail, demoPassword };
}

/**
 * Validate database URL
 */
export function validateDatabaseConfig(): boolean {
  try {
    const databaseUrl = getEnv("DATABASE_URL");
    return !!databaseUrl;
  } catch (error) {
    console.error("Database configuration invalid:", error);
    return false;
  }
}

/**
 * Validate all required environment variables on app startup
 */
export function validateEnvironment(): void {
  const required = [
    "DATABASE_URL",
    // Add other required env vars as needed
  ];

  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
