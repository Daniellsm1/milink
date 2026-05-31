// Contenido legal para renderizar en la pantalla de aceptación (Paso 1 de Publicar).
// Espejo fiel de assets/legal/terminos_condiciones_publicacion.md (documento canónico).
// Se estructura para renderizado nativo sin depender de un parser de Markdown.

export type LegalBlock = { tipo: "parrafo" | "vineta"; texto: string };
export type LegalSection = { titulo: string; bloques: LegalBlock[] };

export const TERMINOS_SECCIONES: LegalSection[] = [
  {
    titulo: "Términos y Condiciones de Uso — Milink",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "1. Aceptación: El uso de la plataforma Milink implica la aceptación plena de estos términos. Solo se permite el registro a mayores de 18 años.",
      },
      {
        tipo: "parrafo",
        texto:
          "2. Naturaleza del Servicio: Milink es un marketplace que facilita el contacto entre usuarios. Milink no es propietario, arrendador, ni agente de seguros. Toda relación contractual, pago, inspección de bienes o resolución de controversias es responsabilidad exclusiva de los usuarios involucrados.",
      },
      {
        tipo: "parrafo",
        texto:
          "3. Verificación de Antecedentes: La plataforma no realiza verificaciones de antecedentes integradas. La consulta de antecedentes (ej. Procuraduría, Policía, etc.) es responsabilidad directa y autónoma de cada usuario.",
      },
      { tipo: "parrafo", texto: "4. Publicación de Bienes:" },
      {
        tipo: "vineta",
        texto:
          "Responsabilidad: El usuario (\"Arrendador\") garantiza que posee la titularidad o autorización para alquilar el bien. La información (fotos, descripciones, estado) es responsabilidad única del Arrendador.",
      },
      {
        tipo: "vineta",
        texto:
          "Licencia: El Arrendador otorga a Milink una licencia para exhibir el contenido del activo dentro de la plataforma.",
      },
      {
        tipo: "vineta",
        texto:
          "Privacidad de la Ubicación: Milink recomienda no publicar direcciones exactas o placas completas. El Arrendador asume la responsabilidad de la información que decide hacer pública.",
      },
      {
        tipo: "vineta",
        texto:
          "Prohibiciones: Está prohibido publicar bienes con limitaciones legales, fotos de terceros sin autorización o para fines ilícitos.",
      },
      {
        tipo: "parrafo",
        texto:
          "5. Exención de Responsabilidad e Indemnidad: Milink no responde por la veracidad de la información, accidentes, multas o incumplimientos contractuales. El Arrendador acepta mantener a Milink (Daniel López) indemne frente a cualquier reclamación, multa o daño derivado de la falsedad de la información publicada o disputas legales sobre el bien.",
      },
      {
        tipo: "parrafo",
        texto:
          "6. Modificaciones: Milink podrá actualizar estos términos, notificando a los usuarios vía correo electrónico.",
      },
    ],
  },
  {
    titulo: "Política de Tratamiento de Datos Personales — Milink",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "1. Responsable del Tratamiento: Daniel López. Contacto: millinkofficial@gmail.com.",
      },
      {
        tipo: "parrafo",
        texto:
          "2. Datos Recolectados: Nombre completo, correo electrónico, número telefónico e información de los activos listados (descripciones de vehículos/propiedades, fotografías y ubicación).",
      },
      {
        tipo: "parrafo",
        texto:
          "3. Finalidad: El tratamiento de los datos tiene como fin habilitar el funcionamiento de la plataforma, permitir el contacto entre usuarios y enviar notificaciones de servicio.",
      },
      {
        tipo: "parrafo",
        texto:
          "4. Datos de los Bienes: La información suministrada sobre vehículos y propiedades es tratada bajo la exclusiva responsabilidad del Arrendador. Milink no verifica la titularidad ni el estado de los mismos.",
      },
      {
        tipo: "parrafo",
        texto:
          "5. Seguridad: Los datos personales y de activos son almacenados en bases de datos cifradas bajo los estándares de seguridad de la infraestructura de Supabase, garantizando medidas técnicas para evitar el acceso no autorizado.",
      },
      {
        tipo: "parrafo",
        texto:
          "6. Derechos del Titular: Usted tiene derecho a conocer, actualizar, rectificar y suprimir sus datos personales. Si desea ejercer estos derechos, solicite la acción a través del correo millinkofficial@gmail.com.",
      },
      {
        tipo: "parrafo",
        texto:
          "7. Supresión Segura: En caso de solicitar la eliminación de su cuenta, Milink procederá a la supresión de sus datos de los servidores activos. Ante requerimientos de eliminación forense, se ejecutará el borrado lógico y la limpieza de los registros vinculados al usuario.",
      },
      {
        tipo: "parrafo",
        texto:
          "8. Terceros: Milink no comercializa, transfiere ni comparte datos personales con terceros para fines comerciales.",
      },
    ],
  },
  {
    titulo: "Anexo I: Términos para la Publicación de Bienes",
    bloques: [
      {
        tipo: "parrafo",
        texto:
          "1. Responsabilidad sobre el Contenido: Al publicar un vehículo o propiedad en la plataforma Milink, el Arrendador garantiza que:",
      },
      {
        tipo: "vineta",
        texto:
          "Es el propietario legal del bien o cuenta con la autorización expresa y vigente del titular para ofrecer el alquiler a través de terceros.",
      },
      {
        tipo: "vineta",
        texto:
          "La información suministrada (descripción, estado físico, fotografías y características técnicas) es veraz, completa, actualizada y no induce a error.",
      },
      {
        tipo: "vineta",
        texto:
          "El bien se encuentra en condiciones legales y técnicas adecuadas para su uso y explotación económica conforme a la normativa colombiana.",
      },
      {
        tipo: "parrafo",
        texto:
          "2. Licencia de Contenido: El Arrendador otorga a Milink una licencia gratuita, no exclusiva y transferible para visualizar, procesar y exhibir el contenido dentro de la aplicación, con el único fin de facilitar el contacto entre usuarios.",
      },
      {
        tipo: "parrafo",
        texto:
          "3. Privacidad y Seguridad de la Ubicación: El Arrendador decide qué nivel de detalle de ubicación comparte. Milink recomienda no publicar direcciones exactas o placas completas, y se reserva el derecho de anonimizar datos de ubicación en la interfaz pública.",
      },
      {
        tipo: "parrafo",
        texto:
          "4. Prohibiciones y Contenido Inapropiado: Está prohibido publicar bienes sin documentación en regla o con limitaciones de dominio, con fotografías de terceros sin autorización, o para actividades ilícitas. La detección resultará en la eliminación inmediata del anuncio y el bloqueo permanente del usuario, sin derecho a indemnización.",
      },
      {
        tipo: "parrafo",
        texto:
          "5. Cláusula de Indemnidad: El Arrendador acepta mantener a Milink (Daniel López) indemne frente a cualquier reclamación, demanda, multa o daño (incluyendo honorarios legales) derivado de la falsedad de la información, conflictos de titularidad/estado del bien, o incumplimiento de derechos de propiedad intelectual sobre las fotografías o descripciones.",
      },
    ],
  },
];

// Casillas obligatorias: el botón "Continuar" se habilita solo cuando todas
// están marcadas.
export const TERMINOS_CHECKBOXES: { id: string; texto: string }[] = [
  {
    id: "terminos",
    texto: "He leído y acepto los Términos y Condiciones de Uso de Milink.",
  },
  {
    id: "privacidad",
    texto:
      "Acepto la Política de Tratamiento de Datos Personales.",
  },
  {
    id: "titularidad",
    texto:
      "Soy mayor de edad y declaro ser propietario(a) o tener autorización para publicar el bien, y que la información es veraz.",
  },
];
