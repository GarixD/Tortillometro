import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Obtener todos los bares
export async function GET() {
  try {
    const bares = await db.bar.findMany({
      orderBy: [
        { notaTortilla: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    return NextResponse.json(bares)
  } catch (error) {
    console.error('Error al obtener bares:', error)
    return NextResponse.json({ error: 'Error al obtener bares' }, { status: 500 })
  }
}

// POST - Crear nuevo bar
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, direccion, latitud, longitud, notaTortilla, comentario, nombreUsuario } = body

    // Validaciones
    if (!nombre || !latitud || !longitud || !notaTortilla || !nombreUsuario) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (notaTortilla < 1 || notaTortilla > 10) {
      return NextResponse.json({ error: 'La nota debe estar entre 1 y 10' }, { status: 400 })
    }

    const bar = await db.bar.create({
      data: {
        nombre,
        direccion: direccion || null,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        notaTortilla: parseInt(notaTortilla),
        comentario: comentario || null,
        nombreUsuario
      }
    })

    return NextResponse.json(bar, { status: 201 })
  } catch (error: unknown) {
    console.error('Error al crear bar:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: 'Error al crear bar', detalle: errorMessage }, { status: 500 })
  }
}
