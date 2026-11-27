import { useState } from "react";

import { getDashboard } from "../api/dashboardApi.js";
import { useApi } from "../api/useDashboardApi.js";
import RecommendedResults from "../components/RecommendedResults";
import logo from "../assets/flower.png";

const STORAGE_KEY = "terra-insight:recommendations";
const numberFormat = new Intl.NumberFormat("th-TH");

const placeTypes = {
  school: "โรงเรียน",
  hospital: "โรงพยาบาล",
  temple: "วัด",
  park: "สวนสาธารณะ",
  university: "มหาวิทยาลัย",
  mall: "ห้างสรรพสินค้า",
  health: "จุดบริการสาธารณสุข",
};

function readRecommendations() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.slice(0, 5) : null;
  } catch {
    return null;
  }
}

function normalizeDistrictName(value) {
  return String(value ?? "").trim().replace(/^เขต\s*/, "");
}

function getDistrictName(district) {
  return district.district_name
    ?? district.districtName
    ?? district.district
    ?? district.name;
}

function getDistrictId(district) {
  return district.district_id ?? district.districtId ?? district.id;
}

function isCount(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function matchRecommendedDistricts(recommendations, districts) {
  const matches = new Map();

  for (const recommendation of recommendations) {
    if (!recommendation || typeof recommendation !== "object") continue;

    const name = normalizeDistrictName(getDistrictName(recommendation));
    const id = getDistrictId(recommendation);

    const districtByName = name
      ? districts.find((district) =>
          normalizeDistrictName(getDistrictName(district)) === name)
      : undefined;

    const district = districtByName ?? (
      id == null
        ? undefined
        : districts.find((row) => String(row.id) === String(id))
    );

    if (district?.id != null) {
      matches.set(String(district.id), district);
    }
  }

  return [...matches.values()];
}

function Panel({ title, children }) {
  return (
    <section className="dashboard-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Bars({ rows, unit }) {
  const values = rows.filter(({ value }) => isCount(value));

  if (!values.length) {
    return (
      <p className="dashboard-muted">
        ยังไม่มีข้อมูลสำหรับเขตที่กำลังดู
      </p>
    );
  }

  const max = Math.max(1, ...values.map(({ value }) => value));

  return (
    <ul className="dashboard-bars">
      {values.map(({ id, name, value }) => (
        <li key={id}>
          <span>{name}</span>
          <meter min={0} max={max} value={value} aria-label={name} />
          <strong>{numberFormat.format(value)} {unit}</strong>
        </li>
      ))}
    </ul>
  );
}

function PlacesChart({ districts, counts }) {
  const rows = Object.entries(placeTypes).map(([id, name]) => {
    const values = districts
      .map((district) => counts[district.id]?.[id])
      .filter(isCount);

    return {
      id,
      name,
      value: values.length
        ? values.reduce((total, value) => total + value, 0)
        : null,
    };
  });

  return <Bars rows={rows} unit="แห่ง" />;
}

function DashboardComparison({ recommendations }) {
  const [selectedId, setSelectedId] = useState("");
  const { data, loading, error, reload } = useApi(getDashboard, []);

  if (loading) {
    return <p role="status">กำลังโหลดข้อมูลเขตที่แนะนำ...</p>;
  }

  if (error) {
    return (
      <div className="dashboard-panel" role="alert">
        <p>โหลดข้อมูลเขตไม่สำเร็จ · {error.message}</p>
        <button type="button" onClick={reload}>ลองใหม่</button>
      </div>
    );
  }

  const districts = data?.districts ?? [];
  const populationDistricts = data?.populationDistricts ?? [];
  const districtRows = districts.length ? districts : populationDistricts;
  const recommendedDistricts = matchRecommendedDistricts(
    recommendations,
    districtRows,
  );

  if (!recommendedDistricts.length) {
    return (
      <p className="dashboard-muted">
        ไม่พบข้อมูล Dashboard ของเขตที่แนะนำ
      </p>
    );
  }

  const selectedDistrict = recommendedDistricts.find(
    ({ id }) => String(id) === selectedId,
  );
  const visibleDistricts = selectedDistrict
    ? [selectedDistrict]
    : recommendedDistricts;

  const populationById = new Map(
    populationDistricts.map(({ id, population }) => [String(id), population]),
  );

  const populationRows = visibleDistricts
    .map(({ id, name, population }) => ({
      id,
      name,
      value: populationById.get(String(id)) ?? population,
    }))
    .filter(({ value }) => isCount(value))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      <label className="dashboard-filter">
        เขตที่ต้องการดู
        <select
          value={selectedDistrict ? String(selectedDistrict.id) : ""}
          onChange={(event) => setSelectedId(event.target.value)}
        >
          <option value="">ทุกเขตที่แนะนำ</option>
          {recommendedDistricts.map(({ id, name }) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
      </label>

      <div className="dashboard-grid">
        <Panel title="จำนวนประชากรรายเขต">
          {data.years?.population && (
            <p className="dashboard-muted">
              ปีข้อมูล {data.years.population}
            </p>
          )}
          <Bars rows={populationRows} unit="คน" />
        </Panel>

        <Panel title="สถานที่สำคัญแยกตามประเภท">
          {visibleDistricts.length > 1 && (
            <p className="dashboard-muted">
              รวมจาก {visibleDistricts.length} เขตที่กำลังดู
            </p>
          )}
          <PlacesChart
            districts={visibleDistricts}
            counts={data.placeCountsByDistrict ?? {}}
          />
        </Panel>
      </div>
    </>
  );
}

export default function Dashboard() {
  const [recommendations] = useState(readRecommendations);

  return (
    <section className="dashboard-page" lang="th">
      <style>{styles}</style>
      <h1>ข้อมูลเขตที่แนะนำ</h1>

      <RecommendedResults
        recommendations={recommendations ?? []}
        hasSearched={recommendations !== null}
        logo={logo}
      />

      {recommendations?.length > 0 && (
        <DashboardComparison recommendations={recommendations} />
      )}

      {recommendations === null && (
        <p className="dashboard-muted">
          ค้นหาทำเลจากหน้าแรกเพื่อดูข้อมูลเปรียบเทียบ
        </p>
      )}
    </section>
  );
}

const styles = `
.dashboard-page {
  display: grid;
  gap: 1rem;
}

.dashboard-page h1,
.dashboard-page h2 {
  margin: 0 0 .75rem;
}

.dashboard-page h2 {
  font-size: 1.125rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  gap: 1rem;
}

.dashboard-panel {
  min-width: 0;
  padding: 1rem;
  border: 1px solid #dee7da;
  border-radius: 1rem;
  background: #fff;
}

.dashboard-muted {
  color: #52604e;
}

.dashboard-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .5rem;
}

.dashboard-page select,
.dashboard-page button {
  padding: .45rem .65rem;
  border: 1px solid #c8d5c3;
  border-radius: .5rem;
}

.dashboard-page button {
  cursor: pointer;
  background: #f1f6ee;
}

.dashboard-bars {
  display: grid;
  gap: .65rem;
  padding: 0;
  margin: .75rem 0 0;
  list-style: none;
}

.dashboard-bars li {
  display: grid;
  grid-template-columns: minmax(5rem, 1fr) minmax(2rem, 1fr) auto;
  align-items: center;
  gap: .5rem;
}

.dashboard-bars meter {
  width: 100%;
}
`;