export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TOKEN_KEY = "sf_token";

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (t) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// api("/api/hotels?city=Lahore")  |  api("/api/bookings", { method: "POST", body: {...} })  |  { form: FormData }
export async function api(path, { method = "GET", body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(API + path, { method, headers, body: payload });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running?", 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {}

  if (!res.ok) {
    const detail = json?.errors?.[0] ? `${json.errors[0].field}: ${json.errors[0].message}` : "";
    throw new ApiError(detail || json?.message || "Something went wrong", res.status);
  }
  return json;
}

// uploads are returned as "/uploads/x.jpg"; seed data uses full URLs
export const imgUrl = (u) => (!u ? "" : u.startsWith("/") ? API + u : u);

export const dayOnly = (d) => (d ? String(d).slice(0, 10) : "");
