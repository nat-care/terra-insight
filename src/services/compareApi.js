// ดึงข้อมูลรายเขตสำหรับหน้าเปรียบเทียบเขต (Compare)
// Endpoint: GET /api/districts/profiles
// ใช้ VITE_API_URL ตัวเดียวกับ services/api.js (ถ้าไม่ตั้ง ใช้ http://localhost:3000)
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

export async function fetchDistrictProfiles({ signal } = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}/api/districts/profiles`, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "ไม่สามารถเชื่อมต่อ Backend ได้ กรุณาตรวจสอบว่า Server กำลังทำงานอยู่",
      { cause: error }
    );
  }

  if (response.status === 503) {
    throw new Error("Backend กำลังเตรียมข้อมูล ลองใหม่อีกครั้งในไม่กี่วินาที");
  }

  if (!response.ok) {
    throw new Error(`Server Error: ${response.status}`);
  }

  const data = await response.json();

  if (
    !Array.isArray(data?.districts) ||
    !Array.isArray(data?.meta?.groups) ||
    !Array.isArray(data?.meta?.feature_columns)
  ) {
    throw new Error("รูปแบบข้อมูลจาก Backend ไม่ถูกต้อง");
  }

  return data;
}