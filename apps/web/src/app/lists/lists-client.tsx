"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MoreVertical, Trash2, Heart, Eye, Bookmark } from "lucide-react";
import type {
  ListResponse,
  ListItem,
  ListType,
  RemoveFromListRequest,
} from "@/lib/media-types";

const LIST_TYPES: { value: ListType; label: string; icon: React.ReactNode }[] =
  [
    {
      value: "FAVORITE",
      label: "Favoritos",
      icon: <Heart className="h-4 w-4" />,
    },
    { value: "WATCHED", label: "Vistos", icon: <Eye className="h-4 w-4" /> },
    {
      value: "WATCHLIST",
      label: "Lista de Espera",
      icon: <Bookmark className="h-4 w-4" />,
    },
  ];

export default function ListsClient() {
  const [activeTab, setActiveTab] = useState<ListType>("FAVORITE");
  const [lists, setLists] = useState<Record<ListType, ListResponse>>({
    FAVORITE: { page: 1, totalPages: 0, results: [] },
    WATCHED: { page: 1, totalPages: 0, results: [] },
    WATCHLIST: { page: 1, totalPages: 0, results: [] },
  });
  const [loading, setLoading] = useState<Record<ListType, boolean>>({
    FAVORITE: false,
    WATCHED: false,
    WATCHLIST: false,
  });

  const fetchList = async (listType: ListType, page: number = 1) => {
    setLoading((prev) => ({ ...prev, [listType]: true }));

    try {
      const response = await fetch(
        `/api/list?type=${listType}&page=${page}&limit=20`
      );

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to view your lists");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch list");
      }

      const data: ListResponse = await response.json();
      setLists((prev) => ({ ...prev, [listType]: data }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not fetch list";
      toast.error(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, [listType]: false }));
    }
  };

  const handleRemoveFromList = async (item: ListItem, listType: ListType) => {
    try {
      const requestBody: RemoveFromListRequest = {
        mediaId: item.mediaId,
        listType,
      };

      const response = await fetch("/api/list/remove", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to manage your lists");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove from list");
      }

      const data = await response.json();
      toast.success(data.message || `Removed from ${listType}`);

      // Refresh the current list
      fetchList(listType, lists[listType].page);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not remove item";
      toast.error(errorMessage);
    }
  };

  const handlePageChange = (listType: ListType, newPage: number) => {
    fetchList(listType, newPage);
  };

  const handleTabChange = (value: string) => {
    const listType = value as ListType;
    setActiveTab(listType);

    // Fetch data if not already loaded
    if (lists[listType].results.length === 0) {
      fetchList(listType);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchList(activeTab);
  }, []);

  const getMediaTypeVariant = (mediaType: string) => {
    return mediaType === "movie" ? "default" : "secondary";
  };

  const getMediaTypeLabel = (mediaType: string) => {
    return mediaType === "movie" ? "Película" : "Serie";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR");
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {LIST_TYPES.map(({ value, label, icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="flex items-center gap-2"
          >
            {icon}
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      {LIST_TYPES.map(({ value: listType }) => (
        <TabsContent key={listType} value={listType} className="mt-6">
          {loading[listType] ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-2/3 w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : lists[listType].results.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                {LIST_TYPES.find((t) => t.value === listType)?.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                No hay elementos en esta lista
              </h3>
              <p className="text-muted-foreground">
                Agrega películas y series desde la página de búsqueda
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-sm text-muted-foreground">
                  {lists[listType].results.length} elemento
                  {lists[listType].results.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {lists[listType].results.map((item) => (
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
                                <span className="sr-only">Opciones</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRemoveFromList(item, listType)
                                }
                                className="cursor-pointer text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar de la lista
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Agregado el {formatDate(item.createdAt)}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {lists[listType].totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handlePageChange(listType, lists[listType].page - 1)
                    }
                    disabled={lists[listType].page <= 1 || loading[listType]}
                    aria-label="Página anterior"
                  >
                    Anterior
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    Página {lists[listType].page} de{" "}
                    {lists[listType].totalPages}
                  </span>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handlePageChange(listType, lists[listType].page + 1)
                    }
                    disabled={
                      lists[listType].page >= lists[listType].totalPages ||
                      loading[listType]
                    }
                    aria-label="Página siguiente"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
