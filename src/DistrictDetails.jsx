import BangkokMap from "./BangkokMap.jsx"
import DistrictDensityTable from "./DistrictDensityTable.jsx"
import DistrictPlaces from "./DistrictPlaces.jsx"

export default function DistrictDetails({ district }) {
  const summaryCards = [
    { label: "จำนวนเขตในกรุงเทพฯ", value: district.totalDistricts, unit: "เขต" },
    { label: "จำนวน Cluster ทั้งหมด", value: district.totalClusters, unit: "กลุ่ม" },
    { label: "ประชากรในเขต", value: district.population, unit: "คน" },
    { label: "สถานที่สำคัญในเขต", value: district.poiCount, unit: "แห่ง" },
  ]

  const densityComparison = district.densityComparison ?? []
  const maxDensity = Math.max(1, ...densityComparison.map((item) => item.value))

  const livabilityScores = district.livabilityScores ?? []
  const topScore = [...livabilityScores].sort((a, b) => b.score - a.score)[0]

  return (
    <section className="rounded-2xl bg-white p-5">
      {district.cluster && (
        <p className="mb-3 inline-block rounded-full bg-[#36513D] px-3 py-1 text-xs font-semibold text-white">
          {district.cluster}
        </p>
      )}

      <h1 className="text-2xl font-bold text-[#36513D]">
        {district.name}
      </h1>

      {district.englishName && (
        <p className="mt-1 text-sm text-gray-600">{district.englishName}</p>
      )}

      {district.description && (
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          {district.description}
        </p>
      )}

      {district.isExample && (
        <p className="mt-4 text-xs text-gray-500">ข้อมูลตัวอย่าง</p>
      )}

      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-xl bg-[#F8F3ED] p-4">
            <h2 className="text-sm font-medium text-[#79554B]">{card.label}</h2>
            <p className="mt-2 text-2xl font-bold text-[#36513D]">
              {card.value?.toLocaleString("th-TH") ?? "—"}{" "}
              <span className="text-sm font-normal">{card.unit}</span>
            </p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section className="min-w-0 rounded-xl bg-[#F8F3ED] p-4">
          <h2 className="font-semibold text-[#36513D]">
            {district.mapCenter
              ? `แผนที่${district.name}`
              : "แผนที่ภาพรวมกรุงเทพฯ"}
          </h2>

          <BangkokMap
            key={district.name}
            center={district.mapCenter}
            zoom={district.mapCenter ? 13 : 11}
          />
        </section>

        <div className="min-w-0 space-y-4">
          {densityComparison.length > 0 && (
            <section className="rounded-xl bg-[#F8F3ED] p-4">
              <h2 className="font-semibold text-[#36513D]">
                ความหนาแน่นประชากรเทียบกับกรุงเทพฯ
              </h2>
              <p className="mt-1 text-xs text-gray-600">คน/ตร.กม.</p>

              <div className="mt-4 space-y-4">
                {densityComparison.map(({ label, value }) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span>{label}</span>
                      <strong className="shrink-0">
                        {value.toLocaleString("th-TH")}
                      </strong>
                    </div>

                    <div aria-hidden="true" className="h-2 rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#36513D]"
                        style={{ width: `${(value / maxDensity) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {livabilityScores.length > 0 && (
            <section className="rounded-xl bg-[#F8F3ED] p-4">
              <h2 className="font-semibold text-[#36513D]">
                คะแนนย่อยด้านคุณภาพชีวิต
              </h2>

              <div className="mt-4 space-y-3">
                {livabilityScores.map(({ label, score }) => (
                  <div key={label}>
                    <div className="mb-1 flex justify-between gap-3 text-sm">
                      <span>{label}</span>
                      <strong className="shrink-0 text-[#36513D]">
                        {score.toFixed(1)}/10
                      </strong>
                    </div>

                    <div aria-hidden="true" className="h-2 rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-[#36513D]"
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <DistrictDensityTable district={district} />
      <DistrictPlaces district={district} />

      {topScore && (
        <section className="mt-6 rounded-xl bg-[#EAF0E9] p-4">
          <h2 className="font-semibold text-[#36513D]">
            สรุปศักยภาพ{district.name}
          </h2>

          <p className="mt-2 text-sm text-gray-700">
            ด้านที่ได้คะแนนสูงสุดคือ <strong>{topScore.label}</strong>{" "}
            ที่ <strong>{topScore.score.toFixed(1)}/10</strong>
          </p>

          {district.isExample && (
            <p className="mt-2 text-xs text-gray-600">สรุปจากคะแนนตัวอย่าง</p>
          )}
        </section>
      )}
    </section>
  )
}