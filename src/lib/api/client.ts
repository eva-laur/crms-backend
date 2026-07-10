/**
 * Central HTTP client for talking to the CRMS Express backend.
 *
 * Base URL comes from VITE_API_URL (e.g. "http://localhost:5000/api").
 * Falls back to http://localhost:5000/api for local dev, matching the
 * server's default PORT=5000 and the "/api/*" mount points used by every
 * PluginRegistry module (see server/core/PluginRegistry.js).
 */

export const BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5000/api";

const TOKEN_KEY = "crms-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  /** Set true when sending a FormData body (file uploads) — skips JSON stringify/headers. */
  isFormData?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Skip attaching the Authorization header (login/register only). */
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(
    path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`
  );
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

/**
 * Low-level request helper used by every module under src/lib/api/.
 * Every backend route (see server/modules/*\/*.routes.js) returns JSON
 * except calendar/report export endpoints, which are handled by the
 * dedicated `apiDownload` helper below.
 */
export async function apiRequest<T = unknown>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isFormData, query, skipAuth } = opts;

  const headers: Record<string, string> = {};
  if (!isFormData) headers["Content-Type"] = "application/json";

  if (!skipAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  // 204 No Content or empty body
  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    const message = (data && (data as any).message) || res.statusText || "Request failed";
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** For endpoints that return a file (CSV/ICS export) rather than JSON. */
export async function apiDownload(path: string, query?: RequestOptions["query"]): Promise<Blob> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(buildUrl(path, query), { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.statusText || "Download failed", res.status, safeJsonParse(text));
  }
  return res.blob();
}

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
