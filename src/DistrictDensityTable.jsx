const comparisonExamples = [
  { name: "เขตป้อมปราบศัตรูพ่าย", population: 41200, area: 1.93 },
  { name: "เขตสัมพันธวงศ์", population: 20600, area: 1.42 },
  { name: "เขตดินแดง", population: 116500, area: 8.35 },
  { name: "เขตธนบุรี", population: 102100, area: 8.55 },
  { name: "เขตราชเทวี", population: 71000, area: 7.10 },
  { name: "เขตบางรัก", population: 46000, area: 5.54 },
]

export default function DistrictDensityTable({ district }) {
  const selectedDensity = district.densityComparison?.[0]?.value
  const numberFormat = new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  })

  const rows = comparisonExamples
    .filter((item) => item.name !== district.name)
    .map((item) => ({
      ...item,
      density: Math.round(item.population / item.area),
    }))
    .sort((a, b) => b.density - a.density)
    .slice(0, 5)

  return (
    <section className="mt-6 rounded-xl border border-[#E3DDD4] p-4">
      <h2 className="font-semibold text-[#36513D]">
        เขตที่มีความหนาแน่นประชากรสูง เทียบกับ{district.name}
      </h2>
      <p className="mt-1 text-xs text-gray-600">
        ข้อมูลตัวอย่าง · เรียงตามความหนาแน่นประชากร
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#F8F3ED] text-[#79554B]">
            <tr>
              <th scope="col" className="p-3">อันดับ</th>
              <th scope="col" className="p-3">ชื่อเขต</th>
              <th scope="col" className="p-3">ประชากร (คน)</th>
              <th scope="col" className="p-3">พื้นที่ (ตร.กม.)</th>
              <th scope="col" className="p-3">ความหนาแน่น (คน/ตร.กม.)</th>
              <th scope="col" className="p-3">เทียบกับเขตที่ค้นหา</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item, index) => (
              <tr key={item.name} className="border-b border-gray-100">
                <td className="p-3">{index + 1}</td>
                <th scope="row" className="p-3 font-medium">{item.name}</th>
                <td className="p-3">{numberFormat.format(item.population)}</td>
                <td className="p-3">{numberFormat.format(item.area)}</td>
                <td className="p-3">{numberFormat.format(item.density)}</td>
                <td className="p-3">
                  {selectedDensity > 0
                    ? `${(item.density / selectedDensity).toFixed(1)} เท่า`
                    : "—"}
                </td>
              </tr>
            ))}

            <tr className="bg-[#EAF0E9] font-semibold text-[#36513D]">
              <td className="p-3">—</td>
              <th scope="row" className="p-3">{district.name}</th>
              <td className="p-3">
                {district.population != null
                  ? numberFormat.format(district.population)
                  : "—"}
              </td>
              <td className="p-3">—</td>
              <td className="p-3">
                {selectedDensity != null
                  ? numberFormat.format(selectedDensity)
                  : "—"}
              </td>
              <td className="p-3">เขตที่ค้นหา</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}