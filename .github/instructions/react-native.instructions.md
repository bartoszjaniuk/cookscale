---
name: React Native & Expo Best Practices
description: Performance, UI patterns, and animation conventions for React Native and Expo apps. Use when building components, optimizing lists, implementing animations, or working with navigation.
applyTo: "mobile/src/**/*.{ts,tsx}"
---

# React Native & Expo Best Practices

Based on proven patterns from Vercel's React Native expertise, optimized for this project's Expo + Reanimated + NativeWind stack.

## Feature Modules

Organize domain logic in `src/features/<domain>/<screen-area>/` with subfolders:

```
src/features/
├── lists/
│   ├── overview/          # List of lists
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   └── details/           # List details
│       ├── components/
│       ├── hooks/
│       └── constants.ts
├── auth/
│   └── sign-in/
│       ├── components/
│       └── hooks/
└── profile/
    ├── components/
    └── hooks/
```

**Route files (`src/app/`) are thin entry points only** — compose the screen from feature hooks and components:

```tsx
// ❌ Business logic in route file
export default function ListsScreen() {
	const [lists, setLists] = useState([]);
	useEffect(() => {
		fetchLists().then(setLists);
	}, []);
	const handleDelete = async (id: string) => {
		/* mutation logic */
	};
	return <FlatList data={lists} /* ... */ />;
}

// ✅ Thin route — delegates to feature hooks and components
import { useListsOverview } from "../../features/lists/overview/hooks/use-lists-overview";
import { ListsGrid } from "../../features/lists/overview/components/lists-grid";

export default function ListsScreen() {
	const { lists, refetch } = useListsOverview();
	return <ListsGrid lists={lists} onRefresh={refetch} />;
}
```

**Handler references** — when the type matches, pass the reference directly:

```tsx
// ❌ Unnecessary wrapper
<ListsGrid onRefresh={() => void refetch()} />

// ✅ Direct reference
<ListsGrid onRefresh={refetch} />
```

## NativeWind Styling

This project uses **NativeWind v5 with Tailwind CSS v4**, which means **Tailwind classes ARE fully supported** via the `className` prop on components from `src/tw/`.

**Import from `src/tw/index.tsx` for className support:**

```tsx
// ✅ Use CSS-enabled components from src/tw/
import { View, Text, Pressable, ScrollView } from "../tw";

<View className="flex-1 bg-white dark:bg-gray-900 p-4 gap-3">
	<Text className="text-lg font-semibold text-gray-900 dark:text-white">
		Hello
	</Text>
</View>;
```

**Use className for static styles, inline styles for dynamic values:**

```tsx
// ✅ Static Tailwind classes
<Pressable className="bg-blue-500 px-4 py-2 rounded-lg">
  <Text className="text-white font-semibold">Button</Text>
</Pressable>

// ✅ Dynamic styles inline
<View style={{ opacity: fadeProgress }}>
  <Text>Fading text</Text>
</View>
```

**Dark mode variants work automatically** via `dark:` prefix — no additional setup needed. Color tokens in `src/global.css` adapt based on `Appearance.setColorScheme()`:

```tsx
// Automatically switches colors in dark mode
<View className="bg-white dark:bg-gray-900">
	<Text className="text-gray-900 dark:text-white">Content</Text>
</View>
```

## List Performance (CRITICAL)

Always use a list virtualizer (FlashList, LegendList) instead of ScrollView with mapped children — even for short lists.

```tsx
// ❌ ScrollView renders all items upfront (expensive)
<ScrollView>
	{items.map((item) => (
		<ItemCard key={item.id} item={item} />
	))}
</ScrollView>;

// ✅ FlashList renders only visible items (fast)
import { FlashList } from "@shopify/flash-list";
<FlashList
	data={items}
	renderItem={({ item }) => <ItemCard item={item} />}
	keyExtractor={(item) => item.id}
	estimatedItemSize={80}
/>;
```

Memoize list item components with `React.memo()` to prevent unnecessary re-renders when parent updates.

```tsx
const ItemCard = React.memo(({ item }: { item: Item }) => (
	<Pressable>
		<Text>{item.title}</Text>
	</Pressable>
));
```

Stabilize callback references — pass stable functions, not inline arrow functions. Use `useCallback` if callbacks depend on props.

```tsx
// ❌ Inline function re-creates every render
<FlashList renderItem={({ item }) => <Item onPress={() => handlePress(item)} />} />

// ✅ Stable function reference
const renderItem = useCallback(({ item }: { item: Item }) => (
  <Item onPress={() => handlePress(item)} />
), [handlePress])
<FlashList renderItem={renderItem} />
```

Avoid inline style objects in list renders — use Tailwind className instead of StyleSheet or extracted inline styles.

```tsx
// ❌ Recreates object on every render
const renderItem = ({ item }: { item: Item }) => (
	<View style={{ padding: 16, backgroundColor: "#fff" }}>
		<Text>{item.title}</Text>
	</View>
);

// ✅ Use className (static, zero cost)
const renderItem = ({ item }: { item: Item }) => (
	<View className="bg-white dark:bg-gray-900 p-4">
		<Text className="text-gray-900 dark:text-white">{item.title}</Text>
	</View>
);
```

## Animations (HIGH)

Animate only `transform` and `opacity` — never animate layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`). Layout animations trigger recalculation every frame; transform/opacity run on the GPU.

```tsx
// ❌ Animates height, triggers layout recalculation
<Animated.View style={{ height: withTiming(expanded ? 200 : 0) }} />

// ✅ Animates scaleY, GPU-accelerated
<Animated.View
  style={[
    { height: 200, transformOrigin: 'top' },
    { transform: [{ scaleY: withTiming(expanded ? 1 : 0) }] }
  ]}
