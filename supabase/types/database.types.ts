export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	// Allows to automatically instantiate createClient with right options
	// instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
	__InternalSupabase: {
		PostgrestVersion: "14.5";
	};
	graphql_public: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: {
				Args: {
					extensions?: Json;
					operationName?: string;
					query?: string;
					variables?: Json;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			ai_usage_log: {
				Row: {
					called_at: string;
					id: number;
					ip_hash: string;
					success: boolean;
					user_id: string | null;
				};
				Insert: {
					called_at?: string;
					id?: number;
					ip_hash: string;
					success?: boolean;
					user_id?: string | null;
				};
				Update: {
					called_at?: string;
					id?: number;
					ip_hash?: string;
					success?: boolean;
					user_id?: string | null;
				};
				Relationships: [];
			};
			calculations: {
				Row: {
					cooking_method_id: string | null;
					created_at: string;
					direction: Database["public"]["Enums"]["direction_enum"] | null;
					id: string;
					input: Json;
					input_text: string | null;
					product_id: string | null;
					result: Json;
					type: Database["public"]["Enums"]["calculation_type_enum"];
					user_id: string;
					warnings: Json | null;
				};
				Insert: {
					cooking_method_id?: string | null;
					created_at?: string;
					direction?: Database["public"]["Enums"]["direction_enum"] | null;
					id?: string;
					input: Json;
					input_text?: string | null;
					product_id?: string | null;
					result: Json;
					type: Database["public"]["Enums"]["calculation_type_enum"];
					user_id: string;
					warnings?: Json | null;
				};
				Update: {
					cooking_method_id?: string | null;
					created_at?: string;
					direction?: Database["public"]["Enums"]["direction_enum"] | null;
					id?: string;
					input?: Json;
					input_text?: string | null;
					product_id?: string | null;
					result?: Json;
					type?: Database["public"]["Enums"]["calculation_type_enum"];
					user_id?: string;
					warnings?: Json | null;
				};
				Relationships: [
					{
						foreignKeyName: "calculations_cooking_method_id_fkey";
						columns: ["cooking_method_id"];
						isOneToOne: false;
						referencedRelation: "cooking_methods";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "calculations_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "active_products";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "calculations_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
				];
			};
			categories: {
				Row: {
					created_at: string;
					icon: string;
					id: string;
					name: string;
					slug: string;
				};
				Insert: {
					created_at?: string;
					icon?: string;
					id?: string;
					name: string;
					slug: string;
				};
				Update: {
					created_at?: string;
					icon?: string;
					id?: string;
					name?: string;
					slug?: string;
				};
				Relationships: [];
			};
			cooking_methods: {
				Row: {
					created_at: string;
					id: string;
					slug: string;
				};
				Insert: {
					created_at?: string;
					id?: string;
					slug: string;
				};
				Update: {
					created_at?: string;
					id?: string;
					slug?: string;
				};
				Relationships: [];
			};
			product_cooking_factors: {
				Row: {
					cooking_method_id: string;
					id: string;
					product_id: string;
					yield_factor: number;
				};
				Insert: {
					cooking_method_id: string;
					id?: string;
					product_id: string;
					yield_factor: number;
				};
				Update: {
					cooking_method_id?: string;
					id?: string;
					product_id?: string;
					yield_factor?: number;
				};
				Relationships: [
					{
						foreignKeyName: "product_cooking_factors_cooking_method_id_fkey";
						columns: ["cooking_method_id"];
						isOneToOne: false;
						referencedRelation: "cooking_methods";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "product_cooking_factors_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "active_products";
						referencedColumns: ["id"];
					},
					{
						foreignKeyName: "product_cooking_factors_product_id_fkey";
						columns: ["product_id"];
						isOneToOne: false;
						referencedRelation: "products";
						referencedColumns: ["id"];
					},
				];
			};
			products: {
				Row: {
					calories_kcal: number | null;
					carbs_g: number | null;
					category_id: string | null;
					created_at: string;
					created_by_user_id: string | null;
					deleted_at: string | null;
					ean: string | null;
					external_id: string | null;
					fat_g: number | null;
					fiber_g: number | null;
					id: string;
					is_popular: boolean;
					name_en: string;
					name_pl: string;
					protein_g: number | null;
					sodium_mg: number | null;
					source: Database["public"]["Enums"]["source_enum"];
					sugar_g: number | null;
					updated_at: string;
				};
				Insert: {
					calories_kcal?: number | null;
					carbs_g?: number | null;
					category_id?: string | null;
					created_at?: string;
					created_by_user_id?: string | null;
					deleted_at?: string | null;
					ean?: string | null;
					external_id?: string | null;
					fat_g?: number | null;
					fiber_g?: number | null;
					id?: string;
					is_popular?: boolean;
					name_en: string;
					name_pl: string;
					protein_g?: number | null;
					sodium_mg?: number | null;
					source: Database["public"]["Enums"]["source_enum"];
					sugar_g?: number | null;
					updated_at?: string;
				};
				Update: {
					calories_kcal?: number | null;
					carbs_g?: number | null;
					category_id?: string | null;
					created_at?: string;
					created_by_user_id?: string | null;
					deleted_at?: string | null;
					ean?: string | null;
					external_id?: string | null;
					fat_g?: number | null;
					fiber_g?: number | null;
					id?: string;
					name_en?: string;
					name_pl?: string;
					protein_g?: number | null;
					sodium_mg?: number | null;
					source?: Database["public"]["Enums"]["source_enum"];
					sugar_g?: number | null;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: "products_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "categories";
						referencedColumns: ["id"];
					},
				];
			};
			profiles: {
				Row: {
					anonymous_calc_count: number;
					avatar_url: string | null;
					created_at: string;
					id: string;
					is_premium: boolean;
					preferred_language: string;
					premium_expires_at: string | null;
					revenuecat_customer_id: string | null;
					trial_ai_used_at: string | null;
					updated_at: string;
				};
				Insert: {
					anonymous_calc_count?: number;
					avatar_url?: string | null;
					created_at?: string;
					id: string;
					is_premium?: boolean;
					preferred_language?: string;
					premium_expires_at?: string | null;
					revenuecat_customer_id?: string | null;
					trial_ai_used_at?: string | null;
					updated_at?: string;
				};
				Update: {
					anonymous_calc_count?: number;
					avatar_url?: string | null;
					created_at?: string;
					id?: string;
					is_premium?: boolean;
					preferred_language?: string;
					premium_expires_at?: string | null;
					revenuecat_customer_id?: string | null;
					trial_ai_used_at?: string | null;
					updated_at?: string;
				};
				Relationships: [];
			};
		};
		Views: {
			active_products: {
				Row: {
					calories_kcal: number | null;
					carbs_g: number | null;
					category_id: string | null;
					created_at: string | null;
					created_by_user_id: string | null;
					deleted_at: string | null;
					ean: string | null;
					external_id: string | null;
					fat_g: number | null;
					fiber_g: number | null;
					id: string | null;
					name_en: string | null;
					name_pl: string | null;
					protein_g: number | null;
					sodium_mg: number | null;
					source: Database["public"]["Enums"]["source_enum"] | null;
					sugar_g: number | null;
					updated_at: string | null;
				};
				Insert: {
					calories_kcal?: number | null;
					carbs_g?: number | null;
					category_id?: string | null;
					created_at?: string | null;
					created_by_user_id?: string | null;
					deleted_at?: string | null;
					ean?: string | null;
					external_id?: string | null;
					fat_g?: number | null;
					fiber_g?: number | null;
					id?: string | null;
					name_en?: string | null;
					name_pl?: string | null;
					protein_g?: number | null;
					sodium_mg?: number | null;
					source?: Database["public"]["Enums"]["source_enum"] | null;
					sugar_g?: number | null;
					updated_at?: string | null;
				};
				Update: {
					calories_kcal?: number | null;
					carbs_g?: number | null;
					category_id?: string | null;
					created_at?: string | null;
					created_by_user_id?: string | null;
					deleted_at?: string | null;
					ean?: string | null;
					external_id?: string | null;
					fat_g?: number | null;
					fiber_g?: number | null;
					id?: string | null;
					name_en?: string | null;
					name_pl?: string | null;
					protein_g?: number | null;
					sodium_mg?: number | null;
					source?: Database["public"]["Enums"]["source_enum"] | null;
					sugar_g?: number | null;
					updated_at?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "products_category_id_fkey";
						columns: ["category_id"];
						isOneToOne: false;
						referencedRelation: "categories";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Functions: {
			show_limit: { Args: never; Returns: number };
			show_trgm: { Args: { "": string }; Returns: string[] };
		};
		Enums: {
			calculation_type_enum: "product" | "dish";
			direction_enum: "raw_to_cooked" | "cooked_to_raw";
			source_enum: "system" | "user";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {
			calculation_type_enum: ["product", "dish"],
			direction_enum: ["raw_to_cooked", "cooked_to_raw"],
			source_enum: ["system", "user"],
		},
	},
} as const;
