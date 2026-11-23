import BangkokMap from "../BangkokMap";

export default function MapSection({ activeLayer, setActiveLayer, mapLayers }) {
  return (
    <section className="min-w-0 rounded-xl border border-[#DCCABB] bg-white p-4">
      <h2 className="text-base font-semibold text-[#79554B]">
        แผนที่แนะนำพื้นที่ที่เหมาะสม
      </h2>

      <div className="mt-3 flex flex-wrap gap-2">
        {mapLayers.map((layer) => (
          <button
            key={layer}
            type="button"
            aria-pressed={activeLayer === layer}
            onClick={() => setActiveLayer(layer)}
            className={`rounded-lg px-3 py-2 text-xs transition ${
              activeLayer === layer
                ? "bg-[#36513D] text-white"
                : "bg-[#F8F3ED] text-[#79554B]"
            }`}
          >
            {layer}
          </button>
        ))}
      </div>

      {activeLayer !== "ภาพรวม" && (
        <p className="mt-2 text-xs text-gray-500">
          รอข้อมูลชั้นแผนที่ {activeLayer}
        </p>
      )}

      <div className="mt-3 overflow-hidden rounded-lg">
        <BangkokMap />
      </div>
    </section>
  );
}
