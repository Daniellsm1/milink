# Contexto del Proyecto y Análisis

## 1. Resumen ejecutivo

es una aplicación pensada para conectar a miembros de las Fuerzas Militares de Colombia que poseen vehículos en desuso con otros militares que necesitan transporte durante sus permisos o vacaciones. 

## 2. Problema identificado

- No existe una plataforma centralizada que conecte a militares que ofrecen y militares que buscan alquileres de vehículos.
- El personal militar tiene dificultad para encontrar opciones de alquiler asequibles y confiables durante permisos y vacaciones, especialmente en zonas alejadas de las grandes ciudades.
- Existen vehículos en propiedad del personal militar que permanecen ociosos durante los periodos de servicio, representando un activo desaprovechado.

## 3. Objetivos

### Objetivo general

Desarrollar e implementar una aplicación que optimice el uso de recursos entre miembros de las Fuerzas Militares mediante un sistema seguro,eficiente y movil responsivo de alquiler de vehículos (y a futuro, propiedades).

#### Prioritarios (MVP)

1. Registro y verificación de identidad militar solo despues de darle click al boton de reservar.
2. Perfil dual: usuario puede ser arrendador, arrendatario, o ambos.
3. Catálogo de vehículos con filtros (ciudad, fechas, tipo, precio, favoritos).
4. Calendario de disponibilidad por vehículo.
5. carrusel de nuevos ingresos en la pantalla principal
6. botan de mensajeria directa con elpropietario por medio de whatsapp
7. Calificaciones y reseñas.
8. Notificaciones push.
9. boton de publicar el cual me lleva a pantalla con un formulario que piden todos los datos del vehiculo a arrendar y la posibilidad de cargar 3 fotos del mismo
10. pantalla de detalles del automovil 

#### Opcionales / no prioritarios (futuras iteraciones)

- Generación de contrato digital y firma electrónica.
- Panel de soporte y disputas.
- Geolocalización del vehículo para ubicación de entrega.
- Histórico de transacciones y facturación.

### 9.6 Requisitos no funcionales sugeridos

- **Disponibilidad:** objetivo razonable inicial 99 %, con plan de crecimiento.
- **Escalabilidad:** arquitectura preparada para sumar inmuebles posteriormente sin reescribir el núcleo.
- **Usabilidad:** la app debe ser usable por personal con poca experiencia tecnológica; pruebas con soldados profesionales son clave.
- **Localización:** español colombiano; preparado para soportar regionalismos militares.

### 9.7 Stack tecnológico seleccionado

 **Framework principal:** **React Native con Expo**. Permite escribir un solo código en JavaScript/TypeScript y compilar de forma nativa para ambas plataformas.
- **Lenguaje de programación:** **TypeScript**, asegurando un código ordenado y libre de errores tipográficos.
- **Backend y base de datos:** **Supabase**. Se reutiliza al 100 % la lógica, tablas, autenticación y almacenamiento de imágenes ya estructurada previamente.
- **Estilos y diseño:** **NativeWind**, que permite aplicar clases de Tailwind CSS directamente sobre los componentes nativos del celular.