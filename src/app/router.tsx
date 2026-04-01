import { createBrowserRouter } from "react-router-dom";

import { NotFoundPage } from "../routes/NotFoundPage";
import { SearchPage } from "../routes/SearchPage";
import { WebinarDetailPage } from "../routes/WebinarDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SearchPage />
  },
  {
    path: "/webinars/:id",
    element: <WebinarDetailPage />
  },
  {
    path: "*",
    element: <NotFoundPage />
  }
], {
  future: {
    v7_relativeSplatPath: true
  }
});
