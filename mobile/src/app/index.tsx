import { View, Text } from "../tw";

export default function Index() {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<Text>Edit app/index.tsx to edit this screen.</Text>
			<Text className="text-gray-500">
				Changes you make will automatically reload.
			</Text>
		</View>
	);
}
