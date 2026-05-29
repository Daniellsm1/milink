/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#F8FAFC",
        ink: "#0F172A",
        muted: "#64748B",
        line: "#E2E8F0",
        accent: "#10B981",
        accentSoft: "#D1FAE5",
        accentTint: "#ECFDF5",
        categoryBg: "#DCE1ED",
      },
      fontFamily: {
        quicksand: ["Quicksand_400Regular"],
        "quicksand-medium": ["Quicksand_500Medium"],
        "quicksand-semibold": ["Quicksand_600SemiBold"],
        "quicksand-bold": ["Quicksand_700Bold"],
      },
    },
  },
  plugins: [],
};