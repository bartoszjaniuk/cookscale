#!/usr/bin/env node

/**
 * USDA FDC API Data Fetcher - Universal
 * Pobiera dane produktów spożywczych z USDA FoodData Central API
 * dla dowolnej kategorii
 *
 * Usage:
 *   node supabase/seeds/fetch-usda-data.js [category]
 *   node supabase/seeds/fetch-usda-data.js meat
 *   node supabase/seeds/fetch-usda-data.js vegetables
 *   node supabase/seeds/fetch-usda-data.js fish
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// Klucz API z .env
const API_KEY =
	process.env.USDA_API_KEY || "u0cWhJXGaa2SOuA66L0st2YqeB64Hb9JjK50qgJg";
const API_BASE = "https://api.nal.usda.gov/fdc/v1";

// Konfiguracja kategorii - łatwo rozszerzalna
const CATEGORIES_CONFIG = {
	meat: {
		displayName: "Meat",
		slug: "meat",
		products: [
			{ searchTerm: "whole chicken raw", expected: "Whole chicken" },
			{ searchTerm: "chicken breast raw", expected: "Chicken breast" },
			{ searchTerm: "chicken thighs raw", expected: "Chicken thighs" },
			{ searchTerm: "chicken drumsticks raw", expected: "Chicken drumsticks" },
			{ searchTerm: "chicken wings raw", expected: "Chicken wings" },
			{ searchTerm: "ground chicken raw", expected: "Ground chicken" },
			{ searchTerm: "chicken liver raw", expected: "Chicken liver" },
			{ searchTerm: "chicken gizzards raw", expected: "Chicken gizzards" },
			{ searchTerm: "whole turkey raw", expected: "Whole turkey" },
			{ searchTerm: "turkey breast raw", expected: "Turkey breast" },
			{ searchTerm: "turkey thighs raw", expected: "Turkey thighs" },
			{ searchTerm: "ground turkey raw", expected: "Ground turkey" },
			{ searchTerm: "turkey wings raw", expected: "Turkey wings" },
			{ searchTerm: "ground beef raw", expected: "Ground beef" },
			{ searchTerm: "beef sirloin steak raw", expected: "Beef sirloin steak" },
			{
				searchTerm: "beef tenderloin steak raw",
				expected: "Beef tenderloin steak",
			},
			{ searchTerm: "beef ribeye steak raw", expected: "Beef ribeye steak" },
			{ searchTerm: "beef t-bone steak raw", expected: "Beef T-bone steak" },
			{
				searchTerm: "beef porterhouse steak raw",
				expected: "Beef porterhouse steak",
			},
			{ searchTerm: "beef flank steak raw", expected: "Beef flank steak" },
			{ searchTerm: "beef skirt steak raw", expected: "Beef skirt steak" },
			{ searchTerm: "beef chuck roast raw", expected: "Beef chuck roast" },
			{ searchTerm: "beef brisket raw", expected: "Beef brisket" },
			{ searchTerm: "beef short ribs raw", expected: "Beef short ribs" },
			{ searchTerm: "beef shank raw", expected: "Beef shank" },
			{ searchTerm: "beef liver raw", expected: "Beef liver" },
			{ searchTerm: "beef heart raw", expected: "Beef heart" },
			{ searchTerm: "beef tongue raw", expected: "Beef tongue" },
			{ searchTerm: "pork chops raw", expected: "Pork chops" },
			{ searchTerm: "pork loin raw", expected: "Pork loin" },
			{ searchTerm: "pork tenderloin raw", expected: "Pork tenderloin" },
			{ searchTerm: "pork shoulder raw", expected: "Pork shoulder" },
			{ searchTerm: "pork ribs raw", expected: "Pork ribs" },
			{ searchTerm: "ground pork raw", expected: "Ground pork" },
			{ searchTerm: "pork belly raw", expected: "Pork belly" },
			{ searchTerm: "ham raw", expected: "Ham" },
			{ searchTerm: "bacon raw", expected: "Bacon" },
			{ searchTerm: "pork sausage raw", expected: "Pork sausage" },
			{ searchTerm: "pork liver raw", expected: "Pork liver" },
			{ searchTerm: "lamb chops raw", expected: "Lamb chops" },
			{ searchTerm: "ground lamb raw", expected: "Ground lamb" },
			{ searchTerm: "lamb leg raw", expected: "Lamb leg" },
			{ searchTerm: "lamb shoulder raw", expected: "Lamb shoulder" },
			{ searchTerm: "lamb shank raw", expected: "Lamb shank" },
			{ searchTerm: "rack of lamb raw", expected: "Rack of lamb" },
			{ searchTerm: "lamb liver raw", expected: "Lamb liver" },
			{ searchTerm: "veal cutlet raw", expected: "Veal cutlet" },
			{ searchTerm: "veal loin raw", expected: "Veal loin" },
			{ searchTerm: "veal shank raw", expected: "Veal shank" },
			{ searchTerm: "ground veal raw", expected: "Ground veal" },
			{ searchTerm: "whole duck raw", expected: "Whole duck" },
			{ searchTerm: "duck breast raw", expected: "Duck breast" },
			{ searchTerm: "duck legs raw", expected: "Duck legs" },
			{ searchTerm: "goose raw", expected: "Goose" },
			{ searchTerm: "goose breast raw", expected: "Goose breast" },
			{ searchTerm: "rabbit meat raw", expected: "Rabbit meat" },
			{ searchTerm: "venison raw", expected: "Venison" },
			{ searchTerm: "bison raw", expected: "Bison" },
			{ searchTerm: "elk meat raw", expected: "Elk meat" },
			{ searchTerm: "wild boar raw", expected: "Wild boar" },
			{ searchTerm: "salami", expected: "Salami" },
			{ searchTerm: "pepperoni", expected: "Pepperoni" },
			{ searchTerm: "prosciutto", expected: "Prosciutto" },
			{ searchTerm: "chorizo", expected: "Chorizo" },
			{ searchTerm: "hot dog", expected: "Hot dog" },
			{ searchTerm: "beef sausage raw", expected: "Beef sausage" },
			{ searchTerm: "turkey sausage raw", expected: "Turkey sausage" },
			{ searchTerm: "liver raw", expected: "Liver" },
			{ searchTerm: "kidney raw", expected: "Kidney" },
			{ searchTerm: "heart raw", expected: "Heart" },
			{ searchTerm: "tongue raw", expected: "Tongue" },
			{ searchTerm: "tripe raw", expected: "Tripe" },
			{ searchTerm: "beef flank steak raw", expected: "Beef flank steak" },
			{ searchTerm: "beef skirt steak raw", expected: "Beef skirt steak" },
			{ searchTerm: "beef chuck roast raw", expected: "Beef chuck roast" },
			{ searchTerm: "beef brisket raw", expected: "Beef brisket" },
			{ searchTerm: "beef short ribs raw", expected: "Beef short ribs" },
			{ searchTerm: "beef shank raw", expected: "Beef shank" },
			{ searchTerm: "beef liver raw", expected: "Beef liver" },
			{ searchTerm: "beef heart raw", expected: "Beef heart" },
			{ searchTerm: "beef tongue raw", expected: "Beef tongue" },
			{ searchTerm: "pork chops raw", expected: "Pork chops" },
			{ searchTerm: "pork loin raw", expected: "Pork loin" },
			{ searchTerm: "pork tenderloin raw", expected: "Pork tenderloin" },
			{ searchTerm: "pork shoulder raw", expected: "Pork shoulder" },
			{ searchTerm: "pork ribs raw", expected: "Pork ribs" },
			{ searchTerm: "ground pork raw", expected: "Ground pork" },
			{ searchTerm: "pork belly raw", expected: "Pork belly" },
			{ searchTerm: "ham raw", expected: "Ham" },
			{ searchTerm: "bacon raw", expected: "Bacon" },
			{ searchTerm: "pork sausage raw", expected: "Pork sausage" },
			{ searchTerm: "pork liver raw", expected: "Pork liver" },
			{ searchTerm: "lamb chops raw", expected: "Lamb chops" },
			{ searchTerm: "ground lamb raw", expected: "Ground lamb" },
			{ searchTerm: "lamb leg raw", expected: "Lamb leg" },
			{ searchTerm: "lamb shoulder raw", expected: "Lamb shoulder" },
			{ searchTerm: "lamb shank raw", expected: "Lamb shank" },
			{ searchTerm: "rack of lamb raw", expected: "Rack of lamb" },
			{ searchTerm: "lamb liver raw", expected: "Lamb liver" },
			{ searchTerm: "veal cutlet raw", expected: "Veal cutlet" },
			{ searchTerm: "veal loin raw", expected: "Veal loin" },
			{ searchTerm: "veal shank raw", expected: "Veal shank" },
			{ searchTerm: "ground veal raw", expected: "Ground veal" },
			{ searchTerm: "whole duck raw", expected: "Whole duck" },
			{ searchTerm: "duck breast raw", expected: "Duck breast" },
			{ searchTerm: "duck legs raw", expected: "Duck legs" },
			{ searchTerm: "goose raw", expected: "Goose" },
			{ searchTerm: "goose breast raw", expected: "Goose breast" },
			{ searchTerm: "rabbit meat raw", expected: "Rabbit meat" },
			{ searchTerm: "venison raw", expected: "Venison" },
			{ searchTerm: "bison raw", expected: "Bison" },
			{ searchTerm: "elk meat raw", expected: "Elk meat" },
			{ searchTerm: "wild boar raw", expected: "Wild boar" },
			{ searchTerm: "salami", expected: "Salami" },
			{ searchTerm: "pepperoni", expected: "Pepperoni" },
			{ searchTerm: "prosciutto", expected: "Prosciutto" },
			{ searchTerm: "chorizo", expected: "Chorizo" },
			{ searchTerm: "hot dog", expected: "Hot dog" },
			{ searchTerm: "beef sausage raw", expected: "Beef sausage" },
			{ searchTerm: "turkey sausage raw", expected: "Turkey sausage" },
			{ searchTerm: "liver raw", expected: "Liver" },
			{ searchTerm: "kidney raw", expected: "Kidney" },
			{ searchTerm: "heart raw", expected: "Heart" },
			{ searchTerm: "tongue raw", expected: "Tongue" },
			{ searchTerm: "tripe raw", expected: "Tripe" },
		],
	},
	fish: {
		displayName: "Fish",
		slug: "fish",
		products: [
			// Salmon
			{ searchTerm: "salmon raw", expected: "Salmon" },
			{ searchTerm: "atlantic salmon raw", expected: "Atlantic salmon" },
			{ searchTerm: "sockeye salmon raw", expected: "Sockeye salmon" },
			{ searchTerm: "smoked salmon", expected: "Smoked salmon" },

			// Tuna
			{ searchTerm: "tuna raw", expected: "Tuna" },
			{ searchTerm: "yellowfin tuna raw", expected: "Yellowfin tuna" },
			{ searchTerm: "bluefin tuna raw", expected: "Bluefin tuna" },
			{ searchTerm: "canned tuna in water", expected: "Canned tuna" },

			// White fish
			{ searchTerm: "cod raw", expected: "Cod" },
			{ searchTerm: "atlantic cod raw", expected: "Atlantic cod" },
			{ searchTerm: "pacific cod raw", expected: "Pacific cod" },
			{ searchTerm: "haddock raw", expected: "Haddock" },
			{ searchTerm: "pollock raw", expected: "Pollock" },
			{ searchTerm: "halibut raw", expected: "Halibut" },
			{ searchTerm: "sole raw", expected: "Sole" },
			{ searchTerm: "flounder raw", expected: "Flounder" },
			{ searchTerm: "tilapia raw", expected: "Tilapia" },
			{ searchTerm: "catfish raw", expected: "Catfish" },

			// Oily fish
			{ searchTerm: "mackerel raw", expected: "Mackerel" },
			{ searchTerm: "herring raw", expected: "Herring" },
			{ searchTerm: "sardine raw", expected: "Sardine" },
			{ searchTerm: "anchovy raw", expected: "Anchovy" },
			{ searchTerm: "eel raw", expected: "Eel" },

			// Trout
			{ searchTerm: "trout raw", expected: "Trout" },
			{ searchTerm: "rainbow trout raw", expected: "Rainbow trout" },

			// Sea fish
			{ searchTerm: "sea bass raw", expected: "Sea bass" },
			{ searchTerm: "snapper raw", expected: "Snapper" },
			{ searchTerm: "grouper raw", expected: "Grouper" },
			{ searchTerm: "mahi mahi raw", expected: "Mahi mahi" },
			{ searchTerm: "swordfish raw", expected: "Swordfish" },

			// Flatfish
			{ searchTerm: "turbot raw", expected: "Turbot" },
			{ searchTerm: "plaice raw", expected: "Plaice" },

			// Freshwater fish
			{ searchTerm: "carp raw", expected: "Carp" },
			{ searchTerm: "pike raw", expected: "Pike" },
			{ searchTerm: "perch raw", expected: "Perch" },
			{ searchTerm: "zander raw", expected: "Zander" },

			// Shellfish
			{ searchTerm: "shrimp raw", expected: "Shrimp" },
			{ searchTerm: "prawn raw", expected: "Prawn" },
			{ searchTerm: "crab raw", expected: "Crab" },
			{ searchTerm: "lobster raw", expected: "Lobster" },
			{ searchTerm: "crayfish raw", expected: "Crayfish" },

			// Mollusks
			{ searchTerm: "mussels raw", expected: "Mussels" },
			{ searchTerm: "clams raw", expected: "Clams" },
			{ searchTerm: "oysters raw", expected: "Oysters" },
			{ searchTerm: "scallops raw", expected: "Scallops" },

			// Cephalopods
			{ searchTerm: "squid raw", expected: "Squid" },
			{ searchTerm: "octopus raw", expected: "Octopus" },
			{ searchTerm: "cuttlefish raw", expected: "Cuttlefish" },

			// Roe & specialty
			{ searchTerm: "caviar", expected: "Caviar" },
			{ searchTerm: "fish roe raw", expected: "Fish roe" },

			// Processed fish
			{ searchTerm: "fish sticks frozen", expected: "Fish sticks" },
			{ searchTerm: "smoked mackerel", expected: "Smoked mackerel" },
			{ searchTerm: "pickled herring", expected: "Pickled herring" },

			// Sushi / sashimi common
			{ searchTerm: "sashimi salmon", expected: "Salmon sashimi" },
			{ searchTerm: "sashimi tuna", expected: "Tuna sashimi" },

			// Generic seafood
			{ searchTerm: "mixed seafood raw", expected: "Mixed seafood" },
		],
	},
	vegetables: {
		displayName: "Vegetables",
		slug: "vegetables",
		products: [
			{ searchTerm: "broccoli raw", expected: "Broccoli" },
			{ searchTerm: "carrot raw", expected: "Carrot" },
			{ searchTerm: "spinach raw", expected: "Spinach" },
			{ searchTerm: "tomato raw", expected: "Tomato" },
			{ searchTerm: "cucumber raw", expected: "Cucumber" },
			{ searchTerm: "bell pepper raw", expected: "Bell pepper" },
			{ searchTerm: "lettuce raw", expected: "Lettuce" },
			{ searchTerm: "garlic raw", expected: "Garlic" },
			{ searchTerm: "onion raw", expected: "Onion" },
			{ searchTerm: "green peas raw", expected: "Green peas" },
			{ searchTerm: "asparagus raw", expected: "Asparagus" },
			{ searchTerm: "cabbage raw", expected: "Cabbage" },
			{ searchTerm: "zucchini raw", expected: "Zucchini" },
			{ searchTerm: "potato raw", expected: "Potato" },
			{ searchTerm: "mushroom raw", expected: "Mushroom" },
			{ searchTerm: "celery raw", expected: "Celery" },
			{ searchTerm: "cauliflower raw", expected: "Cauliflower" },
			{ searchTerm: "eggplant raw", expected: "Eggplant" },
			{ searchTerm: "kale raw", expected: "Kale" },
			{ searchTerm: "arugula raw", expected: "Arugula" },
			{ searchTerm: "beetroot raw", expected: "Beetroot" },
			{ searchTerm: "radish raw", expected: "Radish" },
			{ searchTerm: "turnip raw", expected: "Turnip" },
			{ searchTerm: "sweet potato raw", expected: "Sweet potato" },
			{ searchTerm: "pumpkin raw", expected: "Pumpkin" },
			{ searchTerm: "butternut squash raw", expected: "Butternut squash" },
			{ searchTerm: "leek raw", expected: "Leek" },
			{ searchTerm: "spring onion raw", expected: "Spring onion" },
			{ searchTerm: "shallot raw", expected: "Shallot" },
			{ searchTerm: "fennel raw", expected: "Fennel" },
			{ searchTerm: "parsley root raw", expected: "Parsley root" },
			{ searchTerm: "parsnip raw", expected: "Parsnip" },
			{ searchTerm: "rutabaga raw", expected: "Rutabaga" },
			{ searchTerm: "kohlrabi raw", expected: "Kohlrabi" },
			{ searchTerm: "brussels sprouts raw", expected: "Brussels sprouts" },
			{ searchTerm: "bok choy raw", expected: "Bok choy" },
			{ searchTerm: "chinese cabbage raw", expected: "Chinese cabbage" },
			{ searchTerm: "collard greens raw", expected: "Collard greens" },
			{ searchTerm: "mustard greens raw", expected: "Mustard greens" },
			{ searchTerm: "swiss chard raw", expected: "Swiss chard" },
			{ searchTerm: "endive raw", expected: "Endive" },
			{ searchTerm: "radicchio raw", expected: "Radicchio" },
			{ searchTerm: "watercress raw", expected: "Watercress" },
			{ searchTerm: "dill raw", expected: "Dill" },
			{ searchTerm: "cilantro raw", expected: "Cilantro" },
			{ searchTerm: "basil raw", expected: "Basil" },
			{ searchTerm: "oregano fresh", expected: "Oregano" },
			{ searchTerm: "thyme fresh", expected: "Thyme" },
			{ searchTerm: "rosemary fresh", expected: "Rosemary" },
			{ searchTerm: "sage fresh", expected: "Sage" },
			{ searchTerm: "corn raw", expected: "Corn" },
			{ searchTerm: "green beans raw", expected: "Green beans" },
			{ searchTerm: "yellow wax beans raw", expected: "Wax beans" },
			{ searchTerm: "broad beans raw", expected: "Broad beans" },
			{ searchTerm: "chickpeas raw", expected: "Chickpeas" },
			{ searchTerm: "lentils raw", expected: "Lentils" },
			{ searchTerm: "soybeans raw", expected: "Soybeans" },
			{ searchTerm: "edamame raw", expected: "Edamame" },
			{ searchTerm: "black beans raw", expected: "Black beans" },
			{ searchTerm: "kidney beans raw", expected: "Kidney beans" },
			{ searchTerm: "jalapeno raw", expected: "Jalapeno" },
			{ searchTerm: "chili pepper raw", expected: "Chili pepper" },
			{ searchTerm: "habanero raw", expected: "Habanero" },
			{ searchTerm: "poblano raw", expected: "Poblano" },
			{ searchTerm: "serrano pepper raw", expected: "Serrano pepper" },
			{ searchTerm: "daikon raw", expected: "Daikon" },
			{ searchTerm: "lotus root raw", expected: "Lotus root" },
			{ searchTerm: "bamboo shoots raw", expected: "Bamboo shoots" },
			{ searchTerm: "artichoke raw", expected: "Artichoke" },
			{ searchTerm: "okra raw", expected: "Okra" },
			{ searchTerm: "yam raw", expected: "Yam" },
			{ searchTerm: "cassava raw", expected: "Cassava" },
			{ searchTerm: "taro root raw", expected: "Taro root" },
			{ searchTerm: "jicama raw", expected: "Jicama" },
			{ searchTerm: "chayote raw", expected: "Chayote" },
			{ searchTerm: "spaghetti squash raw", expected: "Spaghetti squash" },
			{ searchTerm: "acorn squash raw", expected: "Acorn squash" },
			{ searchTerm: "delicata squash raw", expected: "Delicata squash" },
			{ searchTerm: "snap peas raw", expected: "Snap peas" },
			{ searchTerm: "snow peas raw", expected: "Snow peas" },
			{ searchTerm: "seaweed raw", expected: "Seaweed" },
			{ searchTerm: "nori raw", expected: "Nori" },
			{ searchTerm: "wakame raw", expected: "Wakame" },
			{ searchTerm: "kombu raw", expected: "Kombu" },
			{ searchTerm: "microgreens raw", expected: "Microgreens" },
			{ searchTerm: "alfalfa sprouts raw", expected: "Alfalfa sprouts" },
			{ searchTerm: "bean sprouts raw", expected: "Bean sprouts" },
			{ searchTerm: "sunflower sprouts raw", expected: "Sunflower sprouts" },
			{ searchTerm: "pea shoots raw", expected: "Pea shoots" },
			{ searchTerm: "cress raw", expected: "Cress" },
		],
	},
	grains: {
		displayName: "Grains",
		slug: "grains",
		products: [
			{ searchTerm: "white rice raw", expected: "White rice" },
			{ searchTerm: "brown rice raw", expected: "Brown rice" },
			{ searchTerm: "basmati rice raw", expected: "Basmati rice" },
			{ searchTerm: "jasmine rice raw", expected: "Jasmine rice" },
			{ searchTerm: "wild rice raw", expected: "Wild rice" },
			{ searchTerm: "black rice raw", expected: "Black rice" },
			{ searchTerm: "red rice raw", expected: "Red rice" },
			{ searchTerm: "arborio rice raw", expected: "Arborio rice" },
			{ searchTerm: "sushi rice raw", expected: "Sushi rice" },
			{ searchTerm: "oats raw", expected: "Oats" },
			{ searchTerm: "rolled oats raw", expected: "Rolled oats" },
			{ searchTerm: "steel cut oats raw", expected: "Steel cut oats" },
			{ searchTerm: "instant oats raw", expected: "Instant oats" },
			{ searchTerm: "oat bran raw", expected: "Oat bran" },
			{ searchTerm: "wheat raw", expected: "Wheat" },
			{ searchTerm: "whole wheat raw", expected: "Whole wheat" },
			{ searchTerm: "bulgur dry", expected: "Bulgur" },
			{ searchTerm: "couscous dry", expected: "Couscous" },
			{ searchTerm: "semolina dry", expected: "Semolina" },
			{ searchTerm: "farro raw", expected: "Farro" },
			{ searchTerm: "spelt raw", expected: "Spelt" },
			{ searchTerm: "kamut raw", expected: "Kamut" },
			{ searchTerm: "barley raw", expected: "Barley" },
			{ searchTerm: "pearled barley raw", expected: "Pearled barley" },
			{ searchTerm: "rye raw", expected: "Rye" },
			{ searchTerm: "rye berries raw", expected: "Rye berries" },
			{ searchTerm: "corn raw", expected: "Corn" },
			{ searchTerm: "popcorn kernels raw", expected: "Popcorn" },
			{ searchTerm: "polenta dry", expected: "Polenta" },
			{ searchTerm: "cornmeal dry", expected: "Cornmeal" },
			{ searchTerm: "grits dry", expected: "Grits" },
			{ searchTerm: "millet raw", expected: "Millet" },
			{ searchTerm: "sorghum raw", expected: "Sorghum" },
			{ searchTerm: "teff raw", expected: "Teff" },
			{ searchTerm: "quinoa raw", expected: "Quinoa" },
			{ searchTerm: "white quinoa raw", expected: "White quinoa" },
			{ searchTerm: "red quinoa raw", expected: "Red quinoa" },
			{ searchTerm: "black quinoa raw", expected: "Black quinoa" },
			{ searchTerm: "buckwheat raw", expected: "Buckwheat" },
			{ searchTerm: "buckwheat groats raw", expected: "Buckwheat groats" },
			{ searchTerm: "amaranth raw", expected: "Amaranth" },
			{ searchTerm: "freekeh raw", expected: "Freekeh" },
			{ searchTerm: "triticale raw", expected: "Triticale" },
			{ searchTerm: "fonio raw", expected: "Fonio" },
			{ searchTerm: "rice noodles dry", expected: "Rice noodles" },
			{ searchTerm: "egg noodles dry", expected: "Egg noodles" },
			{ searchTerm: "udon noodles dry", expected: "Udon noodles" },
			{ searchTerm: "soba noodles dry", expected: "Soba noodles" },
			{ searchTerm: "pasta dry", expected: "Pasta" },
			{ searchTerm: "whole wheat pasta dry", expected: "Whole wheat pasta" },
			{ searchTerm: "spaghetti dry", expected: "Spaghetti" },
			{ searchTerm: "penne dry", expected: "Penne" },
			{ searchTerm: "fusilli dry", expected: "Fusilli" },
			{ searchTerm: "macaroni dry", expected: "Macaroni" },
			{ searchTerm: "lasagna sheets dry", expected: "Lasagna sheets" },
			{ searchTerm: "white bread", expected: "White bread" },
			{ searchTerm: "whole wheat bread", expected: "Whole wheat bread" },
			{ searchTerm: "rye bread", expected: "Rye bread" },
			{ searchTerm: "sourdough bread", expected: "Sourdough bread" },
			{ searchTerm: "multigrain bread", expected: "Multigrain bread" },
			{ searchTerm: "bagel", expected: "Bagel" },
			{ searchTerm: "english muffin", expected: "English muffin" },
			{ searchTerm: "tortilla wheat", expected: "Wheat tortilla" },
			{ searchTerm: "corn tortilla", expected: "Corn tortilla" },
			{ searchTerm: "cracker whole grain", expected: "Whole grain crackers" },
			{ searchTerm: "muesli", expected: "Muesli" },
			{ searchTerm: "granola", expected: "Granola" },
			{ searchTerm: "bran flakes", expected: "Bran flakes" },
			{ searchTerm: "corn flakes", expected: "Corn flakes" },
			{ searchTerm: "rice cakes", expected: "Rice cakes" },
			{ searchTerm: "puffed rice", expected: "Puffed rice" },
			{ searchTerm: "puffed wheat", expected: "Puffed wheat" },
		],
	},
	legumes: {
		displayName: "Legumes",
		slug: "legumes",
		products: [
			{ searchTerm: "chickpeas raw", expected: "Chickpeas" },
			{ searchTerm: "black chickpeas raw", expected: "Black chickpeas" },
			{ searchTerm: "lentils raw", expected: "Lentils" },
			{ searchTerm: "red lentils raw", expected: "Red lentils" },
			{ searchTerm: "green lentils raw", expected: "Green lentils" },
			{ searchTerm: "brown lentils raw", expected: "Brown lentils" },
			{ searchTerm: "black lentils raw", expected: "Black lentils" },
			{ searchTerm: "black beans raw", expected: "Black beans" },
			{ searchTerm: "kidney beans raw", expected: "Kidney beans" },
			{ searchTerm: "pinto beans raw", expected: "Pinto beans" },
			{ searchTerm: "white beans raw", expected: "White beans" },
			{ searchTerm: "navy beans raw", expected: "Navy beans" },
			{ searchTerm: "cannellini beans raw", expected: "Cannellini beans" },
			{
				searchTerm: "great northern beans raw",
				expected: "Great northern beans",
			},
			{ searchTerm: "red beans raw", expected: "Red beans" },
			{ searchTerm: "adzuki beans raw", expected: "Adzuki beans" },
			{ searchTerm: "mung beans raw", expected: "Mung beans" },
			{ searchTerm: "black-eyed peas raw", expected: "Black-eyed peas" },
			{ searchTerm: "soybeans raw", expected: "Soybeans" },
			{ searchTerm: "edamame raw", expected: "Edamame" },
			{ searchTerm: "peas raw", expected: "Peas" },
			{ searchTerm: "green peas raw", expected: "Green peas" },
			{ searchTerm: "yellow peas raw", expected: "Yellow peas" },
			{ searchTerm: "split peas raw", expected: "Split peas" },
			{ searchTerm: "broad beans raw", expected: "Broad beans" },
			{ searchTerm: "fava beans raw", expected: "Fava beans" },
			{ searchTerm: "lupin beans raw", expected: "Lupin beans" },
			{ searchTerm: "hyacinth beans raw", expected: "Hyacinth beans" },
			{ searchTerm: "winged beans raw", expected: "Winged beans" },
			{ searchTerm: "cowpeas raw", expected: "Cowpeas" },
			{ searchTerm: "pigeon peas raw", expected: "Pigeon peas" },
			{ searchTerm: "tepary beans raw", expected: "Tepary beans" },
			{ searchTerm: "flageolet beans raw", expected: "Flageolet beans" },
			{ searchTerm: "borlotti beans raw", expected: "Borlotti beans" },
			{ searchTerm: "cranberry beans raw", expected: "Cranberry beans" },
			{ searchTerm: "lima beans raw", expected: "Lima beans" },
			{ searchTerm: "butter beans raw", expected: "Butter beans" },
			{ searchTerm: "horse gram raw", expected: "Horse gram" },
			{ searchTerm: "moth beans raw", expected: "Moth beans" },
			{ searchTerm: "bambara groundnuts raw", expected: "Bambara groundnuts" },
			{ searchTerm: "peanuts raw", expected: "Peanuts" },
			{ searchTerm: "bean sprouts raw", expected: "Bean sprouts" },
			{ searchTerm: "mung bean sprouts raw", expected: "Mung bean sprouts" },
		],
	},
	dairy: {
		displayName: "Dairy",
		slug: "dairy",
		products: [
			{ searchTerm: "whole milk", expected: "Whole milk" },
			{ searchTerm: "semi-skimmed milk", expected: "Semi-skimmed milk" },
			{ searchTerm: "skim milk", expected: "Skim milk" },
			{ searchTerm: "lactose-free milk", expected: "Lactose-free milk" },
			{ searchTerm: "goat milk", expected: "Goat milk" },
			{ searchTerm: "sheep milk", expected: "Sheep milk" },
			{ searchTerm: "evaporated milk", expected: "Evaporated milk" },
			{ searchTerm: "condensed milk", expected: "Condensed milk" },
			{ searchTerm: "powdered milk", expected: "Powdered milk" },
			{ searchTerm: "buttermilk", expected: "Buttermilk" },
			{ searchTerm: "plain yogurt", expected: "Plain yogurt" },
			{ searchTerm: "greek yogurt", expected: "Greek yogurt" },
			{ searchTerm: "skyr", expected: "Skyr" },
			{ searchTerm: "kefir", expected: "Kefir" },
			{ searchTerm: "drinkable yogurt", expected: "Drinkable yogurt" },
			{ searchTerm: "flavored yogurt", expected: "Flavored yogurt" },
			{ searchTerm: "butter", expected: "Butter" },
			{ searchTerm: "salted butter", expected: "Salted butter" },
			{ searchTerm: "unsalted butter", expected: "Unsalted butter" },
			{ searchTerm: "clarified butter", expected: "Clarified butter" },
			{ searchTerm: "ghee", expected: "Ghee" },
			{ searchTerm: "heavy cream", expected: "Heavy cream" },
			{ searchTerm: "light cream", expected: "Light cream" },
			{ searchTerm: "whipping cream", expected: "Whipping cream" },
			{ searchTerm: "sour cream", expected: "Sour cream" },
			{ searchTerm: "creme fraiche", expected: "Crème fraîche" },
			{ searchTerm: "cream cheese", expected: "Cream cheese" },
			{ searchTerm: "cottage cheese", expected: "Cottage cheese" },
			{ searchTerm: "ricotta", expected: "Ricotta" },
			{ searchTerm: "mascarpone", expected: "Mascarpone" },
			{ searchTerm: "mozzarella cheese", expected: "Mozzarella" },
			{ searchTerm: "cheddar cheese", expected: "Cheddar" },
			{ searchTerm: "gouda cheese", expected: "Gouda" },
			{ searchTerm: "edam cheese", expected: "Edam" },
			{ searchTerm: "emmental cheese", expected: "Emmental" },
			{ searchTerm: "gruyere cheese", expected: "Gruyère" },
			{ searchTerm: "parmesan cheese", expected: "Parmesan" },
			{ searchTerm: "pecorino cheese", expected: "Pecorino" },
			{ searchTerm: "feta cheese", expected: "Feta" },
			{ searchTerm: "halloumi cheese", expected: "Halloumi" },
			{ searchTerm: "brie cheese", expected: "Brie" },
			{ searchTerm: "camembert cheese", expected: "Camembert" },
			{ searchTerm: "blue cheese", expected: "Blue cheese" },
			{ searchTerm: "gorgonzola cheese", expected: "Gorgonzola" },
			{ searchTerm: "roquefort cheese", expected: "Roquefort" },
			{ searchTerm: "processed cheese", expected: "Processed cheese" },
			{ searchTerm: "cheese spread", expected: "Cheese spread" },
			{ searchTerm: "ice cream", expected: "Ice cream" },
			{ searchTerm: "gelato", expected: "Gelato" },
			{ searchTerm: "frozen yogurt", expected: "Frozen yogurt" },
			{ searchTerm: "milkshake", expected: "Milkshake" },
			{ searchTerm: "custard", expected: "Custard" },
			{ searchTerm: "pudding", expected: "Pudding" },
			{ searchTerm: "whey", expected: "Whey" },
			{ searchTerm: "casein", expected: "Casein" },
			{ searchTerm: "dulce de leche", expected: "Dulce de leche" },
			{ searchTerm: "quark", expected: "Quark" },
			{ searchTerm: "farmer cheese", expected: "Farmer cheese" },
			{ searchTerm: "paneer cheese", expected: "Paneer" },
			{ searchTerm: "labneh", expected: "Labneh" },
			{ searchTerm: "clotted cream", expected: "Clotted cream" },
		],
	},
};

// Pobierz kategorię z argumentu command line
const CATEGORY = (process.argv[2] || "meat").toLowerCase();

if (!CATEGORIES_CONFIG[CATEGORY]) {
	console.error(`\n❌ Kategoria "${CATEGORY}" nie jest zdefiniowana!\n`);
	console.error("Dostępne kategorie:");
	Object.keys(CATEGORIES_CONFIG).forEach((cat) => {
		console.error(`  - ${cat}`);
	});
	process.exit(1);
}

const CONFIG = CATEGORIES_CONFIG[CATEGORY];
const PRODUCTS_TO_SEARCH = CONFIG.products;

/**
 * Fetch z HTTPS - zwraca Promise
 */
