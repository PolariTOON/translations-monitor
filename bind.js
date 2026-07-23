import {mkdir, writeFile} from "node:fs/promises";
import locales from "./cache/locales.json" with {type: "json"};
import keys from "./cache/keys.json" with {type: "json"};
const bears = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/bears.json")).json();
const challenges = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/challenges.json")).json();
const levels = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/levels.json")).json();
const missions = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/missions.json")).json();
const outfits = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/outfits.json")).json();
const races = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/races.json")).json();
const rarities = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/rarities.json")).json();
const sublevels = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/sublevels.json")).json();
const updates = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/updates.json")).json();
function relocalize(locale) {
	if (locale === "en") {
		return "en-US";
	}
	if (locale === "es") {
		return "es-ES";
	}
	if (locale === "pt") {
		return "pt-BR";
	}
	return locale;
}
function bind(object) {
	const isArray = Array.isArray(object);
	const binding = isArray ? [] : Object.create(null);
	for (const [key, initialValue] of isArray ? object.entries() : Object.entries(object)) {
		const finalValue = Object.fromEntries(Object.entries(initialValue).map(([key, locales]) => {
			const source = locales["en"];
			return [
				key,
				Object.fromEntries(Object.entries(locales).map(([locale, words]) => {
					return [
						relocalize(locale),
						(words ?? source).split(/.^/ms)[0].replaceAll(/<a>|<b>/g, ($0) => {
							return $0[1].toLocaleUpperCase();
						}).replaceAll(/<("[^"]*"|[^"<>]*)*>/g, ""),
					];
				})),
			];
		}));
		if (isArray) {
			binding.push(finalValue);
		} else {
			binding[key] = finalValue;
		}
	}
	return binding;
}
function supports(locale) {
	return ["en-US", "fr", "pt-BR"].includes(locale);
}
function merge(original, override) {
	const isArray = Array.isArray(original) && Array.isArray(override);
	for (const [key, overrideValue] of isArray ? override.entries() : Object.entries(override)) {
		const hasOriginalValue = isArray ? key < original.length : Object.hasOwn(original, key);
		const originalValue = hasOriginalValue ? original[key] : Object.create(null);
		if (isArray) {
			if (!hasOriginalValue) {
				original.push(originalValue);
			}
		} else {
			if (hasOriginalValue) {
				delete original[key];
			}
			original[key] = originalValue;
		}
		for (const [key, overrideLocales] of Object.entries(overrideValue)) {
			const originalLocales = originalValue[key] = Object.create(null);
			for (const [locale, words] of Object.entries(overrideLocales)) {
				if (supports(locale)) {
					originalLocales[locale] = words;
				}
			}
		}
	}
	return original;
}
function computeBears() {
	const bears = Object.create(null);
	const bearKeys = [...Array.from({length: 32}, (item, index) => {
		const bearKey = `char_bear_${`${index + 1}`.padStart(2, "0")}`;
		return bearKey;
	}), "char_brother"];
	const bossKeys = {
		"char_bear_01": "boss_turtle_golem",
		"char_bear_09": "boss_yeti",
		"char_bear_17": "boss_guardian",
		"char_bear_25": "boss_rat",
		"char_brother": "char_queen",
	};
	for (const bearKey of bearKeys) {
		if (Object.hasOwn(bossKeys, bearKey)) {
			const bossKey = bossKeys[bearKey];
			bears[bearKey] = {
				name: keys[bearKey],
				boss: keys[bossKey],
			};
			continue;
		}
		bears[bearKey] = {
			name: keys[bearKey],
		};
	}
	return bears;
}
function computeChallenges() {
	const challenges = Object.create(null);
	const challengeKeys = [
		"mission_lava",
		"mission_airplane",
		"mission_egg",
		"mission_sleeping_moles",
		"mission_parkour",
		"mission_electricity",
		"mission_kart",
		"mission_flooding",
		"mission_race",
		"mission_penalty",
	];
	for (const challengeKey of challengeKeys) {
		challenges[challengeKey] = {
			name: keys[challengeKey],
		};
	}
	return challenges;
}
function computeLevels() {
	const levels = Object.create(null);
	const levelKeys = [
		"ui_hub",
		"_backrooms",
		"ui_level1",
		"ui_arcade_world",
		"ui_level2",
		"ui_level3",
		"ui_level4",
		"ui_hive",
		"ui_level_mole2",
		"ui_level_mole3",
	];
	for (const levelKey of levelKeys) {
		if (levelKey === "_backrooms") {
			levels[levelKey] = {
				name: Object.fromEntries(Object.keys(locales).map((locale) => {
					return [locale, "Backrooms"];
				})),
			};
			continue;
		}
		levels[levelKey] = {
			name: keys[levelKey],
		};
	}
	return levels;
}
function computeOutfits() {
	const outfits = Object.create(null);
	const outfitKeys = [
		"cosmetic_hat_cap_modern",
		"cosmetic_hat_cap_classic",
		"cosmetic_hat_axe",
		"cosmetic_hat_egg",
		"cosmetic_hat_fez",
		"cosmetic_head_flower",
		"cosmetic_headbow",
		"cosmetic_angel_halo",
		"cosmetic_hat_banana",
		"cosmetic_hat_cake",
		"cosmetic_egg_fried",
		"cosmetic_headband_ninja",
		"cosmetic_horns_reindeer",
		"cosmetic_hat_santa",
		"cosmetic_hat_hanoi",
		"cosmetic_hat_unicorn",
		"cosmetic_hat_crown",
		"cosmetic_hat_crown_bee",
		"cosmetic_headset_dj",
		"cosmetic_helmet_knight",
		"cosmetic_hat_witch",
		"cosmetic_cap_soccer",
		"cosmetic_crown_royal",
		"cosmetic_hat_cowboy",
		"cosmetic_ears_ring",
		"cosmetic_helmer_miner",
		"cosmetic_hair_long",
		"cosmetic_hair_short",
		"cosmetic_hair_punk",
		"cosmetic_hair_ponytail",
		"cosmetic_hair_clown",
		"cosmetic_mask_gas",
		"cosmetic_mask_neutral",
		"cosmetic_mask_pumpkin",
		"cosmetic_mask_realistic",
		"cosmetic_mask_necromancer",
		"cosmetic_mask_papercraft",
		"cosmetic_headset_vr",
		"cosmetic_mask_wrestler",
		"cosmetic_mask_sandstorm",
		"cosmetic_hat_winter_coat",
		"cosmetic_mask_bandit",
		"cosmetic_eyes_feminine",
		"cosmetic_glasses_simple",
		"cosmetic_eyes_white",
		"cosmetic_eyes_big",
		"cosmetic_eyes_cartoon",
		"cosmetic_eyes_manga",
		"cosmetic_glasses_robot",
		"cosmetic_glasses_dealwithit",
		"cosmetic_head_vampire",
		"cosmetic_glasses_imabear",
		"cosmetic_glasses_screen",
		"cosmetic_glasses_shutter",
		"cosmetic_glasses_sunset",
		"cosmetic_glasses_miner",
		"cosmetic_beard",
		"cosmetic_mustache",
		"cosmetic_pacifier",
		"cosmetic_mouth_wheat",
		"cosmetic_nose_clown",
		"cosmetic_toothpick",
		"cosmetic_ears_big",
		"cosmetic_head_child",
		"cosmetic_head_skull",
		"cosmetic_head_swollen",
		"cosmetic_face_cute",
		"cosmetic_head_dog",
		"cosmetic_head_egg",
		"cosmetic_head_fennec",
		"cosmetic_headless",
		"cosmetic_head_rabbit",
		"cosmetic_head_reversed",
		"cosmetic_egg_easter",
		"cosmetic_head_bobble",
		"cosmetic_head_cat",
		"cosmetic_head_dice",
		"cosmetic_head_capitalus",
		"cosmetic_mask_yeti",
		"cosmetic_head_snowman",
		"cosmetic_jacket",
		"cosmetic_suit_business",
		"cosmetic_body_chocolate",
		"cosmetic_coat_lab",
		"cosmetic_shirt_number",
		"cosmetic_body_skeleton",
		"cosmetic_diaper",
		"cosmetic_pyjama_duck",
		"cosmetic_vest_police",
		"cosmetic_suit_capitalus",
		"cosmetic_suit_santa",
		"cosmetic_shirt_spooky",
		"cosmetic_coat_rain",
		"cosmetic_shirt_sba",
		"cosmetic_jacket_cowboy",
		"cosmetic_shirt_hawaiian",
		"cosmetic_hoodie_rapper",
		"cosmetic_jacket_night",
		"cosmetic_poncho",
		"cosmetic_coat_winter",
		"cosmetic_scarf",
		"cosmetic_bandana",
		"cosmetic_bowtie",
		"cosmetic_cape",
		"cosmetic_necklace_dollar",
		"cosmetic_necklace_shark",
		"cosmetic_cape_damaged",
		"cosmetic_bandana_miner",
		"cosmetic_gloves_boxing",
		"cosmetic_balloon",
		"cosmetic_watch_golden",
		"cosmetic_gloves_fingerless",
		"cosmetic_shoes_flipflop",
		"cosmetic_shoes_cowboy",
		"cosmetic_body_fat",
		"cosmetic_body_muscular",
		"cosmetic_body_turtle",
		"cosmetic_skin_black",
		"cosmetic_skin_crocodile",
		"cosmetic_skin_dark",
		"cosmetic_skin_desert",
		"cosmetic_skin_polar",
		"cosmetic_skin_sackbear",
		"cosmetic_skin_gummy",
		"cosmetic_outline",
		"cosmetic_skin_badger",
		"cosmetic_skin_clown",
		"cosmetic_skin_grayscale",
		"cosmetic_skin_leopard",
		"cosmetic_skin_pink",
		"cosmetic_skin_racoon",
		"cosmetic_skin_spectacled",
		"cosmetic_skin_red",
		"cosmetic_skin_8bit",
		"cosmetic_skin_golden",
		"cosmetic_skin_rainbow",
		"cosmetic_skin_shickacolor",
		"cosmetic_skin_cosmic",
		"cosmetic_skin_panda",
		"cosmetic_skin_purple",
		"cosmetic_shicka_green",
		"cosmetic_shicka_invisible",
		"cosmetic_shicka_red",
		"cosmetic_shicka_bearcolor",
		"cosmetic_shicka_dark",
		"cosmetic_shicka_ghost",
		"cosmetic_shicka_penguin",
		"cosmetic_shicka_retro",
		"cosmetic_shicka_golden",
		"cosmetic_shicka_rainbow",
		"cosmetic_shicka_8bit",
		"cosmetic_shicka_cosmic",
		"cosmetic_shicka_frog",
		"cosmetic_shicka_koala",
		"cosmetic_shicka_pig",
		"cosmetic_shicka_bobble",
		"cosmetic_shicka_baguette",
		"cosmetic_shicka_pickaxe",
		"cosmetic_trail_rainbow",
		"cosmetic_trail_ghost",
		"cosmetic_pet_bird",
		"cosmetic_pet_violette",
		"cosmetic_music_night",
		"cosmetic_music_rapper",
		"cosmetic_music_sheriff",
		"cosmetic_music_summer",
		"cosmetic_cloud_rain",
		"cosmetic_fx_dust",
		"cosmetic_fx_night",
		"cosmetic_fx_tumbleweeds",
		"cosmetic_footstep_magical",
		"cosmetic_filter_noire",
		"cosmetic_special_tiny",
		"cosmetic_car_muscle",
		"cosmetic_surfboard",
	];
	for (const outfitKey of outfitKeys) {
		outfits[outfitKey] = {
			name: keys[outfitKey],
		};
	}
	return outfits;
}
function computeRaces() {
	const races = Object.create(null);
	const raceKeys = Array.from({length: 4}, (item, index) => {
		const raceKey = `arcade_race_${index + 1}`;
		return raceKey;
	});
	for (const raceKey of raceKeys) {
		races[raceKey] = {
			name: keys[raceKey],
		};
	}
	return races;
}
function computeRarities() {
	const rarities = Object.create(null);
	const rarityKeys = [
		"rarity_common",
		"rarity_rare",
		"rarity_epic",
		"char_tristopio",
		"rarity_legendary",
		"ui_hive",
		"pmk_title",
		"char_mole",
	];
	for (const rarityKey of rarityKeys) {
		rarities[rarityKey] = {
			name: keys[rarityKey],
		};
	}
	return rarities;
}
merge(bears, bind(computeBears()));
merge(challenges, bind(computeChallenges()));
merge(levels, bind(computeLevels()));
merge(outfits, bind(computeOutfits()));
merge(races, bind(computeRaces()));
merge(rarities, bind(computeRarities()));
await mkdir("bind", {
	recursive: true,
});
await writeFile(`bind/bears.json`, `${JSON.stringify(bears, null, "\t")}\n`);
await writeFile(`bind/challenges.json`, `${JSON.stringify(challenges, null, "\t")}\n`);
await writeFile(`bind/levels.json`, `${JSON.stringify(levels, null, "\t")}\n`);
await writeFile(`bind/missions.json`, `${JSON.stringify(missions, null, "\t")}\n`);
await writeFile(`bind/outfits.json`, `${JSON.stringify(outfits, null, "\t")}\n`);
await writeFile(`bind/races.json`, `${JSON.stringify(races, null, "\t")}\n`);
await writeFile(`bind/rarities.json`, `${JSON.stringify(rarities, null, "\t")}\n`);
await writeFile(`bind/sublevels.json`, `${JSON.stringify(sublevels, null, "\t")}\n`);
await writeFile(`bind/updates.json`, `${JSON.stringify(updates, null, "\t")}\n`);
await writeFile(`bind/readme.md`, `\
# Bind

- [Bears](bears.json)
- [Challenges](challenges.json)
- [Levels](levels.json)
- [Missions](missions.json)
- [Outfits](outfits.json)
- [Races](races.json)
- [Rarities](rarities.json)
- [Sublevels](sublevels.json)
- [Updates](updates.json)
`);
