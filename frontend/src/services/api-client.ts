import { API_BASE_URL } from "@/constants/env";
import { sleep } from "@/lib/sleep";

const UNAUTHORIZED = 401;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiFetchOptions extends RequestInit {
  retryOn401?: boolean;
}

export interface AuthRefreshHandler {
  refresh: () => Promise<string | null>;
}

export class ApiClient {
  private accessToken: string | null = null;
  private readonly refreshHandler: AuthRefreshHandler;

  constructor(refreshHandler: AuthRefreshHandler) {
    this.refreshHandler = refreshHandler;
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  async request<TResponse>(path: string, options: ApiFetchOptions = {}): Promise<TResponse> {
    const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
    const headers = new Headers(options.headers);

    if (this.accessToken) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include"
    });

    if (response.status === UNAUTHORIZED && options.retryOn401 !== false) {
      const newAccessToken = await this.refreshHandler.refresh();
      if (newAccessToken) {
        this.accessToken = newAccessToken;
        await sleep(150);
        return this.request<TResponse>(path, { ...options, retryOn401: false });
      }
    }

    if (!response.ok) {
      throw new ApiError(response.status, await safeParseJson(response));
    }

    const data = await safeParseJson<TResponse>(response);
    return data as TResponse;
  }
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, payload: unknown) {
    super(`API request failed with status ${status}`);
    this.status = status;
    this.payload = payload;
  }
}

async function safeParseJson<T = unknown>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}