import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// DELETE - Eliminar un bar (solo si eres quien lo creó)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = new URL(request.url)
    const nombreUsuario = url.searchParams.get('nombreUsuario')

    if (!nombreUsuario) {
      return NextResponse.json({ error: 'Se requiere tu nombre para verificar' }, { status: 400 })
    }

    // Buscar el bar
    const bar = await db.bar.findUnique({
      where: { id }
    })

    if (!bar) {
      return NextResponse.json({ error: 'Bar no encontrado' }, { status: 404 })
    }

    // Verificar que el usuario es quien creó el bar
    if (bar.nombreUsuario.toLowerCase() !== nombreUsuario.toLowerCase()) {
      return NextResponse.json({ 
        error: 'Solo puedes eliminar los bares que tú has añadido',
        barOwner: bar.nombreUsuario 
      }, { status: 403 })
    }

    // Eliminar el bar
    await db.bar.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Bar eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar bar:', error)
    return NextResponse.json({ error: 'Error al eliminar bar' }, { status: 500 })
  }
}
