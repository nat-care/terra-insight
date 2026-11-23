import { useState } from "react";
import {
  BaseDistrictPicker,
  SimilarDistrictList,
  SimilarityBreakdown,
} from "./components/CompareSections";
import {
  mockDistricts,
  findDistrict,
  findSimilarDistricts,
  compareDistricts,
} from "./utils/compare";

export default function ComparePage() {
  const [baseId, setBaseId] = useState(mockDistricts[0].id);
  const [sameClusterOnly, setSameClusterOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const base = findDistrict(baseId);
  const similar = findSimilarDistricts(base, sameClusterOnly);

  // ถ้ายังไม่ได้คลิกเลือก (หรือตัวที่เลือกหายไปจากรายการ) ใช้อันดับ 1
  const active = similar.find((d) => d.id === selectedId) ?? similar[0];
  const comparison = active ? compareDistricts(base, active) : null;

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
        options={mockDistricts}
        base={base}
        onBaseChange={handleBaseChange}
        sameClusterOnly={sameClusterOnly}
        onSameClusterChange={setSameClusterOnly}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <SimilarDistrictList
          items={similar}
          selectedId={active?.id}
          onSelect={setSelectedId}
        />
        <SimilarityBreakdown comparison={comparison} />
      </div>
    </div>
  );
}