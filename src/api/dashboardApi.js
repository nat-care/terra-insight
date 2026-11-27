// dashboardApi.js
const BASE_URL = (
  import.meta.env.VITE_API_URL?.trim() ||
  "https://backend-terrainsight.onrender.com"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

async function request(path, { method = "GET", params, body, signal } = {}) {
  const url = new URL(`${BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value != null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const hasBody = body !== undefined;
  let response;

  try {
    response = await fetch(url, {
      method,
      signal,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("เชื่อมต่อ backend ไม่ได้ ตรวจว่ารัน server แล้ว", 0);
  }

  let data;

  try {
    data = await response.json();
  } catch (error) {
    if (error.name === "AbortError") throw error;

    const message = response.ok
      ? "Backend ส่งข้อมูลกลับมาในรูปแบบที่ไม่ใช่ JSON"
      : `API error ${response.status}`;

    throw new ApiError(message, response.status);
  }

  if (!response.ok) {
    throw new ApiError(
      data?.error ?? `API error ${response.status}`,
      response.status,
      data,
    );
  }

  return data;
}

export const apiGet = (path, params, signal) =>
  request(path, { params, signal });

export const apiPost = (path, body, signal) =>
  request(path, { method: "POST", body, signal });

// ข้อมูลรวมสำหรับหน้า Dashboard
export const getDashboard = (signal) =>
  apiGet("/api/dashboard", undefined, signal);

// รายชื่อเขตและรายละเอียดรายเขต
export const getDistricts = (signal) =>
  apiGet("/api/districts", undefined, signal);

export const getDistrict = (idOrName, signal) =>
  apiGet(`/api/districts/${encodeURIComponent(idOrName)}`, undefined, signal);

export const searchDistricts = (query, limit = 10, signal) =>
  apiGet("/api/search", { q: query, limit }, signal);

// โมเดล
export const checkModel = (signal) =>
  apiGet("/health", undefined, signal);

export const predictGroup = (features, signal) =>
  apiPost("/predict", features, signal);