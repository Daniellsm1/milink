import { MarkdownDoc } from "../../src/components/MarkdownDoc";

export default function PreguntasFrecuentes() {
  return (
    <MarkdownDoc
      source={require("../../assets/docs/04_Preguntas_Frecuentes.md")}
    />
  );
}
