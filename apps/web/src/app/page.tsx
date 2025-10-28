"use client";
// import { useQuery } from "@tanstack/react-query";
// import { trpc } from "@/utils/trpc";

// const TITLE_TEXT = `
// Better-T-Movies`;

// export default function Home() {
//   const healthCheck = useQuery(trpc.healthCheck.queryOptions());

//   return (
//     <div className="container mx-auto max-w-3xl px-4 py-2">
//       <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
//       <div className="grid gap-6">
//         <section className="rounded-lg border p-4">
//           <h2 className="mb-2 font-medium">API Status</h2>
//           <div className="flex items-center gap-2">
//             <div
//               className={`h-2 w-2 rounded-full ${
//                 healthCheck.data ? "bg-green-500" : "bg-red-500"
//               }`}
//             />
//             <span className="text-sm text-muted-foreground">
//               {healthCheck.isLoading
//                 ? "Checking..."
//                 : healthCheck.data
//                 ? "Connected"
//                 : "Disconnected"}
//             </span>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

import { cn } from "@/lib/utils";
import React from "react";
import BlurText from "@/components/BlurText";

export default function HomePage() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-white dark:bg-black">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      {/* <p className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold text-transparent sm:text-7xl">
        Better-T-Movies
      </p> */}
      <BlurText
        text="Better - T - Movies"
        delay={150}
        animateBy="words"
        direction="top"
        // onAnimationComplete={handleAnimationComplete}
        className="bg-gradient-to-b from-neutral-200 to-neutral-500 bg-clip-text py-8 text-4xl font-bold sm:text-7xl"
      />
    </div>
  );
}
