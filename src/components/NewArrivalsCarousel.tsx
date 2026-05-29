import { FlatList } from "react-native";
import { NewArrivalCard } from "./NewArrivalCard";
import type { NuevaEntrada } from "../data/mock";

type Props = {
  data: NuevaEntrada[];
  onPressItem?: (item: NuevaEntrada) => void;
};

const CARD_WIDTH = 200;
const GAP = 12;

export function NewArrivalsCarousel({ data, onPressItem }: Props) {
  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={CARD_WIDTH + GAP}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: 20, gap: GAP }}
      renderItem={({ item }) => (
        <NewArrivalCard item={item} onPress={() => onPressItem?.(item)} />
      )}
    />
  );
}
