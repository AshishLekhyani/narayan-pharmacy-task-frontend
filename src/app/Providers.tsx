"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { ReactNode, useState } from "react";

const SmoothScroll = dynamic(() => import("../components/SmoothScroll"), { ssr: false });

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll>{children}</SmoothScroll>
    </QueryClientProvider>
  );
}
