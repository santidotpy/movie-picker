"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/utils/trpc";

// TODO: Bento Grid con algunas estadisticas de las listas
export default function Dashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  const privateData = useQuery(trpc.privateData.queryOptions());

  return (
    <>
      <p>API: {privateData.data?.message}</p>
    </>
  );
}
