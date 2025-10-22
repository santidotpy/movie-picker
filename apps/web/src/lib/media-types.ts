export type MediaType = "movie" | "tv";
export type ListType = "FAVORITE" | "WATCHED" | "WATCHLIST";

export type NormalizedMedia = {
  id: string; // e.g. "movie:299536"
  title: string;
  mediaType: MediaType;
  posterUrl?: string;
};

export type ListItem = {
  id: number;
  mediaId: string;
  mediaType: MediaType;
  title: string;
  posterUrl?: string;
  createdAt: string;
};

export type ListResponse = {
  page: number;
  totalPages: number;
  results: ListItem[];
};

export type AddToListRequest = {
  mediaId: string;
  mediaType: MediaType;
  title: string;
  posterUrl?: string;
  listType: ListType;
};

export type RemoveFromListRequest = {
  mediaId: string;
  listType: ListType;
};
