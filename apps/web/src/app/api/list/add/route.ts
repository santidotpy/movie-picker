import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@better-t-movies/auth";
import { db } from "@better-t-movies/db";
import { userMedia } from "@better-t-movies/db/schema";
import type { AddToListRequest } from "@/lib/media-types";

export async function POST(request: NextRequest) {
  try {
    // Validate session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: AddToListRequest = await request.json();

    // Validate required fields
    if (!body.mediaId || !body.mediaType || !body.title || !body.listType) {
      return NextResponse.json(
        {
          error: "Missing required fields: mediaId, mediaType, title, listType",
        },
        { status: 400 }
      );
    }

    // Validate enum values
    if (!["movie", "tv"].includes(body.mediaType)) {
      return NextResponse.json(
        { error: 'Invalid mediaType. Must be "movie" or "tv"' },
        { status: 400 }
      );
    }

    if (!["FAVORITE", "WATCHED", "WATCHLIST"].includes(body.listType)) {
      return NextResponse.json(
        {
          error:
            'Invalid listType. Must be "FAVORITE", "WATCHED", or "WATCHLIST"',
        },
        { status: 400 }
      );
    }

    // Upsert the item (ignore duplicates via unique composite constraint)
    const result = await db
      .insert(userMedia)
      .values({
        userId: session.user.id,
        mediaId: body.mediaId,
        mediaType: body.mediaType,
        title: body.title,
        posterUrl: body.posterUrl,
        listType: body.listType,
      })
      .onConflictDoNothing()
      .returning();

    return NextResponse.json({
      success: true,
      message: `Added to ${body.listType}`,
      data: result[0] || null,
    });
  } catch (error) {
    console.error("Add to list error:", error);
    return NextResponse.json({ error: "Could not save item" }, { status: 500 });
  }
}
