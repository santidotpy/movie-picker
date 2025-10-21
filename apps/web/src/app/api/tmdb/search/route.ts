import { NextRequest, NextResponse } from "next/server";

type MediaType = "movie" | "tv";

type SearchItem = {
  id: string; // e.g. "movie:299536" or "tv:123"
  title: string;
  mediaType: MediaType;
  posterUrl?: string;
  overview?: string;
  releaseDate?: string; // movie: release_date; tv: first_air_date
  voteAverage?: number;
};

type SearchResponse = {
  page: number;
  totalPages: number;
  results: SearchItem[];
};

type TMDBMovieResult = {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
};

type TMDBTVResult = {
  id: number;
  name: string;
  poster_path: string | null;
  overview: string;
  first_air_date: string;
  vote_average: number;
};

type TMDBMultiResult = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: "movie" | "tv";
};

type TMDBResponse = {
  page: number;
  total_pages: number;
  results: TMDBMovieResult[] | TMDBTVResult[] | TMDBMultiResult[];
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = searchParams.get("page") || "1";
    const type = searchParams.get("type") || "multi";

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const tmdbApiKey = process.env.TMDB_API_KEY;
    if (!tmdbApiKey) {
      return NextResponse.json(
        { error: "TMDB API key is not configured" },
        { status: 500 }
      );
    }

    // Build the appropriate TMDB endpoint
    let endpoint: string;
    if (type === "multi") {
      endpoint = `https://api.themoviedb.org/3/search/multi`;
    } else if (type === "movie") {
      endpoint = `https://api.themoviedb.org/3/search/movie`;
    } else if (type === "tv") {
      endpoint = `https://api.themoviedb.org/3/search/tv`;
    } else {
      return NextResponse.json(
        { error: "Invalid type parameter. Must be movie, tv, or multi" },
        { status: 400 }
      );
    }

    const tmdbUrl = new URL(endpoint);
    tmdbUrl.searchParams.set("query", query);
    tmdbUrl.searchParams.set("page", page);
    tmdbUrl.searchParams.set("include_adult", "false");
    tmdbUrl.searchParams.set("language", "es-AR");

    const response = await fetch(tmdbUrl.toString(), {
      headers: {
        Authorization: `Bearer ${tmdbApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("TMDB API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to fetch from TMDB API" },
        { status: response.status }
      );
    }

    const data: TMDBResponse = await response.json();

    // Normalize the response based on type
    const normalizedResults: SearchItem[] = data.results.map((item) => {
      if (type === "multi") {
        const multiItem = item as TMDBMultiResult;
        return {
          id: `${multiItem.media_type}:${multiItem.id}`,
          title: multiItem.title || multiItem.name || "Sin título",
          mediaType: multiItem.media_type,
          posterUrl: multiItem.poster_path
            ? `https://image.tmdb.org/t/p/w342${multiItem.poster_path}`
            : undefined,
          overview: multiItem.overview || undefined,
          releaseDate:
            multiItem.media_type === "movie"
              ? multiItem.release_date
              : multiItem.first_air_date,
          voteAverage: multiItem.vote_average,
        };
      } else if (type === "movie") {
        const movieItem = item as TMDBMovieResult;
        return {
          id: `movie:${movieItem.id}`,
          title: movieItem.title,
          mediaType: "movie" as MediaType,
          posterUrl: movieItem.poster_path
            ? `https://image.tmdb.org/t/p/w342${movieItem.poster_path}`
            : undefined,
          overview: movieItem.overview || undefined,
          releaseDate: movieItem.release_date,
          voteAverage: movieItem.vote_average,
        };
      } else {
        const tvItem = item as TMDBTVResult;
        return {
          id: `tv:${tvItem.id}`,
          title: tvItem.name,
          mediaType: "tv" as MediaType,
          posterUrl: tvItem.poster_path
            ? `https://image.tmdb.org/t/p/w342${tvItem.poster_path}`
            : undefined,
          overview: tvItem.overview || undefined,
          releaseDate: tvItem.first_air_date,
          voteAverage: tvItem.vote_average,
        };
      }
    });

    const searchResponse: SearchResponse = {
      page: data.page,
      totalPages: data.total_pages,
      results: normalizedResults,
    };

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
