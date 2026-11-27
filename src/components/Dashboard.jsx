import { useState } from "react";

import { getDashboard, getDistrict } from "../api/dashboardApi.js";
import { useApi, useDistrictSearch } from "../api/useDashboardApi.js";
import RecommendedResults from "../components/RecommendedResults";
import logo from "../assets/flower.png";

const STORAGE_KEY = "terra-insight:recommendations";

function readRecommendations() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.slice(0, 5) : null;
  } catch {
    return null;
  }
}

const numberFormat = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
});

const placeTypes = {
  school: "โรงเรียน",
  hospital: "โรงพยาบาล",
  temple: "วัด",
  park: "สวนสาธารณะ",
  university: "มหาวิทยาลัย",
  mall: "ห้างสรรพสินค้า",
  health: "จุดบริการสาธารณสุข",
};

const format = (value) =>
  Number.isFinite(value) ? numberFormat.format(value) : "—";

const isCount = (value) => Number.isSafeInteger(value) && value >= 0;

function Panel({ title, children }) {
  return (
    <section className="dashboard-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Empty() {
  return <p className="dashboard-muted">ยังไม่มีข้อมูล</p>;
}

function Bars({ rows, unit, selectedId }) {
  const values = rows.filter(({ value }) => Number.isFinite(value) && value >= 0);
  const max = Math.max(1, ...values.map(({ value }) => value));

  if (!values.length) return <Empty />;

  return (
    <ul className="dashboard-bars">
      {values.map(({ id, name, value }) => (
        <li key={id} aria-current={String(id) === selectedId ? "true" : undefined}>
          <span>{name}</span>
          <meter min={0} max={max} value={value} aria-label={name} />
          <strong>{format(value)} {unit}</strong>
        </li>
      ))}
    </ul>
  );
}

function DistrictSearch({ onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const { results = [], loading, error } = useDistrictSearch(
    open ? query.trim() : "",
  );

  function selectDistrict(district) {
    setQuery(district.name);
    setOpen(false);
    onSelect(String(district.id));
  }

  return (
    <div className="dashboard-search">
      <label htmlFor="dashboard-district-search">ค้นหาเขต</label>
      <input
        id="dashboard-district-search"
        type="search"
        value={query}
        placeholder="พิมพ์ชื่อเขต"
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          setOpen(Boolean(value.trim()));
          if (!value.trim()) onSelect("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "Enter" && open && results.length) {
            event.preventDefault();
            selectDistrict(results[0]);
          }
        }}
      />
      {open && (
        <>
          {loading && <p role="status">กำลังค้นหา...</p>}
          {error && <p role="alert">{error.message}</p>}
          {!loading && !error && !results.length && (
            <p role="status">ไม่พบเขตที่ตรงกับคำค้น</p>
          )}
          {results.length > 0 && (
            <ul>
              {results.map((district) => (
                <li key={district.id}>
                  <button type="button" onClick={() => selectDistrict(district)}>
                    {district.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function DistrictDetails({ districtId, onClear }) {
  const { data, loading, error, reload } = useApi(
    (signal) => getDistrict(districtId, signal),
    [districtId],
    { enabled: Boolean(districtId) },
  );

  return (
    <Panel title={data?.name ?? "รายละเอียดเขต"}>
      <button type="button" onClick={onClear}>ล้างการเลือก</button>
      {loading && <p role="status">กำลังโหลดรายละเอียดเขต...</p>}
      {error && (
        <div role="alert">
          <p>{error.message}</p>
          <button type="button" onClick={reload}>ลองใหม่</button>
        </div>
      )}
      {!loading && !error && data && (
        <>
          <p>ประชากร {format(data.population)} คน</p>
          <p>พื้นที่ {format(data.area)} ตร.กม.</p>
          <p>สถานที่สำคัญ {format(data.placeCount ?? data.poiCount)} แห่ง</p>
          {data.households?.counts?.length > 0 && (
            <Bars
              unit="หลัง"
              rows={data.households.counts.map((value, index) => ({
                id: index,
                name: String(data.households.years?.[index] ?? index + 1),
                value,
              }))}
            />
          )}
        </>
      )}
    </Panel>
  );
}

function DensityTable({ districts, selectedId }) {
  const ranked = districts
    .filter(({ area, population }) => Number.isFinite(area) && area > 0 && isCount(population))
    .map((district) => ({ ...district, density: district.population / district.area }))
    .sort((a, b) => b.density - a.density);

  const rows = selectedId
    ? ranked.filter(({ id }) => String(id) === selectedId)
    : ranked.slice(0, 5);

  if (!rows.length) return <Empty />;

  return (
    <div className="dashboard-scroll">
      <table>
        <thead>
          <tr>
            <th scope="col">เขต</th>
            <th scope="col">ประชากร</th>
            <th scope="col">พื้นที่ (ตร.กม.)</th>
            <th scope="col">คน/ตร.กม.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ id, name, population, area, density }) => (
            <tr key={id}>
              <th scope="row">{name}</th>
              <td>{format(population)}</td>
              <td>{format(area)}</td>
              <td>{format(density)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AreaChart({ zones }) {
  const rows = zones.filter(({ area }) => Number.isFinite(area) && area > 0);
  const totalArea = rows.reduce((total, { area }) => total + area, 0);

  return (
    <>
      {rows.length > 0 && <p>พื้นที่รวม {format(totalArea)} ตร.กม.</p>}
      <Bars
        unit="%"
        rows={rows.map(({ id, name, area }) => ({
          id: id ?? name,
          name,
          value: (area / totalArea) * 100,
        }))}
      />
    </>
  );
}

function PlacesChart({ districts, counts, selectedId }) {
  const options = districts.filter(({ id }) => counts[id]);
  const activeId = options.some(({ id }) => String(id) === selectedId)
    ? selectedId
    : "";
  const [filter, setFilter] = useState(activeId);
  const entries = filter ? [counts[filter]].filter(Boolean) : Object.values(counts);

  const rows = Object.entries(placeTypes).map(([id, name]) => {
    const values = entries.map((entry) => entry?.[id]).filter(isCount);
    return {
      id,
      name,
      value: values.length ? values.reduce((sum, value) => sum + value, 0) : null,
    };
  });

  return (
    <>
      {options.length > 0 && (
        <label>
          เลือกเขต{" "}
          <select value={filter} onChange={(event) => setFilter(event.target.value)}>
            <option value="">ทุกเขตที่มีข้อมูล</option>
            {options.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
      )}
      <Bars rows={rows} unit="แห่ง" />
    </>
  );
}

function HousingChart({ housing, selectedId }) {
  const years = housing?.years ?? [];
  const districts = (housing?.districts ?? []).filter(
    ({ counts }) => years.length > 0
      && Array.isArray(counts)
      && counts.length === years.length
      && counts.every(isCount),
  );
  const [filter, setFilter] = useState(selectedId);
  const selected = districts.find(({ id }) => String(id) === filter);

  if (!districts.length) return <Empty />;

  const totals = selected?.counts ?? years.map((_, index) =>
    districts.reduce((sum, district) => sum + district.counts[index], 0),
  );

  return (
    <>
      <label>
        เลือกเขต{" "}
        <select value={selected ? filter : ""} onChange={(event) => setFilter(event.target.value)}>
          <option value="">รวมเขตที่มีข้อมูล</option>
          {districts.map(({ id, district, name }) => (
            <option key={id} value={id}>{name ?? district}</option>
          ))}
        </select>
      </label>
      <Bars
        unit="หลัง"
        rows={years.map((year, index) => ({
          id: year,
          name: String(year),
          value: totals[index],
        }))}
      />
    </>
  );
}

function TransitChart({ stops, districtCount }) {
  const districtsByStation = new Map();

  for (const stop of stops) {
    if (stop?.type !== "bts" || stop.id == null || typeof stop.district !== "string") {
      continue;
    }
    const district = stop.district.trim().replace(/^เขต\s*/, "");
    if (district) districtsByStation.set(String(stop.id), district);
  }

  const coverage = new Map();
  for (const district of districtsByStation.values()) {
    coverage.set(district, (coverage.get(district) ?? 0) + 1);
  }

  const rows = [...coverage]
    .map(([district, value]) => ({ id: district, name: `เขต${district}`, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <>
      {rows.length > 0 && (
        <p>
          {format(rows.length)}{districtCount > 0 && ` / ${format(districtCount)}`} เขต
          {" · "}{format(districtsByStation.size)} สถานี
        </p>
      )}
      <Bars rows={rows} unit="สถานี" />
    </>
  );
}

function DashboardView({ data }) {
  const [selectedId, setSelectedId] = useState("");
  const {
    summary = {},
    clusters = [],
    districts = [],
    populationDistricts = districts,
    placeCountsByDistrict = {},
    zones = [],
    housing,
    transitStops = [],
    bts,
    years = {},
  } = data;

  const populationRows = populationDistricts
    .filter(({ population }) => isCount(population))
    .map(({ id, name, population }) => ({ id, name, value: population }))
    .sort((a, b) => b.value - a.value);

  const cards = [
    { label: "จำนวนเขตทั้งหมด", value: summary.districtCount, unit: "เขต" },
    { label: "จำนวน Cluster", value: clusters.length || null, unit: "กลุ่ม" },
    { label: "ประชากรรวม", value: summary.population, unit: "คน" },
    { label: "สถานที่สำคัญ", value: summary.placeCount, unit: "แห่ง" },
  ];

  const passengerRows = (bts?.stations ?? [])
    .filter(({ total }) => isCount(total))
    .map(({ id, name, total }) => ({ id: id ?? name, name, value: total }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  return (
    <>
      <DistrictSearch onSelect={setSelectedId} />

      <div className="dashboard-grid dashboard-metrics">
        {cards.map(({ label, value, unit }) => (
          <div key={label} className="dashboard-panel">
            <p>{label}</p>
            <strong>{format(value)}</strong>
            {Number.isFinite(value) && ` ${unit}`}
          </div>
        ))}
      </div>

      {selectedId && (
        <DistrictDetails key={selectedId} districtId={selectedId} onClear={() => setSelectedId("")} />
      )}

      <div className="dashboard-grid">
        <Panel title="จำนวนประชากรรายเขต">
          <p className="dashboard-muted">
            {populationRows.length} เขต · {years.population ? `ปีข้อมูล ${years.population}` : "ไม่ระบุปีข้อมูล"}
          </p>
          <Bars rows={populationRows} unit="คน" selectedId={selectedId} />
        </Panel>

        <Panel title="อันดับความหนาแน่นประชากร">
          <DensityTable districts={districts} selectedId={selectedId} />
        </Panel>

        <Panel title="สัดส่วนพื้นที่ในกรุงเทพมหานคร">
          <AreaChart zones={zones} />
        </Panel>

        <Panel title="สถานที่สำคัญแยกตามประเภท">
          <PlacesChart
            key={selectedId}
            districts={districts.length ? districts : populationDistricts}
            counts={placeCountsByDistrict}
            selectedId={selectedId}
          />
        </Panel>

        <Panel title="แนวโน้มจำนวนบ้านรายเขต">
          <HousingChart key={selectedId} housing={housing} selectedId={selectedId} />
        </Panel>

        <Panel title="BTS ให้บริการกี่เขตในกรุงเทพฯ">
          <TransitChart
            stops={transitStops}
            districtCount={summary.districtCount ?? (districts.length || populationDistricts.length)}
          />
        </Panel>

        {passengerRows.length > 0 && (
          <Panel title="จำนวนผู้โดยสาร BTS รายสถานี">
            <Bars rows={passengerRows} unit="คน" />
          </Panel>
        )}
      </div>
    </>
  );
}

export default function Dashboard() {
  const [results] = useState(readRecommendations);
  const { data, loading, error, reload } = useApi(getDashboard, []);

  return (
    <section className="dashboard-page" lang="th">
      <style>{styles}</style>
      <h1>ภาพรวมกรุงเทพมหานคร</h1>

      <RecommendedResults
        recommendations={results ?? []}
        hasSearched={results !== null}
        logo={logo}
      />

      {loading ? (
        <p role="status">กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...</p>
      ) : error ? (
        <div className="dashboard-panel" role="alert">
          <p>โหลดข้อมูลไม่สำเร็จ · {error.message}</p>
          <button type="button" onClick={reload}>ลองใหม่</button>
        </div>
      ) : data ? (
        <DashboardView data={data} />
      ) : (
        <Empty />
      )}
    </section>
  );
}

const styles = `
.dashboard-page { display: grid; gap: 1rem; }
.dashboard-page h1, .dashboard-page h2 { margin: 0 0 .75rem; }
.dashboard-page h2 { font-size: 1.125rem; }

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  gap: 1rem;
}

.dashboard-metrics {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
}

.dashboard-panel {
  min-width: 0;
  padding: 1rem;
  border: 1px solid #dee7da;
  border-radius: 1rem;
  background: #fff;
}

.dashboard-metrics strong { font-size: 1.5rem; }
.dashboard-muted { color: #52604e; }
.dashboard-search { display: grid; gap: .5rem; max-width: 26rem; }

.dashboard-page input, .dashboard-page select, .dashboard-page button {
  padding: .45rem .65rem;
  border: 1px solid #c8d5c3;
  border-radius: .5rem;
}

.dashboard-page button { cursor: pointer; background: #f1f6ee; }

.dashboard-bars, .dashboard-search ul {
  list-style: none;
  padding: 0;
  margin: .75rem 0 0;
}

.dashboard-bars {
  max-height: 20rem;
  overflow: auto;
}

.dashboard-bars li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(2rem, .65fr) auto;
  align-items: center;
  gap: .5rem;
  padding: .4rem;
}

.dashboard-bars li[aria-current="true"] { background: #e2ebd9; }
.dashboard-bars meter { width: 100%; }
.dashboard-scroll { overflow-x: auto; }
.dashboard-page table { width: 100%; border-collapse: collapse; }

.dashboard-page th, .dashboard-page td {
  padding: .5rem;
  border-bottom: 1px solid #dee7da;
  text-align: start;
}
`;