import { geoJSON } from "leaflet"
import { useDistrictDetails } from "./api/useDashboardApi.js"
import { GeoJSON, MapContainer, TileLayer, Tooltip } from "react-leaflet"
import { bboxPolygon, difference, featureCollection } from "@turf/turf"
import "leaflet/dist/leaflet.css"
import districts from "./data/bangkok-districts.json"

const bangkokBounds = geoJSON(districts).getBounds()

function normalizeDistrictName(name) {
  return name?.trim().replace(/^เขต\s*/, "") ?? ""
}

let outsideBangkok

function getOutsideBangkok() {
  outsideBangkok ??= difference(featureCollection([
    bboxPolygon([-180, -85.051129, 180, 85.051129]),
    ...districts.features,
  ]))
  return outsideBangkok
}

function BangkokMap({ districtName }) {
  const mask = getOutsideBangkok()
  const name = normalizeDistrictName(districtName)
  const selectedDistrict = districts.features.find(
    (feature) => normalizeDistrictName(feature.properties.dname) === name,
  )

  return (
    <MapContainer
      key={name}
      bounds={selectedDistrict ? geoJSON(selectedDistrict).getBounds() : bangkokBounds}
      boundsOptions={{ padding: [24, 24] }}
      maxBounds={bangkokBounds}
      maxBoundsViscosity={1}
      minZoom={9}
      zoomSnap={0.25}
      scrollWheelZoom
      className="relative z-0 h-[300px] w-full rounded-xl bg-[#F1EFE8] sm:h-[372px]"
    >
      <TileLayer
        noWrap
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {mask && (
        <GeoJSON
          data={mask}
          interactive={false}
          style={{ stroke: false, fillColor: "#F1EFE8", fillOpacity: 1 }}
        />
      )}
      {selectedDistrict && (
        <GeoJSON
          data={selectedDistrict}
          style={{ color: "#36513E", weight: 2, dashArray: "5 4", fillOpacity: 0.19 }}
        >
          <Tooltip permanent direction="center" opacity={0.92}>
            {selectedDistrict.properties.dname}
          </Tooltip>
        </GeoJSON>
      )}
    </MapContainer>
  )
}

const numberFormat = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 })
const panel = "min-w-0 rounded-2xl border border-[#DCCABB] bg-white p-5"
const muted = "text-xs leading-relaxed text-[#806D61]"
const cardTitle = "text-base font-semibold leading-snug text-[#79544B] sm:text-lg"
const innerCell = "rounded-lg border border-[#E8DDD0] bg-[#F8F3ED]"
const statValue = "text-lg font-bold tabular-nums text-[#36513E]"

const iconPaths = {
  compare: "M12 2v19m-5 0h10M3 6h18M5 6l-3 7h6L5 6Zm14 0-3 7h6l-3-7Z",
  people: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-4M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm4-4a4 4 0 0 1 0 8",
  transport: "M3 8h17m-5-5 5 5-5 5m6 3H4m5-5-5 5 5 5",
  education: "m2 8 10-5 10 5-10 5-10-5Zm4 2v6l6 4 6-4v-6",
  home: "m2 12 10-9 10 9M5 10v11h5v-6h4v6h5V10",
  safety: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-3-10 2 2 4-5",
}

function format(value) {
  return value == null ? "—" : numberFormat.format(value)
}

function PanelTitle({ icon, children, subtitle, headingId }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F3DCD8] text-[#79544B]">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={iconPaths[icon]} />
        </svg>
      </span>
      <div className="min-w-0">
        <h2 id={headingId} className={cardTitle}>{children}</h2>
        {subtitle && <p className={muted + " mt-0.5"}>{subtitle}</p>}
      </div>
    </div>
  )
}

function Metric({ label, value, unit, note }) {
  return (
    <article className={panel + " flex min-h-[112px] flex-col justify-between"}>
      <h2 className="text-sm font-medium leading-snug text-[#79544B]">{label}</h2>
      <div className="mt-2">
        <p className="text-2xl font-bold leading-tight tabular-nums text-[#36513E] sm:text-3xl">
          {format(value)}
          {value != null && <span className="ml-1.5 text-xs font-semibold tracking-normal text-[#806D61]">{unit}</span>}
        </p>
        {note && <p className={muted + " mt-2"}>{note}</p>}
      </div>
    </article>
  )
}

