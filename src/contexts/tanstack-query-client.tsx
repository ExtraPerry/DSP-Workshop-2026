"use client"

import { ReactNode, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const THIRTY_MINUTES_IN_MS = 30 * 60 * 1000;

export function TanstackQueryClient({
  children,
}: {
  children: ReactNode,
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: THIRTY_MINUTES_IN_MS,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
