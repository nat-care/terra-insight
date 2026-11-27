// useDashboardApi.js: hook ที่หน้า Dashboard ใช้
//   useApi: จำสถานะ กำลังโหลด / ได้ข้อมูล / error
//   useDistrictSearch: ช่องค้นหาเขต รอหยุดพิมพ์ 0.3 วิ แล้วค่อยค้น
import { useCallback, useEffect, useState } from "react";
import { searchDistricts } from "./dashboardApi.js";

// ---------- useApi ----------

// เรียก API แล้วเก็บสถานะ loading / error / data
// ยกเลิก request เก่าอัตโนมัติเมื่อ deps เปลี่ยนหรือ component ถูกถอดออก
export function useApi(fetcher, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null });
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => setAttempt((count) => count + 1), []);

  useEffect(() => {
    if (!enabled) {
      setState({ data: null, loading: false, error: null });
      return undefined;
    }
    const controller = new AbortController();
    setState((previous) => ({ ...previous, loading: true, error: null }));

    fetcher(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError") setState({ data: null, loading: false, error });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, attempt]);

  return { ...state, reload };
}

// ---------- useDistrictSearch ----------

// ค้นหาเขต: รอให้หยุดพิมพ์ 300ms ก่อนยิง API และยกเลิกคำค้นเก่าที่ยังไม่ตอบ
export function useDistrictSearch(query, { delay = 300, limit = 10 } = {}) {
  const [debounced, setDebounced] = useState(query.trim());

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), delay);
    return () => clearTimeout(timer);
  }, [query, delay]);

  const { data, loading, error } = useApi(
    (signal) => searchDistricts(debounced, limit, signal),
    [debounced, limit],
    { enabled: debounced.length > 0 },
  );

  return {
    results: data?.results ?? [],
    loading: loading || query.trim() !== debounced,
    error,
    searched: debounced.length > 0,
  };
}