function PopulationPanel({ district }) {
  const male = district.malePopulation
  const female = district.femalePopulation
  const hasBreakdown = male != null && female != null && male + female > 0
  const malePercent = hasBreakdown ? Math.round(male / (male + female) * 100) : null

  return (
    <section className={panel + " flex flex-col justify-between gap-6"}>
      <PanelTitle icon="people">ประชากรและที่อยู่อาศัย</PanelTitle>
      <div className="grid grid-cols-2 gap-3">
        <div className={innerCell + " px-3 py-3"}>
          <p className={muted}>ประชากร</p>
          <p className={statValue + " mt-1"}>
            {format(district.population)}
            {district.population != null && <span className="ml-1 text-xs font-normal">คน</span>}
          </p>
          {district.populationRank != null && (
            <p className={muted + " mt-1"}>อันดับ {district.populationRank} จาก {district.totalDistricts ?? 50} เขต</p>
          )}
        </div>
        <div className={innerCell + " px-3 py-3"}>
          <p className={muted}>ชาย / หญิง</p>
          <p className={statValue + " mt-1"}>{hasBreakdown ? `${malePercent} : ${100 - malePercent}` : "—"}</p>
          {hasBreakdown && <p className={muted + " mt-1"}>{format(male)} / {format(female)} คน</p>}
        </div>
      </div>
    </section>
  )
}

