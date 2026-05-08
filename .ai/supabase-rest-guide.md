# Supabase REST Layer Usage Guide — Expo React Native

This guide explains how to interact with the Supabase REST API from your Expo React Native app using the official Supabase JS client.

---

## 1. Setup

### 1.1 Install dependencies

```bash
bun add @supabase/supabase-js
```

### 1.2 Initialize Supabase client

Create a file `src/api/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 1.3 Environment variables

Create `.env.local`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

> The `EXPO_PUBLIC_` prefix makes these variables available at build time.

---

## 2. Authentication

### 2.1 Sign up

```typescript
import { supabase } from "@/api/supabase";

async function signUp(email: string, password: string) {
	try {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			console.error("Signup error:", error.message);
			return { success: false, error: error.message };
		}

		console.log("Signup successful:", data.user?.id);
		return { success: true, user: data.user };
	} catch (e) {
		console.error("Unexpected error:", e);
		return { success: false, error: "An unexpected error occurred" };
	}
}
```

**Response:**

```json
{
	"success": true,
	"user": {
		"id": "uuid",
		"email": "user@example.com",
		"created_at": "2026-05-08T10:00:00Z"
	}
}
```

---

### 2.2 Login

```typescript
async function login(email: string, password: string) {
	try {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return { success: false, error: error.message };
		}

		console.log("Login successful, JWT:", data.session?.access_token);
		return {
			success: true,
			user: data.user,
			accessToken: data.session?.access_token,
		};
	} catch (e) {
		console.error("Unexpected error:", e);
		return { success: false, error: "An unexpected error occurred" };
	}
}
```

> The JWT is automatically stored in the Supabase client's session storage. Subsequent requests use this token automatically.

---

### 2.3 Logout

```typescript
async function logout() {
	try {
		const { error } = await supabase.auth.signOut();

		if (error) {
			return { success: false, error: error.message };
		}

		console.log("Logged out successfully");
		return { success: true };
	} catch (e) {
		console.error("Unexpected error:", e);
		return { success: false, error: "An unexpected error occurred" };
	}
}
```

---

### 2.4 Get current user

```typescript
async function getCurrentUser() {
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) {
		console.error("Error fetching user:", error.message);
		return null;
	}

	return user;
}
```

---

### 2.5 Password reset

```typescript
async function requestPasswordReset(email: string) {
	try {
		const { error } = await supabase.auth.resetPasswordForEmail(email);

		if (error) {
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (e) {
		console.error("Unexpected error:", e);
		return { success: false, error: "An unexpected error occurred" };
	}
}
```

> Supabase sends a reset link via email. The user clicks the link and sets a new password.

---

## 3. Product Search (GET /rest/v1/products)

### 3.1 Basic search

```typescript
import { supabase } from "@/api/supabase";

async function searchProducts(query: string, limit: number = 20) {
	try {
		const { data, error } = await supabase
			.from("products")
			.select(
				`
        id,
        name,
        calories_kcal,
        protein_g,
        fat_g,
        carbs_g,
        fiber_g,
        category_id,
        product_cooking_factors(
          cooking_method_id,
          yield_factor,
          cooking_methods(id, slug)
        )
        `,
			)
			.ilike("name", `%${query}%`) // Case-insensitive partial match
			.limit(limit)
			.order("name", { ascending: true });

		if (error) {
			console.error("Search error:", error.message);
			return { success: false, products: [], error: error.message };
		}

		return { success: true, products: data };
	} catch (e) {
		console.error("Unexpected error:", e);
		return { success: false, products: [], error: "Search failed" };
	}
}
```

**Example call:**

```typescript
const result = await searchProducts("chicken");
console.log(result.products);
// Output:
// [
//   {
//     id: 'uuid',
//     name: 'chicken breast',
//     calories_kcal: 110.0,
//     protein_g: 23.1,
//     ...
//     product_cooking_factors: [
//       { cooking_method_id: 'uuid', yield_factor: 0.84, cooking_methods: {...} }
//     ]
//   }
// ]
```

### 3.2 Search with category filter

```typescript
async function searchProductsByCategory(
	query: string,
	categoryId: string,
	limit: number = 20,
) {
	const { data, error } = await supabase
		.from("products")
		.select(
			`
      id,
      name,
      calories_kcal,
      protein_g,
      fat_g,
      carbs_g,
      fiber_g,
      product_cooking_factors(cooking_method_id, yield_factor)
      `,
		)
		.ilike("name", `%${query}%`)
		.eq("category_id", categoryId)
		.limit(limit);

	if (error) throw error;
	return data;
}
```

### 3.3 Fetch single product by ID

```typescript
async function getProductById(productId: string) {
	const { data, error } = await supabase
		.from("products")
		.select(
			`
      id,
      name,
      calories_kcal,
      protein_g,
      fat_g,
      carbs_g,
      fiber_g,
      category_id,
      product_cooking_factors(cooking_method_id, yield_factor, cooking_methods(id, slug))
      `,
		)
		.eq("id", productId)
		.single(); // Expects exactly one row

	if (error) {
		console.error("Error fetching product:", error.message);
		return null;
	}

	return data;
}
```

---

## 4. Categories & Cooking Methods (Cached on app startup)

### 4.1 Fetch all categories

```typescript
async function fetchCategories() {
	const { data, error } = await supabase
		.from("categories")
		.select("id, name, slug")
		.order("name", { ascending: true });

	if (error) throw error;
	return data;
}
```

**Cache in Zustand store:**

```typescript
import { create } from "zustand";

interface CategoriesStore {
	categories: Array<{ id: string; name: string; slug: string }>;
	loaded: boolean;
	initialize: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
	categories: [],
	loaded: false,
	initialize: async () => {
		const categories = await fetchCategories();
		set({ categories, loaded: true });
	},
}));
```

**Usage in component:**

```typescript
import { useCategoriesStore } from '@/stores/categories';

