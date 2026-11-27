import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import ComparePage from "./ComparePage.jsx";
import Home from "./Home.jsx";
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

  function handleNavigate(page) {
    setCurrentPage(page);
  }

  return (
    <div className="min-h-screen bg-[#FAF5EC]">
      <Header onReset={() => handleNavigate("home")} />

      <div className="flex min-h-[calc(100vh-67px)]">
        <Sidebar onNavigate={handleNavigate} />

        <main className="flex-1 min-w-0 p-6">
          <h2 className="text-xl font-semibold text-[#79554B]">
            {pageTitles[currentPage]}
          </h2>

          {currentPage === "home" && <Home />}
          {currentPage === "map" && <MapPage />}
          {currentPage === "compare" && <ComparePage />}
          {currentPage === "dashboard" && <Dashboard />}
        </main>
      </div>
    </div>
  );
}