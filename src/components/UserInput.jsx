import { useId, useState } from "react";
import logo from "../assets/flower.png";

const PHOTON_URL = "https://photon.komoot.io/api/";

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

const workTypes = ["ทำงานที่บ้าน", "ทำงานออฟฟิศ", "Hybrid"];

const travelOptions = [
  "รถยนต์",
  "รถเมล์",
  "รถไฟฟ้า",
  "มอเตอร์ไซค์",
  "เดินเท้า",
  "อื่น ๆ",
];

function formatLocationResult(feature) {
  const place = feature.properties ?? {};
  const streetAddress = [place.housenumber, place.street]
    .filter(Boolean)
    .join(" ");

  const name = place.name || streetAddress || place.district || place.city;
  if (!name) return null;

  const addressParts = [
    streetAddress,
    place.district,
    place.city,
    place.state,
    place.postcode,
  ].filter((part) => part && part !== name);

  return {
    name,
    address: [...new Set(addressParts)].join(", "),
  };
}

export default function UserInput({ onSearch, isLoading = false }) {
  const formId = useId();
  const [workType, setWorkType] = useState("ทำงานที่บ้าน");
  const [workLocation, setWorkLocation] = useState("");
  const [travel, setTravel] = useState(["รถยนต์"]);
  const [distance, setDistance] = useState(5);
  const [factors, setFactors] = useState(initialFactors);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [locationResults, setLocationResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");

  const isBusy = isLoading || isLookingUp;

  function toggleTravel(option) {
    setTravel((previous) =>
      previous.includes(option)
        ? previous.filter((item) => item !== option)
        : [...previous, option]
    );
  }

  function handleLocationChange(event) {
    setWorkLocation(event.target.value);
    setSelectedLocation(null);
    setLocationResults([]);
    setLocationMessage("");
  }

  async function handleLookup() {
    if (isBusy) return;

    const query = workLocation.trim();

    setSelectedLocation(null);
    setLocationResults([]);

    if (!query) {
      setLocationMessage("กรุณากรอกชื่อสถานที่หรือที่อยู่");
      return;
    }

    setLocationMessage("");
    setIsLookingUp(true);

    try {
      const url = new URL(PHOTON_URL);
      url.searchParams.set("q", query);
      url.searchParams.set("limit", "5");
      url.searchParams.set("lat", "13.7563");
      url.searchParams.set("lon", "100.5018");

      const response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error(`Photon HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!Array.isArray(data.features)) {
        throw new Error("Invalid location search response");
      }

      const results = data.features
        .map(formatLocationResult)
        .filter(Boolean);

      const uniqueResults = [
        ...new Map(
          results.map((result) => [
            JSON.stringify([result.name, result.address]),
            result,
          ])
        ).values(),
      ];

      setLocationResults(uniqueResults);

      if (uniqueResults.length === 0) {
        setLocationMessage(
          "ไม่พบผลจากที่อยู่นี้ ลองค้นด้วยชื่อสถานที่ หรือชื่อถนนและเขต"
        );
      }
    } catch {
      setLocationMessage(
        "ค้นหาที่อยู่ไม่สำเร็จ ลองอีกครั้ง หรือกรอกชื่อสถานที่แล้วกด Find Suitable Area"
      );
    } finally {
      setIsLookingUp(false);
    }
  }

  function handleSelectLocation(location) {
    setSelectedLocation(location);
    setLocationResults([]);
    setLocationMessage("");
  }

  function handleSearch() {
    if (isBusy) return;

    const location = selectedLocation?.name || workLocation.trim();

    if (!location) {
      setLocationMessage("กรุณากรอกสถานที่ทำงาน");
      return;
    }

    if (travel.length === 0) {
      alert("กรุณาเลือกวิธีการเดินทาง");
      return;
    }

    onSearch?.({
      workType,
      workLocation: location,
      travel,
      distance,
      factors: { ...factors },
    });
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2">
        <img
          src={logo}
          alt="TerraInsight"
          className="h-[35px] w-[35px] object-contain"
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

      <div className="mb-3">
        <p className="mb-1.5 text-xs font-semibold text-[#806D62]">
          รูปแบบการทำงาน
        </p>

        <div className="flex flex-wrap gap-1">
          {workTypes.map((item) => (
            <button
              key={item}
              type="button"
              disabled={isBusy}
              aria-pressed={workType === item}
              onClick={() => setWorkType(item)}
              className={`rounded-full border px-2.5 py-1.5 text-[10px] transition disabled:cursor-not-allowed disabled:opacity-50 ${
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

      <div className="mb-3">
        <label
          htmlFor={`${formId}-location`}
          className="mb-1.5 block text-xs font-semibold text-[#806D62]"
        >
          สถานที่ทำงาน
        </label>

        <input
          id={`${formId}-location`}
          type="text"
          value={workLocation}
          disabled={isBusy}
          onChange={handleLocationChange}
          placeholder="เช่น มหาวิทยาลัยศรีปทุม หรือที่อยู่เต็ม"
          className="w-full rounded-lg border border-[#E4D8CA] bg-white px-3 py-2 text-xs text-[#66584F] outline-none focus:border-[#64875B] focus:ring-1 focus:ring-[#64875B]/20 disabled:bg-gray-100"
        />

        <button
          type="button"
          onClick={handleLookup}
          disabled={isBusy}
          className="mt-2 rounded-md border border-[#64875B] px-2.5 py-1.5 text-[10px] font-semibold text-[#52764E] hover:bg-[#EAF0E5] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLookingUp ? "กำลังค้นหาที่อยู่..." : "ค้นหาจากที่อยู่"}
        </button>

        {locationMessage && (
          <p role="status" className="mt-2 text-[11px] text-[#9C4747]">
            {locationMessage}
          </p>
        )}

        {locationResults.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-[11px] text-[#806D62]">
              เลือกสถานที่ที่ตรงกับที่อยู่ของคุณ
            </p>

            <ul className="space-y-1">
              {locationResults.map((location) => (
                <li key={JSON.stringify([location.name, location.address])}>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleSelectLocation(location)}
                    className="w-full rounded-md border border-[#E4D8CA] bg-white px-3 py-2 text-left hover:bg-[#EAF0E5] disabled:opacity-50"
                  >
                    <span className="block text-xs font-semibold text-[#52764E]">
                      {location.name}
                    </span>

                    {location.address && (
                      <span className="mt-0.5 block text-[10px] text-[#806D62]">
                        {location.address}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {selectedLocation && (
          <p role="status" className="mt-2 text-[11px] text-[#52764E]">
            ใช้ {selectedLocation.name} เป็นจุดอ้างอิง
          </p>
        )}

        <p className="mt-1 text-[9px] text-[#806D62]">
          ข้อมูลสถานที่ ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            OpenStreetMap contributors
          </a>
        </p>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-semibold text-[#806D62]">
          ความต้องการด้านการเดินทาง
        </p>

        <div className="grid grid-cols-3 gap-1.5">
          {travelOptions.map((option) => (
            <button
              key={option}
              type="button"
              disabled={isBusy}
              aria-pressed={travel.includes(option)}
              onClick={() => toggleTravel(option)}
              className={`rounded-md border px-1 py-2 text-[10px] transition disabled:cursor-not-allowed disabled:opacity-50 ${
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

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor={`${formId}-distance`}
            className="text-xs font-semibold text-[#806D62]"
          >
            ระยะทางที่ยอมรับได้
          </label>

          <span className="text-xs font-bold text-[#52764E]">
            {distance} กม.
          </span>
        </div>

        <input
          id={`${formId}-distance`}
          type="range"
          min="1"
          max="20"
          value={distance}
          disabled={isBusy}
          onChange={(event) => setDistance(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer accent-[#64875B] disabled:opacity-50"
        />

        <div className="flex justify-between text-[9px] text-[#A79588]">
          <span>1 กม.</span>
          <span>20 กม.</span>
        </div>
      </div>

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
                <label
                  htmlFor={`${formId}-${factor.key}`}
                  className="text-[11px] text-[#806D62]"
                >
                  {factor.label}
                </label>

                <span className="text-[11px] font-bold text-[#52764E]">
                  {factors[factor.key]}
                </span>
              </div>

              <input
                id={`${formId}-${factor.key}`}
                type="range"
                min="1"
                max="5"
                step="1"
                value={factors[factor.key]}
                disabled={isBusy}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setFactors((previous) => ({
                    ...previous,
                    [factor.key]: value,
                  }));
                }}
                className="h-1.5 w-full cursor-pointer accent-[#64875B] disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        disabled={isBusy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#C77F83] px-3 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#B96E74] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden="true">{isLoading ? "◌" : "⌕"}</span>
        {isLoading ? "กำลังวิเคราะห์พื้นที่..." : "Find Suitable Area"}
      </button>

      <p className="mt-2 text-center text-[9px] text-[#A79588]">
        ค้นหาพื้นที่ที่เหมาะสมกับความต้องการของคุณ
      </p>
    </div>
  );
}