#!/usr/bin/env node

/**
 * Fix Duplicate external_ids in seed JSON files
 *
 * For each product with a duplicated external_id, fetches the correct
 * USDA FDC ID by searching for the product name via the USDA API,
 * then updates the JSON files in place.
 *
 * Usage:
 *   node supabase/seeds/fix-duplicate-ids.js [--dry-run]
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

const API_KEY =
	process.env.USDA_API_KEY || "u0cWhJXGaa2SOuA66L0st2YqeB64Hb9JjK50qgJg";
const API_BASE = "https://api.nal.usda.gov/fdc/v1";
const SEEDS_DIR = path.resolve(__dirname);
const DRY_RUN = process.argv.includes("--dry-run");
const DELAY_MS = 300; // polite delay between API calls

if (DRY_RUN) {
	console.log("🔎 DRY RUN mode — pliki nie zostaną zapisane\n");
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpsGet(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				let data = "";
				res.on("data", (chunk) => (data += chunk));
				res.on("end", () => {
					try {
						resolve(JSON.parse(data));
					} catch (e) {
						reject(new Error(`JSON parse error: ${e.message}`));
					}
				});
			})
			.on("error", reject);
	});
}

/**
 * Search USDA FDC for a product and return the best-matching fdcId.
 * Tries several query variants to maximise hit rate.
 */
async function findFdcId(productName, categorySlug) {
	// Build search terms from most to least specific
	const searchTerms = [`${productName} raw`, `${productName} dry`, productName];

	for (const term of searchTerms) {
		const query = encodeURIComponent(term);
		const url = `${API_BASE}/foods/search?query=${query}&pageSize=5&api_key=${API_KEY}`;

		try {
			const response = await httpsGet(url);
			if (response.foods && response.foods.length > 0) {
				const food = response.foods[0];
				console.log(
					`   ✅ "${term}" → "${food.description}" (FDC ID: ${food.fdcId})`,
				);
				return { fdcId: String(food.fdcId), description: food.description };
			}
		} catch (err) {
			console.error(`   ❌ API error for "${term}": ${err.message}`);
		}

		await sleep(DELAY_MS);
	}

	console.log(`   ⚠️  No result found for "${productName}"`);
	return null;
}

// ─── Load all JSON files ─────────────────────────────────────────────────────

const jsonFiles = fs
	.readdirSync(SEEDS_DIR)
	.filter((f) => f.endsWith(".json"))
	.sort();

/** { file, productIndex, product } */
const allProducts = [];

for (const file of jsonFiles) {
	const filePath = path.join(SEEDS_DIR, file);
	const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
	for (let i = 0; i < data.products.length; i++) {
		allProducts.push({
			file,
			filePath,
			productIndex: i,
			product: data.products[i],
		});
	}
}

// ─── Detect duplicates ───────────────────────────────────────────────────────

/** Map<external_id, Array<{file, productIndex, product}>> */
const idMap = new Map();
for (const entry of allProducts) {
	const id = entry.product.external_id;
	if (!idMap.has(id)) idMap.set(id, []);
	idMap.get(id).push(entry);
}

const duplicateGroups = [...idMap.entries()].filter(
	([, items]) => items.length > 1,
);

if (duplicateGroups.length === 0) {
	console.log("✅ No duplicate external_ids found — nothing to fix.");
	process.exit(0);
}

console.log(
	`Found ${duplicateGroups.length} duplicated IDs affecting the following products:\n`,
);
for (const [id, items] of duplicateGroups) {
	console.log(`  ID ${id}:`);
	for (const item of items) {
		console.log(`    - ${item.product.name} (${item.file})`);
	}
}
console.log();

// ─── Fix duplicates ──────────────────────────────────────────────────────────

/**
 * Strategy:
 *  - Keep the external_id for the FIRST occurrence of each duplicated ID.
 *  - For every subsequent occurrence, fetch a new FDC ID from USDA API.
 */

