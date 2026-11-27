import { useState } from "react";

import DistrictCompareCard from "./components/DistrictCompareCard";
import UserInput from "./components/UserInput";
import SummaryCards from "./components/SummaryCards";
import MapSection from "./components/MapSection";
import RecommendedResults from "./components/RecommendedResults";
import { predictAreas } from "./services/api";
import { summaryCards, mapLayers } from "./data/Exdata";
import logo from "./assets/flower.png";

const STORAGE_KEY = "terra-insight:recommendations";
const EMPTY_RECOMMENDATIONS = [];

function readRecommendations() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.slice(0, 5) : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const [activeLayer, setActiveLayer] = useState("ภาพรวม");
  const [results, setResults] = useState(readRecommendations);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const recommendations = results ?? EMPTY_RECOMMENDATIONS;
  const hasSearched = results !== null;

  async function handleSearch(data) {
    setLoading(true);
    setError("");

    try {
      const response = await predictAreas(data);

      if (!Array.isArray(response)) {
        throw new Error("รูปแบบผลลัพธ์จากเซิร์ฟเวอร์ไม่ถูกต้อง");
      }

      const nextRecommendations = response.slice(0, 5);
      setResults(nextRecommendations);

      try {
        window.sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(nextRecommendations),
        );
      } catch {
        // Results remain visible on Home if session storage is unavailable.
      }
    } catch (err) {
      setError(err?.message || "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 space-y-4">
      <p className="mt-1 text-xs text-[#A79588]">
        ค้นหาพื้นที่อยู่อาศัยที่เหมาะสมกับความต้องการของคุณในกรุงเทพมหานคร
      </p>

      <SummaryCards cards={summaryCards} />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.5fr)]">
        <section className="min-w-0 rounded-xl border border-[#DCCABB] bg-white p-3">
          <UserInput onSearch={handleSearch} isLoading={loading} />
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <MapSection
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            mapLayers={mapLayers}
            recommendations={recommendations}
          />

          <DistrictCompareCard recommendations={recommendations} />
        </div>
      </div>

      {loading && (
        <div
          role="status"
          className="rounded-xl border border-[#DCCABB] bg-white p-5 text-center"
        >
          <p className="text-sm text-[#8B7667]">
            กำลังวิเคราะห์ข้อมูลพื้นที่ด้วยระบบ TerraInsight...
          </p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <RecommendedResults
        recommendations={recommendations}
        hasSearched={hasSearched}
        logo={logo}
      />
    </div>
  );
}