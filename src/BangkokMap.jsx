import { MapContainer, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"

export default function BangkokMap() {
  return (
    <MapContainer
      center={[13.7563, 100.5018]}
      zoom={11}
      scrollWheelZoom={true}
      className="relative z-0 mt-4 h-[320px] w-full rounded-xl"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
    </MapContainer>
  )
}