// Track which IDs have already been "claimed" by the first occurrence
const claimedIds = new Set();

// Collect patches: { filePath, productIndex, newExternalId, newUsdaDescription }
const patches = [];

async function main() {
	for (const [originalId, items] of duplicateGroups) {
		for (let i = 0; i < items.length; i++) {
			const { file, filePath, productIndex, product } = items[i];

			if (i === 0) {
				// First occurrence keeps the original id
				claimedIds.add(originalId);
				console.log(
					`⏭️  Keeping ID ${originalId} for "${product.name}" (${file})`,
				);
				continue;
			}

			// All subsequent occurrences need a new ID
			console.log(
				`\n🔄 Fixing "${product.name}" (${file}) — currently has duplicate ID ${originalId}`,
			);

			const result = await findFdcId(product.name, product.category_slug);
			await sleep(DELAY_MS);

			if (result && !claimedIds.has(result.fdcId)) {
				claimedIds.add(result.fdcId);
				patches.push({
					filePath,
					productIndex,
					newExternalId: result.fdcId,
					newUsdaDescription: result.description,
					productName: product.name,
				});
				console.log(`   → Will update external_id to ${result.fdcId}`);
			} else if (result && claimedIds.has(result.fdcId)) {
				// USDA returned an ID that is already used — mark for manual review
				console.log(
					`   ⚠️  USDA returned ID ${result.fdcId} which is already claimed. Marking as NEEDS_REVIEW.`,
				);
				patches.push({
					filePath,
					productIndex,
					newExternalId: `NEEDS_REVIEW_${result.fdcId}`,
					newUsdaDescription: `NEEDS_REVIEW: ${result.description}`,
					productName: product.name,
				});
			} else {
				console.log(
					`   ⚠️  Could not resolve ID for "${product.name}" — leaving as NEEDS_REVIEW.`,
				);
				patches.push({
					filePath,
					productIndex,
					newExternalId: `NEEDS_REVIEW_${originalId}`,
					newUsdaDescription: `NEEDS_REVIEW: no USDA result`,
					productName: product.name,
				});
			}
		}
	}

	// ─── Apply patches ───────────────────────────────────────────────────────

	if (patches.length === 0) {
		console.log("\n✅ No patches to apply.");
		return;
	}

	// Group patches by file
	const patchesByFile = new Map();
	for (const patch of patches) {
		if (!patchesByFile.has(patch.filePath))
			patchesByFile.set(patch.filePath, []);
		patchesByFile.get(patch.filePath).push(patch);
	}

	console.log(`\n${"=".repeat(60)}`);
	console.log(
		`📝 Applying ${patches.length} patches to ${patchesByFile.size} file(s)...\n`,
	);

	for (const [filePath, filePatches] of patchesByFile) {
		const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

		for (const patch of filePatches) {
			const product = data.products[patch.productIndex];
			console.log(`  [${path.basename(filePath)}] "${patch.productName}"`);
			console.log(
				`    external_id: ${product.external_id} → ${patch.newExternalId}`,
			);
			product.external_id = patch.newExternalId;
			if (patch.newUsdaDescription) {
				product.usda_description = patch.newUsdaDescription;
			}
		}

		if (!DRY_RUN) {
			fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
			console.log(`  💾 Saved ${path.basename(filePath)}\n`);
		} else {
			console.log(`  (dry-run — not saved)\n`);
		}
	}

	const needsReview = patches.filter((p) =>
		p.newExternalId.startsWith("NEEDS_REVIEW"),
	);
	if (needsReview.length > 0) {
		console.log(
			`\n⚠️  ${needsReview.length} product(s) marked NEEDS_REVIEW (manual fix required):`,
		);
		for (const p of needsReview) {
			console.log(`  - ${p.productName} (${path.basename(p.filePath)})`);
		}
	} else {
		console.log("\n✅ All duplicate IDs resolved successfully!");
	}
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
