import { NextResponse } from "next/server";

export async function POST() {
  console.log("Logout request received");

  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  // Clear the auth cookie
  response.cookies.delete("auth_token");
  console.log("Auth cookie deleted");

  return response;
}

