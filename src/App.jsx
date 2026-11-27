import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ComparePage from "./ComparePage.jsx";
import Home from "./Home.jsx";
import { DistrictSearchResult } from "./DistrictDetails.jsx";
import MapPage from "./components/MapPage.jsx";
import Dashboard from "./components/Dashboard.jsx";
const pageTitles = {
  home: "HELLO มาหาพื้นที่ที่ใช่สำหรับคุณกัน!!",
  map: "แผนที่",
  analysis: "วิเคราะห์พื้นที่",
  compare: "ค้นหาเขตที่คล้ายกัน",
};

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  const isSearching = searchQuery !== "";

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
          {currentPage === "map" && !isSearching && <MapPage />}
          {currentPage === "compare" && !isSearching && <ComparePage />}


          {currentPage === "dashboard" && !isSearching && <Dashboard />}
          {/* ค้นหาเขตจาก navbar: ดึงข้อมูลจริงจาก backend (/api/district-details) */}
          {currentPage === "home" && isSearching && (
            <DistrictSearchResult
              key={searchQuery}
              query={searchQuery}
              onSearch={handleSearch}
            />
          )}
        </main>
      </div>
    </div>
  );
}