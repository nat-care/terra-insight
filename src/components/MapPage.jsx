import { useState } from "react";
import BangkokMap from "../BangkokMap";

const STORAGE_KEY = "terra-insight:recommendations";
const EMPTY_RECOMMENDATIONS = [];

const detailFields = [
  { key: "population", label: "ประชากร", unit: "คน" },
  { key: "health", label: "สถานพยาบาล", unit: "แห่ง" },
  { key: "schools", label: "โรงเรียน", unit: "แห่ง" },
  { key: "malls", label: "ห้างสรรพสินค้า", unit: "แห่ง" },
  { key: "temples", label: "วัด", unit: "แห่ง" },
  { key: "universities", label: "มหาวิทยาลัย", unit: "แห่ง" },
  { key: "risk", label: "จุดเสี่ยง", unit: "จุด" },
];

const numberFormat = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 1,
});

function readRecommendations() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY));

    return Array.isArray(saved)
      ? saved.filter((area) => area && typeof area === "object").slice(0, 5)
      : null;
  } catch {
    return null;
  }
}

function DistrictPost({ area }) {
  const title = area.name || area.district || "ไม่ระบุชื่อพื้นที่";
  const reasons = Array.isArray(area.reasons) ? area.reasons : [];
  const details = area.details ?? {};

  return (
    <article className="rounded-2xl border border-[#E3D8CC] bg-white p-4 shadow-sm sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h3 className="min-w-0 flex-1 text-lg font-bold leading-relaxed text-[#44372F]">
          {title}
        </h3>

        {area.cluster_id != null && (
          <span className="rounded-full bg-[#EAF0E5] px-3 py-1 text-sm font-semibold text-[#36513D]">
            กลุ่ม {area.cluster_id}
          </span>
        )}
      </header>

      {area.cluster && (
        <p className="mt-2 text-base leading-relaxed text-[#604D42]">
          {area.cluster}
        </p>
      )}

      {reasons.length > 0 && (
        <ul className="mt-3 list-disc space-y-1.5 ps-5 text-sm leading-relaxed text-[#604D42] sm:text-base">
          {reasons.map((reason, index) => (
            <li key={`${index}-${reason}`}>{reason}</li>
          ))}
        </ul>
      )}

      <details className="mt-4 border-t border-[#EEE5DC] pt-3">
        <summary className="cursor-pointer rounded text-sm font-semibold leading-relaxed text-[#36513D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          ข้อมูลประกอบพื้นที่
        </summary>

        <p className="mt-3 text-sm leading-relaxed text-[#6B594E]">
          ค่าเฉลี่ยข้อมูลรอบจุดพื้นที่ภายในเขต
        </p>

        <dl className="mt-2 divide-y divide-[#EEE5DC]">
          {detailFields.map(({ key, label, unit }) => {
            const rawValue = details[key];
            const value = Number(rawValue);
            const hasValue =
              rawValue != null && rawValue !== "" && Number.isFinite(value);

            return (
              <div
                key={key}
                className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2 text-sm leading-relaxed"
              >
                <dt className="text-[#604D42]">{label}</dt>
                <dd className="font-semibold text-[#44372F]">
                  {hasValue ? `${numberFormat.format(value)} ${unit}` : "—"}
                </dd>
              </div>
            );
          })}
        </dl>
      </details>
    </article>
  );
}

export default function MapPage() {
  const [results] = useState(readRecommendations);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const recommendations = results ?? EMPTY_RECOMMENDATIONS;

  return (
    <div className="relative isolate">
      <BangkokMap recommendations={recommendations} />

      <div
        lang="th"
        className="pointer-events-none absolute inset-x-3 bottom-6 z-10 flex flex-col items-start gap-2 font-sans [overflow-wrap:anywhere] sm:right-auto"
      >
        <button
          type="button"
          aria-expanded={isPanelOpen}
          aria-controls="map-results-panel"
          onClick={() => setIsPanelOpen((open) => !open)}
          className="pointer-events-auto order-last min-h-11 rounded-full bg-[#36513D] px-5 py-2.5 text-sm font-semibold leading-relaxed text-white shadow-lg hover:bg-[#455E40] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#36513D]"
        >
          {isPanelOpen ? "ซ่อนผลการวิเคราะห์" : "ผลการวิเคราะห์"}
          {recommendations.length > 0 &&
            ` (${numberFormat.format(recommendations.length)})`}
        </button>

        <aside
          id="map-results-panel"
          aria-labelledby="map-results-heading"
          hidden={!isPanelOpen}
          className="pointer-events-auto max-h-[min(50svh,30rem)] w-full overflow-y-auto overscroll-contain rounded-2xl border border-[#DCCABB] bg-[#FAF6F0] shadow-xl sm:w-[28rem] sm:max-w-[calc(100vw-3rem)]"
        >
          <header className="sticky top-0 z-10 border-b border-[#E3D8CC] bg-[#FAF6F0] px-4 py-3 sm:px-5">
            <h2
              id="map-results-heading"
              className="text-lg font-bold leading-relaxed text-[#44372F]"
            >
              ผลการจัดกลุ่มพื้นที่
            </h2>

            {recommendations.length > 0 && (
              <p className="text-sm leading-relaxed text-[#6B594E]">
                พื้นที่ตัวอย่าง {numberFormat.format(recommendations.length)}{" "}
                รายการจากการจำแนกด้วย Random Forest
              </p>
            )}
          </header>

          <div className="space-y-3 p-3 sm:p-4">
            {recommendations.length > 0 ? (
              recommendations.map((area, index) => (
                <DistrictPost
                  key={`${area.district ?? area.name}-${area.cluster_id}-${index}`}
                  area={area}
                />
              ))
            ) : (
              <p className="rounded-xl bg-white p-4 text-base leading-relaxed text-[#604D42]">
                {results === null
                  ? "ไปที่หน้าแรกแล้วกด Find Suitable Area เพื่อแสดงผลบนแผนที่"
                  : "ไม่พบพื้นที่จากการค้นหาครั้งล่าสุด"}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}