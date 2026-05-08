import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";

export default function RootLayout() {
	const scheme = useColorScheme();
	const isDark = scheme === "dark";

	return (
		<>
			<StatusBar style={isDark ? "light" : "dark"} />
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor: isDark ? "#111827" : "#ffffff",
					},
					headerTintColor: isDark ? "#ffffff" : "#111827",
					headerShadowVisible: false,
					contentStyle: {
						backgroundColor: isDark ? "#030712" : "#f9fafb",
					},
				}}
			/>
		</>
	);
}
