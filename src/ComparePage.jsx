import { useEffect, useMemo, useState } from "react";
import {
  BaseDistrictPicker,
  SimilarDistrictList,
  SimilarityBreakdown,
} from "./components/CompareSections";
import { fetchDistrictProfiles } from "./services/compareApi";
import {
  buildCompareModel,
  findDistrict,
  findSimilarDistricts,
  compareDistricts,
} from "./utils/compare";

export default function ComparePage() {
  const [result, setResult] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [baseId, setBaseId] = useState(null);
  const [sameGroupOnly, setSameGroupOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchDistrictProfiles({ signal: controller.signal })
      .then(setResult)
      .catch((error) => {
        if (error.name !== "AbortError") setLoadError(error.message);
      });

    return () => controller.abort();
  }, []);

  const model = useMemo(() => (result ? buildCompareModel(result) : null), [result]);

  if (loadError) {
    return (
      <p role="alert" className="mt-3 rounded-xl bg-white p-4 text-sm text-[#8A4B45]">
        โหลดข้อมูลเขตไม่สำเร็จ: {loadError}
      </p>
    );
  }

  if (!model) {
    return (
      <p role="status" className="mt-3 rounded-xl bg-white p-4 text-sm text-[#A79588]">
        กำลังโหลดข้อมูลเขต…
      </p>
    );
  }

  if (model.districts.length < 2) {
    return (
      <p role="status" className="mt-3 rounded-xl bg-white p-4 text-sm text-[#A79588]">
        ยังมีข้อมูลเขตไม่พอสำหรับการเปรียบเทียบ
      </p>
    );
  }

  const base = findDistrict(model, baseId) ?? model.districts[0];
  const similar = findSimilarDistricts(model, base, sameGroupOnly);

  // ถ้ายังไม่ได้คลิกเลือก (หรือตัวที่เลือกหายไปจากรายการ) ใช้อันดับ 1
  const active = similar.find((d) => d.id === selectedId) ?? similar[0];
  const comparison = active ? compareDistricts(model, base, active) : null;

  function handleBaseChange(id) {
    setBaseId(id);
    setSelectedId(null);
  }

  return (
    <div className="mt-1 space-y-4">
      <p className="text-xs text-[#A79588]">
        ชอบเขตไหนอยู่แล้ว? เลือกมาเป็นต้นแบบ แล้วดูว่ามีเขตไหนให้ความรู้สึกคล้าย ๆ กันบ้าง
      </p>

      <BaseDistrictPicker
        model={model}
        base={base}
        onBaseChange={handleBaseChange}
        sameGroupOnly={sameGroupOnly}
        onSameGroupChange={setSameGroupOnly}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <SimilarDistrictList
          items={similar}
          selectedId={active?.id}
          onSelect={setSelectedId}
        />
        <SimilarityBreakdown comparison={comparison} />
      </div>

      <p className="text-[11px] leading-relaxed text-[#A79588]">
        กลุ่มพื้นที่มาจากโมเดล Random Forest ของ Terra Insight · ประชากรเป็นตัวเลขทั้งเขต
        ส่วนจำนวนสถานที่เป็นค่าเฉลี่ยในรัศมี {model.radiusKm} กม. รอบแต่ละจุดในเขต ·
        ความคล้ายคำนวณจากสัดส่วนกลุ่มพื้นที่ที่ทั้งสองเขตมีร่วมกัน
      </p>
    </div>
  );
}