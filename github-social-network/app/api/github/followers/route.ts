import { NextRequest, NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const perPage = parseInt(searchParams.get("per_page") || "30", 10);

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const octokit = getOctokit();
    const { data } = await octokit.users.listFollowersForUser({
      username,
      page,
      per_page: Math.min(perPage, 100), // GitHub API max is 100
    });

    return NextResponse.json(
      data.map((follower) => ({
        id: follower.id,
        login: follower.login,
        avatar_url: follower.avatar_url,
      }))
    );
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.error("Error fetching followers:", error);
    return NextResponse.json(
      { error: "Failed to fetch followers" },
      { status: 500 }
    );
  }
}
