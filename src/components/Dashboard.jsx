import React, { useEffect, useRef, useState } from "react";
import { getDashboard, getDistrict } from "../api/dashboardApi.js";
import { useApi, useDistrictSearch } from "../api/useDashboardApi.js";

// คอลัมน์เขตและรวมจาก bangkok_population_clean.csv (ไม่ระบุปี)
const bangkokPopulationDistricts = [
  { id: "คลองสามวา", name: "เขตคลองสามวา", population: 212016 },
  { id: "สายไหม", name: "เขตสายไหม", population: 210954 },
  { id: "บางแค", name: "เขตบางแค", population: 192234 },
  { id: "บางขุนเทียน", name: "เขตบางขุนเทียน", population: 185159 },
  { id: "บางเขน", name: "เขตบางเขน", population: 184611 },
  { id: "หนองจอก", name: "เขตหนองจอก", population: 184138 },
  { id: "ประเวศ", name: "เขตประเวศ", population: 183893 },
  { id: "ลาดกระบัง", name: "เขตลาดกระบัง", population: 179899 },
  { id: "ดอนเมือง", name: "เขตดอนเมือง", population: 165941 },
  { id: "หนองแขม", name: "เขตหนองแขม", population: 155124 },
  { id: "จตุจักร", name: "เขตจตุจักร", population: 154003 },
  { id: "บางกะปิ", name: "เขตบางกะปิ", population: 141360 },
  { id: "จอมทอง", name: "เขตจอมทอง", population: 141098 },
  { id: "มีนบุรี", name: "เขตมีนบุรี", population: 141018 },
  { id: "บึงกุ่ม", name: "เขตบึงกุ่ม", population: 137125 },
  { id: "ทุ่งครุ", name: "เขตทุ่งครุ", population: 124093 },
  { id: "สวนหลวง", name: "เขตสวนหลวง", population: 122994 },
  { id: "ภาษีเจริญ", name: "เขตภาษีเจริญ", population: 121833 },
  { id: "บางซื่อ", name: "เขตบางซื่อ", population: 118634 },
  { id: "ลาดพร้าว", name: "เขตลาดพร้าว", population: 113197 },
  { id: "ดินแดง", name: "เขตดินแดง", population: 109802 },
  { id: "วังทองหลาง", name: "เขตวังทองหลาง", population: 103456 },
  { id: "ตลิ่งชัน", name: "เขตตลิ่งชัน", population: 101330 },
  { id: "บางบอน", name: "เขตบางบอน", population: 100203 },
  { id: "หลักสี่", name: "เขตหลักสี่", population: 98377 },
  { id: "ธนบุรี", name: "เขตธนบุรี", population: 98286 },
  { id: "บางกอกน้อย", name: "เขตบางกอกน้อย", population: 98028 },
  { id: "สะพานสูง", name: "เขตสะพานสูง", population: 97061 },
  { id: "คันนายาว", name: "เขตคันนายาว", population: 95201 },
  { id: "คลองเตย", name: "เขตคลองเตย", population: 89514 },
  { id: "บางพลัด", name: "เขตบางพลัด", population: 87205 },
  { id: "พระโขนง", name: "เขตพระโขนง", population: 85696 },
  { id: "บางนา", name: "เขตบางนา", population: 85345 },
  { id: "ห้วยขวาง", name: "เขตห้วยขวาง", population: 83692 },
  { id: "วัฒนา", name: "เขตวัฒนา", population: 80515 },
  { id: "ทวีวัฒนา", name: "เขตทวีวัฒนา", population: 79771 },
  { id: "บางคอแหลม", name: "เขตบางคอแหลม", population: 77673 },
  { id: "ดุสิต", name: "เขตดุสิต", population: 75814 },
  { id: "ราษฎร์บูรณะ", name: "เขตราษฎร์บูรณะ", population: 75534 },
  { id: "ยานนาวา", name: "เขตยานนาวา", population: 73416 },
  { id: "สาทร", name: "เขตสาทร", population: 71306 },
  { id: "คลองสาน", name: "เขตคลองสาน", population: 64961 },
  { id: "ราชเทวี", name: "เขตราชเทวี", population: 64468 },
  { id: "พญาไท", name: "เขตพญาไท", population: 64037 },
  { id: "บางกอกใหญ่", name: "เขตบางกอกใหญ่", population: 60675 },
  { id: "บางรัก", name: "เขตบางรัก", population: 42921 },
  { id: "พระนคร", name: "เขตพระนคร", population: 40254 },
  { id: "ปทุมวัน", name: "เขตปทุมวัน", population: 40077 },
  { id: "ป้อมปราบศัตรูพ่าย", name: "เขตป้อมปราบศัตรูพ่าย", population: 38100 },
  { id: "สัมพันธวงศ์", name: "เขตสัมพันธวงศ์", population: 19546 },
];

const dashboardData = {
  isExample: true,
  populationDistricts: bangkokPopulationDistricts,
  summary: {
    districtCount: 50,
    population: bangkokPopulationDistricts.reduce((sum, { population }) => sum + population, 0),
    placeCount: 18_450,
  },
  clusters: [
    { count: 12 },
    { count: 11 },
    { count: 10 },
    { count: 9 },
    { count: 8 },
  ],
  districts: [
    {
      id: "pomprap", name: "เขตป้อมปราบศัตรูพ่าย", population: 41200, area: 1.93,
    },
    {
      id: "samphanthawong", name: "เขตสัมพันธวงศ์", population: 20600, area: 1.42,
    },
    {
      id: "dindaeng", name: "เขตดินแดง", population: 116500, area: 8.35,
    },
    {
      id: "thonburi", name: "เขตธนบุรี", population: 102100, area: 8.55,
    },
    {
      id: "ratchathewi", name: "เขตราชเทวี", population: 67800, area: 7.13,
    },
    {
      id: "bangkhen", name: "เขตบางเขน", population: 190400, area: 42.12,
    },
    {
      id: "chatuchak", name: "เขตจตุจักร", population: 153800, area: 32.91,
    },
    {
      id: "watthana", name: "เขตวัฒนา", population: 88600, area: 12.57,
    },
    {
      id: "latkrabang", name: "เขตลาดกระบัง", population: 181200, area: 123.86,
    },
    {
      id: "nongchok", name: "เขตหนองจอก", population: 182400, area: 236.26,
    },
    {
      id: "bangkapi", name: "เขตบางกะปิ", population: 142500, area: 28.52,
    },
    {
      id: "bangbon", name: "เขตบางบอน", population: 103500, area: 34.75,
    },
  ],
};


const placeTypes = [
  { id: "school", label: "โรงเรียน" },
  { id: "hospital", label: "โรงพยาบาล" },
  { id: "temple", label: "วัด" },
  { id: "park", label: "สวนสาธารณะ" },
  { id: "university", label: "มหาวิทยาลัย" },
  { id: "mall", label: "ห้างสรรพสินค้า" },
  { id: "health", label: "จุดบริการสาธารณสุข" },
];

// จำนวนสถานที่ตัวอย่างรายเขต
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

const integer = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 });
const areaNumber = new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 });
const barColors = ["#536f4c", "#47627c", "#79544b", "#9b6a39", "#a85653"];

function format(figure, formatter = integer) {
  return Number.isFinite(figure) ? formatter.format(figure) : "—";
}

function formatDataYear(year) {
  return year ? `ปีข้อมูล ${year}` : "ไม่ระบุปีข้อมูล";
}

function isReportedCount(count) {
  return Number.isSafeInteger(count) && count >= 0;
}

function Panel({ title, description, className = "", children }) {
  return (
    <section className={`terra-insights__panel ${className}`}>
      <h2>{title}</h2>
      <p className="terra-insights__description">{description}</p>
      {children}
    </section>
  );
}

