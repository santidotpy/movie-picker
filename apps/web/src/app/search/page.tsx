"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoreVertical, Heart, Eye, Bookmark } from "lucide-react";
import type { AddToListRequest, MediaType, ListType } from "@/lib/media-types";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

type SearchItem = {
  id: string;
  title: string;
  mediaType: MediaType;
  posterUrl?: string;
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
};

type SearchResponse = {
  page: number;
  totalPages: number;
  results: SearchItem[];
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchType, setSearchType] = useState<"movie" | "tv" | "multi">(
    "multi"
  );
  const { data: session } = authClient.useSession();

  if (!session) {
    redirect("/login");
  }

  // Handle adding items to lists
  const handleAddToList = async (item: SearchItem, listType: ListType) => {
    try {
      const requestBody: AddToListRequest = {
        mediaId: item.id,
        mediaType: item.mediaType,
        title: item.title,
        posterUrl: item.posterUrl,
        listType,
      };

      const response = await fetch("/api/list/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to save items to your lists");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add to list");
      }

      const data = await response.json();
      toast.success(data.message || `Added to ${listType}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not save item";
      toast.error(errorMessage);
    }
  };

  // Debounce search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (
        searchQuery: string,
        searchPage: number = 1,
        type: string = "multi"
      ) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          performSearch(searchQuery, searchPage, type);
        }, 300);
      };
    })(),
    []
  );

  const performSearch = async (
    searchQuery: string,
    searchPage: number = 1,
    type: string = "multi"
  ) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        page: searchPage.toString(),
        type: type,
      });

      const response = await fetch(`/api/tmdb/search?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search");
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);
      setTotalPages(data.totalPages);
      setPage(data.page);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query, 1, searchType);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value, 1, searchType);
  };

  const handlePageChange = (newPage: number) => {
    if (query.trim()) {
      performSearch(query, newPage, searchType);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Fecha no disponible";
    try {
      return new Date(dateString).toLocaleDateString("es-AR");
    } catch {
      return "Fecha no disponible";
    }
  };

  const formatVoteAverage = (vote?: number) => {
    if (vote === undefined || vote === null) return "N/A";
    return vote.toFixed(1);
  };

  const getMediaTypeLabel = (mediaType: MediaType) => {
    return mediaType === "movie" ? "Película" : "Serie";
  };

  const getMediaTypeVariant = (mediaType: MediaType) => {
    return mediaType === "movie" ? "default" : "secondary";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">
          Buscar Películas y Series
        </h1>
        <p className="text-muted-foreground text-center">
          Descubre tus películas y series favoritas
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Buscar películas o series..."
              value={query}
              onChange={handleInputChange}
              className="w-full"
              aria-label="Búsqueda de películas y series"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) =>
                setSearchType(e.target.value as "movie" | "tv" | "multi")
              }
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              aria-label="Tipo de búsqueda"
            >
              <option value="multi">Todo</option>
              <option value="movie">Películas</option>
              <option value="tv">Series</option>
            </select>
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-2/3 w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground">
              {results.length} resultado{results.length !== 1 ? "s" : ""}{" "}
              encontrado{results.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-2/3 relative">
                  {item.posterUrl ? (
                    <Image
                      src={item.posterUrl}
                      alt={`Poster de ${item.title}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">
                        Sin imagen
                      </span>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-tight line-clamp-2">
                      {item.title}
                    </CardTitle>
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        variant={getMediaTypeVariant(item.mediaType)}
                        className="text-xs"
                      >
                        {getMediaTypeLabel(item.mediaType)}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <MoreVertical className="h-3 w-3" />
                            <span className="sr-only">Opciones de lista</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleAddToList(item, "FAVORITE")}
                            className="cursor-pointer"
                          >
                            <Heart className="mr-2 h-4 w-4" />
                            Agregar a Favoritos
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAddToList(item, "WATCHED")}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Marcar como Visto
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleAddToList(item, "WATCHLIST")}
                            className="cursor-pointer"
                          >
                            <Bookmark className="mr-2 h-4 w-4" />
                            Agregar a Lista de Espera
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>⭐ {formatVoteAverage(item.voteAverage)}</span>
                    <span>{formatDate(item.releaseDate)}</span>
                  </div>
                </CardHeader>

                {item.overview && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {item.overview}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || isLoading}
                aria-label="Página anterior"
              >
                Anterior
              </Button>

              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || isLoading}
                aria-label="Página siguiente"
              >
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!isLoading && query.trim() && results.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No se encontraron resultados para "{query}"
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}

      {/* Initial State */}
      {!isLoading && !query.trim() && results.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Ingresa un término de búsqueda para comenzar
          </p>
        </div>
      )}
    </div>
  );
}