export function MyComponent() {
  const { categories, loaded, initialize } = useCategoriesStore();

  useEffect(() => {
    if (!loaded) {
      initialize();
    }
  }, []);

  if (!loaded) return <Text>Loading...</Text>;

  return (
    <ScrollView>
      {categories.map((cat) => (
        <Text key={cat.id}>{cat.name}</Text>
      ))}
    </ScrollView>
  );
}
```

### 4.2 Fetch all cooking methods

```typescript
async function fetchCookingMethods() {
	const { data, error } = await supabase
		.from("cooking_methods")
		.select("id, slug")
		.order("slug", { ascending: true });

	if (error) throw error;
	return data;
}
```

---

## 5. Calculations History (GET /rest/v1/calculations)

### 5.1 Fetch user's calculation history

```typescript
async function fetchCalculationHistory(limit: number = 50, offset: number = 0) {
	const { data, error } = await supabase
		.from("calculations")
		.select(
			`
      id,
      type,
      direction,
      created_at,
      input,
      result,
      warnings,
      product_id,
      cooking_method_id,
      input_text
      `,
		)
		.order("created_at", { ascending: false })
		.range(offset, offset + limit - 1);

	if (error) {
		console.error("Error fetching calculations:", error.message);
		return [];
	}

	return data;
}
```

**Example response:**

```json
[
  {
    "id": "uuid",
    "type": "product",
    "direction": "raw_to_cooked",
    "created_at": "2026-05-08T10:00:00Z",
    "input": { "weight_g": 200, "product_name": "chicken breast", ... },
    "result": { "product_id": "uuid", "macros_total": {...}, ... },
    "warnings": null
  }
]
```

---

## 6. Save Calculation (POST /rest/v1/calculations)

### 6.1 Save product-mode calculation

The product-mode calculation is performed **client-side**. After getting the result, save it to the database:

```typescript
async function saveProductCalculation(calculation: {
	type: "product";
	direction: "raw_to_cooked" | "cooked_to_raw";
	product_id: string;
	cooking_method_id: string;
	input: {
		weight_g: number;
		product_name: string;
		cooking_method_slug: string;
	};
	result: {
		product_id: string;
		product_name: string;
		cooking_method_slug: string;
		direction: string;
		input_weight_g: number;
		output_weight_g: number;
		yield_factor: number;
		macros_per_100g: {
			calories_kcal: number;
			protein_g: number;
			fat_g: number;
			carbs_g: number;
		};
		macros_total: {
			calories_kcal: number;
			protein_g: number;
			fat_g: number;
			carbs_g: number;
		};
	};
}) {
	const user = await getCurrentUser();
	if (!user) {
		return { success: false, error: "Not authenticated" };
	}

	const { data, error } = await supabase
		.from("calculations")
		.insert([
			{
				user_id: user.id,
				...calculation,
			},
		])
		.select()
		.single();

	if (error) {
		console.error("Error saving calculation:", error.message);
		return { success: false, error: error.message };
	}

	return { success: true, calculation: data };
}
```

**Example usage:**

```typescript
const result = await saveProductCalculation({
	type: "product",
	direction: "raw_to_cooked",
	product_id: "uuid",
	cooking_method_id: "uuid",
	input: {
		weight_g: 200,
		product_name: "chicken breast",
		cooking_method_slug: "baking",
	},
	result: {
		product_id: "uuid",
		product_name: "chicken breast",
		cooking_method_slug: "baking",
		direction: "raw_to_cooked",
		input_weight_g: 200,
		output_weight_g: 168,
		yield_factor: 0.84,
		macros_per_100g: {
			calories_kcal: 110.0,
			protein_g: 23.1,
			fat_g: 1.2,
			carbs_g: 0.0,
		},
		macros_total: {
			calories_kcal: 184.8,
			protein_g: 38.8,
			fat_g: 2.0,
			carbs_g: 0.0,
		},
	},
});
```

---

## 7. User Profile (GET/PATCH /rest/v1/profiles)

### 7.1 Fetch user's profile

```typescript
async function fetchUserProfile() {
	const { data, error } = await supabase
		.from("profiles")
		.select(
			"id, is_premium, premium_expires_at, preferred_language, trial_ai_used_at, avatar_url, created_at",
		)
		.single();

	if (error) {
		console.error("Error fetching profile:", error.message);
		return null;
	}

	return data;
}
```

**Example response:**

```json
{
	"id": "uuid",
	"is_premium": false,
	"premium_expires_at": null,
	"preferred_language": "pl",
	"trial_ai_used_at": null,
	"avatar_url": null,
	"created_at": "2026-05-08T10:00:00Z"
}
```

### 7.2 Update user's profile

```typescript
async function updateUserProfile(updates: {
	preferred_language?: "pl" | "en";
	avatar_url?: string;
}) {
	const { data, error } = await supabase
		.from("profiles")
		.update(updates)
		.eq("id", (await getCurrentUser())?.id)
		.select()
		.single();

	if (error) {
		console.error("Error updating profile:", error.message);
		return { success: false, error: error.message };
	}

	return { success: true, profile: data };
}
```

**Example usage:**

```typescript
await updateUserProfile({
	preferred_language: "en",
	avatar_url: "https://example.com/avatar.jpg",
});
```

---

## 8. AI Dish Calculation (Edge Function)

### 8.1 Call calculate-dish Edge Function

```typescript
async function calculateDish(description: string) {
	const user = await getCurrentUser();
	const token = (await supabase.auth.getSession()).data.session?.access_token;

	const headers: HeadersInit = {
		"Content-Type": "application/json",
		apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
	};

	// Add JWT if user is authenticated
	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/calculate-dish`,
			{
				method: "POST",
				headers,
				body: JSON.stringify({ description }),
			},
		);

		if (!response.ok) {
			const error = await response.json();
			console.error("AI calculation error:", error);
			return { success: false, error: error.error, data: null };
		}

		const data = await response.json();
		return { success: true, data, error: null };
	} catch (e) {
		console.error("Unexpected error:", e);
		return { success: false, error: "Network error", data: null };
	}
}
```

**Example usage:**

```typescript
const result = await calculateDish(
	"pierś z kurczaka 200g pieczona, ziemniaki 300g gotowane, brokuł 150g",
);

if (result.success) {
	console.log("Total macros:", result.data.total);
	// {
	//   calories_kcal: 520.0,
	//   protein_g: 62.5,
	//   fat_g: 9.1,
	//   carbs_g: 45.0
	// }
} else {
	console.error("Error:", result.error);
	// Possible errors: 'trial_exhausted', 'premium_required', 'rate_limit_exceeded', etc.
}
```

### 8.2 Error handling

```typescript
async function calculateDishWithErrorHandling(description: string) {
	if (description.length < 1 || description.length > 200) {
		return { success: false, error: "Description must be 1-200 characters" };
	}

	const result = await calculateDish(description);

	if (!result.success) {
		const errorMessages: Record<string, string> = {
			trial_exhausted: "Free AI trial already used. Sign up to continue.",
			premium_required: "Upgrade to Premium to use AI mode.",
			rate_limit_exceeded: "Too many requests. Please try again later.",
			ai_service_error: "AI service unavailable. Please try again.",
			invalid_token: "Session expired. Please login again.",
		};

		return {
			success: false,
			error: errorMessages[result.error] || "Something went wrong",
		};
	}

	return result;
}
```

---

## 9. Real-time Subscriptions (Optional)

### 9.1 Subscribe to calculation history changes

```typescript
import { useEffect, useState } from "react";
import { supabase } from "@/api/supabase";

export function useCalculationHistory() {
	const [calculations, setCalculations] = useState<any[]>([]);

	useEffect(() => {
		const subscription = supabase
			.from("calculations")
			.on("*", (payload) => {
				console.log("Calculation changed:", payload);
				// Handle INSERT, UPDATE, DELETE
				setCalculations((prev) => {
					if (payload.eventType === "INSERT") {
						return [payload.new, ...prev];
					}
					return prev;
				});
			})
			.subscribe();

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return calculations;
}
```

> Real-time subscriptions require the table to have the `replica identity` set to `FULL` in PostgreSQL. Check with your Supabase setup.

---

## 10. Best Practices

### 10.1 Error handling pattern

```typescript
async function apiCall<T>(fn: () => Promise<T>): Promise<{
	data: T | null;
	error: string | null;
}> {
	try {
		const data = await fn();
		return { data, error: null };
	} catch (e) {
		const message = e instanceof Error ? e.message : "Unknown error";
		console.error("API error:", message);
		return { data: null, error: message };
	}
}

// Usage:
const { data: products, error } = await apiCall(() =>
	searchProducts("chicken"),
);

if (error) {
	Alert.alert("Search failed", error);
	return;
}

// Use products...
```

### 10.2 Caching with Zustand

```typescript
import { create } from "zustand";

interface ProductsStore {
	products: Map<string, any>;
	fetchProduct: (id: string) => Promise<any>;
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
	products: new Map(),
	fetchProduct: async (id: string) => {
		const cached = get().products.get(id);
		if (cached) return cached;

		const product = await getProductById(id);
		set((state) => {
			state.products.set(id, product);
			return state;
		});

		return product;
	},
}));
```

### 10.3 Handling network errors

```typescript
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    return unsubscribe;
  }, []);

  return isConnected;
}

// Usage:
function MyComponent() {
  const isConnected = useNetworkStatus();

  if (!isConnected) {
    return <Text>No internet connection</Text>;
  }

  return <ProductSearch />;
}
```

### 10.4 Debounce search

```typescript
import { useMemo } from 'react';
import { debounce } from 'lodash';

function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (q.length < 2) {
          setResults([]);
          return;
        }
        const { products } = await searchProducts(q);
        setResults(products);
      }, 300),
    []
  );

  const handleChangeText = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  return (
    <>
      <TextInput
        placeholder="Search products..."
        value={query}
        onChangeText={handleChangeText}
      />
      {results.map((product) => (
        <Text key={product.id}>{product.name}</Text>
      ))}
    </>
  );
}
```

---

## 11. Complete Example: Product Mode Calculation

```typescript
import { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { supabase } from '@/api/supabase';

export function ProductCalculatorScreen() {
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [weight, setWeight] = useState('200');
  const [cookingMethod, setCookingMethod] = useState<string | null>(null);

  async function handleCalculate() {
    if (!selectedProduct || !weight || !cookingMethod) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Error', 'Weight must be a positive number');
      return;
    }

    // Find yield factor for this product + cooking method
    const yieldFactorObj = selectedProduct.product_cooking_factors.find(
      (f: any) => f.cooking_methods.slug === cookingMethod
    );

    if (!yieldFactorObj) {
      Alert.alert('Error', 'Cooking method not available for this product');
      return;
    }

    const yieldFactor = yieldFactorObj.yield_factor;
    const outputWeight = weightNum * yieldFactor;

    // Calculate macros
    const macrosPerGram = {
      calories_kcal: selectedProduct.calories_kcal / 100,
      protein_g: selectedProduct.protein_g / 100,
      fat_g: selectedProduct.fat_g / 100,
      carbs_g: selectedProduct.carbs_g / 100,
    };

    const result = {
      product_id: selectedProduct.id,
      product_name: selectedProduct.name,
      cooking_method_slug: cookingMethod,
      direction: 'raw_to_cooked' as const,
      input_weight_g: weightNum,
      output_weight_g: outputWeight,
      yield_factor: yieldFactor,
      macros_per_100g: {
        calories_kcal: selectedProduct.calories_kcal,
        protein_g: selectedProduct.protein_g,
        fat_g: selectedProduct.fat_g,
        carbs_g: selectedProduct.carbs_g,
      },
      macros_total: {
        calories_kcal: macrosPerGram.calories_kcal * outputWeight,
        protein_g: macrosPerGram.protein_g * outputWeight,
        fat_g: macrosPerGram.fat_g * outputWeight,
        carbs_g: macrosPerGram.carbs_g * outputWeight,
      },
    };

    // Save to database
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    const { error } = await supabase.from('calculations').insert([
      {
        user_id: user.data.user.id,
        type: 'product',
        direction: 'raw_to_cooked',
        product_id: selectedProduct.id,
        cooking_method_id: yieldFactorObj.cooking_method_id,
        input: {
          weight_g: weightNum,
          product_name: selectedProduct.name,
          cooking_method_slug: cookingMethod,
        },
        result,
      },
    ]);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Success', 'Calculation saved!');
    // Show result screen...
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Weight (grams):</Text>
      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Text>Cooking method:</Text>
      <Button title="Boiling" onPress={() => setCookingMethod('boiling')} />
      <Button title="Frying" onPress={() => setCookingMethod('frying')} />
      <Button title="Baking" onPress={() => setCookingMethod('baking')} />

      <Button title="Calculate" onPress={handleCalculate} />
    </View>
  );
}
```

---

## 12. Troubleshooting

### "RLS policy error"

**Problem:** `PolicyViolationError: new row violates row level security policy`

**Solution:** You're trying to INSERT/UPDATE with a `user_id` that doesn't match your authenticated user.

```typescript
// ❌ Wrong
const { error } = await supabase.from('calculations').insert([
  {
    user_id: 'some-other-uuid', // RLS will reject this
    ...
  },
]);

// ✅ Correct
const user = await supabase.auth.getUser();
const { error } = await supabase.from('calculations').insert([
  {
    user_id: user.data.user!.id, // Use authenticated user's ID
    ...
  },
]);
```

### "JWT expired"

**Problem:** `AuthSessionMissing` or `Invalid JWT`

**Solution:** The session token has expired. Refresh it:

```typescript
const { error } = await supabase.auth.refreshSession();
if (error) {
	// Logout and redirect to login
	await supabase.auth.signOut();
}
```

### "No rows returned"

**Problem:** `.single()` throws an error when the query returns 0 or >1 rows

**Solution:** Use `.maybeSingle()` for optional single row:

```typescript
// ❌ Throws if not found
const { data } = await supabase
	.from("products")
	.select("*")
	.eq("id", "invalid-id")
	.single();

// ✅ Returns null if not found
const { data } = await supabase
	.from("products")
	.select("*")
	.eq("id", "invalid-id")
	.maybeSingle();
```

---

## Summary

- **POST /auth/** — Use `supabase.auth.*` methods
- **GET /rest/v1/\*** — Use `.from(tableName).select(...).*`
- **POST /rest/v1/\*** — Use `.from(tableName).insert(...).select()`
- **PATCH /rest/v1/\*** — Use `.from(tableName).update(...).select()`
- **POST /functions/v1/\*** — Use `fetch()` with `Authorization` header
- Always handle errors and check `.error` property
- Cache static data (categories, cooking methods) on app startup
- Use RLS policies — never trust client-supplied `user_id`