function TransportPanel({ transport }) {
  return (
    <section className={panel + " flex flex-col justify-between gap-5"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <PanelTitle icon="transport">การเดินทาง</PanelTitle>
        {transport?.stationCount != null && (
          <span className="rounded-full bg-[#DBE9D5] px-2.5 py-1 text-xs font-bold text-[#36513E]">
            BTS &amp; MRT {format(transport.stationCount)} สถานี
          </span>
        )}
      </div>
      {transport ? (
        <div>
          {(transport.stations ?? []).map(({ name, annualPassengers }) => (
            <div key={name} className="flex justify-between gap-3 border-b border-[#E8DDD0] py-2 text-xs">
              <span>{name}</span>
              <strong className="shrink-0 font-semibold tabular-nums text-[#79544B]">
                {annualPassengers == null ? "—" : `${format(annualPassengers / 1000000)} ล้านคน/ปี`}
              </strong>
            </div>
          ))}
          {transport.lines && <p className={muted + " mt-3 text-right"}>{transport.lines}</p>}
        </div>
      ) : <p className={muted}>ยังไม่มีข้อมูลการเดินทาง</p>}
    </section>
  )
}

function CityStatistics({ district }) {
  const { education, dailyLife, safety } = district

  return (
    <section className="mt-7" aria-labelledby="district-city-statistics">
      <h2 id="district-city-statistics" className="text-lg font-bold leading-snug text-[#79544B]">ข้อมูลสถิติมิติเมืองเชิงลึก</h2>
      <p className={muted + " mt-1"}>ข้อมูลโครงสร้างพื้นฐาน การคมนาคม การศึกษา และความปลอดภัยประจำ{district.name}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <article className={panel}>
          <PanelTitle icon="education">การศึกษา</PanelTitle>
          {education ? (
            <>
              <p className={muted + " mt-2"}>มหาวิทยาลัย / สถาบันอุดมศึกษา {format(education.universityCount)} แห่ง</p>
              {education.universities && <p className="mt-1 text-sm font-bold">{education.universities}</p>}
              {education.students != null && <p className={muted + " mt-1"}>รวมนิสิตนักศึกษา {format(education.students)} คน</p>}
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className={innerCell + " p-2.5"}>
                  <strong className={statValue}>{format(education.schoolCount)}</strong>
                  <p className={muted}>โรงเรียนสังกัด กทม.</p>
                </div>
                <div className={innerCell + " p-2.5"}>
                  <strong className={statValue}>{format(education.kindergartenCount)}</strong>
                  <p className={muted}>เปิดชั้นอนุบาล</p>
                </div>
              </div>
            </>
          ) : <p className={muted + " mt-3"}>ยังไม่มีข้อมูลการศึกษา</p>}
        </article>

        <article className={panel + " flex flex-col justify-between gap-5"}>
          <PanelTitle icon="home">ชีวิตประจำวัน</PanelTitle>
          {dailyLife?.length > 0 ? (
            <dl className="divide-y divide-[#E8DDD0]">
              {dailyLife.map(({ label, count, detail }) => (
                <div key={label} className="grid grid-cols-[1fr_auto] gap-x-2 py-2 text-xs">
                  <dt>{label}</dt>
                  <dd className="font-semibold tabular-nums text-[#36513E]">{format(count)} แห่ง</dd>
                  {detail && <dd className={muted + " col-span-2"}>{detail}</dd>}
                </div>
              ))}
            </dl>
          ) : <p className={muted}>ยังไม่มีข้อมูลสถานที่ในชีวิตประจำวัน</p>}
        </article>

        <article className={panel + " flex flex-col justify-between gap-4"}>
          <div>
            <PanelTitle icon="safety">ความปลอดภัย</PanelTitle>
            {safety?.riskCount != null && (
              <p className="mt-2 text-2xl font-bold tabular-nums text-[#36513E] sm:text-3xl">
                {format(safety.riskCount)}
                <span className="ml-2 text-xs font-semibold text-[#806D61]">
                  จุดเสี่ยง{safety.year != null ? ` (ปี ${safety.year})` : ""}
                </span>
              </p>
            )}
          </div>
          {safety?.darkOrIsolatedCount != null && (
            <p className="w-fit rounded-md border border-[#F3D6D2] bg-[#F3D6D2] px-2 py-1 text-xs text-[#79544B]">
              จุดมืด จุดเปลี่ยว <strong>{format(safety.darkOrIsolatedCount)} จุด</strong>
            </p>
          )}
          {safety?.description && <p className={muted}>{safety.description}</p>}
          {!safety && <p className={muted}>ยังไม่มีข้อมูลความปลอดภัย</p>}
        </article>
      </div>
    </section>
  )
}

export default function DistrictDetails({ district }) {
  const profile = district
  const displayName = profile.name.startsWith("เขต") ? profile.name : `เขต${profile.name}`
  const density = profile.density ?? (
    profile.area > 0 && profile.population != null
      ? Math.round(profile.population / profile.area)
      : profile.densityComparison?.[0]?.value
  )
  let clusterLabel = profile.clusterId != null ? `Cluster ${profile.clusterId}` : profile.cluster
  if (!clusterLabel) clusterLabel = "รอข้อมูลกลุ่มเขต"
  if (profile.clusterName) clusterLabel += ` · ${profile.clusterName}`

  return (
    <section className="bg-[#FAF5EC] px-4 py-6 text-[#51433D] sm:px-6 lg:px-8">
      <header>
        <p className="inline-flex rounded-full bg-[#536F4C] px-3.5 py-1 text-xs font-semibold text-white">
          {clusterLabel}
        </p>
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h1 className="text-2xl font-bold leading-tight text-[#79544B] sm:text-3xl">{displayName}</h1>
          {profile.englishName && <p className="text-lg font-semibold text-[#806D61]">{profile.englishName}</p>}
        </div>
        {profile.description && <p className="mt-2 text-sm leading-relaxed text-[#51433D]">{profile.description}</p>}
      </header>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Metric
          label="พื้นที่"
          value={profile.area}
          unit="ตร.กม."
          note={profile.area != null ? "ประมาณจากขอบเขตบนแผนที่" : null}
        />
        <Metric label="แขวง" value={profile.subdistrictCount} unit="แขวง" />
        <Metric
          label="บ้าน/ครัวเรือน"
          value={profile.households}
          unit="หลัง"
          note={profile.householdsYear ? `ปี ${profile.householdsYear}` : null}
        />
        <Metric
          label="ความหนาแน่น"
          value={density}
          unit="คน/ตร.กม."
          note={profile.densityRank != null ? `อันดับ ${profile.densityRank} จาก ${profile.totalDistricts ?? 50} เขต` : null}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.43fr)_minmax(0,1fr)]">
        <section className={panel}>
          <h2 className={cardTitle + " mb-4"}>แผนที่{displayName}</h2>
          <BangkokMap districtName={displayName} />
        </section>
        <div className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-1 xl:grid-rows-2">
          <PopulationPanel district={profile} />
          <TransportPanel transport={profile.transport} />
        </div>
      </div>

      <CityStatistics district={{ ...profile, name: displayName }} />
      <DistrictDensityTable district={{ ...profile, name: displayName, density }} />
    </section>
  )
}

