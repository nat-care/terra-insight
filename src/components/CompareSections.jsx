import { getBaseTags } from "../utils/compare";

// หัวข้อที่มีวงกลมเลข ① ② ③ — ใช้แค่ในไฟล์นี้ จึงไม่ต้อง export
function StepHeading({ step, children }) {
  return (
    <h3 className="flex items-center gap-2 text-base font-semibold text-[#5A3A32]">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5A3A32] text-[11px] text-white">
        {step}
      </span>
      {children}
    </h3>
  );
}

// ① เลือกเขตต้นแบบ + การ์ดสีชมพู
export function BaseDistrictPicker({
  options,
  base,
  onBaseChange,
  sameClusterOnly,
  onSameClusterChange,
}) {
  return (
    <section className="grid grid-cols-1 gap-4 rounded-2xl border border-[#E8DDD0] bg-[#FFFDF8] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      {/* ซ้าย: เลือกเขต */}
      <div>
        <StepHeading step={1}>เลือกเขตต้นแบบ</StepHeading>

        <label
          htmlFor="base-district"
          className="mt-3 block text-xs font-medium text-[#51443D]"
        >
          เขตที่ชอบ หรือเขตที่อยู่ตอนนี้
        </label>
        <select
          id="base-district"
          value={base.id}
          onChange={(e) => onBaseChange(e.target.value)}
          className="mt-1 h-9 w-full rounded-lg border border-[#C3B2A9] bg-white px-3 text-sm text-[#51443D] outline-none focus:border-[#71845D]"
        >
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              เขต{o.name} 
            </option>
          ))}
        </select>

        <label className="mt-3 flex items-center gap-2 text-xs text-[#79554B]">
          <input
            type="checkbox"
            checked={sameClusterOnly}
            onChange={(e) => onSameClusterChange(e.target.checked)}
            className="h-4 w-4 accent-[#536F4C]"
          />
          ค้นเฉพาะเขตในกลุ่มเดียวกัน
        </label>
      </div>

      {/* ขวา: การ์ดเขตต้นแบบ */}
      <div className="rounded-xl bg-[#F3DCD8] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold text-[#5A3A32]">{base.name}</h2>
          
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-[#5A3A32]">
            ต้นแบบ
          </span>
        </div>

        <p className="mt-2 text-sm text-[#51443D]">{base.summary}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {getBaseTags(base).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#DCE5D3] px-2.5 py-1 text-[11px] text-[#536F4C]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ② รายการเขตที่ใกล้เคียง
export function SimilarDistrictList({ items, selectedId, onSelect }) {
  return (
    <section className="rounded-2xl border border-[#E8DDD0] bg-[#FFFDF8] p-4">
      <StepHeading step={2}>เขตที่ลักษณะใกล้เคียง</StepHeading>

      {items.length === 0 && (
        <p className="mt-3 text-sm text-[#A79588]">ไม่พบเขตที่คล้ายกันในกลุ่มนี้</p>
      )}

      <ul className="mt-3 space-y-2">
        {items.map((item) => {
          const active = item.id === selectedId;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                aria-pressed={active}
                className={`w-full rounded-xl border bg-white p-3 text-left transition ${
                  active
                    ? "border-[#5A3A32] shadow-sm"
                    : "border-[#E8DDD0] hover:border-[#C3B2A9]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#5A3A32]">
                    {item.name}
                  </span>
                  <span className="ml-auto rounded-md bg-[#536F4C] px-2 py-0.5 text-[11px] text-white">
                    {item.label} {item.score}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#79554B]">{item.reason}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ③ เหมือนกันตรงไหน ต่างกันตรงไหน
const groupStyles = {
  same: { title: "เหมือนกัน", icon: "=", box: "bg-[#E3EBD9]", badge: "bg-[#536F4C]" },
  better: { title: "ดีกว่า", icon: "+", box: "bg-[#DCE5EE]", badge: "bg-[#3F5A78]" },
  worse: { title: "ด้อยกว่า", icon: "−", box: "bg-[#F3DCD8]", badge: "bg-[#8A4B45]" },
};

function FeatureGroup({ type, items }) {
  const style = groupStyles[type];

  return (
    <div className={`rounded-xl p-3 ${style.box}`}>
      <h4 className="flex items-center gap-2 text-sm font-semibold text-[#5A3A32]">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-xs text-white ${style.badge}`}
        >
          {style.icon}
        </span>
        {style.title}
      </h4>

      {items.length === 0 ? (
        <p className="mt-2 text-xs text-[#79554B]">ไม่มี</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li key={item.key} className="rounded-lg bg-white px-3 py-2">
              <p className="text-sm font-medium text-[#5A3A32]">{item.label}</p>
              <p className="text-[11px] text-[#79554B]">{item.note}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SimilarityBreakdown({ comparison }) {
  return (
    <section className="rounded-2xl border border-[#E8DDD0] bg-[#FFFDF8] p-4">
      <StepHeading step={3}>เหมือนกันตรงไหน ต่างกันตรงไหน</StepHeading>

      {!comparison && (
        <p className="mt-3 text-sm text-[#A79588]">
          เลือกเขตจากรายการทางซ้ายเพื่อดูการเปรียบเทียบ
        </p>
      )}

      {comparison && (
        <div className="mt-3 space-y-3">
          <p className="rounded-xl bg-[#EFE6D8] p-3 text-sm leading-relaxed text-[#51443D]">
            {comparison.summary}
          </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FeatureGroup type="same" items={comparison.same} />
            <FeatureGroup type="better" items={comparison.better} />
            <FeatureGroup type="worse" items={comparison.worse} />
          </div>

          
        </div>
      )}
    </section>
  );
}