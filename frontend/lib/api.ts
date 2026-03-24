import { CLIENT_API_BASE, SERVER_API_BASE } from "@/lib/constants";
import {
  Martyr,
  MartyrListItem,
  MartyrStats,
  PaginatedResponse,
  Submission,
  SubmissionStatus,
  Village
} from "@/lib/types";
import { buildQueryString } from "@/lib/utils";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function resolveBaseUrl() {
  return typeof window === "undefined" ? SERVER_API_BASE : CLIENT_API_BASE;
}

async function request<T>(
  path: string,
  init?: RequestInit & { token?: string; next?: { revalidate?: number | false; tags?: string[] } }
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (init?.token) {
    headers.set("Authorization", `Bearer ${init.token}`);
  }

  if (!(init?.body instanceof FormData) && !headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: init?.cache ?? (init?.next ? "force-cache" : "no-store"),
    next: init?.next
  });

  if (!response.ok) {
    let message = "حدث خطأ غير متوقع";
    try {
      const payload = await response.json();
      message = payload?.detail || message;
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export type MartyrQuery = {
  q?: string;
  village?: string;
  year?: number;
  featured?: boolean;
  page?: number;
  page_size?: number;
  sort?: "newest" | "oldest" | "alphabetical";
  include_unpublished?: boolean;
};

export async function getMartyrs(query: MartyrQuery = {}) {
  const q = buildQueryString(query);
  return request<PaginatedResponse<MartyrListItem>>(`/martyrs${q ? `?${q}` : ""}`, {
    cache: "no-store"
  });
}

export async function getMartyrBySlug(slug: string) {
  return request<Martyr>(`/martyrs/${slug}`, {
    cache: "no-store"
  });
}

export async function getMartyrByIdAdmin(id: number, token: string) {
  return request<Martyr>(`/martyrs/by-id/${id}`, { token });
}

export async function getMartyrStats() {
  return request<MartyrStats>("/martyrs/stats", {
    next: { revalidate: 120 }
  });
}

export async function getVillages() {
  return request<Village[]>("/villages", {
    next: { revalidate: 3600 }
  });
}

export async function submitSubmission(payload: {
  martyr_id?: number;
  submitter_name?: string;
  submitter_email?: string;
  message: string;
}) {
  return request<Submission>("/submissions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function loginAdmin(payload: { username: string; password: string }) {
  return request<{ access_token: string; token_type: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function getAdminMartyrs(token: string, query: MartyrQuery = {}) {
  return request<PaginatedResponse<MartyrListItem>>(
    `/martyrs?${buildQueryString({ include_unpublished: true, ...query })}`,
    {
      token
    }
  );
}

export async function createMartyr(token: string, formData: FormData) {
  return request<Martyr>("/martyrs", {
    method: "POST",
    token,
    body: formData
  });
}

export async function updateMartyr(token: string, martyrId: number, formData: FormData) {
  return request<Martyr>(`/martyrs/${martyrId}`, {
    method: "PATCH",
    token,
    body: formData
  });
}

export async function deleteMartyr(token: string, martyrId: number) {
  return request<void>(`/martyrs/${martyrId}`, {
    method: "DELETE",
    token
  });
}

export async function uploadGalleryImage(
  token: string,
  martyrId: number,
  formData: FormData
) {
  return request(`/martyrs/${martyrId}/gallery`, {
    method: "POST",
    token,
    body: formData
  });
}

export async function deleteGalleryImage(token: string, martyrId: number, imageId: number) {
  return request<void>(`/martyrs/${martyrId}/gallery/${imageId}`, {
    method: "DELETE",
    token
  });
}

export async function createVillage(token: string, payload: { name_ar: string; name_en?: string }) {
  return request<Village>("/villages", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}

export async function getSubmissions(token: string, query?: { status?: SubmissionStatus; page?: number }) {
  const q = buildQueryString(query ?? {});
  return request<PaginatedResponse<Submission>>(`/submissions${q ? `?${q}` : ""}`, {
    token
  });
}

export async function reviewSubmission(token: string, submissionId: number, status: SubmissionStatus) {
  return request<Submission>(`/submissions/${submissionId}/review`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status })
  });
}
