import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@better-t-movies/auth";
import { db } from "@better-t-movies/db";
import { userMedia } from "@better-t-movies/db/schema";
import type { ListResponse, ListType } from "@/lib/media-types";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as ListType;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Validate required fields
    if (!type) {
      return NextResponse.json(
        { error: "Missing required parameter: type" },
        { status: 400 }
      );
    }

    // Validate enum values
    if (!["FAVORITE", "WATCHED", "WATCHLIST"].includes(type)) {
      return NextResponse.json(
        {
          error: 'Invalid type. Must be "FAVORITE", "WATCHED", or "WATCHLIST"',
        },
        { status: 400 }
      );
    }

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: userMedia.id })
      .from(userMedia)
      .where(
        and(eq(userMedia.userId, session.user.id), eq(userMedia.listType, type))
      );

    const totalCount = totalCountResult.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Get paginated results
    const results = await db
      .select({
        id: userMedia.id,
        mediaId: userMedia.mediaId,
        mediaType: userMedia.mediaType,
        title: userMedia.title,
        posterUrl: userMedia.posterUrl,
        createdAt: userMedia.createdAt,
      })
      .from(userMedia)
      .where(
        and(eq(userMedia.userId, session.user.id), eq(userMedia.listType, type))
      )
      .orderBy(desc(userMedia.createdAt))
      .limit(limit)
      .offset(offset);

    const response: ListResponse = {
      page,
      totalPages,
      results: results.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get list error:", error);
    return NextResponse.json(
      { error: "Could not fetch list" },
      { status: 500 }
    );
  }
}
