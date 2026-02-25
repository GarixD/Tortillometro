# 🥔 TORTILLÓMETRO - Guía de Instalación

## Pasos para tener tu app funcionando en Vercel (GRATIS)

### Paso 1: Crear cuenta en Neon (Base de datos GRATIS)
1. Ve a https://neon.tech
2. Clic en "Sign up" (registrarse)
3. Crea un proyecto nuevo
4. Copia la "Connection string" (algo como: `postgresql://usuario:password@ep-xxx.neon.tech/neondb?sslmode=require`)

### Paso 2: Subir a Vercel
1. Ve a https://vercel.com
2. Clic en "Sign up" (puedes usar tu cuenta de GitHub)
3. Clic en "Add New..." → "Project"
4. Puedes:
   - Opción A: Arrastrar la carpeta del proyecto
   - Opción B: Subir el proyecto a GitHub y conectarlo

### Paso 3: Configurar variable de entorno
En Vercel:
1. Ve a tu proyecto → Settings → Environment Variables
2. Añade:
   - Name: `DATABASE_URL`
   - Value: (la connection string que copiaste de Neon)
3. Clic en "Save"

### Paso 4: Inicializar base de datos
1. En Vercel, ve a "Deployments"
2. Cada vez que hagas deploy, Prisma se ejecutará automáticamente
3. Si hay problemas, ve a la terminal de Vercel y ejecuta: `npx prisma db push`

### Paso 5: ¡Listo!
Tu app estará en: `https://tu-proyecto.vercel.app`

---

## ¿Problemas?

### Error de base de datos
Asegúrate de que DATABASE_URL está bien configurada en Vercel.

### El mapa no carga
El mapa usa OpenStreetMap, no necesita configuración.

---

¡Disfruta buscando la mejor tortilla! 🍳
