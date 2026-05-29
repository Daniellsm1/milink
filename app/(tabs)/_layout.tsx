import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#1e293b" }}>
      <Tabs.Screen name="index" options={{ title: "Explorar" }} />
      <Tabs.Screen name="favorites" options={{ title: "Favoritos" }} />
      <Tabs.Screen name="publish" options={{ title: "Publicar" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
