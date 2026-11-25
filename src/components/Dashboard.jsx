import { useId, useRef, useState } from "react";
import { divIcon, geoJSON } from "leaflet";
import { GeoJSON, MapContainer, Marker, Popup, TileLayer, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import districtBoundaries from "../data/bangkok-districts.json";

// ข้อมูลตัวอย่างสำหรับหน้า Dashboard
const dashboardData = {
  isExample: true,
  summary: {
    districtCount: 50,
    population: 5_454_300,
    placeCount: 18_450,
  },
  clusters: [
    { id: 1, name: "กรุงเทพชั้นในและพาณิชย์", count: 12, color: "#174b3b" },
    { id: 2, name: "โซนเหนือและการศึกษา", count: 11, color: "#347859" },
    { id: 3, name: "สุขุมวิทและตะวันออก", count: 10, color: "#97671f" },
    { id: 4, name: "ฝั่งธนบุรีและชุมชนดั้งเดิม", count: 9, color: "#55695f" },
    { id: 5, name: "ชานเมืองและเกษตรกรรม", count: 8, color: "#aa4d3b" },
  ],
  districts: [
    {
      id: "pomprap", name: "เขตป้อมปราบศัตรูพ่าย", clusterId: 1, population: 41200, area: 1.93,
    },
    {
      id: "samphanthawong", name: "เขตสัมพันธวงศ์", clusterId: 1, population: 20600, area: 1.42,
    },
    {
      id: "dindaeng", name: "เขตดินแดง", clusterId: 1, population: 116500, area: 8.35,
    },
    {
      id: "thonburi", name: "เขตธนบุรี", clusterId: 4, population: 102100, area: 8.55,
    },
    {
      id: "ratchathewi", name: "เขตราชเทวี", clusterId: 1, population: 67800, area: 7.13,
    },
    {
      id: "bangkhen", name: "เขตบางเขน", clusterId: 2, population: 190400, area: 42.12,
    },
    {
      id: "chatuchak", name: "เขตจตุจักร", clusterId: 2, population: 153800, area: 32.91,
    },
    {
      id: "watthana", name: "เขตวัฒนา", clusterId: 3, population: 88600, area: 12.57,
    },
    {
      id: "latkrabang", name: "เขตลาดกระบัง", clusterId: 5, population: 181200, area: 123.86,
    },
    {
      id: "nongchok", name: "เขตหนองจอก", clusterId: 5, population: 182400, area: 236.26,
    },
    {
      id: "bangkapi", name: "เขตบางกะปิ", clusterId: 3, population: 142500, area: 28.52,
    },
    {
      id: "bangbon", name: "เขตบางบอน", clusterId: 4, population: 103500, area: 34.75,
    },
  ],
};

// ประชากรจาก bangkok_population_clean.csv ตามรหัสเขต (ไม่ระบุปี)
const populationByCode = {
  "1001": 40254,
  "1002": 75814,
  "1003": 184138,
  "1004": 42921,
  "1005": 184611,
  "1006": 141360,
  "1007": 40077,
  "1008": 38100,
  "1009": 85696,
  "1010": 141018,
  "1011": 179899,
  "1012": 73416,
  "1013": 19546,
  "1014": 64037,
  "1015": 98286,
  "1016": 60675,
  "1017": 83692,
  "1018": 64961,
  "1019": 101330,
  "1020": 98028,
  "1021": 185159,
  "1022": 121833,
  "1023": 155124,
  "1024": 75534,
  "1025": 87205,
  "1026": 109802,
  "1027": 137125,
  "1028": 71306,
  "1029": 118634,
  "1030": 154003,
  "1031": 77673,
  "1032": 183893,
  "1033": 89514,
  "1034": 122994,
  "1035": 141098,
  "1036": 165941,
  "1037": 64468,
  "1038": 113197,
  "1039": 80515,
  "1040": 192234,
  "1041": 98377,
  "1042": 210954,
  "1043": 95201,
  "1044": 97061,
  "1045": 103456,
  "1046": 212016,
  "1047": 85345,
  "1048": 79771,
  "1049": 124093,
  "1050": 100203,
};
const mapBounds = geoJSON(districtBoundaries).getBounds();

const format = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });
const densityBands = [
  { min: 12000, label: "ตั้งแต่ 12,000", color: "#ad4936" },
  { min: 8000, label: "8,000–11,999", color: "#a36b20" },
  { min: 4000, label: "4,000–7,999", color: "#4e7464" },
  { min: 0, label: "ต่ำกว่า 4,000", color: "#75978a" },
];

