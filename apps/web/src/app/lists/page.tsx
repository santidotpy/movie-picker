import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@better-t-movies/auth";
import ListsClient from "./lists-client";

export default async function ListsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-2">Mis Listas</h1>
        <p className="text-muted-foreground text-center">
          Gestiona tus películas y series favoritas
        </p>
      </div>

      <ListsClient />
    </div>
  );
}
