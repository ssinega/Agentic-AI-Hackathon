// Authentication using JWT tokens + custom API routes
// No Supabase dependency

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
}

export async function signUp(email: string, password: string, name: string): Promise<{ user: AuthUser }> {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Sign up failed");
  }

  return response.json();
}

export async function signIn(email: string, password: string): Promise<{ user: AuthUser }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Sign in failed");
  }

  return response.json();
}

export async function signOut(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error("Sign out failed");
  }

  // Clear localStorage token
  localStorage.removeItem("auth_user");
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    // Try to get from localStorage first
    const token = localStorage.getItem("auth_user");
    if (token) {
      const parsed = JSON.parse(token);
      return parsed;
    }

    // If no localStorage token, check if auth cookie exists via a lightweight endpoint
    return null;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const token = localStorage.getItem("auth_user");
    if (token) {
      const parsed = JSON.parse(token);
      return parsed;
    }
    return null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export async function resetPassword(_email: string): Promise<void> {
  // TODO: Implement password reset via email
  throw new Error("Password reset not yet implemented");
}

export async function updatePassword(_newPassword: string): Promise<void> {
  // TODO: Implement password update
  throw new Error("Password update not yet implemented");
}
