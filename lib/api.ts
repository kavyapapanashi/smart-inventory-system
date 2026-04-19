/**
 * lib/api.ts
 * Central API client — all backend calls go through here.
 * Base URL reads from NEXT_PUBLIC_API_URL env var, falls back to localhost:5000
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; status: number }> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    const json = await res.json();
    if (!res.ok) {
      // ── Auto-logout on expired / invalid token ──────────────────────────
      if (res.status === 401 && typeof window !== "undefined") {
        clearSession();
        window.location.href = "/login";
        return { data: null, error: "Session expired. Please log in again.", status: 401 };
      }
      return { data: null, error: json.error || "Request failed", status: res.status };
    }
    return { data: json as T, error: null, status: res.status };
  } catch (err) {
    return { data: null, error: "Cannot reach the server. Is the backend running?", status: 0 };
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginResponse {
  message: string;
  token: string;
  user: { id: string; name: string; email: string; role: string };
}

export interface RegisterResponse {
  message: string;
  user_id: string;
}

export const auth = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, role: string) =>
    request<RegisterResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    }),

  me: () => request<{ user: LoginResponse["user"] }>("/auth/me"),
};

// ── Inventory ─────────────────────────────────────────────────────────────────

export interface Item {
  id: string;
  name: string;
  quantity: number;
  description: string;
}

export interface PaginatedItems {
  items: Item[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const inventory = {
  list: (page = 1, limit = 10) =>
    request<PaginatedItems>(`/items?page=${page}&limit=${limit}`),

  get: (id: string) => request<{ item: Item }>(`/items/${id}`),

  add: (name: string, quantity: number, description = "") =>
    request<{ message: string; item_id: string }>("/items", {
      method: "POST",
      body: JSON.stringify({ name, quantity, description }),
    }),

  update: (id: string, name: string, quantity: number, description = "") =>
    request<{ message: string }>(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, quantity, description }),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/items/${id}`, { method: "DELETE" }),
};

// ── Requests ──────────────────────────────────────────────────────────────────

export interface StockRequest {
  id: string;
  item_name: string;
  quantity: number;
  requested_by: string;
  status: "pending" | "approved" | "rejected";
}

export interface PaginatedRequests {
  requests: StockRequest[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const requests = {
  list: (page = 1, limit = 10) =>
    request<PaginatedRequests>(`/requests?page=${page}&limit=${limit}`),

  create: (item_name: string, quantity: number) =>
    request<{ message: string; request_id: string }>("/requests", {
      method: "POST",
      body: JSON.stringify({ item_name, quantity }),
    }),

  approve: (id: string) =>
    request<{ message: string }>(`/requests/${id}/approve`, { method: "PUT" }),

  reject: (id: string) =>
    request<{ message: string }>(`/requests/${id}/reject`, { method: "PUT" }),
};

// ── Transactions ──────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  item_id: string;
  item_name: string;
  user_id: string;
  user_name: string;
  type: "issued" | "returned";
  quantity: number;
  timestamp: string;
  status: string;
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const transactions = {
  list: (page = 1, limit = 10) =>
    request<PaginatedTransactions>(`/transactions?page=${page}&limit=${limit}`),

  log: (item_id: string, type: "issued" | "returned", quantity: number) =>
    request<{ message: string; transaction_id: string }>("/transactions", {
      method: "POST",
      body: JSON.stringify({ item_id, type, quantity }),
    }),
};

// ── Users (admin) ─────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
export interface PaginatedUsers {
  users: AppUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export const users = {
  list: (page = 1, limit = 20) =>
    request<PaginatedUsers>(`/users?page=${page}&limit=${limit}`),
};

// ── Reports ───────────────────────────────────────────────────────────────────

export interface ReportSummary {
  total_items: number;
  low_stock: number;
  out_of_stock: number;
  total_users: number;
  pending_requests: number;
  approved_requests: number;
  total_transactions: number;
}

export const reports = {
  summary: () => request<ReportSummary>("/reports/summary"),
};

// ── File download helper ──────────────────────────────────────────────────────

export async function downloadFile(path: string, filename: string) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.error || "Download failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


export function saveSession(token: string, user: LoginResponse["user"]) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): LoginResponse["user"] | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isAdmin(): boolean {
  return getUser()?.role === "admin";
}