const placeTypes = [
  { id: "school", label: "โรงเรียน" },
  { id: "university", label: "มหาวิทยาลัย" },
  { id: "temple", label: "วัด" },
  { id: "mall", label: "ห้างสรรพสินค้า" },
  { id: "health", label: "จุดบริการสาธารณสุข" },
];

// จำนวนตัวอย่าง มีไว้สำหรับแผนที่จำลองและการ์ดรายเขต
const examplePlaceCounts = {
  pomprap: { school: 5, university: 0, temple: 7, mall: 2, health: 2 },
  samphanthawong: { school: 4, university: 0, temple: 6, mall: 2, health: 1 },
  dindaeng: { school: 9, university: 1, temple: 3, mall: 3, health: 4 },
  thonburi: { school: 10, university: 2, temple: 11, mall: 2, health: 3 },
  ratchathewi: { school: 8, university: 2, temple: 4, mall: 4, health: 5 },
  bangkhen: { school: 15, university: 2, temple: 5, mall: 3, health: 4 },
  chatuchak: { school: 12, university: 2, temple: 4, mall: 6, health: 4 },
  watthana: { school: 9, university: 1, temple: 2, mall: 5, health: 3 },
  latkrabang: { school: 16, university: 2, temple: 9, mall: 3, health: 4 },
  nongchok: { school: 18, university: 1, temple: 8, mall: 1, health: 3 },
  bangkapi: { school: 13, university: 2, temple: 5, mall: 5, health: 4 },
  bangbon: { school: 8, university: 0, temple: 3, mall: 2, health: 2 },
};

const placeIcon = divIcon({
  className: "terra-dashboard__place-pin",
  iconSize: [14, 14],
});

function hasCoordinates(position) {
  return Array.isArray(position) && position.length === 2
    && Number.isFinite(position[0]) && Math.abs(position[0]) <= 90
    && Number.isFinite(position[1]) && Math.abs(position[1]) <= 180;
}

function getPlaceCount(counts, districtId, type) {
  const count = counts?.[districtId]?.[type];
  return Number.isSafeInteger(count) && count >= 0 ? count : null;
}

function formatPlaceCount(count) {
  return count === null ? "—" : `${format.format(count)} แห่ง`;
}

