import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (typeof window !== "undefined") {
  globalThis.AbortController = window.AbortController;
  globalThis.AbortSignal = window.AbortSignal;
  globalThis.Request = window.Request;
  globalThis.Response = window.Response;
  globalThis.Headers = window.Headers;
}

afterEach(() => {
  cleanup();
});
