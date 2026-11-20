const examplePlaces = [
  {
    category: "การเดินทาง",
    name: "สถานีขนส่งตัวอย่าง",
    description: "ตัวอย่างข้อมูลจุดเชื่อมต่อการเดินทางในเขต",
  },
  {
    category: "การศึกษา",
    name: "สถานศึกษาตัวอย่าง",
    description: "ตัวอย่างข้อมูลโรงเรียนหรือมหาวิทยาลัยในเขต",
  },
  {
    category: "พื้นที่พักผ่อน",
    name: "สวนสาธารณะตัวอย่าง",
    description: "ตัวอย่างข้อมูลพื้นที่พักผ่อนและออกกำลังกาย",
  },
]

export default function DistrictPlaces({ district }) {
  const places = district.places ?? (district.isExample ? examplePlaces : [])

  return (
    <section className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[#36513D]">
          สถานที่สำคัญใน{district.name}
        </h2>

        {district.poiCount != null && (
          <p className="text-sm text-gray-600">
            รวมทั้งหมด {district.poiCount.toLocaleString("th-TH")} แห่ง
          </p>
        )}
      </div>

      {district.isExample && (
        <p className="mt-1 text-xs text-gray-500">ข้อมูลตัวอย่าง</p>
      )}

      {places.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {places.map((place) => (
            <article
              key={`${place.category}-${place.name}`}
              className="overflow-hidden rounded-xl border border-[#E3DDD4] bg-white"
            >
              {place.imageUrl ? (
                <img
                  src={place.imageUrl}
                  alt={place.name}
                  loading="lazy"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="grid aspect-video place-items-center bg-[#EAF0E9] text-sm font-medium text-[#36513D]">
                  {place.category}
                </div>
              )}

              <div className="p-4">
                <h3 className="font-semibold text-[#36513D]">{place.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{place.description}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-600">ยังไม่มีข้อมูลสถานที่สำคัญ</p>
      )}
    </section>
  )
}