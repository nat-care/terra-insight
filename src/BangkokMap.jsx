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

const EMPTY_RECOMMENDATIONS = [];

const districtStyle = {
  color: "#416342",
  weight: 2,
  fillColor: "#73966D",
  fillOpacity: 0.1,
};

const highlightedStyle = {
  color: "#A54535",
  weight: 3,
  fillColor: "#C77F83",
  fillOpacity: 0.2,
};

const selectedDistrictStyle = {
  color: "#1D4ED8",
  weight: 3,
  fillOpacity: 0,
};

function normalizeDistrictName(name) {
  return String(name ?? "").normalize("NFC").trim().replace(/^เขต\s*/, "");
}

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

function placeSearchPin(map, markerRef, { lat, lng }, label) {
  const coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  const googleMapsUrl = new URL("https://www.google.com/maps/search/");
  googleMapsUrl.searchParams.set("api", "1");
  googleMapsUrl.searchParams.set("query", label);

  const placeLink = document.createElement("a");
  placeLink.href = googleMapsUrl.toString();
  placeLink.textContent = label;
  placeLink.target = "_blank";
  placeLink.rel = "noopener noreferrer";
  placeLink.className = "font-semibold underline";
  placeLink.setAttribute(
    "aria-label",
    `ค้นหา ${label} ใน Google Maps (เปิดในแท็บใหม่)`,
  );

  const popupContent = document.createElement("div");
  const coordinateLine = document.createElement("div");
  coordinateLine.textContent = `พิกัด ${coordinates}`;
  popupContent.append(placeLink, coordinateLine);

  markerRef.current?.remove();

  const marker = L.marker([lat, lng], {
    title: label,
    alt: label,
    icon: L.divIcon({
      className: "",
      html: '<span style="display:block;width:18px;height:18px;box-sizing:border-box;background:#A54535;border:3px solid white;border-radius:50%;box-shadow:0 1px 5px #0008"></span>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -9],
    }),
  })
    .addTo(map)
    .bindPopup(popupContent);

  markerRef.current = marker;
  return marker;
}

export default function BangkokMap({
  recommendations = EMPTY_RECOMMENDATIONS,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const boundaryRef = useRef(null);
  const boundsRef = useRef(null);
  const markerRef = useRef(null);
  const searchRequestRef = useRef(null);
  const districtLayersRef = useRef(new Map());
  const highlightedLayersRef = useRef(new Set());
  const selectedDistrictRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [districtStatus, setDistrictStatus] = useState("");
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [searchStatus, setSearchStatus] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const districtLayers = districtLayersRef.current;
    const highlightedLayers = highlightedLayersRef.current;

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
        if (controller.signal.aborted) return;

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
          style: {
            ...districtStyle,
            className: "bangkok-district",
          },
          onEachFeature(feature, layer) {
            const name = normalizeDistrictName(feature.properties.name_th);

            districtLayers.set(name, layer);
            layer.bindTooltip(textNode(`เขต${name}`), { sticky: true });

            layer.on("click", () => {
              const previous = selectedDistrictRef.current;

              if (previous && previous !== layer) {
                previous.setStyle(
                  highlightedLayers.has(previous)
                    ? highlightedStyle
                    : districtStyle,
                );
              }

              selectedDistrictRef.current = layer;
              layer.setStyle(selectedDistrictStyle);
              layer.bringToFront();
            });

            layer.on("mouseover", () => {
              if (
                layer !== selectedDistrictRef.current &&
                !highlightedLayers.has(layer)
              ) {
                layer.setStyle({ weight: 3, fillOpacity: 0.25 });
              }
            });

            layer.on("mouseout", () => {
              if (layer === selectedDistrictRef.current) return;

              layer.setStyle(
                highlightedLayers.has(layer) ? highlightedStyle : districtStyle,
              );
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
      } catch {
        if (!controller.signal.aborted) {
          setMapError(
            "โหลดแผนที่กรุงเทพฯ ไม่สำเร็จ กรุณารีเฟรชหน้าแล้วลองใหม่",
          );
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
      selectedDistrictRef.current = null;
      districtLayers.clear();
      highlightedLayers.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;

    const districtLayers = districtLayersRef.current;
    const highlightedLayers = highlightedLayersRef.current;
    const hadHighlights = highlightedLayers.size > 0;

    highlightedLayers.forEach((layer) => layer.setStyle(districtStyle));
    highlightedLayers.clear();

    const resultBounds = L.latLngBounds([]);
    const unmatched = [];

    for (const area of recommendations) {
      const districtName = normalizeDistrictName(area.district);
      const areaName = normalizeDistrictName(area.name);
      const layer =
        districtLayers.get(districtName) ?? districtLayers.get(areaName);

      if (!layer) {
        unmatched.push(districtName || areaName || "ไม่ระบุชื่อพื้นที่");
        continue;
      }

      highlightedLayers.add(layer);
      layer.setStyle(highlightedStyle);
      layer.bringToFront();
      resultBounds.extend(layer.getBounds());
    }

    const selectedDistrict = selectedDistrictRef.current;

    if (selectedDistrict) {
      selectedDistrict.setStyle(selectedDistrictStyle);
      selectedDistrict.bringToFront();
    }

    setDistrictStatus(
      unmatched.length
        ? `ไม่พบเขตบนแผนที่สำหรับ ${[...new Set(unmatched)].join(", ")}`
        : "",
    );

    if (resultBounds.isValid()) {
      map.closePopup();
      map.fitBounds(resultBounds, {
        padding: [24, 24],
        maxZoom: 15,
      });
    } else if (hadHighlights && boundsRef.current) {
      map.fitBounds(boundsRef.current.pad(0.08));
    }
  }, [ready, recommendations]);

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
      if (controller.signal.aborted) return;

      const matches = data.features.filter(
        (place) =>
          place.geometry?.type === "Point" &&
          booleanPointInPolygon(place.geometry.coordinates, boundary),
      );

      setPlaces(matches);
      setSearchStatus(matches.length ? "" : "ไม่พบสถานที่นี้ในกรุงเทพฯ");
    } catch {
      if (!controller.signal.aborted) {
        setSearchStatus("ค้นหาไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
    }
  }

  function selectPlace(place) {
    const map = mapRef.current;
    if (!map) return;

    const [lng, lat] = place.geometry.coordinates;
    const label = getPlaceLabel(place);
    const marker = placeSearchPin(map, markerRef, { lat, lng }, label);

    map.setView([lat, lng], 16);
    marker.openPopup();

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

      {districtStatus && (
        <p role="status" className="text-sm text-[#79554B]">
          {districtStatus}
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

      {ready && (
        <p className="text-sm text-[#79554B]">
          คลิกบนแผนที่เพื่อเลือกเขต
        </p>
      )}

      <div
        ref={containerRef}
        role="region"
        aria-label="แผนที่กรุงเทพมหานคร"
        className="relative isolate h-[65vh] min-h-[360px] w-full overflow-hidden rounded-xl border border-[#D9DCCF] [&_.bangkok-district:focus]:outline-none [&_.bangkok-district:focus-visible]:stroke-blue-700 [&_.bangkok-district:focus-visible]:stroke-[3px]"
      />
    </section>
  );
}