import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ComparePage from "./ComparePage.jsx";
import Home from "./Home.jsx";
import DistrictDetails from "./DistrictDetails.jsx";
import Dashboard from "./components/Dashboard.jsx";
// Mock data for districts and clusters
const districtNames = [
  "พระนคร",
  "ดุสิต",
  "หนองจอก",
  "บางรัก",
  "บางเขน",
  "บางกะปิ",
  "ปทุมวัน",
  "ป้อมปราบศัตรูพ่าย",
  "พระโขนง",
  "มีนบุรี",
  "ลาดกระบัง",
  "ยานนาวา",
  "สัมพันธวงศ์",
  "พญาไท",
  "ธนบุรี",
  "บางกอกใหญ่",
  "ห้วยขวาง",
  "คลองสาน",
  "ตลิ่งชัน",
  "บางกอกน้อย",
  "บางขุนเทียน",
  "ภาษีเจริญ",
  "หนองแขม",
  "ราษฎร์บูรณะ",
  "บางพลัด",
  "ดินแดง",
  "บึงกุ่ม",
  "สาทร",
  "บางซื่อ",
  "จตุจักร",
  "บางคอแหลม",
  "ประเวศ",
  "คลองเตย",
  "สวนหลวง",
  "จอมทอง",
  "ดอนเมือง",
  "ราชเทวี",
  "ลาดพร้าว",
  "วัฒนา",
  "บางแค",
  "หลักสี่",
  "สายไหม",
  "คันนายาว",
  "สะพานสูง",
  "วังทองหลาง",
  "คลองสามวา",
  "บางนา",
  "ทวีวัฒนา",
  "ทุ่งครุ",
  "บางบอน",
];

const bangKhen = {
  name: "เขตบางเขน",
  englishName: "Bangkhen District",
  cluster: "Cluster 2 · โซนเหนือและการศึกษา",
  description:
    "ย่านตอนเหนือของกรุงเทพฯ ที่มีสถานศึกษาและเชื่อมต่อรถไฟฟ้าสายสีเขียวกับสายสีชมพู",
  totalDistricts: districtNames.length,
  totalClusters: 5,
  population: 190400,
  poiCount: 380,
  mapCenter: [13.874, 100.596],
  isExample: true,
  densityComparison: [
    { label: "เขตบางเขน", value: 4512 },
    { label: "ค่าเฉลี่ยกรุงเทพฯ", value: 3620 },
    { label: "เขตที่หนาแน่นสูงสุด", value: 21347 },
  ],
  livabilityScores: [
    { label: "การศึกษาและมหาวิทยาลัย", score: 9.6 },
    { label: "ตลาด ร้านอาหาร และร้านค้า", score: 9.4 },
    { label: "การเดินทางและระบบราง", score: 8.8 },
    { label: "ความคุ้มค่าของที่อยู่อาศัย", score: 8.2 },
  ],
};

const pageTitles = {
  home: "HELLO มาหาพื้นที่ที่ใช่สำหรับคุณกัน!!",
  map: "แผนที่",
  analysis: "วิเคราะห์พื้นที่",
  compare: "ค้นหาเขตที่คล้ายกัน",
};



function findMockDistrict(name) {
  if (!districtNames.includes(name)) return null;
  if (name === "บางเขน") return bangKhen;

  const districtName = `เขต${name}`;

  return {
    name: districtName,
    cluster: "Cluster ตัวอย่าง",
    description: `ข้อมูลตัวอย่างสำหรับหน้ารายละเอียด${districtName}`,
    totalDistricts: districtNames.length,
    totalClusters: bangKhen.totalClusters,
    population: 120000,
    poiCount: 150,
    isExample: true,
    densityComparison: [
      { label: districtName, value: 4500 },
      { label: "ค่าเฉลี่ยกรุงเทพฯ", value: 3620 },
      { label: "เขตที่หนาแน่นสูงสุด", value: 21347 },
    ],
    livabilityScores: bangKhen.livabilityScores,
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery !== "";
  const normalizedQuery = searchQuery.replace(/\s+/g, "").replace(/^เขต/, "");
  const foundDistrict = findMockDistrict(normalizedQuery);

  function handleSearch(value) {
    setSearchQuery(value.trim());
    setCurrentPage("home");
  }

  function handleNavigate(page) {
    setSearchQuery("");
    setCurrentPage(page);
  }

  return (
    <div className="min-h-screen bg-[#FAF5EC]">
      <Header onSearch={handleSearch} />

      <div className="flex min-h-[calc(100vh-67px)]">
        <Sidebar onNavigate={handleNavigate} />

        <main className="flex-1 min-w-0 p-6">
          {!isSearching && (
            <h2 className="text-xl font-semibold text-[#79554B]">
              {pageTitles[currentPage]}
            </h2>
          )}

          {currentPage === "home" && !isSearching && <Home />}
          {currentPage === "compare" && !isSearching && <ComparePage />}
          {currentPage === "dashboard" && !isSearching && <Dashboard />}
          {currentPage === "home" && foundDistrict && (
            <DistrictDetails district={foundDistrict} />
          )}

          {currentPage === "home" && isSearching && !foundDistrict && (
            <p role="status" className="rounded-xl bg-white p-4 text-gray-600">
              ไม่พบเขตที่ค้นหา “{searchQuery}”
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
