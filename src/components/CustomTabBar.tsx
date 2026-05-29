import { Pressable, Text, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LayoutGrid, Heart, PlusCircle, User, type IconProps } from "./icons";
import { COLORS } from "../theme/colors";

type TabMeta = {
  label: string;
  Icon: (p: IconProps) => React.ReactElement;
  center?: boolean;
};

const TABS: Record<string, TabMeta> = {
  index: { label: "Explorar", Icon: LayoutGrid },
  favorites: { label: "Favoritos", Icon: Heart },
  publish: { label: "Publicar", Icon: PlusCircle, center: true },
  profile: { label: "Perfil", Icon: User },
};

export function CustomTabBar({
  state,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <BlurView
      intensity={20}
      tint="light"
      className="absolute bottom-0 left-0 right-0 px-3 pt-2 border-t border-line overflow-hidden"
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
        backgroundColor: "rgba(255,255,255,0.85)",
      }}
    >
      <View className="flex-row items-center justify-around">
        {state.routes.map((route, index) => {
          const meta = TABS[route.name];
          if (!meta) return null;
          const isFocused = state.index === index;
          const color = isFocused ? COLORS.accent : COLORS.muted;
          const { Icon } = meta;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (meta.center) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={meta.label}
                className="items-center gap-0.5 -mt-5"
              >
                <View
                  className="w-12 h-12 rounded-2xl items-center justify-center bg-accent"
                  style={{
                    shadowColor: COLORS.accent,
                    shadowOpacity: 0.45,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 6 },
                    elevation: 8,
                  }}
                >
                  <PlusCircle size={26} color={COLORS.white} />
                </View>
                <Text className="text-[10px] font-quicksand-bold text-accent">
                  {meta.label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              hitSlop={8}
              className="items-center gap-0.5 py-1 px-2"
            >
              <Icon size={21} color={color} />
              <Text
                className="text-[10px] font-quicksand-semibold"
                style={{ color }}
              >
                {meta.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </BlurView>
  );
}
