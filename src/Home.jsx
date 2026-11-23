import { useState } from "react";
import DistrictCompareCard from "./components/DistrictCompareCard";
import UserInput from "./components/UserInput";
import SummaryCards from "./components/SummaryCards";
import MapSection from "./components/MapSection";
import RecommendedResults from "./components/RecommendedResults";
import DensityChart from "./components/DensityChart";

import {
  summaryCards,
  mapLayers,
  districtPreview,
} from "./data/Exdata";

import { calculateRecommendations } from "./utils/recommendations";

import logo from "./assets/flower.png";

export default function Home() {
  const [activeLayer, setActiveLayer] = useState("ภาพรวม");
  const [selectedDistrict, setSelectedDistrict] = useState(districtPreview[0]);

  const [recommendations, setRecommendations] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (data) => {
    const results = calculateRecommendations(data);
    setRecommendations(results);
    setHasSearched(true);

    console.log("User Preferences:", data);
    console.log("Recommended Areas:", results);
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
    { label: "ค่าเฉลี่ยกรุงเทพฯ", value: 3600 },
    { label: "เขตที่หนาแน่นสูงสุด", value: rankedDistricts[0].density },
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
        <section className="min-w-0 rounded-xl border border-[#DCCABB] bg-white p-3">
          <UserInput onSearch={handleSearch} />
        </section>

      <div className="flex min-w-0 flex-col gap-4">
        <MapSection
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
          mapLayers={mapLayers}
        />
        <DistrictCompareCard />
      </div>
       </div>

      {/* ผลลัพธ์พื้นที่แนะนำ */}
      <RecommendedResults
        recommendations={recommendations}
        hasSearched={hasSearched}
        logo={logo}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        {/* <DensityChart
          densityPreview={densityPreview}
          maxDensity={maxDensity}
        /> */}
      </div>
    </div>
  );
}
