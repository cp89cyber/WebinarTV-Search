import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { NotFoundPage } from "../routes/NotFoundPage";
import { SearchPage } from "../routes/SearchPage";
import { WebinarDetailPage } from "../routes/WebinarDetailPage";

export function renderApp(initialEntries: string[] = ["/"], user = userEvent.setup()) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false
      }
    }
  });

  return {
    user,
    queryClient,
    ...render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={initialEntries}
          future={{
            v7_relativeSplatPath: true,
            v7_startTransition: true
          }}
        >
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/webinars/:id" element={<WebinarDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  };
}
