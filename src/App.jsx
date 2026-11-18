
import Header from "./components/Header";

function App() {

  const handleSearch = (value) => {
    console.log("ค้นหา:", value);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F1]">

      <Header onSearch={handleSearch} />

      <main className="p-6">
        {/* เนื้อหาหลักของ TerraInsight */}
      </main>

    </div>
  );
}

export default App;
