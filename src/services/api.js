
const API_URL = (
  import.meta.env.VITE_API_URL || "VITE_API_URL=https://backend-terrainsight.onrender.com"
).replace(/\/$/, "");

/**
 * ส่งข้อมูลความต้องการของผู้ใช้ไปวิเคราะห์
 * Endpoint: POST /predict
 */
export async function predictAreas(userPreferences) {
  if (!userPreferences) {
    throw new Error("ไม่พบข้อมูลความต้องการของผู้ใช้");
  }

  const {
    workType,
    workLocation,
    travel,
    distance,
    factors,
  } = userPreferences;

  // ตรวจสอบข้อมูลก่อนส่งไป Backend
  if (!workLocation?.trim()) {
    throw new Error("กรุณาระบุสถานที่ทำงาน");
  }

  if (!Array.isArray(travel) || travel.length === 0) {
    throw new Error("กรุณาเลือกวิธีการเดินทาง");
  }

  if (!factors || typeof factors !== "object") {
    throw new Error("ข้อมูลปัจจัยความต้องการไม่ถูกต้อง");
  }

  const payload = {
    workType,
    workLocation: workLocation.trim(),
    travel,
    distance,
    factors: {
      safety: Number(factors.safety),
      hospital: Number(factors.hospital),
      school: Number(factors.school),
      shopping: Number(factors.shopping),
      park: Number(factors.park),
      transport: Number(factors.transport),
    },
  };

  try {
    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // อ่านผลลัพธ์จาก Backend
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        result?.message ||
        result?.error ||
        `Server Error: ${response.status}`
      );
    }

    if (!result || result.success === false) {
      throw new Error(
        result?.message || "Backend ไม่สามารถวิเคราะห์ข้อมูลได้"
      );
    }

    if (!Array.isArray(result.recommendations)) {
      throw new Error("รูปแบบผลลัพธ์จาก Backend ไม่ถูกต้อง");
    }

    return result.recommendations;

  } catch (error) {
    console.error("API Prediction Error:", error);

    if (error instanceof TypeError) {
      throw new Error(
        "ไม่สามารถเชื่อมต่อ Backend ได้ กรุณาตรวจสอบว่า Server กำลังทำงานอยู่"
      );
    }

    throw error;
  }
}

/**
 * ตรวจสอบสถานะ Backend
 * Endpoint: GET /health
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);

    if (!response.ok) {
      return false;
    }

    const result = await response.json();

    return result.ready === true || result.success === true;

  } catch (error) {
    console.error("Backend Health Error:", error);
    return false;
  }
}
