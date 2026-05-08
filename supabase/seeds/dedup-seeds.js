#!/usr/bin/env node

/**
 * Deduplicate seed JSON files — two-phase strategy:
 *
 *  Phase 1 (REMOVE): Products that are true variants or cross-file duplicates.
 *    - Green/Brown/Black lentils  → covered by "Lentils"
 *    - Green peas, Yellow peas   → covered by "Peas"
 *    - Tepary/Flageolet/Borlotti/Butter/Moth beans → covered by "Broad beans"
 *    - Rolled oats, Instant oats → covered by "Oats"
 *    - Pearled barley            → covered by "Barley"
 *    - Rye berries               → covered by "Rye"
 *    - Atlantic cod              → covered by "Cod"
 *    - Cross-file legume dups in vegetables (Chickpeas, Lentils, Black beans…)
 *
 *  Phase 2 (FETCH NEW ID): Products that are real distinct foods but received a
 *    wrong/placeholder external_id. For these we search USDA FDC API.
 *
 * Usage:
 *   node supabase/seeds/dedup-seeds.js [--dry-run]
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const API_KEY =
	process.env.USDA_API_KEY || "u0cWhJXGaa2SOuA66L0st2YqeB64Hb9JjK50qgJg";
const API_BASE = "https://api.nal.usda.gov/fdc/v1";
const SEEDS_DIR = path.resolve(__dirname);
const DRY_RUN = process.argv.includes("--dry-run");
const DELAY_MS = 350;

if (DRY_RUN) console.log("🔎 DRY RUN — files will NOT be saved\n");

// ─── Products to REMOVE (variants / exact cross-file duplicates) ──────────
// Key: "fileName::productName"
const PRODUCTS_TO_REMOVE = new Set([
	// Lentil variants (all map to "Lentils, raw" in USDA)
	"43_legumes_products.json::Green lentils",
	"43_legumes_products.json::Brown lentils",
	"43_legumes_products.json::Black lentils",

	// Pea variants
	"43_legumes_products.json::Green peas",
	"43_legumes_products.json::Yellow peas",

	// Bean variants (all map to "Green beans, raw" in USDA)
	"43_legumes_products.json::Tepary beans",
	"43_legumes_products.json::Flageolet beans",
	"43_legumes_products.json::Borlotti beans",
	"43_legumes_products.json::Butter beans",
	"43_legumes_products.json::Moth beans",

	// Oat variants
	"72_grains_products.json::Rolled oats",
	"72_grains_products.json::Instant oats",

	// Quinoa variant (USDA treats all quinoa colours the same)
	"72_grains_products.json::Black quinoa",

	// Barley variant
	"72_grains_products.json::Pearled barley",

	// Rye variant
	"72_grains_products.json::Rye berries",

	// Fish variants (same USDA entry)
	"56_fish_products.json::Atlantic cod",
	"56_fish_products.json::Flounder",

	// Cross-file exact duplicates: legumes already in 43_legumes, remove from 90_vegetables
	"90_vegetables_products.json::Chickpeas",
	"90_vegetables_products.json::Lentils",
	"90_vegetables_products.json::Black beans",
	"90_vegetables_products.json::Kidney beans",
	"90_vegetables_products.json::Soybeans",
	"90_vegetables_products.json::Edamame",
	"90_vegetables_products.json::Green peas",
	"90_vegetables_products.json::Broad beans",
	"90_vegetables_products.json::Bean sprouts",

	// Corn: keep in 72_grains (first occurrence), remove from 90_vegetables
	"90_vegetables_products.json::Corn",
]);

// ─── Products that need a NEW USDA ID (different real products, wrong shared ID)
// key: "fileName::productName", value: USDA search term
const PRODUCTS_TO_REFETCH = {
	// Black quinoa got Black chickpeas' ID (173963)
	"72_grains_products.json::Black quinoa": "quinoa grain raw",

	// Organ meat got Kidney beans' ID (169213)
	"72_meat_products.json::Kidney": "beef kidney raw",

	// All products assigned placeholder ID 2709164 (= Clementine)
	"56_fish_products.json::Zander": "zander fish raw",
	"56_fish_products.json::Prawn": "prawn shrimp raw",
	"72_grains_products.json::Kamut": "kamut wheat raw",
	"72_grains_products.json::Freekeh": "freekeh green wheat roasted",
	"72_meat_products.json::Bacon": "bacon pork raw",
	"90_vegetables_products.json::Beetroot": "beets raw",
	"90_vegetables_products.json::Habanero": "habanero pepper raw",
	"90_vegetables_products.json::Daikon": "daikon radish raw",
	"90_vegetables_products.json::Nori": "seaweed nori dried",
	"90_vegetables_products.json::Kombu": "seaweed kelp kombu dried",

	// ID 170688 (Bulgur) shared with other grain products
	"72_grains_products.json::Polenta": "polenta cornmeal dry",
	"72_grains_products.json::Penne": "penne pasta dry",
	"72_grains_products.json::Fusilli": "fusilli pasta dry",

	// Rice varieties all got Basmati/Wild rice ID (169726)
	"72_grains_products.json::Jasmine rice": "rice white long grain raw",
	"72_grains_products.json::Wild rice": "wild rice raw",
	"72_grains_products.json::Arborio rice": "arborio rice raw",

	// Udon noodles got Rice noodles ID (169742)
	"72_grains_products.json::Udon noodles": "noodles japanese wheat udon",

	// Beef cuts all got Tenderloin steak ID (2727573)
	"72_meat_products.json::Beef porterhouse steak": "beef porterhouse steak raw",
	"72_meat_products.json::Beef skirt steak": "beef skirt steak raw",

	// Veal shank got Beef shank ID (172648)
	"72_meat_products.json::Veal shank": "veal shank raw",

	// Lamb shoulder got Ground lamb ID (174370)
	"72_meat_products.json::Lamb shoulder": "lamb shoulder arm chop raw",

	// Duck legs got Lamb leg ID (168148)
	"72_meat_products.json::Duck legs": "duck leg meat raw",

	// Goose breast + Liver got Goose ID (172415)
	"72_meat_products.json::Goose breast": "goose breast raw",
	"72_meat_products.json::Liver": "beef liver raw",

	// Dairy: Processed cheese got Pecorino's ID (2705770)
	"61_dairy_products.json::Processed cheese": "processed cheese food",

	// Bamboo shoots / Pea shoots share ID (169210)
	"90_vegetables_products.json::Pea shoots": "peas shoots greens raw",

	// Alfalfa / Sunflower sprouts share ID (2709765)
	"90_vegetables_products.json::Sunflower sprouts":
		"sunflower seeds raw shelled",

	// Snow peas got generic Peas ID (2709797)
	"90_vegetables_products.json::Snow peas": "snow peas raw",

	// Green beans in vegetables got Broad beans ID (2709769)
	"90_vegetables_products.json::Green beans": "green beans raw",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpsGet(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				let data = "";
				res.on("data", (c) => (data += c));
				res.on("end", () => {
					try {
						resolve(JSON.parse(data));
					} catch (e) {
						reject(new Error(`JSON parse: ${e.message}`));
					}
				});
			})
			.on("error", reject);
	});
}

async function findFdcId(searchTerm, alreadyClaimed) {
	const variants = [
		searchTerm,
		searchTerm.replace(" raw", ""),
		searchTerm.split(" ")[0],
	];
	for (const term of variants) {
		const url = `${API_BASE}/foods/search?query=${encodeURIComponent(term)}&pageSize=10&api_key=${API_KEY}`;
		try {
			const res = await httpsGet(url);
			if (res.foods && res.foods.length > 0) {
				// Pick best unclaimed result
				for (const food of res.foods) {
					const id = String(food.fdcId);
					if (!alreadyClaimed.has(id)) {
						return { fdcId: id, description: food.description };
					}
				}
			}
		} catch (err) {
			console.error(`  API error for "${term}": ${err.message}`);
		}
		await sleep(DELAY_MS);
	}
	return null;
}

// ─── Load files ───────────────────────────────────────────────────────────────

const jsonFiles = fs
	.readdirSync(SEEDS_DIR)
	.filter((f) => f.endsWith(".json"))
	.sort();

const fileData = {};
for (const file of jsonFiles) {
	fileData[file] = JSON.parse(
		fs.readFileSync(path.join(SEEDS_DIR, file), "utf8"),
	);
}

// ─── Phase 1: Remove variants / cross-file duplicates ────────────────────────

let totalRemoved = 0;

console.log("=== Phase 1: Removing variants and cross-file duplicates ===\n");

for (const file of jsonFiles) {
	const data = fileData[file];
	const before = data.products.length;
	data.products = data.products.filter((p) => {
		const key = `${file}::${p.name}`;
		if (PRODUCTS_TO_REMOVE.has(key)) {
			console.log(
				`  ❌ REMOVE  ${file} → "${p.name}" (external_id: ${p.external_id})`,
			);
			return false;
		}
		return true;
	});
	const removed = before - data.products.length;
	totalRemoved += removed;
}

console.log(`\nRemoved ${totalRemoved} products in Phase 1.\n`);

// ─── Phase 2: Fetch correct IDs for real products with wrong IDs ──────────────

console.log(
	"=== Phase 2: Fetching correct USDA IDs for misassigned products ===\n",
);

// Build set of all currently assigned IDs (post-phase-1)
const claimedIds = new Set();
for (const file of jsonFiles) {
	for (const p of fileData[file].products) {
		claimedIds.add(String(p.external_id));
	}
}

async function phase2() {
	for (const [key, searchTerm] of Object.entries(PRODUCTS_TO_REFETCH)) {
		const [file, productName] = key.split("::");
		const data = fileData[file];
		if (!data) {
			console.warn(`  ⚠️  File not found: ${file}`);
			continue;
		}
		const product = data.products.find((p) => p.name === productName);
		if (!product) {
			// Already removed in phase 1
			continue;
		}

		const oldId = product.external_id;
		console.log(`🔄 "${productName}" (${file})  old ID: ${oldId}`);
		const result = await findFdcId(searchTerm, claimedIds);
		await sleep(DELAY_MS);

		if (result) {
			console.log(`   ✅ → "${result.description}" (FDC ID: ${result.fdcId})`);
			product.external_id = result.fdcId;
			product.usda_description = result.description;
			claimedIds.add(result.fdcId);
		} else {
			console.log(`   ⚠️  No unique result found — marking NEEDS_REVIEW`);
			product.external_id = `NEEDS_REVIEW_${oldId}`;
		}
	}
}

phase2()
	.then(() => {
		// ─── Verify: check remaining duplicates ────────────────────────────────────
		console.log("\n=== Verification: remaining duplicate external_ids ===\n");
		const idMap = {};
		for (const file of jsonFiles) {
			for (const p of fileData[file].products) {
				const id = String(p.external_id);
				if (!idMap[id]) idMap[id] = [];
				idMap[id].push(`${file}::${p.name}`);
			}
		}
		const dups = Object.entries(idMap).filter(([, v]) => v.length > 1);
		if (dups.length === 0) {
			console.log("✅ No duplicate external_ids remain!\n");
		} else {
			console.log(`⚠️  ${dups.length} duplicate IDs still remain:`);
			for (const [id, entries] of dups) {
				console.log(`  ${id}:`);
				for (const e of entries) console.log(`    - ${e}`);
			}
			console.log();
		}

		// ─── Count totals ───────────────────────────────────────────────────────────
		let total = 0;
		for (const file of jsonFiles) total += fileData[file].products.length;
		console.log(`Total products remaining: ${total}`);

		// ─── Save files ─────────────────────────────────────────────────────────────
		if (!DRY_RUN) {
			for (const file of jsonFiles) {
				const filePath = path.join(SEEDS_DIR, file);
				fs.writeFileSync(
					filePath,
					JSON.stringify(fileData[file], null, 2) + "\n",
					"utf8",
				);
				console.log(`💾 Saved ${file}`);
			}
			console.log("\n✅ Done.");
		} else {
			console.log("\n(Dry-run — no files saved)");
		}
	})
	.catch((err) => {
		console.error("Fatal:", err);
		process.exit(1);
	});
