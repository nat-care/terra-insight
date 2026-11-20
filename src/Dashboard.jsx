import { useState } from "react"
import BangkokMap from "./BangkokMap.jsx"

const summaryCards = [
  { title: "จำนวนเขตทั้งหมด", unit: "เขต" },
  { title: "จำนวน Cluster", unit: "กลุ่ม" },
  { title: "จำนวนประชากร", unit: "คน" },
  { title: "จำนวนสถานที่สำคัญ", unit: "แห่ง" },
]

const mapLayers = ["ภาพรวม", "รถไฟฟ้า", "พื้นที่สีเขียว", "ความหนาแน่น"]

const districtPreview = [
  { name: "เขตตัวอย่าง A", population: 90000, area: 20 },
  { name: "เขตตัวอย่าง B", population: 120000, area: 10 },
  { name: "เขตตัวอย่าง C", population: 96000, area: 16 },
]

const rankedDistricts = districtPreview
  .map((district) => ({
    ...district,
    density: district.population / district.area,
  }))
  .sort((a, b) => b.density - a.density)

export default function Dashboard() {
  const [activeLayer, setActiveLayer] = useState("ภาพรวม")
  const [selectedDistrict, setSelectedDistrict] = useState(districtPreview[0])

  const densityPreview = [
    {
      label: selectedDistrict.name,
      value: Math.round(selectedDistrict.population / selectedDistrict.area),
    },
    { label: "ค่าเฉลี่ยกรุงเทพฯ", value: 3600 },
    { label: "เขตที่หนาแน่นสูงสุด", value: rankedDistricts[0].density },
  ]

  const maxDensity = Math.max(...densityPreview.map((item) => item.value))

  return (
    <div className="mt-4 space-y-4">
      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-xl font-semibold text-[#79554B]">
          ภาพรวมกรุงเทพฯ
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.title} className="rounded-xl bg-[#F8F3ED] p-4">
              <h3 className="text-sm font-medium text-[#79554B]">
                {card.title}
              </h3>
              <p className="mt-2 text-3xl font-bold text-[#36513D]">
                {card.value ?? "—"}{" "}
                <span className="text-sm font-normal">{card.unit}</span>
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="min-w-0 rounded-2xl bg-white p-5">
          <h2 className="text-lg font-semibold text-[#79554B]">
            แผนที่ภาพรวมกรุงเทพฯ
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {mapLayers.map((layer) => (
              <button
                key={layer}
                type="button"
                aria-pressed={activeLayer === layer}
                onClick={() => setActiveLayer(layer)}
                className={`rounded-lg px-3 py-2 text-sm ${
                  activeLayer === layer
                    ? "bg-[#36513D] text-white"
                    : "bg-[#F8F3ED] text-[#79554B]"
                }`}
              >
                {layer}
              </button>
            ))}
          </div>

          {activeLayer !== "ภาพรวม" && (
            <p className="mt-2 text-sm text-gray-600">
              รอข้อมูลชั้นแผนที่ {activeLayer}
            </p>
          )}

          <BangkokMap />
        </section>

        <section className="min-w-0 rounded-2xl bg-white p-5">
          <h2 className="text-lg font-semibold text-[#79554B]">
            กราฟสรุปข้อมูลกรุงเทพฯ
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            ข้อมูลตัวอย่าง · ความหนาแน่นประชากร (คน/ตร.กม.)
          </p>

          <div className="mt-5 space-y-5">
            {densityPreview.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex justify-between gap-3 text-sm">
                  <span>{item.label}</span>
                  <strong>{item.value.toLocaleString("th-TH")}</strong>
                </div>

                <div className="h-2.5 rounded-full bg-[#F8F3ED]">
                  <div
                    className="h-full rounded-full bg-[#36513D]"
                    style={{ width: `${(item.value / maxDensity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl bg-white p-5">
        <h2 className="text-lg font-semibold text-[#79554B]">
          เขตที่มีความหนาแน่นประชากรสูง
        </h2>
        <p className="mt-2 text-sm text-gray-600">ข้อมูลตัวอย่าง</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-[#F8F3ED]">
              <tr>
                <th scope="col" className="p-3">อันดับ</th>
                <th scope="col" className="p-3">ชื่อเขต</th>
                <th scope="col" className="p-3">ประชากร (คน)</th>
                <th scope="col" className="p-3">พื้นที่ (ตร.กม.)</th>
                <th scope="col" className="p-3">ความหนาแน่น (คน/ตร.กม.)</th>
              </tr>
            </thead>

            <tbody>
              {rankedDistricts.map((district, index) => (
                <tr
                  key={district.name}
                  className={`border-b border-gray-100 ${
                    selectedDistrict.name === district.name ? "bg-[#EAF0E9]" : ""
                  }`}
                >
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      aria-pressed={selectedDistrict.name === district.name}
                      className="font-medium text-[#36513D] underline"
                      onClick={() => setSelectedDistrict(district)}
                    >
                      {district.name}
                    </button>
                  </td>
                  <td className="p-3">
                    {district.population.toLocaleString("th-TH")}
                  </td>
                  <td className="p-3">
                    {district.area.toLocaleString("th-TH")}
                  </td>
                  <td className="p-3 font-semibold text-[#36513D]">
                    {Math.round(district.density).toLocaleString("th-TH")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}