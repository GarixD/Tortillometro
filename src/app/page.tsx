'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast, Toaster } from 'sonner'
import { MapPin, Star, Trash2, Menu, User, Plus, Egg, ExternalLink } from 'lucide-react'
import dynamic from 'next/dynamic'

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

// Componente del mapa cargado dinámicamente
const MapaBares = dynamic(() => import('@/components/MapaBares'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    </div>
  )
})

export default function Tortillometro() {
  // Estados
  const [bares, setBares] = useState<Bar[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [miNombre, setMiNombre] = useState<string>('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalNombre, setModalNombre] = useState(false)
  const [barSeleccionado, setBarSeleccionado] = useState<Bar | null>(null)
  const [nuevoBar, setNuevoBar] = useState({
    nombre: '',
    direccion: '',
    notaTortilla: 7,
    comentario: ''
  })
  const [coordenadasClick, setCoordenadasClick] = useState<{ lat: number; lng: number } | null>(null)

  // Cargar Leaflet CSS y nombre del localStorage
  useEffect(() => {
    setMounted(true)
    
    // Cargar CSS de Leaflet
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    
    // Cargar nombre del localStorage
    const nombreGuardado = localStorage.getItem('tortillometro_nombre')
    if (nombreGuardado) {
      setMiNombre(nombreGuardado)
    } else {
      setModalNombre(true)
    }
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link)
      }
    }
  }, [])

  // Guardar nombre
  const guardarNombre = () => {
    if (miNombre.trim().length < 2) {
      toast.error('El nombre debe tener al menos 2 caracteres')
      return
    }
    localStorage.setItem('tortillometro_nombre', miNombre.trim())
    setModalNombre(false)
    toast.success(`¡Hola ${miNombre}! Ya puedes añadir bares`)
  }

  // Cargar bares
  const cargarBares = useCallback(async () => {
    try {
      const response = await fetch('/api/bares')
      if (response.ok) {
        const data = await response.json()
        setBares(data)
      }
    } catch (error) {
      console.error('Error al cargar bares:', error)
      toast.error('Error al cargar los bares')
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar bares al inicio
  useEffect(() => {
    cargarBares()
  }, [cargarBares])

  // Función para obtener color según nota
  const getBarColor = (nota: number) => {
    if (nota >= 9) return '#22c55e'
    if (nota >= 7) return '#eab308'
    if (nota >= 5) return '#f97316'
    return '#ef4444'
  }

  // Click en el mapa
  const handleMapClick = (lat: number, lng: number) => {
    setCoordenadasClick({ lat, lng })
    setNuevoBar({ nombre: '', direccion: '', notaTortilla: 7, comentario: '' })
    setModalAbierto(true)
  }

  // Añadir nuevo bar
  const añadirBar = async () => {
    if (!coordenadasClick) return

    if (!nuevoBar.nombre.trim()) {
      toast.error('El nombre del bar es obligatorio')
      return
    }

    try {
      const response = await fetch('/api/bares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...nuevoBar,
          latitud: coordenadasClick.lat,
          longitud: coordenadasClick.lng,
          nombreUsuario: miNombre
        })
      })

      if (response.ok) {
        const bar = await response.json()
        setBares(prev => [bar, ...prev].sort((a, b) => b.notaTortilla - a.notaTortilla))
        setModalAbierto(false)
        toast.success('¡Bar añadido! 🥔')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Error al añadir el bar')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al añadir el bar')
    }
  }

  // Eliminar bar
  const eliminarBar = async (bar: Bar) => {
    if (!confirm(`¿Seguro que quieres eliminar "${bar.nombre}"?`)) return

    try {
      const response = await fetch(`/api/bares/${bar.id}?nombreUsuario=${encodeURIComponent(miNombre)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBares(prev => prev.filter(b => b.id !== bar.id))
        setBarSeleccionado(null)
        toast.success('Bar eliminado')
      } else {
        const error = await response.json()
        if (error.barOwner) {
          toast.error(`Este bar fue añadido por ${error.barOwner}. Solo él/ella puede eliminarlo.`)
        } else {
          toast.error(error.error || 'Error al eliminar')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar el bar')
    }
  }

  // Renderizar estrellas
  const renderEstrellas = (nota: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < nota ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  // Abrir en Google Maps
  const abrirEnGoogleMaps = (bar: Bar) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${bar.latitud},${bar.longitud}`, '_blank')
  }

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-orange-50 to-yellow-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-4 py-3 shadow-lg z-10">
        <div className="flex items-center justify-between max-w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <Egg className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Tortillómetro</h1>
              <p className="text-xs text-orange-100 hidden sm:block">La mejor tortilla, el mejor bar</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <User className="w-3 h-3 mr-1" />
              {miNombre || 'Sin identificar'}
            </Badge>
            
            {/* Panel lateral con ranking */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                  <Menu className="w-4 h-4 mr-2" />
                  Ranking
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2 text-orange-600">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    Ranking de Tortillas
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                  {bares.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Egg className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No hay bares todavía</p>
                      <p className="text-sm">¡Haz click en el mapa para añadir el primero!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bares.map((bar, index) => (
                        <Card 
                          key={bar.id} 
                          className={`cursor-pointer transition-all hover:shadow-md ${bar.nombreUsuario.toLowerCase() === miNombre.toLowerCase() ? 'ring-2 ring-orange-300' : ''}`}
                          onClick={() => setBarSeleccionado(bar)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={`text-lg font-bold ${index < 3 ? 'text-orange-500' : 'text-gray-400'}`}>
                                    #{index + 1}
                                  </span>
                                  <span className="font-semibold text-gray-800">{bar.nombre}</span>
                                </div>
                                {bar.direccion && (
                                  <p className="text-xs text-gray-500 mt-0.5">{bar.direccion}</p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  {renderEstrellas(bar.notaTortilla)}
                                  <span className="font-bold text-orange-600">{bar.notaTortilla}/10</span>
                                </div>
                                {bar.comentario && (
                                  <p className="text-xs text-gray-600 mt-1 italic">"{bar.comentario}"</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">
                                  Añadido por <span className="font-medium">{bar.nombreUsuario}</span>
                                </p>
                              </div>
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                style={{ backgroundColor: getBarColor(bar.notaTortilla) }}
                              >
                                {bar.notaTortilla}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Mapa */}
      <div className="flex-1 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando mapa...</p>
            </div>
          </div>
        ) : (
          <MapaBares 
            bares={bares} 
            onBarClick={setBarSeleccionado}
            onMapClick={handleMapClick}
          />
        )}
      </div>

      {/* Instrucciones flotantes */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 max-w-xs z-[1000]">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-orange-600">💡 Click en el mapa</span> para añadir un bar con su tortilla
        </p>
      </div>

      {/* Modal para configurar nombre */}
      <Dialog open={modalNombre} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <User className="w-5 h-5" />
              ¡Bienvenido al Tortillómetro!
            </DialogTitle>
            <DialogDescription>
              Para empezar, dinos cómo te llamas. Así podrás añadir bares y gestionar los tuyos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre">Tu nombre</Label>
              <Input
                id="nombre"
                value={miNombre}
                onChange={(e) => setMiNombre(e.target.value)}
                placeholder="Ej: Juan, María, Pepito..."
                className="mt-1"
                onKeyDown={(e) => e.key === 'Enter' && guardarNombre()}
              />
            </div>
            <Button onClick={guardarNombre} className="w-full bg-orange-500 hover:bg-orange-600">
              ¡Empezar!
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para añadir bar */}
      <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Plus className="w-5 h-5" />
              Añadir Bar
            </DialogTitle>
            <DialogDescription>
              Has seleccionado una ubicación. ¡Cuéntanos sobre la tortilla!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bar-nombre">Nombre del bar *</Label>
              <Input
                id="bar-nombre"
                value={nuevoBar.nombre}
                onChange={(e) => setNuevoBar(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Bar La Esquina"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bar-direccion">Dirección (opcional)</Label>
              <Input
                id="bar-direccion"
                value={nuevoBar.direccion}
                onChange={(e) => setNuevoBar(prev => ({ ...prev, direccion: e.target.value }))}
                placeholder="Ej: Calle Mayor, 15"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Nota de la tortilla: <span className="font-bold text-orange-600">{nuevoBar.notaTortilla}/10</span></Label>
              <Slider
                value={[nuevoBar.notaTortilla]}
                onValueChange={(value) => setNuevoBar(prev => ({ ...prev, notaTortilla: value[0] }))}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>😱 Terrible</span>
                <span>😋 Buenísima</span>
              </div>
            </div>
            <div>
              <Label htmlFor="bar-comentario">Comentario sobre la tortilla (opcional)</Label>
              <Textarea
                id="bar-comentario"
                value={nuevoBar.comentario}
                onChange={(e) => setNuevoBar(prev => ({ ...prev, comentario: e.target.value }))}
                placeholder="Ej: Poco hecha, perfecta para mojar pan..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setModalAbierto(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={añadirBar} className="flex-1 bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-1" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de info del bar seleccionado */}
      <Dialog open={!!barSeleccionado} onOpenChange={() => setBarSeleccionado(null)}>
        <DialogContent className="sm:max-w-md">
          {barSeleccionado && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-orange-600">
                  <MapPin className="w-5 h-5" />
                  {barSeleccionado.nombre}
                </DialogTitle>
                {barSeleccionado.direccion && (
                  <DialogDescription>
                    {barSeleccionado.direccion}
                  </DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4">
                {/* Nota grande */}
                <div className="flex items-center justify-center py-4">
                  <div 
                    className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: getBarColor(barSeleccionado.notaTortilla) }}
                  >
                    <span className="text-4xl font-bold">{barSeleccionado.notaTortilla}</span>
                    <span className="text-sm opacity-90">/10</span>
                  </div>
                </div>

                {/* Estrellas */}
                <div className="flex justify-center">
                  {renderEstrellas(barSeleccionado.notaTortilla)}
                </div>

                {/* Comentario */}
                {barSeleccionado.comentario && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm italic text-gray-700">"{barSeleccionado.comentario}"</p>
                  </div>
                )}

                {/* Añadido por */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Añadido por <strong>{barSeleccionado.nombreUsuario}</strong>
                  </span>
                  <span>{new Date(barSeleccionado.createdAt).toLocaleDateString('es-ES')}</span>
                </div>

                {/* Acciones */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => abrirEnGoogleMaps(barSeleccionado)}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Google Maps
                  </Button>
                  {barSeleccionado.nombreUsuario.toLowerCase() === miNombre.toLowerCase() ? (
                    <Button 
                      variant="destructive" 
                      onClick={() => eliminarBar(barSeleccionado)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      disabled
                      className="flex-1 opacity-50"
                      title={`Solo ${barSeleccionado.nombreUsuario} puede eliminar este bar`}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      No es tuyo
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
