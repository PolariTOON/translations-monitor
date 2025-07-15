import {mkdir, writeFile} from "node:fs/promises";
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
	const bears = [];
	for (let k = 0; k < 32; ++k) {
		bears.push({
			name: keys[`char_bear_${`${k + 1}`.padStart(2, "0")}`],
		});
	}
	bears.push({
		name: keys["char_brother"],
	});
	return bears;
}
function computeChallenges() {
	const challenges = [];
	challenges.push({
		name: keys["mission_lava"],
	});
	challenges.push({
		name: keys["mission_airplane"],
	});
	challenges.push({
		name: keys["mission_egg"],
	});
	challenges.push({
		name: keys["mission_parkour"],
	});
	challenges.push({
		name: keys["mission_electricity"],
	});
	challenges.push({
		name: keys["mission_flooding"],
	});
	challenges.push({
		name: keys["mission_race"],
	});
	return challenges;
}
function computeLevels() {
	const levels = [];
	levels.push({
		name: keys["ui_level1"],
		boss: keys["boss_turtle_golem"],
	});
	levels.push({
		name: keys["ui_level2"],
		boss: keys["boss_yeti"],
	});
	levels.push({
		name: keys["ui_level3"],
		boss: keys["boss_guardian"],
	});
	levels.push({
		name: keys["ui_level4"],
		boss: keys["boss_rat"],
	});
	levels.push({
		name: keys["ui_hive"],
		boss: keys["char_queen"],
	});
	return levels;
}
function computeOutfits() {
	const outfits = Object.create(null);
	outfits["hatCapModern"] = {
		name: keys["cosmetic_hat_cap_modern"],
	};
	outfits["hatCapClassic"] = {
		name: keys["cosmetic_hat_cap_classic"],
	};
	outfits["hatAxe"] = {
		name: keys["cosmetic_hat_axe"],
	};
	outfits["hatEgg"] = {
		name: keys["cosmetic_hat_egg"],
	};
	outfits["hatFez"] = {
		name: keys["cosmetic_hat_fez"],
	};
	outfits["headFlower"] = {
		name: keys["cosmetic_head_flower"],
	};
	outfits["headbow"] = {
		name: keys["cosmetic_headbow"],
	};
	outfits["angelHalo"] = {
		name: keys["cosmetic_angel_halo"],
	};
	outfits["hatBanana"] = {
		name: keys["cosmetic_hat_banana"],
	};
	outfits["hatCake"] = {
		name: keys["cosmetic_hat_cake"],
	};
	outfits["eggFried"] = {
		name: keys["cosmetic_egg_fried"],
	};
	outfits["headbandNinja"] = {
		name: keys["cosmetic_headband_ninja"],
	};
	outfits["maskPapercraft"] = {
		name: keys["cosmetic_mask_papercraft"],
	};
	outfits["hornsReindeer"] = {
		name: keys["cosmetic_horns_reindeer"],
	};
	outfits["hatSanta"] = {
		name: keys["cosmetic_hat_santa"],
	};
	outfits["hatHanoi"] = {
		name: keys["cosmetic_hat_hanoi"],
	};
	outfits["hatUnicorn"] = {
		name: keys["cosmetic_hat_unicorn"],
	};
	outfits["hatCrown"] = {
		name: keys["cosmetic_hat_crown"],
	};
	outfits["hatCrownBee"] = {
		name: keys["cosmetic_hat_crown_bee"],
	};
	outfits["headsetDj"] = {
		name: keys["cosmetic_headset_dj"],
	};
	outfits["helmetKnight"] = {
		name: keys["cosmetic_helmet_knight"],
	};
	outfits["hatWitch"] = {
		name: keys["cosmetic_hat_witch"],
	};
	outfits["capSoccer"] = {
		name: keys["cosmetic_cap_soccer"],
	};
	outfits["crownRoyal"] = {
		name: keys["cosmetic_crown_royal"],
	};
	outfits["hatCowboy"] = {
		name: keys["cosmetic_hat_cowboy"],
	};
	outfits["earsRing"] = {
		name: keys["cosmetic_ears_ring"],
	};
	outfits["helmerMiner"] = {
		name: keys["cosmetic_helmer_miner"],
	};
	outfits["hairLong"] = {
		name: keys["cosmetic_hair_long"],
	};
	outfits["hairShort"] = {
		name: keys["cosmetic_hair_short"],
	};
	outfits["hairPunk"] = {
		name: keys["cosmetic_hair_punk"],
	};
	outfits["hairPonytail"] = {
		name: keys["cosmetic_hair_ponytail"],
	};
	outfits["hairClown"] = {
		name: keys["cosmetic_hair_clown"],
	};
	outfits["maskGas"] = {
		name: keys["cosmetic_mask_gas"],
	};
	outfits["maskNeutral"] = {
		name: keys["cosmetic_mask_neutral"],
	};
	outfits["maskPumpkin"] = {
		name: keys["cosmetic_mask_pumpkin"],
	};
	outfits["maskRealistic"] = {
		name: keys["cosmetic_mask_realistic"],
	};
	outfits["maskNecromancer"] = {
		name: keys["cosmetic_mask_necromancer"],
	};
	outfits["headsetVr"] = {
		name: keys["cosmetic_headset_vr"],
	};
	outfits["maskWrestler"] = {
		name: keys["cosmetic_mask_wrestler"],
	};
	outfits["maskSandstorm"] = {
		name: keys["cosmetic_mask_sandstorm"],
	};
	outfits["hatWinterCoat"] = {
		name: keys["cosmetic_hat_winter_coat"],
	};
	outfits["maskBandit"] = {
		name: keys["cosmetic_mask_bandit"],
	};
	outfits["eyesFeminine"] = {
		name: keys["cosmetic_eyes_feminine"],
	};
	outfits["glassesSimple"] = {
		name: keys["cosmetic_glasses_simple"],
	};
	outfits["eyesWhite"] = {
		name: keys["cosmetic_eyes_white"],
	};
	outfits["eyesBig"] = {
		name: keys["cosmetic_eyes_big"],
	};
	outfits["eyesCartoon"] = {
		name: keys["cosmetic_eyes_cartoon"],
	};
	outfits["eyesManga"] = {
		name: keys["cosmetic_eyes_manga"],
	};
	outfits["glassesRobot"] = {
		name: keys["cosmetic_glasses_robot"],
	};
	outfits["glassesDealwithit"] = {
		name: keys["cosmetic_glasses_dealwithit"],
	};
	outfits["headVampire"] = {
		name: keys["cosmetic_head_vampire"],
	};
	outfits["glassesImabear"] = {
		name: keys["cosmetic_glasses_imabear"],
	};
	outfits["glassesScreen"] = {
		name: keys["cosmetic_glasses_screen"],
	};
	outfits["glassesShutter"] = {
		name: keys["cosmetic_glasses_shutter"],
	};
	outfits["glassesSunset"] = {
		name: keys["cosmetic_glasses_sunset"],
	};
	outfits["glassesMiner"] = {
		name: keys["cosmetic_glasses_miner"],
	};
	outfits["beard"] = {
		name: keys["cosmetic_beard"],
	};
	outfits["mustache"] = {
		name: keys["cosmetic_mustache"],
	};
	outfits["pacifier"] = {
		name: keys["cosmetic_pacifier"],
	};
	outfits["mouthWheat"] = {
		name: keys["cosmetic_mouth_wheat"],
	};
	outfits["noseClown"] = {
		name: keys["cosmetic_nose_clown"],
	};
	outfits["toothpick"] = {
		name: keys["cosmetic_toothpick"],
	};
	outfits["earsBig"] = {
		name: keys["cosmetic_ears_big"],
	};
	outfits["headChild"] = {
		name: keys["cosmetic_head_child"],
	};
	outfits["headSkull"] = {
		name: keys["cosmetic_head_skull"],
	};
	outfits["headSwollen"] = {
		name: keys["cosmetic_head_swollen"],
	};
	outfits["faceCute"] = {
		name: keys["cosmetic_face_cute"],
	};
	outfits["headDog"] = {
		name: keys["cosmetic_head_dog"],
	};
	outfits["headEgg"] = {
		name: keys["cosmetic_head_egg"],
	};
	outfits["headFennec"] = {
		name: keys["cosmetic_head_fennec"],
	};
	outfits["headless"] = {
		name: keys["cosmetic_headless"],
	};
	outfits["headRabbit"] = {
		name: keys["cosmetic_head_rabbit"],
	};
	outfits["headReversed"] = {
		name: keys["cosmetic_head_reversed"],
	};
	outfits["eggEaster"] = {
		name: keys["cosmetic_egg_easter"],
	};
	outfits["headBobble"] = {
		name: keys["cosmetic_head_bobble"],
	};
	outfits["headCat"] = {
		name: keys["cosmetic_head_cat"],
	};
	outfits["headDice"] = {
		name: keys["cosmetic_head_dice"],
	};
	outfits["headCapitalus"] = {
		name: keys["cosmetic_head_capitalus"],
	};
	outfits["maskYeti"] = {
		name: keys["cosmetic_mask_yeti"],
	};
	outfits["jacket"] = {
		name: keys["cosmetic_jacket"],
	};
	outfits["suitBusiness"] = {
		name: keys["cosmetic_suit_business"],
	};
	outfits["bodyChocolate"] = {
		name: keys["cosmetic_body_chocolate"],
	};
	outfits["coatLab"] = {
		name: keys["cosmetic_coat_lab"],
	};
	outfits["shirtNumber"] = {
		name: keys["cosmetic_shirt_number"],
	};
	outfits["bodySkeleton"] = {
		name: keys["cosmetic_body_skeleton"],
	};
	outfits["diaper"] = {
		name: keys["cosmetic_diaper"],
	};
	outfits["pyjamaDuck"] = {
		name: keys["cosmetic_pyjama_duck"],
	};
	outfits["vestPolice"] = {
		name: keys["cosmetic_vest_police"],
	};
	outfits["suitCapitalus"] = {
		name: keys["cosmetic_suit_capitalus"],
	};
	outfits["suitSanta"] = {
		name: keys["cosmetic_suit_santa"],
	};
	outfits["shirtSpooky"] = {
		name: keys["cosmetic_shirt_spooky"],
	};
	outfits["coatRain"] = {
		name: keys["cosmetic_coat_rain"],
	};
	outfits["shirtSba"] = {
		name: keys["cosmetic_shirt_sba"],
	};
	outfits["jacketCowboy"] = {
		name: keys["cosmetic_jacket_cowboy"],
	};
	outfits["shirtHawaiian"] = {
		name: keys["cosmetic_shirt_hawaiian"],
	};
	outfits["hoodieRapper"] = {
		name: keys["cosmetic_hoodie_rapper"],
	};
	outfits["jacketNight"] = {
		name: keys["cosmetic_jacket_night"],
	};
	outfits["poncho"] = {
		name: keys["cosmetic_poncho"],
	};
	outfits["coatWinter"] = {
		name: keys["cosmetic_coat_winter"],
	};
	outfits["scarf"] = {
		name: keys["cosmetic_scarf"],
	};
	outfits["bandana"] = {
		name: keys["cosmetic_bandana"],
	};
	outfits["bowtie"] = {
		name: keys["cosmetic_bowtie"],
	};
	outfits["cape"] = {
		name: keys["cosmetic_cape"],
	};
	outfits["necklaceDollar"] = {
		name: keys["cosmetic_necklace_dollar"],
	};
	outfits["necklaceShark"] = {
		name: keys["cosmetic_necklace_shark"],
	};
	outfits["capeDamaged"] = {
		name: keys["cosmetic_cape_damaged"],
	};
	outfits["bandanaMiner"] = {
		name: keys["cosmetic_bandana_miner"],
	};
	outfits["glovesBoxing"] = {
		name: keys["cosmetic_gloves_boxing"],
	};
	outfits["balloon"] = {
		name: keys["cosmetic_balloon"],
	};
	outfits["watchGolden"] = {
		name: keys["cosmetic_watch_golden"],
	};
	outfits["glovesFingerless"] = {
		name: keys["cosmetic_gloves_fingerless"],
	};
	outfits["shoesFlipflop"] = {
		name: keys["cosmetic_shoes_flipflop"],
	};
	outfits["shoesCowboy"] = {
		name: keys["cosmetic_shoes_cowboy"],
	};
	outfits["bodyFat"] = {
		name: keys["cosmetic_body_fat"],
	};
	outfits["bodyMuscular"] = {
		name: keys["cosmetic_body_muscular"],
	};
	outfits["bodyTurtle"] = {
		name: keys["cosmetic_body_turtle"],
	};
	outfits["skinBlack"] = {
		name: keys["cosmetic_skin_black"],
	};
	outfits["skinCrocodile"] = {
		name: keys["cosmetic_skin_crocodile"],
	};
	outfits["skinDark"] = {
		name: keys["cosmetic_skin_dark"],
	};
	outfits["skinDesert"] = {
		name: keys["cosmetic_skin_desert"],
	};
	outfits["skinPolar"] = {
		name: keys["cosmetic_skin_polar"],
	};
	outfits["skinSackbear"] = {
		name: keys["cosmetic_skin_sackbear"],
	};
	outfits["skinGummy"] = {
		name: keys["cosmetic_skin_gummy"],
	};
	outfits["outline"] = {
		name: keys["cosmetic_outline"],
	};
	outfits["skinBadger"] = {
		name: keys["cosmetic_skin_badger"],
	};
	outfits["skinClown"] = {
		name: keys["cosmetic_skin_clown"],
	};
	outfits["skinGrayscale"] = {
		name: keys["cosmetic_skin_grayscale"],
	};
	outfits["skinLeopard"] = {
		name: keys["cosmetic_skin_leopard"],
	};
	outfits["skinPink"] = {
		name: keys["cosmetic_skin_pink"],
	};
	outfits["skinRacoon"] = {
		name: keys["cosmetic_skin_racoon"],
	};
	outfits["skinSpectacled"] = {
		name: keys["cosmetic_skin_spectacled"],
	};
	outfits["skinRed"] = {
		name: keys["cosmetic_skin_red"],
	};
	outfits["skin8bit"] = {
		name: keys["cosmetic_skin_8bit"],
	};
	outfits["skinGolden"] = {
		name: keys["cosmetic_skin_golden"],
	};
	outfits["skinRainbow"] = {
		name: keys["cosmetic_skin_rainbow"],
	};
	outfits["skinShickacolor"] = {
		name: keys["cosmetic_skin_shickacolor"],
	};
	outfits["skinCosmic"] = {
		name: keys["cosmetic_skin_cosmic"],
	};
	outfits["skinPanda"] = {
		name: keys["cosmetic_skin_panda"],
	};
	outfits["skinPurple"] = {
		name: keys["cosmetic_skin_purple"],
	};
	outfits["shickaGreen"] = {
		name: keys["cosmetic_shicka_green"],
	};
	outfits["shickaInvisible"] = {
		name: keys["cosmetic_shicka_invisible"],
	};
	outfits["shickaRed"] = {
		name: keys["cosmetic_shicka_red"],
	};
	outfits["shickaBearcolor"] = {
		name: keys["cosmetic_shicka_bearcolor"],
	};
	outfits["shickaDark"] = {
		name: keys["cosmetic_shicka_dark"],
	};
	outfits["shickaGhost"] = {
		name: keys["cosmetic_shicka_ghost"],
	};
	outfits["shickaPenguin"] = {
		name: keys["cosmetic_shicka_penguin"],
	};
	outfits["shickaRetro"] = {
		name: keys["cosmetic_shicka_retro"],
	};
	outfits["shickaGolden"] = {
		name: keys["cosmetic_shicka_golden"],
	};
	outfits["shickaRainbow"] = {
		name: keys["cosmetic_shicka_rainbow"],
	};
	outfits["shicka8bit"] = {
		name: keys["cosmetic_shicka_8bit"],
	};
	outfits["shickaCosmic"] = {
		name: keys["cosmetic_shicka_cosmic"],
	};
	outfits["shickaFrog"] = {
		name: keys["cosmetic_shicka_frog"],
	};
	outfits["shickaKoala"] = {
		name: keys["cosmetic_shicka_koala"],
	};
	outfits["shickaPig"] = {
		name: keys["cosmetic_shicka_pig"],
	};
	outfits["shickaBobble"] = {
		name: keys["cosmetic_shicka_bobble"],
	};
	outfits["shickaBaguette"] = {
		name: keys["cosmetic_shicka_baguette"],
	};
	outfits["shickaPickaxe"] = {
		name: keys["cosmetic_shicka_pickaxe"],
	};
	outfits["trailRainbow"] = {
		name: keys["cosmetic_trail_rainbow"],
	};
	outfits["trailGhost"] = {
		name: keys["cosmetic_trail_ghost"],
	};
	outfits["petBird"] = {
		name: keys["cosmetic_pet_bird"],
	};
	outfits["petViolette"] = {
		name: keys["cosmetic_pet_violette"],
	};
	outfits["musicNight"] = {
		name: keys["cosmetic_music_night"],
	};
	outfits["musicRapper"] = {
		name: keys["cosmetic_music_rapper"],
	};
	outfits["musicSheriff"] = {
		name: keys["cosmetic_music_sheriff"],
	};
	outfits["musicSummer"] = {
		name: keys["cosmetic_music_summer"],
	};
	outfits["cloudRain"] = {
		name: keys["cosmetic_cloud_rain"],
	};
	outfits["fxDust"] = {
		name: keys["cosmetic_fx_dust"],
	};
	outfits["fxNight"] = {
		name: keys["cosmetic_fx_night"],
	};
	outfits["fxTumbleweeds"] = {
		name: keys["cosmetic_fx_tumbleweeds"],
	};
	outfits["footstepMagical"] = {
		name: keys["cosmetic_footstep_magical"],
	};
	outfits["filterNoire"] = {
		name: keys["cosmetic_filter_noire"],
	};
	outfits["specialTiny"] = {
		name: keys["cosmetic_special_tiny"],
	};
	outfits["carMuscle"] = {
		name: keys["cosmetic_car_muscle"],
	};
	outfits["surfboard"] = {
		name: keys["cosmetic_surfboard"],
	};
	return outfits;
}
function computeRaces() {
	const races = [];
	for (let k = 0; k < 4; ++k) {
		races.push({
			name: keys[`arcade_race_${k + 1}`],
		});
	}
	return races;
}
function computeRarities() {
	const rarities = [];
	rarities.push({
		name: keys["rarity_common"],
	});
	rarities.push({
		name: keys["rarity_rare"],
	});
	rarities.push({
		name: keys["rarity_epic"],
	});
	rarities.push({
		name: keys["char_tristopio"],
	});
	rarities.push({
		name: keys["rarity_legendary"],
	});
	rarities.push({
		name: keys["ui_hive"],
	});
	rarities.push({
		name: keys["pmk_title"],
	});
	rarities.push({
		name: keys["char_mole"],
	});
	return rarities;
}
function computeSublevels() {
	const sublevels = [];
	sublevels.push({
		name: keys["ui_level_mole2"],
	});
	sublevels.push({
		name: keys["ui_level_mole3"],
	});
	return sublevels;
}
merge(bears, bind(computeBears()));
merge(challenges, bind(computeChallenges()));
merge(levels, bind(computeLevels()));
merge(outfits, bind(computeOutfits()));
merge(races, bind(computeRaces()));
merge(rarities, bind(computeRarities()));
merge(sublevels, bind(computeSublevels()));
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
