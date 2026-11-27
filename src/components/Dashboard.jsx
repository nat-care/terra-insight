import { useState } from "react";

import { getDashboard } from "../api/dashboardApi.js";
import { useApi } from "../api/useDashboardApi.js";
import "./Dashboard.css";

const STORAGE_KEY = "terra-insight:recommendations";

const numberFormat = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 2,
});

const percentFormat = new Intl.NumberFormat("th-TH", {
  style: "percent",
  maximumFractionDigits: 1,
});

const placeTypes = [
  { key: "school", label: "โรงเรียน", color: "#25765a" },
  { key: "hospital", label: "โรงพยาบาล", color: "#b44c66" },
  { key: "temple", label: "วัด", color: "#a56623" },
  { key: "park", label: "สวนสาธารณะ", color: "#698735" },
  { key: "university", label: "มหาวิทยาลัย", color: "#436ba3" },
  { key: "mall", label: "ห้างสรรพสินค้า", color: "#7959a7" },
  { key: "health", label: "จุดบริการสาธารณสุข", color: "#277c86" },
];

const sampleMetrics = [
  { label: "สถานพยาบาล", unit: "แห่ง", keys: ["hospital", "hospital_count", "health_count"] },
  { label: "โรงเรียน", unit: "แห่ง", keys: ["school", "school_count"] },
  { label: "ห้างสรรพสินค้า", unit: "แห่ง", keys: ["shopping", "mall", "mall_count", "shopping_count"] },
  { label: "วัด", unit: "แห่ง", keys: ["temple", "temple_count"] },
  { label: "มหาวิทยาลัย", unit: "แห่ง", keys: ["university", "university_count"] },
  { label: "จุดเสี่ยง", unit: "จุด", keys: ["risk", "risk_count", "risk_points", "risk_point_count"] },
];

function readRecommendations() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved.slice(0, 5) : null;
  } catch {
    return null;
  }
}

function normalizeName(value) {
  return String(value ?? "").normalize("NFC").trim().replace(/^เขต\s*/, "");
}

function districtName(row) {
  return row.district_name ?? row.districtName ?? row.district ?? row.name;
}

function numberOrNull(value) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function firstNumber(...values) {
  return values.map(numberOrNull).find((value) => value !== null) ?? null;
}

function format(value, unit = "") {
  if (value == null) return "ไม่มีข้อมูล";
  return `${numberFormat.format(value)}${unit ? ` ${unit}` : ""}`;
}

function getClusterLabel(row) {
  const cluster = row.cluster_id ?? row.clusterId ?? row.cluster;
  const value = typeof cluster === "object" && cluster !== null
    ? cluster.id ?? cluster.name
    : cluster;

  if (value == null || value === "") return null;
  return /^\d+$/.test(String(value)) ? `Cluster ${value}` : String(value);
}

function getSampleValue(row, keys) {
  const sources = [
    row.avg_features,
    row.average_features,
    row.feature_averages,
    row.features,
    row.area_features,
  ];

  return firstNumber(
    ...sources.flatMap((source) =>
      keys.flatMap((key) => [source?.[key], source?.[`avg_${key}`]])),
    ...keys.map((key) => row[`avg_${key}`]),
  );
}

function makeDistrictRows(recommendations, data) {
  const districts = data?.districts ?? [];
  const populationDistricts = data?.populationDistricts ?? [];
  const names = new Map();
  const ids = new Map();
  const people = new Map();
  const rows = new Map();

  for (const district of [...populationDistricts, ...districts]) {
    const name = normalizeName(districtName(district));
    if (name) names.set(name, district);
    if (district.id != null) ids.set(String(district.id), district);
  }

  for (const district of populationDistricts) {
    if (district.id != null) {
      people.set(String(district.id), numberOrNull(district.population));
    }
  }

  for (const recommendation of recommendations) {
    if (!recommendation || typeof recommendation !== "object") continue;

    const name = normalizeName(districtName(recommendation));
    const recommendationId =
      recommendation.district_id ?? recommendation.districtId ?? recommendation.id;
    const district = names.get(name) ?? ids.get(String(recommendationId ?? ""));
    const id = String(district?.id ?? (name || recommendationId || ""));
    if (!id || rows.has(id)) continue;

    const counts = data?.placeCountsByDistrict?.[id];
    const places = placeTypes.map((type) => ({
      ...type,
      value: numberOrNull(counts?.[type.key]),
    }));

    rows.set(id, {
      id,
      name: district?.name ?? (name ? `เขต${name}` : id),
      population: people.get(id) ?? numberOrNull(district?.population),
      placeCount: numberOrNull(district?.placeCount),
      distance: firstNumber(
        recommendation.distance_km,
        recommendation.distanceKm,
        recommendation.distance,
      ),
      cluster: getClusterLabel(recommendation),
      places,
      sample: sampleMetrics.map((metric) => ({
        ...metric,
        value: getSampleValue(recommendation, metric.keys),
      })),
    });
  }

  return [...rows.values()];
}