function DistrictDensityTable({ district }) {
  const selectedDensity = district.density ?? district.densityComparison?.[0]?.value
  const selectedName = district.name.replace(/^เขต\s*/, "").trim()
  const rows = (district.densityRanking ?? [])
    .filter(({ name }) => name.replace(/^เขต\s*/, "") !== selectedName)
    .sort((a, b) => b.density - a.density)
    .slice(0, 5)

  return (
    <section className={panel + " mt-6"} aria-labelledby="district-density-title">
      <header className="border-b border-[#E8DDD0] pb-4">
        <PanelTitle icon="compare" headingId="district-density-title" subtitle="เรียงตามความหนาแน่นประชากร">
          เขตที่มีความหนาแน่นประชากรสูง เทียบกับ{district.name}
        </PanelTitle>
      </header>

      {rows.length === 0 ? (
        <p className={muted + " mt-4"}>ยังไม่มีข้อมูลพื้นที่สำหรับจัดอันดับความหนาแน่น</p>
      ) : (
      <div className="mt-4 overflow-x-auto rounded-xl bg-[#F8F3ED] focus-visible:outline-[#536F4C]" tabIndex={0} role="group" aria-labelledby="district-density-title">
        <table className="w-full min-w-[720px] text-left text-sm leading-relaxed tabular-nums [&_td]:px-3 [&_td]:py-3 [&_th]:px-3 [&_th]:py-3 [&_tr>*:first-child]:pl-4 [&_tr>*:last-child]:pr-4">
          <thead className="border-b border-[#DCCABB] text-[#79544B]">
            <tr>
              <th scope="col" className="w-16">อันดับ</th>
              <th scope="col">ชื่อเขต</th>
              <th scope="col" className="text-right">ประชากร (คน)</th>
              <th scope="col" className="text-right">พื้นที่ (ตร.กม.)</th>
              <th scope="col" className="text-right">ความหนาแน่น (คน/ตร.กม.)</th>
              <th scope="col" className="text-right">เทียบกับเขตที่ค้นหา</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item, index) => (
              <tr key={item.name} className="border-b border-[#E8DDD0]">
                <td className="font-semibold text-[#806D61]">{index + 1}</td>
                <th scope="row" className="font-semibold">{item.name}</th>
                <td className="text-right">{format(item.population)}</td>
                <td className="text-right">{format(item.area)}</td>
                <td className="text-right font-semibold text-[#36513E]">{format(item.density)}</td>
                <td className="text-right font-semibold text-[#79544B]">
                  {selectedDensity > 0 ? `${(item.density / selectedDensity).toFixed(1)} เท่า` : "—"}
                </td>
              </tr>
            ))}
            <tr className="bg-[#DBE9D5] font-bold text-[#36513E]">
              <td>—</td>
              <th scope="row">
                {district.name}
                <span className="ml-2 inline-block rounded-md bg-[#536F4C] px-2 py-1 text-[10px] text-white">เขตปัจจุบัน</span>
              </th>
              <td className="text-right">{format(district.population)}</td>
              <td className="text-right">{format(district.area)}</td>
              <td className="text-right">{format(selectedDensity)}</td>
              <td className="text-right">เขตที่ค้นหา</td>
            </tr>
          </tbody>
        </table>
      </div>
      )}
    </section>
  )
}

// ---------- ผลค้นหาเขตจาก navbar ----------
// ดึงข้อมูลจริงจาก /api/district-details แล้วส่งให้ DistrictDetails
// onSearch = ฟังก์ชันค้นหาของ App ใช้ตอนกดชื่อเขตที่แนะนำ
const messageBox = "rounded-xl border border-[#DCCABB] bg-white p-4 text-sm text-[#51433D]"
const smallButton = "rounded-md border border-[#C3B2A9] bg-white px-3 py-1.5 text-xs font-semibold text-[#51433D] hover:bg-[#F8F3ED]"

export function DistrictSearchResult({ query, onSearch }) {
  const { district, loading, error, reload } = useDistrictDetails(query)

  if (loading) {
    return <p role="status" className={messageBox}>กำลังโหลดข้อมูลเขต “{query}”...</p>
  }

  if (error?.status === 404) {
    const suggestions = error.body?.suggestions ?? []
    return (
      <div role="status" className={messageBox}>
        <p>ไม่พบเขตที่ค้นหา “{query}”</p>
        {suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={muted}>หมายถึง</span>
            {suggestions.map(({ id, name }) => (
              <button key={id} type="button" className={smallButton} onClick={() => onSearch?.(name)}>
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className={messageBox}>
        <p>โหลดข้อมูลเขตไม่สำเร็จ: {error.message}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={smallButton} onClick={reload}>ลองใหม่</button>
        </div>
      </div>
    )
  }

  return district ? <DistrictDetails district={district} /> : null
}
