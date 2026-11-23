export default function DensityChart({ densityPreview, maxDensity }) {
  return (
    <section className="min-w-0 rounded-xl border border-[#DCCABB] bg-white p-4">
      <h2 className="text-base font-semibold text-[#79554B]">
        กราฟสรุปข้อมูลกรุงเทพฯ
      </h2>
      <p className="mt-1 text-xs text-[#A79588]">
        ความหนาแน่นประชากร (คน/ตร.กม.)
      </p>

      <div className="mt-5 space-y-5">
        {densityPreview.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between gap-2 text-xs">
              <span className="text-[#79554B]">{item.label}</span>
              <strong className="text-[#36513D]">
                {item.value.toLocaleString("th-TH")}
              </strong>
            </div>

            <div className="h-2 rounded-full bg-[#F0EBE3]">
              <div
                className="h-full rounded-full bg-[#64875B]"
                style={{ width: `${(item.value / maxDensity) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
