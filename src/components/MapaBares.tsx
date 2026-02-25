'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

interface Bar {
  id: string
  nombre: string
  direccion: string | null
  latitud: number
  longitud: number
  notaTortilla: number
  comentario: string | null
  nombreUsuario: string
  createdAt: string
}

interface MapaBaresProps {
  bares: Bar[]
  onBarClick: (bar: Bar) => void
  onMapClick: (lat: number, lng: number) => void
}

// Componente para manejar eventos del mapa
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Función para obtener color según nota
function getBarColor(nota: number) {
  if (nota >= 9) return '#22c55e'
  if (nota >= 7) return '#eab308'
  if (nota >= 5) return '#f97316'
  return '#ef4444'
}

// Función para crear icono personalizado
function createIcon(nota: number) {
  const color = getBarColor(nota)
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        color: white;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${nota}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

export default function MapaBares({ bares, onBarClick, onMapClick }: MapaBaresProps) {
  // Centrar en Madrid por defecto
  const center: [number, number] = useMemo(() => [40.4168, -3.7038], [])

  // Crear iconos para cada bar (memoizado)
  const markers = useMemo(() => {
    return bares.map(bar => ({
      ...bar,
      icon: createIcon(bar.notaTortilla)
    }))
  }, [bares])

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onMapClick={onMapClick} />
      {markers.map(bar => (
        <Marker
          key={bar.id}
          position={[bar.latitud, bar.longitud]}
          icon={bar.icon}
          eventHandlers={{
            click: () => onBarClick(bar)
          }}
        >
          <Popup>
            <div className="p-1 min-w-[150px]">
              <p className="font-bold text-gray-800">{bar.nombre}</p>
              <p className="text-lg font-bold text-orange-500">{bar.notaTortilla}/10</p>
              <p className="text-xs text-gray-500">por {bar.nombreUsuario}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
