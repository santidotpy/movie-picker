import { pgTable, text, timestamp, serial, unique } from "drizzle-orm/pg-core";

export const userMedia = pgTable(
  "user_media",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    mediaId: text("media_id").notNull(), // e.g. "movie:299536" or "tv:123"
    mediaType: text("media_type", { enum: ["movie", "tv"] }).notNull(),
    title: text("title").notNull(),
    posterUrl: text("poster_url"),
    listType: text("list_type", {
      enum: ["FAVORITE", "WATCHED", "WATCHLIST"],
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Unique composite constraint: one item can exist in multiple lists, but only once per list
    userMediaUnique: unique().on(table.userId, table.mediaId, table.listType),
  })
);