function DistrictMap({
  districts, selectedId, onSelect, mode, onModeChange,
  places, placeCounts, usingExamplePlaceCounts,
}) {
  const districtPickerId = useId();
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [placeTypeId, setPlaceTypeId] = useState(null);
  const placeType = placeTypes.find(({ id }) => id === placeTypeId);
  const visiblePlaces = showLiveMap && placeType
    ? places.filter(({ type, position }) => type === placeType.id && hasCoordinates(position))
    : [];
  const missingDensity = districts.some(({ density }) => !Number.isFinite(density));

  function districtStyle(district) {
    const selected = district.id === selectedId;
    const band = mode === "density"
      ? densityBands.find(({ min }) => Math.round(district.density) >= min)
      : null;
    return {
      fillColor: mode === "density" ? band?.color ?? "#e2ddd3" : "#86a084",
      fillOpacity: selected ? 0.85 : showLiveMap ? 0.38 : 0.7,
      color: selected ? "#18382e" : "#526a56",
      weight: selected ? 3 : 1,
    };
  }

  return (
    <>
      <div className="terra-dashboard__map-header">
        <h3>แผนที่กรุงเทพมหานคร</h3>
        <button
          className="terra-dashboard__map-switch"
          type="button"
          aria-pressed={showLiveMap}
          onClick={() => setShowLiveMap((visible) => !visible)}
        >
          {showLiveMap ? "ซ่อนแผนที่ถนน" : "เปิดแผนที่จริง"}
        </button>
      </div>
      <div className="terra-dashboard__map-header terra-dashboard__map-toolbar">
        <p className="terra-dashboard__map-note">
          {format.format(districts.length)} เขต · กดที่เขตเพื่อดูรายละเอียด
        </p>
        <div className="terra-dashboard__modes" role="group" aria-label="มุมมองแผนที่">
          <button type="button" aria-pressed={mode === "district"} onClick={() => onModeChange("district")}>
            รายเขต
          </button>
          <button type="button" aria-pressed={mode === "density"} onClick={() => onModeChange("density")}>
            ความหนาแน่นประชากร
          </button>
        </div>
      </div>
      <div className="terra-dashboard__district-picker">
        <label htmlFor={districtPickerId}>เลือกเขต</label>
        <select id={districtPickerId} value={selectedId ?? ""} onChange={(event) => onSelect(event.target.value)}>
          {districts.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
        </select>
      </div>
      <fieldset className="terra-dashboard__place-filters">
        <legend>ประเภทสถานที่</legend>
        <div className="terra-dashboard__modes">
          {placeTypes.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={placeTypeId === id}
              onClick={() => setPlaceTypeId((current) => current === id ? null : id)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      {placeType && (
        <p className="terra-dashboard__place-note" role="status">
          {showLiveMap
            ? (visiblePlaces.length
              ? `${placeType.label}ที่มีพิกัด ${formatPlaceCount(visiblePlaces.length)}`
              : `ยังไม่มีพิกัดสำหรับ${placeType.label}`)
            : `${placeType.label}${usingExamplePlaceCounts ? " · จำนวนตัวอย่างใน 12 เขต" : " · จำนวนรายเขต"}`}
        </p>
      )}
      <figure className="terra-dashboard__map">
        <MapContainer
          bounds={mapBounds}
          boundsOptions={{ padding: [12, 12] }}
          zoomSnap={0.25}
          scrollWheelZoom={false}
          className="terra-dashboard__district-map"
        >
          {showLiveMap && (
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          )}
          {districts.map((district) => (
            <GeoJSON
              key={district.id}
              data={district.boundary}
              style={districtStyle(district)}
              eventHandlers={{ click: () => onSelect(district.id) }}
              attribution='<a href="https://data.go.th/dataset/district">ขอบเขตเขต © กรุงเทพมหานคร</a>'
            >
              <Tooltip sticky>
                <strong>{district.name}</strong>
                {placeType && (
                  <div>{placeType.label} {formatPlaceCount(getPlaceCount(placeCounts, district.id, placeType.id))}</div>
                )}
              </Tooltip>
            </GeoJSON>
          ))}
          {visiblePlaces.map(({ id, name, position }) => (
            <Marker key={id} position={position} icon={placeIcon} title={name} alt={name}>
              <Popup><strong>{name}</strong><br />{placeType.label}</Popup>
            </Marker>
          ))}
        </MapContainer>
        {mode === "density" && (
          <figcaption>
            <span>คน/ตร.กม.</span>
            {densityBands.map(({ label, color }) => (
              <span key={label}><i style={{ backgroundColor: color }} />{label}</span>
            ))}
            {missingDensity && <span><i style={{ backgroundColor: "#e2ddd3" }} />รอข้อมูลพื้นที่</span>}
          </figcaption>
        )}
      </figure>
    </>
  );
}

// places: [{ id, type, name, position: [ละติจูด, ลองจิจูด] }]
// placeCountsByDistrict: { [districtId]: { [type]: จำนวนสถานที่ } }
export default function Dashboard({ data = dashboardData, places = [], placeCountsByDistrict } = {}) {
  const { summary, clusters, districts: sampleDistricts, isExample } = data;
  const [mode, setMode] = useState("district");
  const [selectedId, setSelectedId] = useState(null);
  const mapPanel = useRef(null);
  const headingId = useId();

  const districts = sampleDistricts
    .filter(({ area, population }) =>
      Number.isFinite(area) && area > 0 && Number.isFinite(population) && population >= 0
    )
    .map((district) => ({ ...district, density: district.population / district.area }))
    .sort((a, b) => b.density - a.density);
  const normalizeName = (name) => name.trim().replace(/^เขต\s*/, "").replace("ราษฏร์", "ราษฎร์");
  const districtDetails = new Map(districts.map((district) => [normalizeName(district.name), district]));
  const mapDistricts = districtBoundaries.features
    .map((boundary) => {
      const { dcode, dname } = boundary.properties;
      const name = normalizeName(dname);
      const details = districtDetails.get(name);
      return {
        id: details?.id ?? String(dcode),
        name: `เขต${name}`,
        population: details?.population ?? populationByCode[dcode],
        area: details?.area,
        density: details?.density,
        clusterId: details?.clusterId,
        dataNote: details
          ? (isExample ? "ประชากรและพื้นที่ตัวอย่าง" : null)
          : "ประชากรตามชุดข้อมูลที่ได้รับ · ไม่ระบุปี",
        boundary,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "th"));
  const selected = mapDistricts.find(({ id }) => id === selectedId)
    ?? mapDistricts.find(({ id }) => id === districts[0]?.id)
    ?? mapDistricts[0];
  const usingExamplePlaceCounts = data === dashboardData && placeCountsByDistrict == null;
  const placeCounts = usingExamplePlaceCounts ? examplePlaceCounts : placeCountsByDistrict;
  const topDistricts = districts.slice(0, 5);
  const largestCluster = Math.max(1, ...clusters.map(({ count }) => count));
  const totalClusterDistricts = clusters.reduce((sum, cluster) => sum + cluster.count, 0);
  const populationInMillions = summary.population >= 1_000_000;
  const cards = [
    { label: "จำนวนเขตทั้งหมด", value: summary.districtCount, unit: "เขต", note: "เขตปกครองในกรุงเทพมหานคร" },
    { label: "จำนวน Cluster", value: clusters.length, unit: "กลุ่มเขต", note: "จัดกลุ่มเขตตามลักษณะพื้นที่" },
    {
      label: "ประชากรรวม",
      value: populationInMillions ? summary.population / 1_000_000 : summary.population,
      unit: populationInMillions ? "ล้านคน" : "คน",
      note: populationInMillions ? `${format.format(summary.population)} คน` : "",
    },
    { label: "สถานที่สำคัญในชุดข้อมูล", value: summary.placeCount, unit: "แห่ง", note: "จำนวนสถานที่ที่รวบรวมในชุดข้อมูล" },
  ];

  function selectFromTable(id) {
    setSelectedId(id);
    mapPanel.current?.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    mapPanel.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }

  return (
    <section className="terra-dashboard" aria-labelledby={headingId}>
      <style>{dashboardStyles}</style>
      <header>
        <div className="terra-dashboard__title">
          <h2 id={headingId}>ภาพรวมข้อมูลเมืองกรุงเทพมหานคร</h2>
          {isExample && <span className="terra-dashboard__badge">ข้อมูลตัวอย่าง</span>}
        </div>
        <p className="terra-dashboard__subtitle">สรุปจำนวนเขต การจัดกลุ่มคลัสเตอร์ ความหนาแน่นประชากร และสถานที่สำคัญ</p>
      </header>

      <dl className="terra-dashboard__summary">
        {cards.map(({ label, value, unit, note }) => (
          <div key={label} className="terra-dashboard__panel">
            <dt>{label}</dt>
            <dd>{Number.isFinite(value) ? format.format(value) : "—"} <small>{unit}</small></dd>
            {note && <dd className="terra-dashboard__card-note">{note}</dd>}
          </div>
        ))}
      </dl>

      <div className="terra-dashboard__overview">
        <section className="terra-dashboard__panel" ref={mapPanel} tabIndex={-1} aria-label="แผนที่ภาพรวมและการเลือกเขต">
          <DistrictMap
            districts={mapDistricts}
            selectedId={selected?.id}
            onSelect={setSelectedId}
            mode={mode}
            onModeChange={setMode}
            places={places}
            placeCounts={placeCounts}
            usingExamplePlaceCounts={usingExamplePlaceCounts}
          />
        </section>

        <div className="terra-dashboard__side">
          <section className="terra-dashboard__panel">
            <h3>จำนวนเขตในแต่ละ Cluster</h3>
            <p className="terra-dashboard__subtitle">รวม {format.format(totalClusterDistricts)} เขต ใน {clusters.length} กลุ่ม</p>
            <ul className="terra-dashboard__chart">
              {clusters.map(({ id, name, count, color }) => (
                <li key={id}>
                  <div><span>Cluster {id} · {name}</span><strong>{count} เขต</strong></div>
                  <div className="terra-dashboard__bar" aria-hidden="true">
                    <span style={{ width: `${count / largestCluster * 100}%`, backgroundColor: color }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="terra-dashboard__panel terra-dashboard__selected" aria-live="polite">
            <div className="terra-dashboard__selected-header">
              <p>เขตที่เลือก</p>
              {selected?.clusterId != null && <span className="terra-dashboard__cluster">Cluster {selected.clusterId}</span>}
            </div>
            {selected ? (
              <>
                <h3>{selected.name}</h3>
                {selected.dataNote && <p className="terra-dashboard__place-note">{selected.dataNote}</p>}
                <dl className="terra-dashboard__district-stats">
                  <div><dt>ประชากร</dt><dd>{format.format(selected.population)} คน</dd></div>
                  <div><dt>พื้นที่</dt><dd>{Number.isFinite(selected.area) ? `${format.format(selected.area)} ตร.กม.` : "—"}</dd></div>
                  <div><dt>ความหนาแน่น</dt><dd>{Number.isFinite(selected.density) ? `${format.format(Math.round(selected.density))} คน/ตร.กม.` : "—"}</dd></div>
                </dl>
                <div className="terra-dashboard__district-places">
                  <h4>สถานที่สำคัญในเขตนี้</h4>
                  {usingExamplePlaceCounts && <p className="terra-dashboard__place-note">จำนวนตัวอย่าง</p>}
                  <dl>
                    {placeTypes.map(({ id, label }) => (
                      <div key={id}>
                        <dt>{label}</dt>
                        <dd>{formatPlaceCount(getPlaceCount(placeCounts, selected.id, id))}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            ) : <p className="terra-dashboard__subtitle">เลือกเขตจากแผนที่หรือตาราง</p>}
          </section>
        </div>
      </div>

      <section className="terra-dashboard__panel">
        <h3>{topDistricts.length} เขตที่มีความหนาแน่นประชากรสูงสุด</h3>
        <p className="terra-dashboard__table-note">
          {isExample && `จัดอันดับจากข้อมูลตัวอย่าง ${districts.length} เขต · `}กดชื่อเขตเพื่อดูตำแหน่งบนแผนที่
        </p>
        <div className="terra-dashboard__table-scroll" tabIndex={0} role="region" aria-label="ตารางอันดับความหนาแน่นประชากร">
          <table>
            <thead>
              <tr>
                <th scope="col">อันดับ</th>
                <th scope="col">ชื่อเขต</th>
                <th scope="col">Cluster</th>
                <th scope="col">ประชากร (คน)</th>
                <th scope="col">พื้นที่ (ตร.กม.)</th>
                <th scope="col">ความหนาแน่น (คน/ตร.กม.)</th>
              </tr>
            </thead>
            <tbody>
              {topDistricts.length === 0 && (
                <tr><td colSpan={6}>รอข้อมูลประชากรและพื้นที่</td></tr>
              )}
              {topDistricts.map((district, index) => (
                <tr key={district.id} data-selected={district.id === selected?.id}>
                  <td>{index + 1}</td>
                  <th scope="row">
                    <button type="button" aria-pressed={district.id === selected?.id} onClick={() => selectFromTable(district.id)}>
                      {district.name}
                    </button>
                  </th>
                  <td>Cluster {district.clusterId}</td>
                  <td>{format.format(district.population)}</td>
                  <td>{format.format(district.area)}</td>
                  <td>{format.format(Math.round(district.density))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

const dashboardStyles = `
.terra-dashboard {
  --dash-green: #36513d;
  --dash-heading: #79554b;
  --dash-text: #4f433d;
  --dash-muted: #78685c;
  --dash-border: #e0ccba;
  --dash-surface: #f6f1ea;
  --dash-gap: clamp(0.875rem, 2vw, 1.25rem);
  display: grid;
  gap: var(--dash-gap);
  color: var(--dash-text);
  container-type: inline-size;
}

.terra-dashboard :is(h2, h3, p, ul, figure, dl, dd) { margin: 0; }
.terra-dashboard__title h2 { color: var(--dash-heading); font-size: clamp(1.4rem, 2.5vw, 1.85rem); font-weight: 700; line-height: 1.3; }
.terra-dashboard h3 { color: var(--dash-heading); font-size: 1.2rem; font-weight: 700; line-height: 1.4; }
.terra-dashboard button { border: 0; background: transparent; color: inherit; font-family: inherit; cursor: pointer; }
.terra-dashboard :focus-visible { outline: 2px solid #a36b20; outline-offset: 3px; }

.terra-dashboard__title,
.terra-dashboard__map-header,
.terra-dashboard__selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.terra-dashboard__title { justify-content: flex-start; }

.terra-dashboard__badge,
.terra-dashboard__cluster {
  display: inline-block;
  padding: 0.15rem 0.65rem;
  border-radius: 2rem;
  background: #fbf0d8;
  color: #754917;
  font-size: 0.8rem;
}

.terra-dashboard__summary,
.terra-dashboard__overview,
.terra-dashboard__side {
  display: grid;
  gap: var(--dash-gap);
  grid-template-columns: minmax(0, 1fr);
}

.terra-dashboard__panel {
  box-sizing: border-box;
  min-width: 0;
  padding: clamp(0.875rem, 1.8vw, 1.25rem);
  border: 1px solid var(--dash-border);
  border-radius: 0.9rem;
  background: #fff;
  scroll-margin-top: 5rem;
}

.terra-dashboard__summary { gap: 0.875rem; }
.terra-dashboard__summary .terra-dashboard__panel { padding: 0.875rem; }
.terra-dashboard__summary dt { color: var(--dash-heading); font-size: 0.88rem; font-weight: 600; }
.terra-dashboard__summary dd { margin-top: 0.4rem; color: var(--dash-green); font-size: clamp(1.35rem, 2.4vw, 1.95rem); font-weight: 700; line-height: 1.25; }
.terra-dashboard__summary small { display: block; margin-top: 0.25rem; color: var(--dash-muted); font-size: 0.75rem; font-weight: 400; }

.terra-dashboard .terra-dashboard__map-note,
.terra-dashboard .terra-dashboard__table-note { margin-block: 0.4rem 0.75rem; color: var(--dash-muted); font-size: 0.85rem; }
.terra-dashboard__modes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.terra-dashboard .terra-dashboard__modes button { padding: 0.48rem 0.75rem; border-radius: 0.6rem; background: var(--dash-surface); color: var(--dash-heading); font-size: 0.82rem; font-weight: 600; }
.terra-dashboard__modes button[aria-pressed="true"] { background: var(--dash-green); color: #fff; }
.terra-dashboard__place-filters { min-width: 0; margin: 0.75rem 0 0; padding: 0; border: 0; }
.terra-dashboard__place-filters legend { margin-bottom: 0.4rem; color: var(--dash-heading); font-size: 0.86rem; font-weight: 700; }
.terra-dashboard .terra-dashboard__place-note { margin-top: 0.45rem; color: var(--dash-muted); font-size: 0.78rem; }
.terra-dashboard__place-pin { box-sizing: border-box; border: 2px solid #fff; border-radius: 50%; background: var(--dash-green); box-shadow: 0 1px 4px #0006; }

.terra-dashboard .terra-dashboard__map {
  margin-top: 0.9rem;
  padding: 0.65rem;
  overflow: hidden;
  border-radius: 0.8rem;
  background: #eaf1e9;
}
.terra-dashboard__district-map { height: clamp(21rem, 45vw, 32rem); width: 100%; border-radius: 0.65rem; background: #eaf1e9; }
.terra-dashboard__district-picker { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; margin-top: 0.75rem; font-size: 0.86rem; }
.terra-dashboard__district-picker label { color: var(--dash-heading); font-weight: 700; }
.terra-dashboard__district-picker select { max-width: 100%; padding: 0.45rem; border: 1px solid var(--dash-border); border-radius: 0.5rem; background: #fff; color: var(--dash-text); font: inherit; }
.terra-dashboard__map figcaption {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.8rem;
  width: fit-content;
  padding: 0.5rem 0.7rem;
  border-radius: 0.65rem;
  background: #fff;
  font-size: 0.8rem;
}
.terra-dashboard__map figcaption span { display: inline-flex; align-items: center; gap: 0.25rem; }
.terra-dashboard__map i { flex: 0 0 0.6rem; height: 0.6rem; border-radius: 50%; }

.terra-dashboard .terra-dashboard__chart { display: grid; gap: 0.65rem; margin-top: 1rem; padding: 0; list-style: none; }
.terra-dashboard__chart li > div:first-child { display: flex; justify-content: space-between; gap: 0.6rem; font-size: 0.86rem; }
.terra-dashboard__chart strong { white-space: nowrap; }
.terra-dashboard__bar { height: 0.52rem; margin-top: 0.25rem; border-radius: 1rem; background: #ebeeeb; }
.terra-dashboard__bar span { display: block; height: 100%; border-radius: inherit; }

.terra-dashboard__selected-header p { color: var(--dash-muted); font-size: 0.86rem; }
.terra-dashboard__selected h3 { margin-top: 0.4rem; font-size: clamp(1.25rem, 2.2vw, 1.9rem); }
.terra-dashboard__cluster { background: #e1f1e8; color: var(--dash-green); }
.terra-dashboard .terra-dashboard__district-stats { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.85rem; }
.terra-dashboard__district-stats div { flex: 1 1 6rem; padding: 0.65rem; border-radius: 0.6rem; background: var(--dash-surface); }
.terra-dashboard__selected dt { color: var(--dash-muted); font-size: 0.78rem; }
.terra-dashboard__selected dd { font-size: 0.88rem; font-weight: 700; }
.terra-dashboard__district-places { margin-top: 0.95rem; padding-top: 0.75rem; border-top: 1px solid var(--dash-border); }
.terra-dashboard__district-places h4 { margin: 0; color: var(--dash-heading); font-size: 0.95rem; }
.terra-dashboard .terra-dashboard__district-places dl { margin-top: 0.4rem; }
.terra-dashboard__district-places dl div { display: flex; justify-content: space-between; align-items: baseline; gap: 0.6rem; padding: 0.35rem 0; }
.terra-dashboard__district-places dl div + div { border-top: 1px solid #eaded2; }
.terra-dashboard__district-places dd { white-space: nowrap; }

.terra-dashboard__table-scroll { overflow-x: auto; border: 1px solid var(--dash-border); border-radius: 0.65rem; }
.terra-dashboard table { width: 100%; min-width: 43rem; table-layout: fixed; border-collapse: collapse; font-size: 0.88rem; }
.terra-dashboard thead { background: var(--dash-surface); color: var(--dash-heading); }
.terra-dashboard thead th:nth-child(1) { width: 8%; }
.terra-dashboard thead th:nth-child(2) { width: 25%; }
.terra-dashboard thead th:nth-child(3) { width: 13%; }
.terra-dashboard thead th:nth-child(4) { width: 17%; }
.terra-dashboard thead th:nth-child(5) { width: 14%; }
.terra-dashboard :is(th, td) { box-sizing: border-box; padding: 0.65rem 0.75rem; text-align: left; }
.terra-dashboard :is(th, td):nth-child(n + 4) { text-align: right; }
.terra-dashboard tbody tr { border-top: 1px solid #eaded2; }
.terra-dashboard tbody tr[data-selected="true"] { background: #e9f5ee; }
.terra-dashboard tbody button { padding: 0; color: var(--dash-green); font-weight: 700; text-align: left; }
.terra-dashboard tbody button:hover { text-decoration: underline; }
.terra-dashboard tbody td:last-child { color: #9f392d; font-weight: 700; }

@container (min-width: 19rem) {
  .terra-dashboard__summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@container (min-width: 55rem) {
  .terra-dashboard__summary { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .terra-dashboard__overview { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); align-items: start; }
}


.terra-dashboard .terra-dashboard__subtitle {
  margin-top: 0.35rem;
  color: var(--dash-muted);
  font-size: 0.88rem;
}
.terra-dashboard__summary .terra-dashboard__card-note {
  color: var(--dash-muted);
  font-size: 0.82rem;
  font-weight: 400;
}
.terra-dashboard__map-toolbar { margin-top: 0.35rem; }
.terra-dashboard .terra-dashboard__map-toolbar .terra-dashboard__map-note { margin: 0; }
.terra-dashboard button.terra-dashboard__map-switch {
  color: var(--dash-green);
  border: 1px solid var(--dash-border);
  border-radius: 0.55rem;
  padding: 0.25rem 0.55rem;
  font-size: 0.8rem;
}
.terra-dashboard button.terra-dashboard__map-switch:hover { background: #eaf1e9; }
.terra-dashboard__map figcaption { margin-top: 0.5rem; }
.terra-dashboard__map .leaflet-container { margin-top: 0; isolation: isolate; }
.terra-dashboard__district-stats div:last-child dd { color: #9f392d; }

`;