const areaGroups = [
  { name: "กรุงเทพตะวันออก", count: 9, area: 693.879, examples: ["เขตหนองจอก", "เขตลาดกระบัง"], color: "#536f4c" },
  { name: "กรุงธนใต้", count: 7, area: 300.070, examples: ["เขตบางขุนเทียน", "เขตบางแค"], color: "#47627c" },
  { name: "กรุงเทพเหนือ", count: 7, area: 212.992, examples: ["เขตจตุจักร", "เขตดอนเมือง"], color: "#79544b" },
  { name: "กรุงธนเหนือ", count: 8, area: 150.049, examples: ["เขตธนบุรี", "เขตตลิ่งชัน"], color: "#9b6a39" },
  { name: "กรุงเทพใต้", count: 10, area: 132.826, examples: ["เขตปทุมวัน", "เขตคลองเตย"], color: "#a85653" },
  { name: "กรุงเทพกลาง", count: 9, area: 78.921, examples: ["เขตพระนคร", "เขตดุสิต"], color: "#65745b" },
];

const groupAreaFormat = new Intl.NumberFormat("th-TH", {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});
const areaPercentFormat = new Intl.NumberFormat("th-TH", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
function getDonutPoint(turn) {
  const angle = turn * 2 * Math.PI - Math.PI / 2;
  return `${60 + 46 * Math.cos(angle)} ${60 + 46 * Math.sin(angle)}`;
}

// รวมรายชื่อเขตจาก API (zones) กับพื้นที่ ตร.กม. ที่ใส่ไว้ใน areaGroups
// ถ้า API ไม่ได้ส่ง zones มา ใช้ areaGroups ตามเดิม
function buildAreaSegments(zones) {
  const groups = zones?.length
    ? zones.map((zone) => {
      const known = areaGroups.find(({ name }) => name === zone.name);
      return {
        name: zone.name,
        count: zone.districts.length,
        area: known?.area ?? null,
        examples: zone.districts.slice(0, 2).map(({ name }) => name),
        districtIds: zone.districts.map(({ id }) => String(id)),
        color: known?.color ?? barColors[0],
      };
    }).filter(({ area }) => Number.isFinite(area))
    : areaGroups.map((group) => ({ ...group, districtIds: [] }));

  const totalArea = groups.reduce((sum, group) => sum + group.area, 0);
  let start = 0;
  const segments = groups.map((group) => {
    const share = group.area / totalArea;
    const path = `M ${getDonutPoint(start)} A 46 46 0 ${share > 0.5 ? 1 : 0} 1 ${getDonutPoint(start + share)}`;
    start += share;
    return { ...group, share, path };
  });
  return { segments, totalArea, totalDistricts: groups.reduce((sum, group) => sum + group.count, 0) };
}

function AreaShareChart({ zones, selectedDistrictId }) {
  const { segments: areaSegments, totalArea, totalDistricts: totalAreaDistricts } = buildAreaSegments(zones);
  const [selectedArea, setSelectedArea] = useState(areaSegments[0]?.name ?? "");
  const selected = areaSegments.find(({ name }) => name === selectedArea) ?? areaSegments[0];

  // เลือกเขตจากช่องค้นหา → เลือกกลุ่มของเขตนั้นให้
  useEffect(() => {
    const zone = areaSegments.find(({ districtIds }) => districtIds.includes(String(selectedDistrictId)));
    if (zone) setSelectedArea(zone.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrictId]);

  if (!selected) {
    return (
      <Panel title="สัดส่วนพื้นที่ในกรุงเทพมหานคร" description="ตร.กม.">
        <p className="terra-insights__empty">ยังไม่มีข้อมูลกลุ่มพื้นที่</p>
      </Panel>
    );
  }

  return (
    <Panel
      title="สัดส่วนพื้นที่ในกรุงเทพมหานคร"
      description={`พื้นที่รวม ${groupAreaFormat.format(totalArea)} ตร.กม. · ${totalAreaDistricts} เขต ใน ${areaSegments.length} กลุ่ม`}
    >
      <div className="terra-insights__cluster">
        <div className="terra-insights__donut">
          <svg viewBox="0 0 120 120" aria-label="เลือกกลุ่มพื้นที่จากกราฟโดนัท" role="group">
            {areaSegments.map(({ name, share, path, color }) => (
              <path
                key={name}
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={selectedArea === name ? 21 : 16}
                role="button"
                tabIndex={0}
                aria-pressed={selectedArea === name}
                aria-label={`${name} ${areaPercentFormat.format(share)}`}
                onClick={() => setSelectedArea(name)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedArea(name);
                  }
                }}
              />
            ))}
          </svg>
          <span aria-hidden="true">
            <strong>{areaPercentFormat.format(selected.share)}</strong>
            <small>ของพื้นที่รวม</small>
          </span>
        </div>
        <ul className="terra-insights__legend">
          {areaSegments.map(({ name, count, share, color }) => (
            <li key={name}>
              <button type="button" aria-pressed={selectedArea === name} onClick={() => setSelectedArea(name)}>
                <i style={{ backgroundColor: color }} aria-hidden="true" />
                <span>{name}<small>{count} เขต</small></span>
                <strong>{areaPercentFormat.format(share)}</strong>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="terra-insights__area-details" role="status">
        <p><strong>{selected.name}</strong> · {groupAreaFormat.format(selected.area)} ตร.กม. · {selected.count} เขต</p>
        <p>ตัวอย่าง 2 เขต ได้แก่ {selected.examples.join(" และ ")}</p>
      </div>
    </Panel>
  );
}

function PopulationBars({ rows, selectedId }) {
  const max = Math.max(1, ...rows.map(({ population }) => population));
  const selectedRef = useRef(null);

  // เลื่อนกราฟไปยังเขตที่เลือกจากช่องค้นหา
  useEffect(() => {
    selectedRef.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" });
  }, [selectedId]);

  return rows.length ? (
    <ul className="terra-insights__bars" aria-label="จำนวนประชากร (คน)">
      {rows.map(({ id, name, population }) => (
        <li
          key={id}
          ref={String(id) === String(selectedId) ? selectedRef : undefined}
          className={String(id) === String(selectedId) ? "terra-insights__bar--selected" : undefined}
          aria-current={String(id) === String(selectedId) ? "true" : undefined}
        >
          <span>{name}</span>
          <span className="terra-insights__track" aria-hidden="true">
            <span style={{ width: `${population / max * 100}%` }} />
          </span>
          <strong>{format(population)}</strong>
        </li>
      ))}
    </ul>
  ) : <p className="terra-insights__empty">ยังไม่มีข้อมูลสำหรับแสดงกราฟ</p>;
}

function VerticalPlaceChart({ rows }) {
  const maxValue = Math.max(1, ...rows.map(({ value }) => value ?? 0));
  const targetStep = Math.max(1, maxValue / 5);
  const magnitude = 10 ** Math.floor(Math.log10(targetStep));
  const multiplier = [1, 2, 5, 10].find((value) => value >= targetStep / magnitude);
  const step = multiplier * magnitude;
  const intervals = Math.ceil(maxValue / step);
  const axisMax = intervals * step;
  const ticks = Array.from({ length: intervals + 1 }, (_, index) => ({
    value: index * step,
    bottom: `${(index / intervals) * 100}%`,
  }));

  return (
    <div className="terra-insights__place-chart">
      <div className="terra-insights__place-grid">
        <div
          className="terra-insights__place-axis"
          style={{ "--place-axis-digits": format(axisMax).length }}
          aria-hidden="true"
        >
          <span className="terra-insights__place-unit">แห่ง</span>
          {ticks.map(({ value, bottom }) => (
            <span key={value} className="terra-insights__place-tick" style={{ bottom }}>
              {format(value)}
            </span>
          ))}
        </div>
        <div className="terra-insights__place-gridlines" aria-hidden="true">
          {ticks.map(({ value, bottom }) => <span key={value} style={{ bottom }} />)}
        </div>
        <ul className="terra-insights__place-columns" aria-label="จำนวนสถานที่สำคัญแยกตามประเภท หน่วยแห่ง">
          {rows.map(({ id, name, value, color }) => (
            <li key={id}>
              <span className="terra-insights__place-name">{name}</span>
              <div className="terra-insights__place-plot">
                {value === null ? (
                  <small>ยังไม่มีข้อมูล</small>
                ) : (
                  <div
                    className="terra-insights__place-bar"
                    style={{ height: `${(value / axisMax) * 100}%`, backgroundColor: color }}
                  >
                    <strong>{format(value)}</strong>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// สรุปจาก Namtang GTFS ของ สนข. รุ่น 20261125 (CC BY 4.0) แยกตามเขตกรุงเทพฯ
const namtangBtsDistrictCounts = [
  ["เขตจตุจักร", 8],
  ["เขตคลองเตย", 7],
  ["เขตปทุมวัน", 5],
  ["เขตคลองสาน", 5],
  ["เขตบางเขน", 4],
  ["เขตพญาไท", 3],
  ["เขตธนบุรี", 3],
  ["เขตสาทร", 3],
  ["เขตราชเทวี", 3],
  ["เขตบางนา", 3],
  ["เขตบางรัก", 2],
  ["เขตพระโขนง", 2],
  ["เขตดอนเมือง", 2],
  ["เขตสายไหม", 2],
  ["เขตภาษีเจริญ", 1],
];

function TransitPanel({ stops, useNamtangSnapshot }) {
  const districtNames = new Set(bangkokPopulationDistricts.map(({ name }) => name));
  const coverage = new Map(useNamtangSnapshot ? namtangBtsDistrictCounts : []);

  if (!useNamtangSnapshot) {
    const uniqueStops = new Map();
    for (const stop of stops) {
      if (stop?.type === "bts" && stop.id != null && String(stop.id).trim()
        && typeof stop.name === "string" && stop.name.trim() && districtNames.has(stop.district)) {
        uniqueStops.set(String(stop.id), stop);
      }
    }
    for (const { district } of uniqueStops.values()) {
      coverage.set(district, (coverage.get(district) ?? 0) + 1);
    }
  }

  const districts = [...coverage].sort(
    ([nameA, countA], [nameB, countB]) => countB - countA || nameA.localeCompare(nameB, "th-TH")
  );
  const total = districts.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Panel
      className="terra-insights__transit-panel"
      title="BTS ให้บริการกี่เขตในกรุงเทพฯ"
      description="นับเขตที่มีสถานีอย่างน้อย 1 แห่งในชุดข้อมูล · กดแถวเพื่อดูรายชื่อเขต"
    >
      <div className="terra-insights__transit-axis" aria-hidden="true">
        <span>ระบบรถไฟฟ้า</span>
        <div>
          {[0, 10, 20, 30, 40, districtNames.size].map((tick) => <span key={tick}>{tick}</span>)}
        </div>
        <span>จำนวนสถานี</span>
      </div>
      <details className="terra-insights__transit-row">
        <summary>
          <strong>BTS รวมสายสีทอง</strong>
          <span className="terra-insights__transit-coverage">
            <span className="terra-insights__track" aria-hidden="true">
              <span style={{ width: `${(districts.length / districtNames.size) * 100}%` }} />
            </span>
            <span>{districts.length ? `${districts.length} / ${districtNames.size} เขต` : "ยังไม่มีข้อมูล"}</span>
          </span>
          <span className="terra-insights__transit-total">
            {districts.length ? `${format(total)} สถานี` : "—"}
          </span>
        </summary>
        {districts.length > 0 && (
          <ul className="terra-insights__transit-districts" aria-label="เขตที่มี BTS">
            {districts.map(([name, count]) => (
              <li key={name}><span>{name}</span><strong>{format(count)} สถานี</strong></li>
            ))}
          </ul>
        )}
      </details>
      {useNamtangSnapshot && (
        <p className="terra-insights__transit-source">
          ข้อมูลจาก <a href="https://namtang-api.otp.go.th/opendata">Namtang GTFS ของ สนข.</a>
          {" "}รุ่น 25 พ.ย. 2569 · CC BY 4.0
        </p>
      )}
    </Panel>
  );
}

// จำนวนบ้านรายเขตจาก CSV ที่ได้รับ หน่วยเป็นหลัง
const housingYears = [2556, 2557, 2558, 2559, 2560, 2561, 2562, 2563, 2564, 2565];

const districtHousing = [
  { district: "จตุจักร", counts: [96304, 99740, 101601, 107192, 111197, 113553, 121352, 126570, 129790, 133963] },
  { district: "บางเขน", counts: [95741, 97256, 101537, 104598, 107198, 109112, 112614, 114661, 115522, 116209] },
  { district: "บางกะปิ", counts: [95265, 97866, 100046, 100751, 102119, 104234, 104926, 107103, 109419, 112795] },
  { district: "สายไหม", counts: [89604, 92755, 94942, 96064, 97642, 100196, 102868, 106139, 106948, 109011] },
  { district: "ลาดกระบัง", counts: [77688, 80578, 84099, 87658, 90000, 93589, 96468, 98260, 100871, 102711] },
  { district: "บางแค", counts: [77864, 79524, 85144, 85875, 88135, 91765, 92959, 94020, 94679, 96515] },
  { district: "ประเวศ", counts: [74913, 78953, 84487, 86555, 88079, 87588, 89608, 92009, 93842, 95188] },
  { district: "บางขุนเทียน", counts: [77350, 80667, 82799, 84599, 87140, 88455, 90017, 91013, 92129, 93312] },
  { district: "คลองสามวา", counts: [70269, 73481, 76179, 78343, 80421, 82412, 84728, 86477, 88145, 90104] },
  { district: "ห้วยขวาง", counts: [59649, 65131, 68596, 69142, 73691, 79768, 81877, 85046, 86846, 89332] },
  { district: "วัฒนา", counts: [62049, 64637, 66723, 68081, 70607, 72939, 78258, 82407, 82927, 84722] },
  { district: "สวนหลวง", counts: [62255, 65869, 69756, 71294, 72788, 76684, 78435, 81116, 82161, 82934] },
  { district: "ดอนเมือง", counts: [67797, 69239, 70923, 72609, 74516, 75954, 77220, 77410, 78493, 79816] },
  { district: "คลองเตย", counts: [62642, 64083, 65006, 66481, 68641, 72180, 74741, 77502, 78678, 79410] },
  { district: "บางซื่อ", counts: [49995, 54651, 55520, 60466, 68977, 69594, 75635, 76116, 76659, 77645] },
  { district: "บึงกุ่ม", counts: [67801, 69412, 71794, 72370, 72868, 74526, 75351, 75943, 76268, 76666] },
  { district: "จอมทอง", counts: [61962, 63846, 68378, 69330, 69916, 71106, 72472, 73778, 73995, 74375] },
  { district: "บางนา", counts: [56819, 57272, 60341, 62042, 65736, 67609, 70410, 72092, 72310, 73052] },
  { district: "หนองจอก", counts: [54857, 56769, 58965, 60546, 61537, 63210, 65048, 66754, 68505, 71054] },
  { district: "ภาษีเจริญ", counts: [49968, 51625, 52657, 53577, 56918, 58891, 59970, 65843, 65974, 66651] },
  { district: "หนองแขม", counts: [56222, 57298, 58210, 58908, 59550, 60680, 61882, 62675, 63568, 64392] },
  { district: "ดินแดง", counts: [55591, 56790, 57373, 58107, 58720, 61149, 61210, 63821, 63891, 64140] },
  { district: "วังทองหลาง", counts: [57178, 58316, 59136, 59546, 59976, 60679, 61277, 62673, 63328, 64109] },
  { district: "มีนบุรี", counts: [53584, 54306, 55711, 56839, 58200, 59822, 61051, 61665, 63274, 63794] },
  { district: "พระโขนง", counts: [45125, 49760, 50272, 50662, 52092, 54409, 58445, 60007, 61515, 62527] },
  { district: "ธนบุรี", counts: [48510, 50554, 51884, 54058, 54576, 56237, 57091, 57707, 61449, 61415] },
  { district: "บางพลัด", counts: [45817, 45819, 45853, 47479, 49873, 53656, 55029, 55838, 57812, 59492] },
  { district: "หลักสี่", counts: [47272, 48135, 50370, 51229, 53342, 55802, 57383, 57833, 58706, 59484] },
  { district: "ลาดพร้าว", counts: [52300, 53475, 54051, 54771, 56147, 56470, 57720, 57916, 58086, 58302] },
  { district: "ราชเทวี", counts: [43242, 44095, 45103, 45522, 47344, 49014, 52041, 52494, 54612, 57243] },
  { district: "ทุ่งครุ", counts: [47130, 47824, 49082, 50284, 51053, 51957, 53735, 54595, 55205, 55959] },
  { district: "ยานนาวา", counts: [47980, 49364, 50674, 50803, 51043, 51655, 52403, 53614, 53663, 53724] },
  { district: "บางกอกน้อย", counts: [46616, 47103, 48672, 48709, 48771, 49111, 49559, 50652, 51364, 52288] },
  { district: "บางบอน", counts: [47459, 48301, 49012, 49489, 49832, 50239, 50531, 50825, 51099, 51344] },
  { district: "คันนายาว", counts: [39200, 39812, 40360, 41518, 42935, 44234, 44685, 45864, 46218, 46722] },
  { district: "พญาไท", counts: [38415, 39193, 40095, 41518, 41891, 42662, 44425, 44727, 44826, 45733] },
  { district: "ตลิ่งชัน", counts: [38825, 39296, 40827, 41345, 41732, 42138, 42532, 42898, 43319, 43891] },
  { district: "สาทร", counts: [36403, 39578, 40043, 41304, 41447, 42255, 43431, 43459, 43840, 43854] },
  { district: "สะพานสูง", counts: [34027, 34807, 35599, 36401, 36855, 38441, 40482, 41308, 41892, 42485] },
  { district: "คลองสาน", counts: [36495, 37448, 37665, 38181, 38166, 38830, 39366, 39924, 40914, 42118] },
  { district: "บางคอแหลม", counts: [36346, 36406, 37920, 39129, 39315, 39353, 39544, 39812, 40393, 40806] },
  { district: "ราษฎร์บูรณะ", counts: [33859, 34220, 35516, 35842, 36973, 37036, 37409, 37664, 38059, 38263] },
  { district: "ทวีวัฒนา", counts: [30833, 31337, 31716, 32329, 32950, 33370, 33895, 34420, 34905, 35482] },
  { district: "บางรัก", counts: [26777, 26937, 27522, 30081, 30301, 32045, 32347, 32371, 32664, 35399] },
  { district: "บางกอกใหญ่", counts: [26739, 26798, 26867, 29861, 30867, 30866, 31671, 32258, 32521, 32974] },
  { district: "ดุสิต", counts: [32082, 32342, 32644, 32338, 32311, 31294, 31955, 31653, 31693, 32404] },
  { district: "ปทุมวัน", counts: [26970, 27734, 30279, 30752, 30815, 30793, 33103, 32590, 32328, 32169] },
  { district: "ป้อมปราบศัตรูพ่าย", counts: [19529, 19529, 19515, 19674, 19684, 19655, 19606, 19627, 19609, 19608] },
  { district: "พระนคร", counts: [19257, 19258, 19273, 19221, 19182, 19101, 19155, 19137, 19140, 19100] },
  { district: "สัมพันธวงศ์", counts: [13252, 13234, 13235, 13238, 13205, 13206, 13195, 13197, 13177, 13179] },
];

// ข้อมูลบ้านจาก API (data.housing) ถ้าไม่มีใช้ตารางด้านบน
function resolveHousing(housing) {
  const years = housing?.years?.length ? housing.years : housingYears;
  const rows = (housing?.districts?.length ? housing.districts : districtHousing.map((row) => ({ ...row, id: row.district })))
    .filter(({ counts }) => Array.isArray(counts) && counts.length === years.length && counts.every(Number.isFinite))
    .map((row) => ({ ...row, id: String(row.id), district: row.district ?? row.name?.replace(/^เขต/, "") }));
  const cityCounts = years.map((_, index) => rows.reduce((sum, { counts }) => sum + counts[index], 0));
  const options = [...rows].sort((a, b) => a.district.localeCompare(b.district, "th-TH"));
  return { years, rows, cityCounts, options };
}

function HousingLine({ counts, title, changeText, years = housingYears }) {
  const housingYears = years;
  const firstYear = years[0];
  const lastYear = years.at(-1);
  const left = 88;
  const right = 704;
  const top = 22;
  const bottom = 216;
  const targetStep = Math.max(1, Math.max(...counts) / 5);
  const magnitude = 10 ** Math.floor(Math.log10(targetStep));
  const step = Math.ceil(targetStep / magnitude) * magnitude;
  const intervals = Math.ceil(Math.max(...counts, 1) / step);
  const y = (value) => bottom - (value / (intervals * step)) * (bottom - top);
  const points = counts.map((value, index) => ({
    value,
    year: housingYears[index],
    x: left + (index / (housingYears.length - 1)) * (right - left),
  }));

  return (
    <div className="terra-insights__housing-scroll">
      <svg viewBox="0 0 720 250" role="img" aria-label={`${title} พ.ศ. ${firstYear}–${lastYear} ${changeText}`}>
        <text x={left - 12} y={12} textAnchor="end">หลัง</text>
        {Array.from({ length: intervals + 1 }, (_, index) => {
          const value = index * step;
          return (
            <g key={value}>
              <line x1={left} x2={right} y1={y(value)} y2={y(value)} />
              <text x={left - 12} y={y(value)} textAnchor="end" dominantBaseline="middle">
                {format(value)}
              </text>
            </g>
          );
        })}
        <polyline points={points.map(({ x, value }) => `${x},${y(value)}`).join(" ")} />
        {points.map(({ value, year, x }) => (
          <g key={year}>
            <circle cx={x} cy={y(value)} r={4}>
              <title>{`พ.ศ. ${year} · ${format(value)} หลัง`}</title>
            </circle>
            <text x={x} y={bottom + 23} textAnchor="middle">{year}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function HousingTrendChart({ housing, selectedDistrictId }) {
  const { years, rows, cityCounts, options: districtOptions } = resolveHousing(housing);
  const firstYear = years[0];
  const lastYear = years.at(-1);
  const [districtId, setDistrictId] = useState("");

  // เลือกเขตจากช่องค้นหา → กราฟบ้านเปลี่ยนตาม
  useEffect(() => {
    if (selectedDistrictId && rows.some(({ id }) => id === String(selectedDistrictId))) {
      setDistrictId(String(selectedDistrictId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDistrictId]);

  if (!rows.length) {
    return (
      <Panel className="terra-insights__housing-panel" title="แนวโน้มจำนวนบ้านรายเขต" description="หน่วยหลัง">
        <p className="terra-insights__empty">ยังไม่มีข้อมูลจำนวนบ้าน</p>
      </Panel>
    );
  }

  const selected = rows.find(({ id }) => id === districtId);
  const counts = selected?.counts ?? cityCounts;
  const title = selected ? `เขต${selected.district}` : "ทั้งกรุงเทพฯ";
  const latest = counts.at(-1);
  const change = latest - counts[0];
  const changeText = change === 0
    ? `จำนวนบ้านเท่าเดิมเมื่อเทียบกับปี ${firstYear}`
    : `${change > 0 ? "เพิ่มขึ้น" : "ลดลง"} ${format(Math.abs(change))} หลังจากปี ${firstYear}`;

  return (
    <Panel
      className="terra-insights__housing-panel"
      title="แนวโน้มจำนวนบ้านรายเขต"
      description={`จำนวนบ้าน พ.ศ. ${firstYear}–${lastYear} · เลือกดูได้ครบ ${rows.length} เขต`}
    >
      <label className="terra-insights__district-picker">
        <span>เลือกเขตสำหรับดูจำนวนบ้าน</span>
        <select value={districtId} onChange={(event) => setDistrictId(event.target.value)}>
          <option value="">ทั้งกรุงเทพฯ</option>
          {districtOptions.map(({ id, district }) => (
            <option key={id} value={id}>เขต{district}</option>
          ))}
        </select>
      </label>
      <div className="terra-insights__housing-summary" aria-live="polite">
        <p><strong>{format(latest)}</strong> หลัง ในปี {lastYear} · {title}</p>
        <p>{changeText}</p>
      </div>
      <HousingLine counts={counts} title={title} changeText={changeText} years={years} />
      <p className="terra-insights__housing-source">
        ชุดข้อมูล จำนวนบ้านในกรุงเทพมหานคร พ.ศ. {firstYear}–{lastYear}
      </p>
    </Panel>
  );
}

// ผู้โดยสาร BTS รายสถานีจาก bts_passengers_clean.csv (ผ่าน API)
function BtsPassengerPanel({ stations = [], limit = 10 }) {
  const rows = stations
    .filter(({ name, total }) => name && Number.isFinite(total))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
  const max = Math.max(1, ...rows.map(({ total }) => total));

  return (
    <Panel
      className="terra-insights__bts-panel"
      title="สถานี BTS ที่มีผู้โดยสารมากที่สุด"
      description={`${limit} อันดับแรกจาก ${format(stations.length)} สถานี · ผู้โดยสารรวมทั้งปี หน่วยคน`}
    >
      {rows.length ? (
        <ul className="terra-insights__bars" aria-label="ผู้โดยสาร BTS รายสถานี (คน)">
          {rows.map(({ name, total }) => (
            <li key={name}>
              <span>{name}</span>
              <span className="terra-insights__track" aria-hidden="true">
                <span style={{ width: `${(total / max) * 100}%`, backgroundColor: barColors[1] }} />
              </span>
              <strong>{format(total)}</strong>
            </li>
          ))}
        </ul>
      ) : <p className="terra-insights__empty">ยังไม่มีข้อมูลผู้โดยสาร BTS</p>}
    </Panel>
  );
}

// ช่องค้นหาเขต: เรียก /api/search แบบรอหยุดพิมพ์ แล้วส่ง id เขตที่เลือกขึ้นไป
function DistrictSearch({ onSelect, fallbackDistricts, useApiSearch }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const api = useDistrictSearch(useApiSearch ? query : "");
  const keyword = query.trim().replace(/^เขต/, "");
  const localResults = !useApiSearch && keyword
    ? fallbackDistricts.filter(({ name }) => name.includes(keyword)).slice(0, 10)
    : [];
  const results = useApiSearch ? api.results : localResults;
  const loading = useApiSearch && api.loading && keyword.length > 0;
  const choose = (district) => {
    onSelect(String(district.id));
    setQuery(district.name);
    setOpen(false);
  };

  return (
    <div className="terra-insights__search">
      <label htmlFor="terra-district-search">ค้นหาเขต</label>
      <input
        id="terra-district-search"
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls="terra-district-results"
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="พิมพ์ชื่อเขต เช่น ดินแดง"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (!event.target.value.trim()) onSelect("");
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && results[0]) {
            event.preventDefault();
            choose(results[0]);
          }
          if (event.key === "Escape") setOpen(false);
        }}
      />
      <p className="terra-insights__search-status" aria-live="polite">
        {loading ? "กำลังค้นหา..."
          : api.error && useApiSearch ? api.error.message
            : open && keyword && !results.length ? `ไม่พบเขต “${keyword}”` : ""}
      </p>
      {open && results.length > 0 && (
        <ul id="terra-district-results" className="terra-insights__search-results" role="listbox">
          {results.map((district) => (
            <li key={district.id} role="option" aria-selected="false">
              <button type="button" onClick={() => choose(district)}>
                <span>{district.name}</span>
                <small>{format(district.population)} คน</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const placeLabels = Object.fromEntries(placeTypes.map(({ id, label }) => [id, label]));

// การ์ดสรุปเขตที่เลือก ดึงจาก /api/districts/:id
function SelectedDistrictCard({ districtId, onClear }) {
  const { data, loading, error, reload } = useApi(
    (signal) => getDistrict(districtId, signal), [districtId], { enabled: Boolean(districtId) },
  );
  if (!districtId) return null;

  const households = data?.households?.counts ?? [];
  return (
    <section className="terra-insights__panel terra-insights__selected" aria-live="polite">
      <div className="terra-insights__selected-head">
        <h2>{data?.name ?? "เขตที่เลือก"}</h2>
        <button type="button" onClick={onClear}>ล้างการเลือก</button>
      </div>
      {loading && <p className="terra-insights__empty">กำลังโหลดข้อมูลเขต...</p>}
      {error && (
        <p className="terra-insights__empty">
          {error.message} <button type="button" onClick={reload}>ลองใหม่</button>
        </p>
      )}
      {data && (
        <>
          <p className="terra-insights__description">
            {data.zone ? `กลุ่ม${data.zone} · ` : ""}รหัสเขต {data.id}
          </p>
          <dl className="terra-insights__selected-stats">
            <div><dt>ประชากร</dt><dd>{format(data.population)} คน</dd></div>
            <div><dt>จำนวนบ้าน ปี {data.households?.years?.at(-1) ?? "—"}</dt><dd>{format(households.at(-1))} หลัง</dd></div>
            <div><dt>สถานที่สำคัญ</dt><dd>{format(data.poiCount)} แห่ง</dd></div>
            {Object.entries(data.placeCounts ?? {})
              .filter(([type]) => placeLabels[type])
              .map(([type, count]) => (
                <div key={type}><dt>{placeLabels[type]}</dt><dd>{format(count)} แห่ง</dd></div>
              ))}
          </dl>
        </>
      )}
    </section>
  );
}

// หน้าหลัก: ดึงข้อมูลจาก backend เอง ถ้าส่ง prop `data` มาจะใช้ข้อมูลนั้นแทน
export default function Dashboard({ data: dataProp, ...props } = {}) {
  const [showExample, setShowExample] = useState(false);
  const shouldFetch = !dataProp && !showExample;
  const { data, loading, error, reload } = useApi((signal) => getDashboard(signal), [], { enabled: shouldFetch });

  if (dataProp) return <DashboardView data={dataProp} {...props} />;
  if (showExample) return <DashboardView data={dashboardData} {...props} />;

  if (loading || error) {
    return (
      <section className="terra-insights" lang="th">
        <style>{styles}</style>
        <header className="terra-insights__header"><h1>ภาพรวมกรุงเทพมหานคร</h1></header>
        <div className="terra-insights__panel" role={error ? "alert" : "status"}>
          {loading ? (
            <p>กำลังโหลดข้อมูลจาก backend...</p>
          ) : (
            <>
              <p>โหลดข้อมูลไม่สำเร็จ: {error.message}</p>
              <div className="terra-insights__actions">
                <button type="button" onClick={reload}>ลองใหม่</button>
                <button type="button" onClick={() => setShowExample(true)}>ดูด้วยข้อมูลตัวอย่าง</button>
              </div>
            </>
          )}
        </div>
      </section>
    );
  }

  return data ? <DashboardView data={data} {...props} /> : null;
}

function DashboardView({
  data,
  placeCountsByDistrict,
  districtQuery: districtQueryProp = "",
  transitStops = data.transitStops,
}) {
  const {
    summary = {}, clusters = [], districts = [], populationDistricts = districts, years = {}, isExample,
  } = data;
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedPlaceDistrictId, setSelectedPlaceDistrictId] = useState("");
  const selectedDistrictName = populationDistricts.find(({ id }) => String(id) === selectedDistrictId)?.name;
  const districtQuery = selectedDistrictName ?? districtQueryProp;

  // เลือกเขตจากช่องค้นหา → กราฟสถานที่เลือกเขตเดียวกัน
  useEffect(() => {
    setSelectedPlaceDistrictId(selectedDistrictId);
  }, [selectedDistrictId]);
  const validClusters = clusters.filter(({ count }) => isReportedCount(count));
  const classifiedDistrictCount = validClusters.reduce((sum, group) => sum + group.count, 0);
  const populationRows = populationDistricts
    .filter(({ population }) => Number.isFinite(population) && population >= 0)
    .sort((a, b) => b.population - a.population);
  const densityRows = districts
    .filter(({ area, population }) => Number.isFinite(area) && area > 0
      && Number.isFinite(population) && population >= 0 && Number.isFinite(population / area))
    .map((district) => ({ ...district, density: district.population / district.area }))
    .sort((a, b) => b.density - a.density);
  const query = districtQuery.trim().toLocaleLowerCase("th-TH");
  const densityTableRows = query
    ? densityRows.filter(({ name }) => name.toLocaleLowerCase("th-TH").includes(query))
    : densityRows.slice(0, 5);
  const densityDescription = densityRows.length
    ? `แสดง ${densityTableRows.length} อันดับแรกจาก ${format(densityRows.length)} เขตที่มีข้อมูลประชากรและพื้นที่`
    : "ประชากรหารด้วยพื้นที่เขต";
  const counts = placeCountsByDistrict ?? data.placeCountsByDistrict ?? (isExample ? examplePlaceCounts : {});
  const reportedDistricts = Object.entries(counts).filter(([, entry]) =>
    placeTypes.some(({ id }) => isReportedCount(entry?.[id]))
  );
  const districtsById = new Map(districts.map(({ id, name }) => [String(id), name]));
  const placeDistrictOptions = reportedDistricts
    .map(([id]) => ({ id, name: districtsById.get(id) }))
    .filter(({ name }) => Boolean(name))
    .sort((a, b) => a.name.localeCompare(b.name, "th-TH"));
  const selectedPlaceDistrict = placeDistrictOptions.find(({ id }) => id === selectedPlaceDistrictId);
  const districtCounts = selectedPlaceDistrict
    ? [counts[selectedPlaceDistrict.id]]
    : reportedDistricts.map(([, entry]) => entry);
  const placeRows = placeTypes.map(({ id, label }, index) => {
    const reportedCounts = districtCounts.map((entry) => entry[id])
      .filter(isReportedCount);
    return {
      id,
      name: label,
      value: reportedCounts.length ? reportedCounts.reduce((sum, count) => sum + count, 0) : null,
      color: barColors[index % barColors.length],
    };
  });
  const populationYear = formatDataYear(years.population);
  const densityYear = isExample ? "ข้อมูลตัวอย่าง" : populationYear;
  const placesYear = formatDataYear(years.places);

  const cards = [
    { label: "จำนวนเขตทั้งหมด", value: summary.districtCount, unit: "เขต", color: barColors[0], note: "เขตกรุงเทพฯ ในชุดข้อมูล" },
    {
      label: "จำนวน Cluster", value: validClusters.length || null, unit: "กลุ่ม", color: barColors[1],
      note: classifiedDistrictCount ? `จัดกลุ่มแล้ว ${format(classifiedDistrictCount)} เขต` : "รอผลการจัดกลุ่มเขต",
    },
    { label: "ประชากรรวม", value: summary.population, unit: "คน", color: barColors[2], note: populationYear },
    { label: "สถานที่สำคัญ", value: summary.placeCount, unit: "แห่ง", color: barColors[3], note: `ยอดรวมในชุดข้อมูล · ${placesYear}` },
  ];

  return (
    <section className="terra-insights" lang="th">
      <style>{styles}</style>
      <header className="terra-insights__header">
        <h1>ภาพรวมกรุงเทพมหานคร</h1>
        {isExample && <span>มีข้อมูลตัวอย่าง</span>}
      </header>

      <DistrictSearch
        onSelect={setSelectedDistrictId}
        fallbackDistricts={populationDistricts}
        useApiSearch={!isExample}
      />

      <div className="terra-insights__metrics">
        {cards.map(({ label, value, unit, color, note }) => (
          <div key={label} className="terra-insights__metric" style={{ "--metric-accent": color }}>
            <p>{label}</p>
            <span><strong>{format(value)}</strong>{Number.isFinite(value) && <small>{unit}</small>}</span>
            <p className="terra-insights__metric-note">{note}</p>
          </div>
        ))}
      </div>

      <SelectedDistrictCard districtId={isExample ? "" : selectedDistrictId} onClear={() => setSelectedDistrictId("")} />

      <div className="terra-insights__grid">
        <Panel
          title="จำนวนประชากรรายเขต"
          description={populationRows.length
            ? `${format(populationRows.length)} เขต · เรียงจากมากไปน้อย · หน่วยคน · ${populationYear}`
            : `หน่วยคน · ${populationYear}`}
        >
          {populationRows.length > 7 && (
            <p className="terra-insights__scroll-hint">เลื่อนลงในกราฟเพื่อดูเขตอื่น</p>
          )}
          <div
            className="terra-insights__population-scroll"
            role="region"
            aria-label="กราฟประชากรรายเขต เลื่อนดูรายการได้"
            tabIndex={populationRows.length > 7 ? 0 : undefined}
          >
            <PopulationBars rows={populationRows} selectedId={selectedDistrictId} />
          </div>
        </Panel>

        <Panel title="อันดับความหนาแน่นประชากร" description={query
          ? `ผลการค้นหา “${districtQuery.trim()}” · ${densityTableRows.length} เขต · ${densityYear}`
          : `${densityDescription} · ${densityYear}`}>
          {densityTableRows.length ? (
            <div className="terra-insights__table-wrap">
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
                  {densityTableRows.map(({ id, name, population, area, density }) => (
                    <tr key={id}>
                      <th scope="row">{name}</th>
                      <td>{format(population)}</td>
                      <td>{format(area, areaNumber)}</td>
                      <td>{format(density)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="terra-insights__empty" role="status">
              {query ? "ไม่พบเขตที่ตรงกับคำค้นและมีข้อมูลความหนาแน่น" : "ยังไม่มีข้อมูลพื้นที่และประชากรสำหรับจัดอันดับ"}
            </p>
          )}
        </Panel>

        <AreaShareChart zones={data.zones} selectedDistrictId={selectedDistrictId} />

        <Panel title="สถานที่สำคัญแยกตามประเภท" description={`จำนวนแห่ง · ${placesYear}`}>
          {placeDistrictOptions.length > 0 && (
            <label className="terra-insights__district-picker">
              <span>เลือกเขต</span>
              <select
                value={selectedPlaceDistrict?.id ?? ""}
                onChange={(event) => setSelectedPlaceDistrictId(event.target.value)}
              >
                <option value="">ทุกเขตที่มีข้อมูล</option>
                {placeDistrictOptions.map(({ id, name }) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </label>
          )}
          {districtCounts.length > 0 && (
            <p className="terra-insights__description" role="status">
              {selectedPlaceDistrict
                ? `ข้อมูลสถานที่ใน${selectedPlaceDistrict.name}`
                : `รวมจาก ${format(districtCounts.length)} เขตที่มีข้อมูล · แต่ละประเภทอาจครอบคลุมจำนวนเขตต่างกัน`}
            </p>
          )}
          <VerticalPlaceChart rows={placeRows} />
        </Panel>

        <HousingTrendChart housing={data.housing} selectedDistrictId={selectedDistrictId} />

        <TransitPanel stops={transitStops ?? []} useNamtangSnapshot={transitStops == null} />

        {data.bts?.stations?.length > 0 && <BtsPassengerPanel stations={data.bts.stations} />}
      </div>
    </section>
  );
}

const styles = `
.terra-insights {
  --dash-page: #faf5ec;
  --dash-surface: #fffdf8;
  --dash-line: #e8ddd0;
  --dash-heading: #79544b;
  --dash-text: #51443d;
  --dash-muted: #746255;
  --dash-green: #536f4c;
  container-type: inline-size;
  min-height: 100%;
  padding: clamp(1rem, 2vw, 1.5rem);
  color: var(--dash-text);
  background: var(--dash-page);
  font-family: inherit;
  line-height: 1.5;
}

.terra-insights *, .terra-insights *::before, .terra-insights *::after { box-sizing: border-box; }
.terra-insights h1, .terra-insights h2, .terra-insights p { margin: 0; }
.terra-insights ul { margin: 0; padding: 0; list-style: none; }

.terra-insights__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  margin-bottom: 1rem;
}
.terra-insights__header h1 {
  color: var(--dash-heading);
  font-size: clamp(1.125rem, 1.8vw, 1.375rem);
  font-weight: 700;
}
.terra-insights__header > span {
  padding: .22rem .65rem;
  border-radius: 2rem;
  color: #5b443a;
  background: #eee5d9;
  font-size: .75rem;
  font-weight: 600;
}

.terra-insights__metrics, .terra-insights__grid { display: grid; gap: 1rem; }
.terra-insights__metrics {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 1rem;
}
.terra-insights__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@container (max-width: 43rem) {
  .terra-insights__metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .terra-insights__grid { grid-template-columns: 1fr; }
}
.terra-insights__metric, .terra-insights__panel {
  min-width: 0;
  padding: 1rem;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  border-radius: 1rem;
}
.terra-insights__metric { border-radius: .875rem; }
.terra-insights__metric p { color: var(--dash-heading); font-size: .875rem; font-weight: 600; }
.terra-insights__metric strong {
  color: var(--metric-accent);
  font-size: clamp(1.125rem, 2.3vw, 1.75rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.terra-insights__metric small { margin-inline-start: .35rem; color: var(--dash-muted); font-size: .75rem; }
.terra-insights__metric .terra-insights__metric-note {
  margin-top: .2rem;
  color: var(--dash-muted);
  font-size: .75rem;
  font-weight: 400;
}
.terra-insights__panel h2 { color: #583a32; font-size: 1rem; font-weight: 700; }
.terra-insights__panel .terra-insights__description {
  color: var(--dash-muted);
  font-size: .8125rem;
  margin: .25rem 0 .875rem;
}

.terra-insights__cluster {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}
.terra-insights__donut {
  position: relative;
  width: 9.5rem;
  aspect-ratio: 1;
  flex: none;
}
.terra-insights__donut > span {
  position: absolute;
  inset: 27%;
  pointer-events: none;
  display: grid;
  place-content: center;
  text-align: center;
}
.terra-insights__donut svg { display: block; width: 100%; }
.terra-insights__donut path { cursor: pointer; }
.terra-insights__donut path:focus-visible { outline: none; stroke-dasharray: 3 1; }
.terra-insights__donut strong { color: var(--dash-heading); font-size: 1.1rem; line-height: 1.1; }
.terra-insights__donut small, .terra-insights__legend small {
  display: block;
  color: var(--dash-muted);
}
.terra-insights__legend { flex: 1 1 11rem; }
.terra-insights__legend button {
  width: 100%;
  text-align: start;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: .5rem;
  display: grid;
  grid-template-columns: .6rem minmax(0, 1fr) auto;
  align-items: start;
  gap: .5rem;
  font-size: .8125rem;
  padding: .3rem .45rem;
}
.terra-insights__legend button:hover, .terra-insights__legend button[aria-pressed="true"] {
  background: var(--dash-page);
  border-color: var(--dash-line);
}
.terra-insights__area-details {
  margin-top: .75rem;
  padding: .625rem .75rem;
  border: 1px solid var(--dash-line);
  border-radius: .625rem;
  font-size: .8125rem;
}
.terra-insights__area-details p + p { margin-top: .15rem; color: var(--dash-muted); }
.terra-insights__legend i { width: .55rem; aspect-ratio: 1; border-radius: 50%; margin-top: .35rem; }
.terra-insights__legend strong {
  padding: .08rem .4rem;
  border-radius: .375rem;
  background: #e2ebd9;
  color: #3d5637;
}
.terra-insights__bars li {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(1.25rem, 1fr) auto;
  align-items: center;
  gap: .625rem;
  padding-block: .5rem;
  font-size: .8125rem;
}
.terra-insights__bars strong, .terra-insights__legend strong {
  text-align: end;
  font-variant-numeric: tabular-nums;
}
.terra-insights__track { background: #eee5d9; height: .4rem; border-radius: 2rem; overflow: hidden; }
.terra-insights__track > span { display: block; height: 100%; background: var(--dash-green); border-radius: inherit; }

.terra-insights .terra-insights__scroll-hint {
  margin-bottom: .45rem;
  color: var(--dash-muted);
  font-size: .8125rem;
}
.terra-insights__population-scroll {
  max-height: 17rem;
  overflow-y: auto;
  scrollbar-gutter: stable;
  padding-right: .45rem;
}

.terra-insights__district-picker {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .35rem .625rem;
  margin-bottom: .5rem;
  font-size: .8125rem;
  font-weight: 600;
}
.terra-insights__district-picker select {
  max-width: 100%;
  padding: .375rem .625rem;
  color: var(--dash-text);
  background: #fff;
  border: 1px solid #c3b2a9;
  border-radius: .375rem;
  font: inherit;
}

.terra-insights__place-chart { overflow-x: auto; }
.terra-insights__place-grid {
  --place-plot-height: 8rem;
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  min-width: 29rem;
  padding: 1.75rem 0 .35rem;
}
.terra-insights__place-axis,
.terra-insights__place-gridlines {
  position: relative;
  grid-row: 1;
  height: var(--place-plot-height);
}
.terra-insights__place-axis {
  grid-column: 1;
  min-width: calc(var(--place-axis-digits) * 1ch + 1rem);
  color: var(--dash-muted);
  text-align: right;
  font-size: .7rem;
  font-variant-numeric: tabular-nums;
}
.terra-insights__place-unit {
  position: absolute;
  right: .45rem;
  bottom: calc(100% + .5rem);
}
.terra-insights__place-tick {
  position: absolute;
  right: .45rem;
  transform: translateY(50%);
}
.terra-insights__place-gridlines { grid-column: 2; border-left: 1px solid var(--dash-line); }
.terra-insights__place-gridlines > span {
  position: absolute;
  inset-inline: 0;
  border-top: 1px solid var(--dash-line);
}
.terra-insights .terra-insights__place-columns {
  grid-area: 1 / 2;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: .25rem;
}
.terra-insights__place-columns li {
  display: grid;
  grid-template-rows: var(--place-plot-height) auto;
  gap: .35rem;
  min-width: 0;
  text-align: center;
  font-size: .75rem;
}
.terra-insights__place-name { grid-row: 2; overflow-wrap: anywhere; }
.terra-insights__place-plot {
  position: relative;
  grid-row: 1;
}
.terra-insights__place-plot strong {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  font-variant-numeric: tabular-nums;
}
.terra-insights__place-plot small {
  position: absolute;
  inset-inline: 0;
  bottom: .2rem;
  color: var(--dash-muted);
}
.terra-insights__place-bar {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(55%, 2.25rem);
  border-radius: .25rem .25rem 0 0;
}

.terra-insights__table-wrap { overflow-x: auto; border: 1px solid var(--dash-line); border-radius: .75rem; }
.terra-insights__transit-panel { grid-column: 1 / -1; }
.terra-insights__transit-axis,
.terra-insights__transit-row summary {
  display: grid;
  grid-template-columns: minmax(9rem, 1fr) minmax(10rem, 2fr) minmax(8rem, .8fr);
  gap: .75rem;
  align-items: center;
  padding: .5rem .625rem;
}
.terra-insights__transit-axis {
  font-size: .75rem;
  color: var(--dash-muted);
}
.terra-insights__transit-axis > div {
  display: flex;
  justify-content: space-between;
  padding-right: 5.75rem;
}
.terra-insights__transit-axis > span:last-child,
.terra-insights__transit-total { text-align: end; }
.terra-insights__transit-row {
  margin-bottom: .4rem;
  border: 1px solid var(--dash-line);
  border-radius: .625rem;
  font-size: .8125rem;
}
.terra-insights__transit-row summary { cursor: pointer; list-style: none; }
.terra-insights__transit-row summary::-webkit-details-marker { display: none; }
.terra-insights__transit-row summary > strong::before {
  content: "▸";
  display: inline-block;
  margin-inline-end: .4rem;
  color: var(--dash-green);
}
.terra-insights__transit-row[open] summary > strong::before { content: "▾"; }
.terra-insights__transit-row[open] summary,
.terra-insights__transit-row summary:hover { background: var(--dash-page); }
.terra-insights__transit-coverage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 5.25rem;
  align-items: center;
  gap: .5rem;
  font-variant-numeric: tabular-nums;
}
.terra-insights__transit-total { font-weight: 600; }
.terra-insights .terra-insights__transit-districts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(12rem, 100%), 1fr));
  gap: .25rem .75rem;
  max-height: 12rem;
  overflow-y: auto;
  padding: .5rem .625rem;
}
.terra-insights__transit-districts li {
  display: flex;
  justify-content: space-between;
  gap: .5rem;
  padding: .2rem 0;
  border-bottom: 1px solid var(--dash-line);
}
.terra-insights__transit-districts strong { white-space: nowrap; }
.terra-insights .terra-insights__transit-source {
  margin-top: .625rem;
  color: var(--dash-muted);
  font-size: .75rem;
}
.terra-insights__transit-source a { text-decoration: underline; }
@container (max-width: 35rem) {
  .terra-insights__transit-axis > span { display: none; }
  .terra-insights__transit-axis { grid-template-columns: 1fr; }
  .terra-insights__transit-row summary { grid-template-columns: minmax(0, 1fr) auto; gap: .35rem; }
  .terra-insights__transit-coverage { grid-row: 2; grid-column: 1 / -1; }
}
.terra-insights table { width: 100%; border-collapse: collapse; background: #fff; font-size: .8125rem; }
.terra-insights th, .terra-insights td {
  padding: .5rem .625rem;
  border-bottom: 1px solid var(--dash-line);
  text-align: end;
}
.terra-insights thead { background: #eee5d9; color: #583a32; }
.terra-insights th:first-child { text-align: start; }
.terra-insights tbody th { font-weight: 600; }
.terra-insights tbody tr:last-child > * { border-bottom: 0; }
.terra-insights td { font-variant-numeric: tabular-nums; white-space: nowrap; }
.terra-insights__empty { color: var(--dash-muted); font-size: .8125rem; }

.terra-insights__housing-panel { grid-column: 1 / -1; }
.terra-insights__housing-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: .25rem 1rem;
  margin: .75rem 0;
  color: var(--dash-muted);
  font-size: .875rem;
}
.terra-insights__housing-summary strong {
  color: var(--dash-green);
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;
}
.terra-insights__housing-scroll { overflow-x: auto; }
.terra-insights__housing-scroll svg {
  display: block;
  width: 100%;
  max-width: 57rem;
  min-width: 35rem;
  height: auto;
}
.terra-insights__housing-scroll text {
  fill: var(--dash-muted);
  font: .75rem system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
}
.terra-insights__housing-scroll line { stroke: var(--dash-line); }
.terra-insights__housing-scroll polyline {
  fill: none;
  stroke: var(--dash-green);
  stroke-width: 3;
  stroke-linejoin: round;
}
.terra-insights__housing-scroll circle {
  fill: var(--dash-green);
  stroke: var(--dash-surface);
  stroke-width: 1.5;
}
.terra-insights .terra-insights__housing-source {
  margin-top: .625rem;
  color: var(--dash-muted);
  font-size: .75rem;
}

/* ช่องค้นหาเขต */
.terra-insights__search { position: relative; margin-bottom: 1rem; max-width: 32rem; }
.terra-insights__search label { display: block; margin-bottom: .3rem; color: var(--dash-heading); font-size: .875rem; font-weight: 600; }
.terra-insights__search input {
  width: 100%;
  padding: .55rem .75rem;
  color: var(--dash-text);
  background: #fff;
  border: 1px solid #c3b2a9;
  border-radius: .5rem;
  font: inherit;
}
.terra-insights__search input:focus-visible { outline: 2px solid var(--dash-green); outline-offset: 1px; }
.terra-insights .terra-insights__search-status { min-height: 1.1rem; margin-top: .2rem; color: var(--dash-muted); font-size: .75rem; }
.terra-insights .terra-insights__search-results {
  position: absolute;
  z-index: 5;
  inset-inline: 0;
  top: calc(100% - 1.1rem);
  max-height: 16rem;
  overflow-y: auto;
  background: var(--dash-surface);
  border: 1px solid var(--dash-line);
  border-radius: .5rem;
  box-shadow: 0 6px 18px rgb(81 68 61 / 12%);
}
.terra-insights__search-results button {
  display: flex;
  width: 100%;
  justify-content: space-between;
  gap: .75rem;
  padding: .5rem .75rem;
  text-align: start;
  font: inherit;
  font-size: .875rem;
  background: none;
  border: 0;
  cursor: pointer;
}
.terra-insights__search-results button:hover,
.terra-insights__search-results button:focus-visible { background: var(--dash-page); }
.terra-insights__search-results small { color: var(--dash-muted); }

/* การ์ดเขตที่เลือก */
.terra-insights__selected { margin-bottom: 1rem; border-color: var(--dash-green); }
.terra-insights__selected-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .5rem; }
.terra-insights__selected-head button,
.terra-insights__actions button,
.terra-insights__empty button {
  padding: .3rem .7rem;
  color: var(--dash-text);
  background: #fff;
  border: 1px solid #c3b2a9;
  border-radius: .375rem;
  font: inherit;
  font-size: .8125rem;
  cursor: pointer;
}
.terra-insights__actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .75rem; }
.terra-insights__selected-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: .5rem;
  margin: 0;
}
.terra-insights__selected-stats div { padding: .5rem .625rem; background: var(--dash-page); border-radius: .5rem; }
.terra-insights__selected-stats dt { color: var(--dash-muted); font-size: .75rem; }
.terra-insights__selected-stats dd { margin: 0; color: var(--dash-green); font-weight: 700; font-variant-numeric: tabular-nums; }

/* แถบประชากรของเขตที่เลือก */
.terra-insights__bars li.terra-insights__bar--selected { margin-inline: -.4rem; padding-inline: .4rem; background: #e2ebd9; border-radius: .375rem; font-weight: 700; }

.terra-insights__bts-panel { grid-column: 1 / -1; }
`;
