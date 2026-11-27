import BangkokMap from "../BangkokMap";

export default function MapSection({ recommendations }) {
  return (
    <section className="min-w-0 rounded-xl border border-[#DCCABB] bg-white p-4">
      <h2 className="text-base font-semibold text-[#79554B]">
        แผนที่แนะนำพื้นที่ที่เหมาะสม
      </h2>

      <div className="mt-3 overflow-hidden rounded-lg">
        <BangkokMap recommendations={recommendations} />
      </div>
    </section>
  );
}