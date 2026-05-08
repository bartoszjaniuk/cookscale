import { Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import { clsx } from "clsx";

import { Pressable, ScrollView, Text, View } from "../tw";
import { useTheme, type ThemePreference } from "../hooks/useTheme";

const THEME_OPTIONS: { label: string; value: ThemePreference; icon: string }[] =
	[
		{ label: "Light", value: "light", icon: "☀️" },
		{ label: "Dark", value: "dark", icon: "🌙" },
		{ label: "System", value: "system", icon: "⚙️" },
	];

export default function Index() {
	const { preference, setTheme, resolvedScheme } = useTheme();

	const handleSelect = (theme: ThemePreference) => {
		if (process.env.EXPO_OS === "ios") {
			Haptics.selectionAsync();
		}
		setTheme(theme);
	};

	return (
		<>
			<Stack.Screen options={{ title: "Settings" }} />
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				className="flex-1 bg-gray-50 dark:bg-gray-950"
				contentContainerClassName="p-4 gap-6"
			>
				{/* Appearance section */}
				<View className="gap-2">
					<Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">
						Appearance
					</Text>

					<View className="bg-white dark:bg-gray-900 rounded-2xl p-4 gap-4">
						{/* Segmented control */}
						<View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
							{THEME_OPTIONS.map((option) => {
								const isSelected = preference === option.value;
								return (
									<Pressable
										key={option.value}
										onPress={() => handleSelect(option.value)}
										className={clsx(
											"flex-1 py-2.5 rounded-lg items-center gap-1",
											isSelected
												? "bg-white dark:bg-gray-700"
												: "bg-transparent",
										)}
										style={
											isSelected
												? {
														boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
														borderCurve: "continuous",
													}
												: undefined
										}
									>
										<Text className="text-base">{option.icon}</Text>
										<Text
											className={clsx(
												"text-xs font-semibold",
												isSelected
													? "text-gray-900 dark:text-white"
													: "text-gray-500 dark:text-gray-400",
											)}
										>
											{option.label}
										</Text>
									</Pressable>
								);
							})}
						</View>

						{/* Active scheme indicator */}
						<View className="flex-row items-center gap-2 px-1">
							<View
								className={clsx(
									"w-2 h-2 rounded-full",
									resolvedScheme === "dark" ? "bg-blue-400" : "bg-yellow-400",
								)}
							/>
							<Text className="text-sm text-gray-500 dark:text-gray-400">
								{resolvedScheme === "dark" ? "Dark" : "Light"} mode is active
							</Text>
						</View>
					</View>
				</View>

				{/* Preview card */}
				<View className="gap-2">
					<Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest px-1">
						Preview
					</Text>
					<View
						className="bg-white dark:bg-gray-900 rounded-2xl p-5 gap-3"
						style={{
							boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
							borderCurve: "continuous",
						}}
					>
						<View className="gap-1">
							<Text className="text-base font-semibold text-gray-900 dark:text-white">
								Sample content
							</Text>
							<Text className="text-sm text-gray-500 dark:text-gray-400">
								This card adapts to the selected color scheme automatically.
							</Text>
						</View>
						<View className="h-px bg-gray-100 dark:bg-gray-800" />
						<View className="flex-row gap-2">
							<View className="flex-1 bg-blue-500 dark:bg-blue-400 rounded-lg py-2 items-center">
								<Text className="text-white text-sm font-semibold">
									Primary
								</Text>
							</View>
							<View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg py-2 items-center">
								<Text className="text-gray-700 dark:text-gray-300 text-sm font-semibold">
									Secondary
								</Text>
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</>
	);
}
