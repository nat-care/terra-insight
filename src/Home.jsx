import { useState } from "react";

import DistrictCompareCard from "./components/DistrictCompareCard";
import UserInput from "./components/UserInput";
import SummaryCards from "./components/SummaryCards";
import MapSection from "./components/MapSection";
import RecommendedResults from "./components/RecommendedResults";
import { predictAreas } from "./services/api";

import { summaryCards, mapLayers, districtPreview } from "./data/Exdata";

import logo from "./assets/flower.png";

// URL ของ Backend
const API_URL = import.meta.env.VITE_API_URL || "https://backend-terrainsight.onrender.com";

export default function Home() {
  const [activeLayer, setActiveLayer] = useState("ภาพรวม");
  const [selectedDistrict, setSelectedDistrict] = useState(districtPreview[0]);

  const [recommendations, setRecommendations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // สถานะการค้นหา
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ส่งข้อมูลไปวิเคราะห์ที่ Backend
  const handleSearch = async (data) => {
    try {
      setLoading(true);
      setError("");
      setHasSearched(false);
      setRecommendations([]);

      console.log("User Preferences:", data);

      const results = await predictAreas(data);

      setRecommendations(results);
      setHasSearched(true);

      console.log("Recommended Areas:", results);
    } catch (err) {
      console.error("Prediction Error:", err);

      setError(err.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  };

  const rankedDistricts = districtPreview
    .map((district) => ({
      ...district,
      density: district.population / district.area,
    }))
    .sort((a, b) => b.density - a.density);

  const densityPreview = [
    {
      label: selectedDistrict.name,
      value: Math.round(selectedDistrict.population / selectedDistrict.area),
    },
    {
      label: "ค่าเฉลี่ยกรุงเทพฯ",
      value: 3600,
    },
  ];

  const maxDensity = Math.max(...densityPreview.map((item) => item.value));

  return (
    <div className="mt-3 space-y-4">
      {/* คำอธิบายหน้า Dashboard */}
      <section>
        <p className="mt-1 text-xs text-[#A79588]">
          ค้นหาพื้นที่อยู่อาศัยที่เหมาะสมกับความต้องการของคุณในกรุงเทพมหานคร
        </p>
      </section>

      {/* การ์ดสรุปข้อมูล */}
      <SummaryCards cards={summaryCards} />

      {/* แบบฟอร์มค้นหาและแผนที่ */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.5fr)]">
        {/* แบบฟอร์ม */}
        <section className="min-w-0 rounded-xl border border-[#DCCABB] bg-white p-3">
          <UserInput onSearch={handleSearch} isLoading={loading} />
        </section>

        {/* แผนที่และเปรียบเทียบเขต */}
        <div className="flex min-w-0 flex-col gap-4">
          <MapSection
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            mapLayers={mapLayers}
          />

          <DistrictCompareCard />
        </div>
      </div>

      {/* สถานะการวิเคราะห์ */}
      {loading && (
        <div className="rounded-xl border border-[#DCCABB] bg-white p-5 text-center">
          <p className="text-sm text-[#8B7667]">
            กำลังวิเคราะห์ข้อมูลพื้นที่ด้วยระบบ TerraInsight...
          </p>
        </div>
      )}

      {/* แจ้งเตือนข้อผิดพลาด */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* ผลลัพธ์พื้นที่แนะนำ */}
      <RecommendedResults
        recommendations={recommendations}
        hasSearched={hasSearched}
        logo={logo}
      />

      {/* กราฟความหนาแน่น */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        {/*
        <DensityChart
          densityPreview={densityPreview}
          maxDensity={maxDensity}
        />
        */}
      </div>
    </div>
  );
}
