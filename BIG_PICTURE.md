# MiLink App — Big Picture

> Plataforma móvil para alquiler de vehículos y propiedades entre miembros de las Fuerzas Militares.

---

## ¿Qué es MiLink?

Conecta militares que tienen vehículos en desuso con compañeros que necesitan transporte durante permisos o vacaciones. El militar propietario genera ingresos adicionales; el arrendatario accede a opciones asequibles y confiables dentro de la comunidad castrense.

---

## Stack tecnológico

| Capa               | Tecnología                        | Versión        |
|--------------------|-----------------------------------|----------------|
| Framework          | React Native + Expo               | 0.81.5 / 54.0.35 |
| Lenguaje           | TypeScript (strict)               | 5.9.2          |
| Estilos            | NativeWind + Tailwind CSS         | 4.2.4 / 3.4.17 |
| Navegación         | Expo Router                       | 6.0.24         |
| Backend / Auth / DB| Supabase                          | 2.106.2        |
| Data fetching      | TanStack React Query              | 5.100.14       |
| Formularios        | React Hook Form + Zod             | 7.76.1 / 4.4.3 |
| Imágenes           | expo-image + expo-image-picker    | ✓              |
| Notificaciones     | expo-notifications                | ✓              |
| Almacenamiento     | expo-secure-store                 | ✓              |
| Builds             | EAS Build (dev client, no Expo Go)| ✓              |

---

## Arquitectura de pantallas (MVP)

```
app/
├── _layout.tsx                  ← Root layout (Expo Router)
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx                ← Inicio de sesión (Supabase Auth)
│   └── register.tsx             ← Registro de usuario militar
├── (tabs)/
│   ├── _layout.tsx              ← Tab bar: Inicio | Explorar | Publicar | Perfil
│   ├── index.tsx                ← Home: carrusel nuevos + búsqueda rápida
│   ├── explore.tsx              ← Catálogo con filtros avanzados
│   ├── publish.tsx              ← Formulario publicar vehículo + 3 fotos
│   └── profile.tsx              ← Perfil dual arrendador / arrendatario
└── vehicle/
    └── [id].tsx                 ← Detalle vehículo + calendario + WhatsApp + Reservar
```

---

## Flujo principal del usuario

```
┌─────────────┐
│   Splash    │
└──────┬──────┘
       ▼
┌─────────────────────────────────────────┐
│  HOME                                   │
│  • Carrusel "Nuevos ingresos"           │
│  • Barra de búsqueda rápida (ciudad)    │
└───────────┬─────────────────────────────┘
            ▼
┌─────────────────────────────────────────┐
│  CATÁLOGO (Explorar)                    │
│  Filtros: ciudad · fechas · tipo ·      │
│           precio · favoritos            │
└───────────┬─────────────────────────────┘
            ▼
┌─────────────────────────────────────────┐
│  DETALLE VEHÍCULO                       │
│  • Galería de fotos (hasta 3)           │
│  • Ficha técnica completa               │
│  • Calendario de disponibilidad         │
│  • ⭐ Calificaciones y reseñas          │
│                                         │
│  [WhatsApp]           [Reservar]        │
│       │                    │            │
│  Abre WhatsApp        Verificación      │
│  con el propietario   militar →         │
│                       Confirmación      │
└─────────────────────────────────────────┘

PUBLICAR:
  Formulario vehículo (datos técnicos + 3 fotos)
  → Supabase Storage + tabla vehicles → visible en catálogo

PERFIL:
  Mis publicaciones | Mis reservas | Calificaciones recibidas
```

---

## Modelo de datos (Supabase)

### `users`
| Campo      | Tipo    | Notas                          |
|------------|---------|--------------------------------|
| id         | uuid PK | generado por Supabase Auth     |
| nombre     | text    |                                |
| cedula     | text    | identificación militar         |
| telefono   | text    | usado para WhatsApp            |
| rol        | enum    | arrendador · arrendatario · ambos |

