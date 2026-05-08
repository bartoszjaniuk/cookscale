import { useCallback, useState } from "react";
import { Appearance, useColorScheme } from "react-native";

export type ThemePreference = "light" | "dark" | "system";

export function useTheme() {
	const systemScheme = useColorScheme();
	const [preference, setPreference] = useState<ThemePreference>("system");

	// Keep "system" preference label in sync when OS theme changes
	const resolvedScheme = preference === "system" ? systemScheme : preference;

	const setTheme = useCallback((theme: ThemePreference) => {
		setPreference(theme);
		Appearance.setColorScheme(theme === "system" ? null : theme);
	}, []);

	return { preference, setTheme, resolvedScheme };
}
