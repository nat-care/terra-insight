export default function RecommendedResults({
  recommendations,
  hasSearched,
  logo,
}) {
  return (
    <section className="min-w-0 rounded-xl border border-[#DCCABB] bg-white p-4">
      <div className="mb-4">
        <h2 className="text-base font-bold text-[#79554B]">
          {hasSearched ? "แขวงที่แนะนำสำหรับคุณ" : "พื้นที่แนะนำสำหรับคุณ"}
        </h2>
        <p className="mt-1 text-xs text-[#A79588]">
          {hasSearched
            ? "ผลการวิเคราะห์จากความต้องการของคุณ"
            : "กรอกข้อมูลและกด Find Suitable Area เพื่อค้นหาพื้นที่"}
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
            <p className="text-sm text-[#A79588]">
              รอข้อมูลการค้นหาจากคุณ
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {recommendations.map((area, index) => (
            <article
              key={area.name}
              className="rounded-xl border border-[#D8C6B5] bg-[#FCF8F1] p-3 transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] text-[#A79588]">
                    อันดับที่ {index + 1} {area.cluster}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-[#79554B]">
                    {area.name}
                  </h3>
                </div>

                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full border border-[#D28E8E] bg-[#F2D4D0]">
                  <span className="text-base font-bold text-[#79554B]">
                    {area.score}
                  </span>
                  <span className="text-[8px] text-[#79554B]">คะแนน</span>
                </div>
              </div>

              <div className="my-3">
                <span className="rounded-full bg-[#DCE8D4] px-2 py-1 text-[9px] text-[#52764E]">
                  เหมาะสมกับความต้องการ
                </span>
              </div>

              <div className="mb-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-[#EDE4D8]">
                  <div
                    className="h-full rounded-full bg-[#C77F83]"
                    style={{ width: `${area.score}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2 border-t border-[#E8DCD0] pt-2">
                {area.reasons.map((reason, i) => (
                  <p key={i} className="text-[10px] text-[#806D62]">
                    ● {reason}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
