const detailFields = [
  { key: "population", label: "ประชากร", unit: "คน" },
  { key: "health", label: "สถานพยาบาล", unit: "แห่ง" },
  { key: "schools", label: "โรงเรียน", unit: "แห่ง" },
  { key: "malls", label: "ห้างสรรพสินค้า", unit: "แห่ง" },
  { key: "temples", label: "วัด", unit: "แห่ง" },
  { key: "universities", label: "มหาวิทยาลัย", unit: "แห่ง" },
  { key: "risk", label: "จุดเสี่ยง", unit: "จุด" },
];

export default function RecommendedResults({
  recommendations = [],
  hasSearched,
  logo,
}) {
  const hasResults =
    Array.isArray(recommendations) && recommendations.length > 0;

  return (
    <section className="min-w-0 rounded-xl border border-[#DCCABB] bg-white p-4">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#79554B]">
          ผลการจัดกลุ่มพื้นที่ในกรุงเทพมหานคร
        </h2>

        <p className="mt-1 text-xs text-[#A79588]">
          {hasSearched
            ? "ผลการจำแนกกลุ่มพื้นที่ด้วย Random Forest"
            : "กด Find Suitable Area เพื่อวิเคราะห์และแสดงผลการจัดกลุ่มพื้นที่"}
        </p>
      </div>

      {!hasSearched ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-lg bg-[#FCF8F1]">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="TerraInsight"
              className="h-[35px] w-[35px] object-contain"
            />
            <p className="text-sm text-[#A79588]">รอข้อมูลการค้นหา</p>
          </div>
        </div>
      ) : !hasResults ? (
        <div className="flex min-h-[180px] items-center justify-center rounded-lg bg-[#FCF8F1]">
          <div className="text-center">
            <img
              src={logo}
              alt="TerraInsight"
              className="mx-auto mb-2 h-[35px] w-[35px] object-contain"
            />
            <p className="text-sm font-semibold text-[#806D62]">
              ไม่พบข้อมูลพื้นที่
            </p>
            <p className="mt-1 text-xs text-[#A79588]">
              ไม่พบผลการจัดกลุ่มจากข้อมูลที่มี
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {recommendations.slice(0, 5).map((area, index) => {
            const reasons = Array.isArray(area.reasons) ? area.reasons : [];
            const details = area.details ?? {};

            return (
              <article
                key={`${area.district || area.name}-${area.cluster_id ?? "none"}-${index}`}
                className="rounded-xl border border-[#D8C6B5] bg-[#FCF8F1] p-3 transition hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-[#A79588]">
                      พื้นที่ตัวอย่างที่ {index + 1}
                    </p>
                    <h3 className="mt-1 text-sm font-bold text-[#79554B]">
                      {area.name || area.district || "ไม่ระบุชื่อพื้นที่"}
                    </h3>
                  </div>

                  <span className="shrink-0 rounded-full bg-[#E9DCCB] px-2 py-1 text-[9px] font-semibold text-[#79554B]">
                    Cluster {area.cluster_id ?? "-"}
                  </span>
                </div>

                <div className="my-3 rounded-lg bg-white p-2">
                  <p className="text-[9px] text-[#A79588]">ลักษณะกลุ่มพื้นที่</p>
                  <p className="mt-1 text-xs font-semibold text-[#79554B]">
                    {area.cluster || "ไม่ระบุ Cluster"}
                  </p>
                </div>

                <div className="mb-3 space-y-1 border-b border-[#E8DCD0] pb-3">
                  <p className="text-[10px] font-semibold text-[#79554B]">
                    ผลการจำแนก
                  </p>

                  {reasons.length > 0 ? (
                    reasons.map((reason, reasonIndex) => (
                      <p
                        key={reasonIndex}
                        className="text-[10px] leading-relaxed text-[#806D62]"
                      >
                        ● {reason}
                      </p>
                    ))
                  ) : (
                    <p className="text-[10px] text-[#A79588]">
                      ไม่มีรายละเอียดเพิ่มเติม
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-[10px] font-semibold text-[#79554B]">
                    ข้อมูลประกอบพื้นที่
                  </p>
                  <p className="mb-2 text-[9px] text-[#A79588]">
                    ค่าเฉลี่ยข้อมูลรอบจุดพื้นที่ภายในเขต
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {detailFields.map(({ key, label, unit }) => {
                      const rawValue = details[key];
                      const value = Number(rawValue);
                      const hasValue = rawValue != null && Number.isFinite(value);

                      return (
                        <div key={key} className="rounded-lg bg-white p-2">
                          <p className="text-[9px] text-[#A79588]">{label}</p>
                          <p className="mt-1 text-xs font-bold text-[#79554B]">
                            {hasValue
                              ? `${value.toLocaleString("th-TH", {
                                  maximumFractionDigits: 1,
                                })} ${unit}`
                              : "-"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {hasSearched && hasResults && (
        <div className="mt-3 border-t border-[#E8DCD0] pt-3">
          <p className="text-[10px] leading-relaxed text-[#A79588]">
            แสดงพื้นที่ตัวอย่างสูงสุด 5 เขต โดยเลือกให้กระจายตาม Cluster
            ผลลัพธ์เป็นการจำแนกกลุ่มพื้นที่ ไม่ใช่การจัดอันดับความเหมาะสมในการอยู่อาศัย
          </p>
        </div>
      )}
    </section>
  );
}