/>
```

Use `useDerivedValue` for computed animations — don't derive from `useSharedValue` directly in animated styles, as this causes extra worklets.

```tsx
// ✅ Compute animation value once, reuse
const progress = useSharedValue(0);
const rotation = useDerivedValue(() => `${progress.value * 360}deg`);
const animatedStyle = useAnimatedStyle(() => ({
	transform: [{ rotate: rotation.value }],
}));
```

Use `Gesture.Tap` from `react-native-gesture-handler` instead of Pressable for gesture-driven interactions in animations.

## Navigation (HIGH)

Use native stack and native tabs navigators (`@react-navigation/native-stack`, `@react-navigation/bottom-tabs`) over JavaScript-only navigators. Native navigators leverage platform APIs for better performance and native feel.

```tsx
// ✅ Native stack (uses native iOS UINavigationController)
import { createNativeStackNavigator } from '@react-navigation/native-stack'
const Stack = createNativeStackNavigator()

<Stack.Navigator>
  <Stack.Screen name="Home" component={HomeScreen} />
</Stack.Navigator>
```

## UI Patterns (HIGH)

Use `expo-image` for all images instead of `Image` from react-native. `expo-image` supports caching, blurhash, and graceful fallbacks.

```tsx
// ❌ Standard Image component
import { Image } from "react-native";
<Image source={{ uri: url }} style={{ width: 100, height: 100 }} />;

// ✅ expo-image with features
import { Image } from "expo-image";
<Image
	source={{ uri: url }}
	placeholder={{ blurhash: "..." }}
	contentFit="cover"
	style={{ width: 100, height: 100 }}
/>;
```

Use `Pressable` over `TouchableOpacity` for all interactive elements. Pressable supports more gesture feedback and state styling.

```tsx
// ✅ Pressable with state
<Pressable
	onPress={handlePress}
	style={({ pressed }) => ({
		opacity: pressed ? 0.5 : 1,
	})}
>
	<Text>Tap me</Text>
</Pressable>
```

Use native context menus (`React.Fragment` with nested Menu components) instead of custom dropdown/popover solutions when possible.

Always use native modals when possible — use Stack navigator with modal presentation instead of custom overlays.

```tsx
// ✅ Native modal (platform-native presentation)
<Stack.Group screenOptions={{ presentation: "modal" }}>
	<Stack.Screen name="ModalScreen" component={ModalContent} />
</Stack.Group>
```

Use `onLayout` instead of `measure()` to read view dimensions — `onLayout` is always available and doesn't require async calls.

```tsx
// ✅ Use onLayout
<View
	onLayout={(event) => {
		const { width, height } = event.nativeEvent.layout;
	}}
>
	...
</View>
```

## Styling with NativeWind

**Prefer `className` with Tailwind utilities for static styles:**

```tsx
// ✅ Use Tailwind classes
<View className="bg-white dark:bg-gray-900 rounded-lg p-4 gap-3 shadow-sm">
	<Text className="text-gray-900 dark:text-white font-semibold">Card</Text>
</View>
```

**Always use `borderCurve: 'continuous'` with rounded corners for iOS smoothness:**

```tsx
// ✅ Smooth Apple-style corners
<View className="rounded-xl" style={{ borderCurve: "continuous" }}>
	...
</View>
```

**Prefer `gap` over margin for spacing between children:**

```tsx
// ✅ Gap (not margin on children)
<View className="gap-3">
	<Text>Item 1</Text>
	<Text>Item 2</Text>
</View>
```

**Use Tailwind spacing utilities (`p-4`, `gap-3`, etc.) instead of inline style objects:**

```tsx
// ❌ Avoid inline objects
<View style={{ padding: 16, gap: 12 }} />

// ✅ Use Tailwind
<View className="p-4 gap-3" />
```

**Use CSS `boxShadow` style prop for shadows (prefer Tailwind `shadow-*` classes):**

```tsx
// ✅ Tailwind shadow class
<View className="shadow-md" />

// ✅ Or CSS prop for custom shadows
<View style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />

// ❌ Never use legacy React Native shadows
<View style={{ shadowColor: "black", elevation: 2 }} />
```

**Use CSS custom properties from `src/global.css` for theme-aware colors:**

```tsx
// ✅ Access CSS variables in inline styles (e.g., for Reanimated)
const bgColor = useCSSVariable("--color-bg");
const animatedStyle = useAnimatedStyle(() => ({
	backgroundColor: bgColor,
}));
```

## State Management

Minimize state subscriptions — only subscribe to the parts of state you need.

Use dispatcher pattern for callbacks passed to components — accept an action type and payload, not a direct function reference.

Show fallback UI on first render before data loads — never leave blank screens during initial load.

## Rendering

Always wrap text in `<Text>` components — never put text directly in View or other containers. Use the `<Text>` from `src/tw/` to support className.

```tsx
// ❌ Text directly in View
import { Text, View } from "react-native";
<View>User Profile</View>;

// ✅ Text component with className support
import { Text, View } from "../tw";
<View className="p-4">
	<Text className="text-lg font-semibold">User Profile</Text>
</View>;
```

Avoid falsy && for conditional rendering — use ternary or separate conditionals.

```tsx
// ❌ Renders `false` or component
{
	isVisible && <Component />;
}

// ✅ Explicit ternary
{
	isVisible ? <Component /> : null;
}
```

## Monorepo (if applicable)

Keep native dependencies in the app package only — don't hoist to workspace root. Native modules must be in the same package as the native build.

Use single dependency versions across all packages — avoid version conflicts that can cause native module conflicts.