function placeValue(row, key, perPopulation) {
  const count = row.places.find((place) => place.key === key)?.value;
  if (count == null) return null;
  if (!perPopulation) return count;
  return row.population > 0 ? (count / row.population) * 10000 : null;
}

function makeScale(values) {
  const max = Math.max(1, ...values.filter((value) => value != null));
  const target = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const factor = [1, 2, 5, 10].find((value) => value * magnitude >= target);
  const step = Math.max(1, factor * magnitude);
  const intervals = Math.ceil(max / step);

  return {
    max: intervals * step,
    ticks: Array.from({ length: intervals + 1 }, (_, index) => step * index),
  };
}

function Panel({ title, description, children, wide = false }) {
  return (
    <section className={`ti-panel${wide ? " ti-wide" : ""}`}>
      <header className="ti-panel-header">
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <p className="ti-muted">{children ?? "ยังไม่มีข้อมูลสำหรับเขตที่กำลังดู"}</p>;
}

function Axis({ scale, unit }) {
  return (
    <div className="ti-axis" aria-hidden="true">
      <div className="ti-ticks">
        {scale.ticks.map((tick) => (
          <span key={tick} style={{ left: `${(tick / scale.max) * 100}%` }}>
            {numberFormat.format(tick)}
          </span>
        ))}
      </div>
      <span>{unit}</span>
    </div>
  );
}

function Plot({ scale, children }) {
  return (
    <div className="ti-plot" aria-hidden="true">
      {scale.ticks.map((tick) => (
        <span
          className="ti-gridline"
          key={tick}
          style={{ left: `${(tick / scale.max) * 100}%` }}
        />
      ))}
      {children}
    </div>
  );
}

function PopulationPlot({ rows, scale }) {
  const available = rows.filter(({ population }) => population != null);
  if (!available.length) return <Empty />;

  return (
    <>
      <ul className="ti-chart-rows">
        {available.map(({ id, name, population }) => (
          <li key={id}>
            <div className="ti-row-label">
              <span>{name}</span>
              <strong>{format(population, "คน")}</strong>
            </div>
            <Plot scale={scale}>
              <span
                className="ti-dot"
                style={{ left: `${(population / scale.max) * 100}%` }}
              />
            </Plot>
          </li>
        ))}
      </ul>
      <Axis scale={scale} unit="คน" />
    </>
  );
}

function PlaceKey({ place }) {
  return (
    <span className="ti-place-key">
      <span className="ti-swatch" style={{ background: place.color }} aria-hidden="true" />
      {place.label}
    </span>
  );
}

function placeTotal(row) {
  return row.places.reduce((total, { value }) => total + (value ?? 0), 0);
}

function PlaceStack({ rows, scale }) {
  const available = rows.filter(({ places }) => places.some(({ value }) => value != null));
  if (!available.length) return <Empty />;

  const legend = placeTypes.filter(({ key }) =>
    available.some(({ places }) => places.some((place) => place.key === key && place.value > 0)),
  );

  return (
    <>
      <ul className="ti-chart-rows">
        {available.map((row) => (
          <li key={row.id}>
            <div className="ti-row-label">
              <span>{row.name}</span>
              <strong>{format(placeTotal(row), "แห่ง")}</strong>
            </div>
            <Plot scale={scale}>
              <div className="ti-stack">
                {row.places.filter(({ value }) => value > 0).map(({ key, value, color }) => (
                  <span
                    key={key}
                    style={{ background: color, width: `${(value / scale.max) * 100}%` }}
                  />
                ))}
              </div>
            </Plot>
            <details className="ti-details">
              <summary>ดูจำนวนแยกตามประเภท</summary>
              <ul>
                {row.places.filter(({ value }) => value != null).map((place) => (
                  <li key={place.key}>
                    <PlaceKey place={place} />
                    <strong>{format(place.value, "แห่ง")}</strong>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>

      <Axis scale={scale} unit="แห่ง" />

      <ul className="ti-legend">
        {legend.map((place) => <li key={place.key}><PlaceKey place={place} /></li>)}
      </ul>
    </>
  );
}

function PlaceDonut({ row }) {
  const total = placeTotal(row);
  if (!total) return <Empty>ไม่มีจำนวนสถานที่ให้คำนวณสัดส่วน</Empty>;

  const places = row.places.filter(({ value }) => value > 0);
  let offset = 0;
  const segments = places.map(({ color, value }) => {
    const start = offset;
    offset += value;
    return `${color} ${(start / total) * 100}% ${(offset / total) * 100}%`;
  });

  return (
    <div className="ti-donut-layout">
      <div
        className="ti-donut"
        style={{ backgroundImage: `conic-gradient(${segments.join(", ")})` }}
      >
        <div className="ti-donut-center">
          <strong>{format(total)}</strong>
          <span>แห่ง</span>
        </div>
      </div>

      <ul className="ti-donut-legend">
        {places.map((place) => (
          <li key={place.key}>
            <PlaceKey place={place} />
            <strong>
              {format(place.value, "แห่ง")} · {percentFormat.format(place.value / total)}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComparisonTable({ rows, placeType, perPopulation, sort, onSort }) {
  const placeUnit = perPopulation ? "แห่งต่อ 10,000 คน" : "แห่ง";
  const columns = [
    { key: "distance", label: "ระยะเส้นตรง", unit: "กม." },
    { key: "population", label: "ประชากร", unit: "คน" },
    { key: "placeCount", label: "สถานที่สำคัญรวม", unit: "แห่ง" },
    { key: "place", label: placeType.label, unit: placeUnit },
  ];

  const valueFor = (row, key) => key === "place"
    ? placeValue(row, placeType.key, perPopulation)
    : row[key];

  const sortedRows = [...rows].sort((a, b) => {
    const left = valueFor(a, sort.key);
    const right = valueFor(b, sort.key);

    if (left == null) return right == null ? 0 : 1;
    if (right == null) return -1;
    return sort.direction === "ascending" ? left - right : right - left;
  });

  return (
    <div className="ti-scroll">
      <table className="ti-table">
        <caption className="ti-sr-only">เปรียบเทียบข้อมูลเขตที่แนะนำ</caption>
        <thead>
          <tr>
            <th scope="col">เขต</th>
            {columns.map(({ key, label }) => (
              <th
                key={key}
                scope="col"
                aria-sort={sort.key === key ? sort.direction : undefined}
              >
                <button type="button" className="ti-sort" onClick={() => onSort(key)}>
                  {label}
                  <span aria-hidden="true">
                    {sort.key === key ? (sort.direction === "ascending" ? "↑" : "↓") : "↕"}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.id}>
              <th scope="row">{row.name}</th>
              {columns.map(({ key, unit }) => (
                <td key={key}>{format(valueFor(row, key), unit)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PairComparison({ rows, placeType, perPopulation }) {
  const [left, right] = rows;
  const metrics = [
    { label: "ระยะเส้นตรงจากที่ทำงาน", unit: "กม.", values: [left.distance, right.distance] },
    { label: "ประชากร", unit: "คน", values: [left.population, right.population] },
    { label: "สถานที่สำคัญรวม", unit: "แห่ง", values: [left.placeCount, right.placeCount] },
    {
      label: placeType.label,
      unit: perPopulation ? "แห่งต่อ 10,000 คน" : "แห่ง",
      values: rows.map((row) => placeValue(row, placeType.key, perPopulation)),
    },
  ];

  return (
    <div className="ti-scroll">
      <table className="ti-table">
        <caption className="ti-sr-only">ส่วนต่างระหว่าง {left.name} และ {right.name}</caption>
        <thead>
          <tr>
            <th scope="col">ข้อมูล</th>
            <th scope="col">{left.name}</th>
            <th scope="col">{right.name}</th>
            <th scope="col">ส่วนต่าง</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map(({ label, unit, values: [a, b] }) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{format(a, unit)}</td>
              <td>{format(b, unit)}</td>
              <td>{format(a != null && b != null ? Math.abs(a - b) : null, unit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SampleTable({ rows }) {
  const metrics = sampleMetrics
    .map((metric, index) => ({ ...metric, index }))
    .filter(({ index }) => rows.some(({ sample }) => sample[index].value != null));

  if (!metrics.length) return null;

  return (
    <Panel
      title="ข้อมูลรอบจุดตัวอย่าง"
      description="ค่าเฉลี่ยรอบจุดที่ใช้ประกอบการจัดกลุ่มพื้นที่"
      wide
    >
      <div className="ti-scroll">
        <table className="ti-table">
          <caption className="ti-sr-only">ค่าเฉลี่ยสถานที่รอบจุดตัวอย่างรายเขต</caption>
          <thead>
            <tr>
              <th scope="col">เขต</th>
              {metrics.map(({ label }) => <th key={label} scope="col">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ id, name, sample }) => (
              <tr key={id}>
                <th scope="row">{name}</th>
                {metrics.map(({ index, label, unit }) => (
                  <td key={label}>{format(sample[index].value, unit)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Loading() {
  return (
    <div className="ti-workspace" aria-busy="true">
      <p className="ti-muted" role="status">กำลังโหลดข้อมูลเขตที่แนะนำ…</p>
      <div className="ti-grid" aria-hidden="true">
        {["population", "places"].map((key) => (
          <div className="ti-panel ti-skeleton-card" key={key}>
            <span /><span /><span />
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardComparison({ recommendations }) {
  const { data, loading, error, reload } = useApi(getDashboard, []);
  const [selectedId, setSelectedId] = useState("");
  const [maxDistance, setMaxDistance] = useState("");
  const [placeKey, setPlaceKey] = useState("school");
  const [perPopulation, setPerPopulation] = useState(false);
  const [pairIds, setPairIds] = useState([]);
  const [sort, setSort] = useState({ key: "distance", direction: "ascending" });

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="ti-panel" role="alert">
        <p>โหลดข้อมูลเขตไม่สำเร็จ · {error.message}</p>
        <button className="ti-button" type="button" onClick={reload}>ลองใหม่</button>
      </div>
    );
  }

  const allRows = makeDistrictRows(recommendations, data);
  if (!allRows.length) return <Empty>ไม่พบข้อมูล Dashboard ของเขตที่แนะนำ</Empty>;

  const limit = numberOrNull(maxDistance);
  const filteredRows = limit == null
    ? allRows
    : allRows.filter(({ distance }) => distance != null && distance <= limit);
  const selected = filteredRows.find(({ id }) => id === selectedId);
  const visibleRows = selected ? [selected] : filteredRows;
  const pair = pairIds
    .map((id) => filteredRows.find((row) => row.id === id))
    .filter(Boolean);
  const shownPair = selected ? [] : pair;

  const placeType = placeTypes.find(({ key }) => key === placeKey) ?? placeTypes[0];
  const populationScale = makeScale(allRows.map(({ population }) => population));
  const placeScale = makeScale(allRows.map(placeTotal));
  const distanceAvailable = allRows.some(({ distance }) => distance != null);

  function togglePair(id) {
    setPairIds((previous) => {
      if (previous.includes(id)) return previous.filter((item) => item !== id);
      return [...previous.slice(-1), id];
    });
  }

  function changeSort(key) {
    setSort((previous) => ({
      key,
      direction: previous.key === key && previous.direction === "ascending"
        ? "descending"
        : "ascending",
    }));
  }

  function changeDistance(value) {
    setMaxDistance(value);
    setSelectedId("");
    setPairIds([]);
  }

  return (
    <section className="ti-workspace ti-enter" aria-labelledby="ti-comparison-heading">
      <header className="ti-toolbar">
        <div>
          <h2 id="ti-comparison-heading">เปรียบเทียบเขตที่แนะนำ</h2>
          <p className="ti-muted" role="status">แสดง {visibleRows.length} จาก {allRows.length} เขต</p>
        </div>

        <div className="ti-controls">
          <label>
            เขตที่ต้องการดู
            <select value={selected?.id ?? ""} onChange={(event) => setSelectedId(event.target.value)}>
              <option value="">ทุกเขตที่ผ่านตัวกรอง</option>
              {filteredRows.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>

          {distanceAvailable && (
            <label>
              ระยะเส้นตรงสูงสุด (กม.)
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="ไม่จำกัด"
                value={maxDistance}
                onChange={(event) => changeDistance(event.target.value)}
              />
            </label>
          )}

          <label>
            ประเภทสถานที่ในตาราง
            <select value={placeKey} onChange={(event) => setPlaceKey(event.target.value)}>
              {placeTypes.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>

          <label>
            หน่วยของประเภทที่เลือก
            <select
              value={perPopulation ? "rate" : "count"}
              onChange={(event) => setPerPopulation(event.target.value === "rate")}
            >
              <option value="count">จำนวนแห่ง</option>
              <option value="rate">แห่งต่อประชากร 10,000 คน</option>
            </select>
          </label>
        </div>
      </header>

      {!filteredRows.length ? (
        <div className="ti-panel">
          <Empty>ไม่มีเขตที่อยู่ในระยะที่กำหนด</Empty>
          <button className="ti-button" type="button" onClick={() => changeDistance("")}>
            ล้างตัวกรองระยะทาง
          </button>
        </div>
      ) : (
        <>
          <div className="ti-district-grid">
            {filteredRows.map((row) => (
              <div className={`ti-district${selected?.id === row.id ? " is-selected" : ""}`} key={row.id}>
                <button
                  className="ti-district-main"
                  type="button"
                  aria-pressed={selected?.id === row.id}
                  onClick={() => setSelectedId(selected?.id === row.id ? "" : row.id)}
                >
                  <span className="ti-district-title">{row.name}</span>
                  {row.cluster && <span className="ti-cluster">{row.cluster}</span>}
                  <span className="ti-district-facts">
                    <span>จากที่ทำงาน <strong>{format(row.distance, "กม.")}</strong></span>
                    <span>ประชากร <strong>{format(row.population, "คน")}</strong></span>
                  </span>
                </button>

                {!selected && filteredRows.length > 1 && (
                  <label className="ti-pair-toggle">
                    <input
                      type="checkbox"
                      checked={pairIds.includes(row.id)}
                      onChange={() => togglePair(row.id)}
                    />
                    เทียบ {row.name}
                  </label>
                )}
              </div>
            ))}
          </div>

          <div className="ti-grid ti-enter" key={selected?.id ?? "all"}>
            <Panel title="ตารางเปรียบเทียบเขต" wide>
              <ComparisonTable
                rows={visibleRows}
                placeType={placeType}
                perPopulation={perPopulation}
                sort={sort}
                onSort={changeSort}
              />
            </Panel>

            {shownPair.length === 2 && (
              <Panel title="เปรียบเทียบสองเขต" wide>
                <PairComparison rows={shownPair} placeType={placeType} perPopulation={perPopulation} />
              </Panel>
            )}

            <Panel
              title="จำนวนประชากรรายเขต"
              description={data?.years?.population ? `ปีข้อมูล ${data.years.population}` : undefined}
            >
              <PopulationPlot rows={visibleRows} scale={populationScale} />
            </Panel>

            <Panel
              title={selected ? "สัดส่วนสถานที่สำคัญ" : "สถานที่สำคัญแยกตามเขต"}
              description="รวมเฉพาะประเภทที่มีข้อมูล"
            >
              {selected ? (
                <PlaceDonut row={selected} />
              ) : (
                <PlaceStack rows={visibleRows} scale={placeScale} />
              )}
            </Panel>

            <SampleTable rows={visibleRows} />
          </div>
        </>
      )}
    </section>
  );
}

export default function Dashboard() {
  const [recommendations] = useState(readRecommendations);

  return (
    <section className="ti-dashboard" lang="th">
      <h1 className="ti-title">ข้อมูลเขตที่แนะนำ</h1>

      

      {recommendations?.length > 0 && (
        <DashboardComparison recommendations={recommendations} />
      )}

      {recommendations === null && (
        <Empty>ค้นหาทำเลจากหน้าแรกเพื่อดูข้อมูลเปรียบเทียบ</Empty>
      )}
    </section>
  );
}