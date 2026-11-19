
import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const pageTitles = {
    home: "หน้าแรก",
    map: "แผนที่",
    analysis: "วิเคราะห์พื้นที่",
    compare: "เปรียบเทียบเขต",
  };

  return (
    <div className="min-h-screen bg-[#FAF5EC]">

      <Header />

      <div className="flex min-h-[calc(100vh-67px)]">

        <Sidebar onNavigate={setCurrentPage} />

        <main className="flex-1 min-w-0 p-6">
          <h2 className="text-xl font-semibold text-[#79554B]">
            {pageTitles[currentPage]}
          </h2>
        </main>

      </div>
    </div>
  );
}

export default App;
