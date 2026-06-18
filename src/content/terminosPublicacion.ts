// Casillas obligatorias del paso 1 de Publicar. El documento legal completo se
// carga directamente desde assets/legal/terminos_condiciones_publicacion.md
// dentro de la pantalla, así que esta lista vive aquí únicamente para que el
// botón "Continuar" solo se habilite cuando todas estén marcadas.

export const TERMINOS_CHECKBOXES: { id: string; texto: string }[] = [
  {
    id: "terminos",
    texto: "He leído y acepto los Términos y Condiciones de Uso de Milink.",
  },
  {
    id: "privacidad",
    texto: "Acepto la Política de Tratamiento de Datos Personales.",
  },
  {
    id: "titularidad",
    texto:
      "Soy mayor de edad y declaro ser propietario(a) o tener autorización para publicar el bien, y que la información es veraz.",
  },
];
