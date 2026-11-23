import { useState } from "react";
import logo from "../assets/flower.png";

const initialFactors = {
  safety: 5,
  hospital: 4,
  school: 3,
  shopping: 4,
  park: 3,
  transport: 5,
};

const factorList = [
  { key: "safety", label: "ความปลอดภัย" },
  { key: "hospital", label: "โรงพยาบาล" },
  { key: "school", label: "โรงเรียน" },
  { key: "shopping", label: "ห้างสรรพสินค้า" },
  { key: "park", label: "สวนสาธารณะ" },
  { key: "transport", label: "การเดินทาง" },
];

const travelOptions = [
  "รถยนต์",
  "รถเมล์",
  "รถไฟฟ้า",
  "มอเตอร์ไซค์",
  "เดินเท้า",
  "อื่น ๆ",
];

export default function UserInput({ onSearch }) {
  const [workType, setWorkType] = useState("ทำงานที่บ้าน");
  const [workLocation, setWorkLocation] = useState("");
  const [travel, setTravel] = useState(["รถยนต์"]);
  const [distance, setDistance] = useState(5);
  const [factors, setFactors] = useState(initialFactors);

  const toggleTravel = (option) => {
    setTravel((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option],
    );
  };

  const handleSearch = () => {
    if (!workLocation.trim()) {
      alert("กรุณากรอกสถานที่ทำงาน");
      return;
    }

    if (travel.length === 0) {
      alert("กรุณาเลือกวิธีการเดินทาง");
      return;
    }

    const data = {
      workType,
      workLocation,
      travel,
      distance,
      factors,
    };

    console.log("User Preferences:", data);
    onSearch?.(data);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <img
          src={logo}
          alt="TerraInsight"
          className="w-[35px] h-[35px] object-contain"
        />

        <div>
          <h2 className="text-sm font-bold text-[#806D62]">
            ความต้องการของคุณ
          </h2>
          <p className="text-[10px] text-[#A79588]">
            กรอกข้อมูลเพื่อค้นหาพื้นที่ที่เหมาะสม
          </p>
        </div>
      </div>

      {/* Work Type */}
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-semibold text-[#806D62]">
          รูปแบบการทำงาน
        </label>

        <div className="flex flex-wrap gap-1">
          {["ทำงานที่บ้าน", "ทำงานออฟฟิศ", "Hybrid"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setWorkType(item)}
              className={`rounded-full border px-2.5 py-1.5 text-[10px] transition ${
                workType === item
                  ? "border-[#64875B] bg-[#64875B] text-white"
                  : "border-[#E4D8CA] bg-white text-[#806D62] hover:bg-[#EAF0E5]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Work Location */}
      <div className="mb-3">
        <label className="mb-1.5 block text-xs font-semibold text-[#806D62]">
          สถานที่ทำงาน
        </label>

        <input
          type="text"
          value={workLocation}
          onChange={(e) => setWorkLocation(e.target.value)}
          placeholder="เช่น สยาม, อโศก, ลาดพร้าว"
          className="w-full rounded-lg border border-[#E4D8CA] bg-white px-3 py-2 text-xs text-[#66584F] outline-none focus:border-[#64875B] focus:ring-1 focus:ring-[#64875B]/20"
        />
      </div>

      {/* Travel */}
      <div className="mb-3">
        <label className="mb-2 block text-xs font-semibold text-[#806D62]">
          ความต้องการด้านการเดินทาง
        </label>

        <div className="grid grid-cols-3 gap-1.5">
          {travelOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => toggleTravel(option)}
              className={`rounded-md border px-1 py-2 text-[10px] transition ${
                travel.includes(option)
                  ? "border-[#64875B] bg-[#E6EDDF] font-semibold text-[#52764E]"
                  : "border-[#E4D8CA] bg-white text-[#806D62] hover:bg-[#F2EDE5]"
              }`}
            >
              {travel.includes(option) ? "✓ " : ""}
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="text-xs font-semibold text-[#806D62]">
            ระยะทางที่ยอมรับได้
          </label>

          <span className="text-xs font-bold text-[#52764E]">
            {distance} กม.
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="20"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer accent-[#64875B]"
        />

        <div className="flex justify-between text-[9px] text-[#A79588]">
          <span>1 กม.</span>
          <span>20 กม.</span>
        </div>
      </div>

      {/* Importance Factors */}
      <div className="mb-4">
        <h3 className="mb-1 text-xs font-bold text-[#806D62]">
          ความสำคัญของแต่ละปัจจัย
        </h3>

        <p className="mb-3 text-[10px] text-[#A79588]">
          เลือกระดับความสำคัญ 1 - 5
        </p>

        <div className="space-y-3">
          {factorList.map((factor) => (
            <div key={factor.key}>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[11px] text-[#806D62]">
                  {factor.label}
                </label>

                <span className="text-[11px] font-bold text-[#52764E]">
                  {factors[factor.key]}
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={factors[factor.key]}
                onChange={(e) =>
                  setFactors({
                    ...factors,
                    [factor.key]: Number(e.target.value),
                  })
                }
                className="h-1.5 w-full cursor-pointer accent-[#64875B]"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Search Button */}
      <button
        type="button"
        onClick={handleSearch}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C77F83] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#B96E74] active:scale-[0.98]"
      >
        <span>⌕</span>
        Find Suitable Area
      </button>

      <p className="mt-2 text-center text-[9px] text-[#A79588]">
        ค้นหาพื้นที่ที่เหมาะสมกับความต้องการของคุณ
      </p>
    </div>
  );
}
