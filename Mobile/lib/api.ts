import axios, { AxiosError } from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Clerk's getToken() is only available inside React via useAuth(), so the
// root layout registers it here once on mount and every request reads it.
let getAuthToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: (() => Promise<string | null>) | null) {
  getAuthToken = getter;
}

api.interceptors.request.use(async (config) => {
  if (getAuthToken && !config.headers?.Authorization) {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  opts: { method?: string; body?: unknown; token?: string | null } = {}
): Promise<T> {
  const isFormData = opts.body instanceof FormData;

  try {
    const res = await api.request<T>({
      url: path,
      method: opts.method ?? "GET",
      data: opts.body,
      headers: {
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
    });
    return res.data;
  } catch (err) {
    if (err instanceof AxiosError) {
      const status = err.response?.status ?? 0;
      const message =
        (err.response?.data as { error?: string } | undefined)?.error ??
        err.message ??
        `Request failed with status ${status}`;
      throw new ApiError(status, message);
    }
    throw err;
  }
}