### `vehicles`
| Campo               | Tipo    | Notas                                      |
|---------------------|---------|--------------------------------------------|
| id                  | uuid PK |                                            |
| owner_id            | uuid FK | → users.id                                 |
| marca               | text    | ej. Toyota, Chevrolet                      |
| modelo              | text    | ej. Corolla, Spark                         |
| año                 | int     |                                            |
| color               | text    |                                            |
| tipo_caja           | enum    | automatico · manual                        |
| kilometraje         | int     | km actuales                                |
| num_puertas         | int     | 2, 4, 5                                    |
| num_pasajeros       | int     | capacidad                                  |
| motor_cc            | int     | cilindraje en cc                           |
| combustible         | enum    | gasolina · diesel · eléctrico · híbrido   |
| aire_acondicionado  | boolean |                                            |
| soat_vigente        | boolean |                                            |
| tecnomecanica_vigente| boolean|                                            |
| ciudad              | text    |                                            |
| precio_dia          | numeric | en COP                                     |
| descripcion         | text    |                                            |
| fotos               | text[]  | URLs en Supabase Storage (máx. 3)          |
| disponible          | boolean |                                            |

### `availability`
| Campo        | Tipo    | Notas                  |
|--------------|---------|------------------------|
| id           | uuid PK |                        |
| vehicle_id   | uuid FK | → vehicles.id          |
| fecha_inicio | date    |                        |
| fecha_fin    | date    |                        |
| disponible   | boolean |                        |

### `reservations`
| Campo                | Tipo    | Notas                              |
|----------------------|---------|------------------------------------|
| id                   | uuid PK |                                    |
| vehicle_id           | uuid FK | → vehicles.id                      |
| arrendatario_id      | uuid FK | → users.id                         |
| fecha_inicio         | date    |                                    |
| fecha_fin            | date    |                                    |
| estado               | enum    | pendiente · confirmada · cancelada |
| verificacion_militar | boolean | solo se pide al reservar           |

### `reviews`
| Campo          | Tipo    | Notas                |
|----------------|---------|----------------------|
| id             | uuid PK |                      |
| reservation_id | uuid FK | → reservations.id    |
| calificador_id | uuid FK | → users.id           |
| calificado_id  | uuid FK | → users.id           |
| estrellas      | int     | 1–5                  |
| comentario     | text    |                      |

---

## Orden de construcción (MVP)

| # | Módulo                     | Descripción                                              |
|---|----------------------------|----------------------------------------------------------|
| 1 | Expo Router + navegación   | Crear carpeta `app/`, layouts, tab bar, rutas base       |
| 2 | Supabase cliente + Auth    | Login, registro, tipos TS generados (`supabase gen types`) |
| 3 | Home Screen                | Carrusel nuevos vehículos + búsqueda por ciudad          |
| 4 | Catálogo + filtros         | Lista vehículos con filtros ciudad / fechas / tipo / precio |
| 5 | Detalle vehículo           | Galería, ficha técnica, calendario, reseñas, botones     |
| 6 | Pantalla Publicar          | Formulario (React Hook Form + Zod) + carga 3 fotos       |
| 7 | Perfil dual                | Tabs: Arrendador / Arrendatario / Calificaciones         |
| 8 | Verificación militar       | Modal/flow al presionar Reservar                         |
| 9 | Calificaciones y reseñas   | Post-reserva, sistema de estrellas                       |
|10 | Push notifications         | expo-notifications + Supabase Edge Functions             |

---

## Estado actual del código

```
✅ Scaffold Expo 54 + TypeScript + NativeWind configurado y funcionando
✅ EAS Build configurado (dev / preview / production)
✅ Dependencias instaladas (Supabase, React Query, React Hook Form, Zod, etc.)
⬜ carpeta app/ (Expo Router) — por crear
⬜ Integración Supabase
⬜ Pantallas y componentes
⬜ Lógica de negocio
```

---

## Requisitos no funcionales

- **Idioma:** Español colombiano
- **Usuarios objetivo:** Personal militar con poca experiencia tecnológica → UI simple y directa
- **Plataformas:** Android (prioritario) + iOS
- **Escalabilidad:** Arquitectura preparada para sumar inmuebles en iteraciones futuras sin reescribir el núcleo
- **Seguridad:** Autenticación Supabase, verificación de identidad militar solo al reservar