function httpsGet(url) {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				let data = "";
				res.on("data", (chunk) => {
					data += chunk;
				});
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
 * Znajdź nutrient po nazwie
 */
function findNutrient(nutrients, nutrientNames) {
	if (!nutrients) return null;
	const namesArray = Array.isArray(nutrientNames)
		? nutrientNames
		: [nutrientNames];

	for (const name of namesArray) {
		const found = nutrients.find(
			(n) =>
				n.nutrient &&
				n.nutrient.name &&
				n.nutrient.name.toLowerCase() === name.toLowerCase(),
		);
		if (found && found.amount !== null && found.amount !== undefined) {
			return found.amount;
		}
	}
	return null;
}

/**
 * Szukaj produktu w USDA FDC
 */
async function searchProduct(searchTerm) {
	const query = encodeURIComponent(searchTerm);
	const url = `${API_BASE}/foods/search?query=${query}&pageSize=10&api_key=${API_KEY}`;

	console.log(`🔍 Szukam: ${searchTerm}`);

	try {
		const response = await httpsGet(url);

		if (!response.foods || response.foods.length === 0) {
			console.log(`   ❌ Nie znaleziono produktu`);
			return null;
		}

		// Weź pierwszy rezultat (najlepsze dopasowanie)
		const food = response.foods[0];

		console.log(
			`   ✅ Znaleziono: "${food.description}" (FDC ID: ${food.fdcId})`,
		);

		return {
			fdcId: food.fdcId,
			description: food.description,
			dataType: food.dataType,
		};
	} catch (error) {
		console.error(`   ❌ Błąd API: ${error.message}`);
		return null;
	}
}

/**
 * Pobierz szczegóły produktu (wartości żywienioze)
 */
async function getProductDetails(fdcId) {
	const url = `${API_BASE}/food/${fdcId}?api_key=${API_KEY}`;

	try {
		const response = await httpsGet(url);

		// Ekstrahuj wartości żywienioze szukając po nazwie
		const nutrients = {};

		if (response.foodNutrients) {
			nutrients.calories_kcal = parseFloat(
				findNutrient(response.foodNutrients, [
					"Energy",
					"Energy (Atwater General Factors)",
				]) || 0,
			);
			nutrients.protein_g = parseFloat(
				findNutrient(response.foodNutrients, "Protein") || 0,
			);
			nutrients.fat_g = parseFloat(
				findNutrient(response.foodNutrients, "Total lipid (fat)") || 0,
			);
			nutrients.carbs_g = parseFloat(
				findNutrient(response.foodNutrients, "Carbohydrate, by difference") ||
					0,
			);
			nutrients.fiber_g = parseFloat(
				findNutrient(response.foodNutrients, "Fiber, total dietary") || 0,
			);
			nutrients.sugar_g = parseFloat(
				findNutrient(response.foodNutrients, "Total Sugars") || 0,
			);
			nutrients.sodium_mg = parseFloat(
				findNutrient(response.foodNutrients, "Sodium, Na") || 0,
			);
		}

		return nutrients;
	} catch (error) {
		console.error(`   ❌ Błąd szczegółów: ${error.message}`);
		return null;
	}
}

/**
 * Main - pobierz wszystkie produkty
 */
async function main() {
	console.log(`\n🚀 USDA FDC API Data Fetcher - ${CONFIG.displayName}\n`);
	console.log("=".repeat(60));

	const results = [];
	let successCount = 0;

	// Pobierz każdy produkt
	for (const product of PRODUCTS_TO_SEARCH) {
		const searchResult = await searchProduct(product.searchTerm);

		if (!searchResult) {
			console.log(`   ⏭️  Pomijam ${product.expected}\n`);
			continue;
		}

		// Pobierz szczegóły
		console.log(`   📊 Pobieram szczegóły...`);
		const details = await getProductDetails(searchResult.fdcId);

		if (!details) {
			console.log(`   ⏭️  Pomijam ${product.expected}\n`);
			continue;
		}

		// Zbuduj wpis produktu
		const productEntry = {
			name: product.expected,
			category_slug: CONFIG.slug,
			source: "system",
			external_id: String(searchResult.fdcId),
			calories_kcal: details.calories_kcal || 0,
			protein_g: details.protein_g || 0,
			fat_g: details.fat_g || 0,
			carbs_g: details.carbs_g || 0,
			fiber_g: details.fiber_g || 0,
			sugar_g: details.sugar_g || 0,
			sodium_mg: details.sodium_mg || 0,
			notes: `Raw/Uncooked - from USDA FDC (${searchResult.description})`,
			usda_description: searchResult.description,
		};

		results.push(productEntry);
		console.log(
			`   ✅ Zapisano:\n      Kcal: ${productEntry.calories_kcal}, Białko: ${productEntry.protein_g}g, Tłuszcz: ${productEntry.fat_g}g\n`,
		);

		successCount++;

		// Rate limiting - czekaj 300ms między żądaniami
		await new Promise((resolve) => setTimeout(resolve, 300));
	}

	console.log("=".repeat(60));
	console.log(
		`\n✅ Pobrano: ${successCount}/${PRODUCTS_TO_SEARCH.length} produktów\n`,
	);

	// Zapisz do JSON
	if (results.length > 0) {
		const outputData = {
			description: `${CONFIG.displayName} products seed data - raw/uncooked state from USDA FoodData Central`,
			data_sources: [
				{
					name: "USDA FoodData Central API",
					url: "https://fdc.nal.usda.gov/api-guide",
					note: "Data fetched programmatically using official USDA FDC API",
				},
			],
			verification_instructions: {
				how_to_find:
					"All products verified via USDA FDC API using official API key. External IDs are real FDC IDs.",
				status: "All data verified from USDA source",
			},
			products: results,
		};

		const outputFileName = `${String(PRODUCTS_TO_SEARCH.length).padStart(2, "0")}_${CONFIG.slug}_products.json`;
		const jsonPath = path.join(__dirname, outputFileName);
		fs.writeFileSync(jsonPath, JSON.stringify(outputData, null, 2));
		console.log(`📁 Zapisano: ${jsonPath}\n`);
	}
}

main().catch(console.error);
