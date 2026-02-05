import { NextRequest, NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  try {
    const octokit = getOctokit();
    const { data } = await octokit.search.users({
      q: query,
      per_page: 10,
    });

    return NextResponse.json({
      total_count: data.total_count,
      items: data.items.map((user) => ({
        id: user.id,
        login: user.login,
        avatar_url: user.avatar_url,
      })),
    });
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}
