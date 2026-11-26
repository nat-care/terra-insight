import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  booleanPointInPolygon,
  difference,
  featureCollection,
  polygon,
  union,
} from "@turf/turf";
import "leaflet/dist/leaflet.css";

const DISTRICTS_URL =
  "https://cdn.jsdelivr.net/gh/GeoThai/boundaries@v2026.10.23/districts.geojson";

const districtStyle = {
  color: "#416342",
  weight: 2,
  fillColor: "#73966D",
  fillOpacity: 0.1,
};

function textNode(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element;
}

function getPlaceLabel(place) {
  const { name, street, housenumber, district, city } = place.properties;
  const address = [housenumber, street].filter(Boolean).join(" ");
  return (
    [...new Set([name, address, district, city].filter(Boolean))].join(", ") ||
    "สถานที่ในกรุงเทพฯ"
  );
}

export default function MapPage() {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const boundaryRef = useRef(null);
  const boundsRef = useRef(null);
  const markerRef = useRef(null);
  const searchRequestRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [searchStatus, setSearchStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const map = L.map(containerRef.current, {
      zoomSnap: 0,
      maxBoundsViscosity: 1,
    });

    mapRef.current = map;

    async function loadMap() {
      try {
        const response = await fetch(DISTRICTS_URL, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("District request failed");

        const data = await response.json();
        const bangkokDistricts = data.features.filter(
          (feature) => String(feature.properties.province_code) === "10",
        );

        if (bangkokDistricts.length !== 50) {
          throw new Error("Expected 50 Bangkok districts");
        }

        const districts = featureCollection(bangkokDistricts);
        const boundary = union(districts);

        if (!boundary) throw new Error("Bangkok boundary is missing");

        const mapExtent = polygon([
          [
            [-180, -85],
            [180, -85],
            [180, 85],
            [-180, 85],
            [-180, -85],
          ],
        ]);
        const outsideBangkok = difference(
          featureCollection([mapExtent, boundary]),
        );

        if (controller.signal.aborted) return;

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          noWrap: true,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        map.attributionControl.addAttribution(
          '<a href="https://github.com/GeoThai/boundaries">GeoThai boundaries</a>',
        );

        if (outsideBangkok) {
          L.geoJSON(outsideBangkok, {
            interactive: false,
            style: {
              stroke: false,
              fillColor: "#FAF5EC",
              fillOpacity: 1,
            },
          }).addTo(map);
        }

        const districtLayer = L.geoJSON(districts, {
          style: districtStyle,
          onEachFeature(feature, layer) {
            const name = feature.properties.name_th;
            const label = name.startsWith("เขต") ? name : `เขต${name}`;

            layer.bindTooltip(textNode(label), { sticky: true });
            layer.bindPopup(textNode(label));

            layer.on("mouseover", () => {
              layer.setStyle({ weight: 3, fillOpacity: 0.25 });
            });
            layer.on("mouseout", () => {
              layer.setStyle(districtStyle);
            });
          },
        }).addTo(map);

        const bounds = districtLayer.getBounds();
        const paddedBounds = bounds.pad(0.08);

        map.setMaxBounds(paddedBounds);
        map.fitBounds(paddedBounds);
        map.setMinZoom(map.getZoom());

        boundaryRef.current = boundary;
        boundsRef.current = bounds;
        setReady(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          setMapError("โหลดแผนที่กรุงเทพฯ ไม่สำเร็จ กรุณารีเฟรชหน้าแล้วลองใหม่");
        }
      }
    }

    loadMap();

    return () => {
      controller.abort();
      searchRequestRef.current?.abort();
      map.remove();
      mapRef.current = null;
      boundaryRef.current = null;
      boundsRef.current = null;
      markerRef.current = null;
    };
  }, []);

  async function handleSearch(event) {
    event.preventDefault();

    const name = query.trim();
    const bounds = boundsRef.current;
    const boundary = boundaryRef.current;

    if (!name || !bounds || !boundary) return;

    searchRequestRef.current?.abort();

    const controller = new AbortController();
    searchRequestRef.current = controller;

    setPlaces([]);
    setSearchStatus("กำลังค้นหาสถานที่…");

    const params = new URLSearchParams({
      q: name,
      bbox: bounds.toBBoxString(),
      limit: "12",
    });

    try {
      const response = await fetch(`https://photon.komoot.io/api/?${params}`, {
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Place search failed");

      const data = await response.json();

      // The bounding box includes some areas outside Bangkok.
      // Test each result against the actual city boundary.
      const matches = data.features.filter(
        (place) =>
          place.geometry?.type === "Point" &&
          booleanPointInPolygon(place.geometry.coordinates, boundary),
      );

      if (controller.signal.aborted) return;

      setPlaces(matches);
      setSearchStatus(matches.length ? "" : "ไม่พบสถานที่นี้ในกรุงเทพฯ");
    } catch (error) {
      if (!controller.signal.aborted) {
        setSearchStatus("ค้นหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    }
  }

  function selectPlace(place) {
    const map = mapRef.current;
    if (!map) return;

    const [lng, lat] = place.geometry.coordinates;
    const position = [lat, lng];
    const label = getPlaceLabel(place);

    markerRef.current?.remove();

    markerRef.current = L.marker(position, {
      title: label,
      icon: L.divIcon({
        className: "",
        html: `<span style="display:block;width:18px;height:18px;background:#A54535;border:3px solid white;border-radius:50%;box-shadow:0 1px 5px #0008"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9],
      }),
    })
      .addTo(map)
      .bindPopup(textNode(label));

    map.setView(position, 16);
    markerRef.current.openPopup();

    setQuery(place.properties.name || label);
    setPlaces([]);
  }

  function resetView() {
    const map = mapRef.current;
    const bounds = boundsRef.current;
    if (map && bounds) map.fitBounds(bounds.pad(0.08));
  }

  return (
    <section className="mt-4 space-y-3">
      <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
        <input
          type="search"
          aria-label="ค้นหาสถานที่ในกรุงเทพฯ"
          placeholder="ค้นหาสถานที่ เช่น สยามพารากอน หรือ BTS อารีย์"
          value={query}
          onChange={(event) => {
            searchRequestRef.current?.abort();
            setQuery(event.target.value);
            setPlaces([]);
            setSearchStatus("");
          }}
          className="min-w-0 flex-1 rounded-lg border border-[#AAB8A1] bg-white px-3 py-2"
        />

        <button
          type="submit"
          disabled={!ready || !query.trim()}
          className="rounded-lg bg-[#536F4C] px-4 py-2 text-white disabled:opacity-50"
        >
          ค้นหา
        </button>

        <button
          type="button"
          onClick={resetView}
          disabled={!ready}
          className="rounded-lg border border-[#536F4C] px-4 py-2 text-[#455E40] disabled:opacity-50"
        >
          ดูทั้งกรุงเทพฯ
        </button>
      </form>

      {!ready && (
        <p role="status" className="text-sm text-[#79554B]">
          {mapError || "กำลังโหลดขอบเขตกรุงเทพฯ…"}
        </p>
      )}

      {searchStatus && (
        <p role="status" className="text-sm text-[#79554B]">
          {searchStatus}
        </p>
      )}

      {places.length > 0 && (
        <ul className="max-h-52 divide-y overflow-y-auto rounded-lg border border-[#D9DCCF] bg-white">
          {places.map((place, index) => (
            <li key={`${place.properties.osm_id ?? "place"}-${index}`}>
              <button
                type="button"
                onClick={() => selectPlace(place)}
                className="w-full px-3 py-2 text-left hover:bg-[#EEF3EA]"
              >
                {getPlaceLabel(place)}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={containerRef}
        role="region"
        aria-label="แผนที่กรุงเทพมหานคร"
        className="relative isolate h-[65vh] min-h-[360px] w-full overflow-hidden rounded-xl border border-[#D9DCCF]"
      />
    </section>
  );
}