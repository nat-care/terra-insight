import { useState } from "react";

// mock ข้อมูลเขต — ภายหลังเปลี่ยนเป็นข้อมูลจริง/จากโมเดลได้
// risk.level: "low" = เขียว, "medium" = เหลือง, "high" = ชมพู
const districtStats = [
  {
    id: "chatuchak",
    name: "จตุจักร",
    population: 155000,
    density: 4700,
    schools: 28,
    hospitals: 8,
    transport: "BTS+MRT+ด่วน",
    risk: { level: "low", text: "เสี่ยงต่ำ / จราจรปานกลาง" },
  },
  {
    id: "watthana",
    name: "วัฒนา",
    population: 82000,
    density: 6300,
    schools: 22,
    hospitals: 6,
    transport: "BTS+MRT+เรือ",
    risk: { level: "high", text: "ติดขัดสูง / ฝนตกท่วมขังขอบทาง" },
  },
  {
    id: "bangkhen",
    name: "บางเขน",
    population: 190000,
    density: 4500,
    schools: 31,
    hospitals: 5,
    transport: "BTS+รถเมล์",
    risk: { level: "medium", text: "เสี่ยงปานกลาง / น้ำท่วมบางจุด" },
  },
  {
    id: "ladprao",
    name: "ลาดพร้าว",
    population: 120000,
    density: 5400,
    schools: 19,
    hospitals: 4,
    transport: "MRT+รถเมล์",
    risk: { level: "medium", text: "จราจรหนาแน่นช่วงเร่งด่วน" },
  },
  {
    id: "bangna",
    name: "บางนา",
    population: 95000,
    density: 5100,
    schools: 15,
    hospitals: 3,
    transport: "BTS+ด่วน",
    risk: { level: "low", text: "เสี่ยงต่ำ / จราจรปานกลาง" },
  },
];

const riskStyles = {
  low: "bg-[#DCE9D5] text-[#36513D]",
  medium: "bg-[#F3E7C9] text-[#7A5B1E]",
  high: "bg-[#F3D6D2] text-[#8A4B45]",
};

const formatNumber = (n) => n.toLocaleString("th-TH");

// แถวในตาราง: [ชื่อแถว, ฟังก์ชันดึงค่าจากข้อมูลเขต]
const rows = [
  ["ความหนาแน่น", (d) => `${formatNumber(d.density)} คน/ตร.กม.`],
  ["จำนวนโรงเรียน", (d) => `${d.schools} แห่ง`],
  ["โรงพยาบาล", (d) => `${d.hospitals} แห่ง`],
  ["ระบบขนส่ง", (d) => d.transport],
];

function ScaleIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v18M7 21h10M5 7h14M12 5l-7 2M12 5l7 2" />
      <path d="m5 7-3 6a3 3 0 0 0 6 0z" />
      <path d="m19 7-3 6a3 3 0 0 0 6 0z" />
    </svg>
  );
}

function DistrictSelect({ id, label, value, disabledId, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="text-xs text-[#A79588]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 h-11 w-full rounded-xl border border-[#E8DDD0] bg-[#FAF5EC] px-3 text-sm font-semibold text-[#51443D] outline-none focus:border-[#71845D]"
      >
        {districtStats.map((d) => (
          <option key={d.id} value={d.id} disabled={d.id === disabledId}>
            เขต{d.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function CompareRow({ label, left, right }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-center gap-2 border-b border-[#E8DDD0] py-3 last:border-b-0">
      <div className="text-sm font-semibold text-[#36513D]">{left}</div>
      <div className="text-center text-[11px] leading-tight text-[#A79588]">
        {label}
      </div>
      <div className="text-right text-sm font-semibold text-[#79554B]">{right}</div>
    </div>
  );
}

function RiskChip({ risk }) {
  return (
    <span
      className={`inline-block rounded-lg px-2 py-1 text-[11px] font-medium ${riskStyles[risk.level]}`}
    >
      {risk.text}
    </span>
  );
}

export default function DistrictCompareCard() {
  const [leftId, setLeftId] = useState(districtStats[0].id);
  const [rightId, setRightId] = useState(districtStats[1].id);

  const left = districtStats.find((d) => d.id === leftId);
  const right = districtStats.find((d) => d.id === rightId);

  return (
    <section className="min-w-0 rounded-xl border border-[#DCCABB] bg-white p-4">
      {/* หัวการ์ด */}
      <div className="flex items-center gap-3 border-b border-[#E8DDD0] pb-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F3DCD8] text-[#79554B]">
          <ScaleIcon />
        </span>
        <div>
          <h2 className="text-base font-semibold text-[#51443D]">
            การเลือกเขตที่ต้องการเปรียบเทียบ
          </h2>
          <p className="text-xs text-[#A79588]">เปรียบเทียบเชิงลึกตัวต่อตัว 2 เขต</p>
        </div>
      </div>

      {/* เลือก 2 เขต (เลือกเขตเดียวกันทั้งสองฝั่งไม่ได้) */}
      <div className="mt-3 grid grid-cols-2 gap-3">
        <DistrictSelect
          id="compare-left"
          label="เขตที่ 1"
          value={leftId}
          disabledId={rightId}
          onChange={setLeftId}
        />
        <DistrictSelect
          id="compare-right"
          label="เขตที่ 2"
          value={rightId}
          disabledId={leftId}
          onChange={setRightId}
        />
      </div>

      {/* ตารางเปรียบเทียบ */}
      <div className="mt-4 rounded-xl bg-[#F8F3ED] px-4 py-1">
        <CompareRow
          label="ประชากร"
          left={
            <>
              {left.name}{" "}
              <span className="text-xs font-normal text-[#A79588]">
                ({formatNumber(left.population)} คน)
              </span>
            </>
          }
          right={
            <>
              {right.name}{" "}
              <span className="text-xs font-normal text-[#A79588]">
                ({formatNumber(right.population)} คน)
              </span>
            </>
          }
        />

        {rows.map(([label, getValue]) => (
          <CompareRow
            key={label}
            label={label}
            left={getValue(left)}
            right={getValue(right)}
          />
        ))}

        <CompareRow
          label="พื้นที่เสี่ยง"
          left={<RiskChip risk={left.risk} />}
          right={<RiskChip risk={right.risk} />}
        />
      </div>
    </section>
  );
}