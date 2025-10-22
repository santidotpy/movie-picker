import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@better-t-movies/auth";
import { db } from "@better-t-movies/db";
import { userMedia } from "@better-t-movies/db/schema";
import type { RemoveFromListRequest } from "@/lib/media-types";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: RemoveFromListRequest = await request.json();

    // Validate required fields
    if (!body.mediaId || !body.listType) {
      return NextResponse.json(
        { error: "Missing required fields: mediaId, listType" },
        { status: 400 }
      );
    }

    // Validate enum values
    if (!["FAVORITE", "WATCHED", "WATCHLIST"].includes(body.listType)) {
      return NextResponse.json(
        {
          error:
            'Invalid listType. Must be "FAVORITE", "WATCHED", or "WATCHLIST"',
        },
        { status: 400 }
      );
    }

    // Delete the item
    const result = await db
      .delete(userMedia)
      .where(
        and(
          eq(userMedia.userId, session.user.id),
          eq(userMedia.mediaId, body.mediaId),
          eq(userMedia.listType, body.listType)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      message: `Removed from ${body.listType}`,
      data: result[0] || null,
    });
  } catch (error) {
    console.error("Remove from list error:", error);
    return NextResponse.json(
      { error: "Could not remove item" },
      { status: 500 }
    );
  }
}
