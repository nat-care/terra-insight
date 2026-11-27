// dashboardApi.js: คุยกับ backend ให้หน้า Dashboard
//   ส่วน A: ตัวยิง API กลาง (ส่งคำขอ แล้วถือคำตอบกลับมา)
//   ส่วน B: รายการ API ทั้งหมดที่ขอจาก backend ได้

// ---------- ส่วน A: ตัวยิง API กลาง ----------
const BASE_URL = (
  import.meta.env.VITE_API_URL || "https://backend-terrainsight.onrender.com"
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
  const url = new URL(BASE_URL + path);
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value != null && value !== "") url.searchParams.set(key, value);
  });

  let response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("เชื่อมต่อ backend ไม่ได้ ตรวจว่ารัน server แล้ว", 0);
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.error ?? `API error ${response.status}`, response.status, data);
  }
  return data;
}

export const apiGet = (path, params, signal) => request(path, { params, signal });
export const apiPost = (path, body, signal) => request(path, { method: "POST", body, signal });

// ---------- ส่วน B: รายการ API ----------

// ข้อมูลทั้งหน้า Dashboard (รูปแบบตรงกับ prop `data` ของ Dashboard)
export const getDashboard = (signal) => apiGet("/api/dashboard", undefined, signal);

// รายชื่อ 50 เขต พร้อมประชากรและจำนวนสถานที่
export const getDistricts = (signal) => apiGet("/api/districts", undefined, signal);

// รายละเอียดเขตเดียว รับได้ทั้งรหัสเขต (เช่น "1026") และชื่อ (เช่น "ดินแดง")
export const getDistrict = (idOrName, signal) =>
  apiGet(`/api/districts/${encodeURIComponent(idOrName)}`, undefined, signal);

// ค้นหาเขตจากชื่อ
export const searchDistricts = (query, limit = 10, signal) =>
  apiGet("/api/search", { q: query, limit }, signal);

// โมเดลของเพื่อน (ไม่ได้แก้): ส่ง feature ครบ 7 ตัว ได้ { group_id, group_name }
export const checkModel = (signal) => apiGet("/health", undefined, signal);
export const predictGroup = (features, signal) => apiPost("/predict", features, signal);
