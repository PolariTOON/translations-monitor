import {mkdir, writeFile} from "node:fs/promises";
import keys from "./cache/keys.json" with {type: "json"};
const bears = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/bears.json")).json();
const challenges = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/challenges.json")).json();
const levels = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/levels.json")).json();
const missions = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/missions.json")).json();
const outfits = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/outfits.json")).json();
const races = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/races.json")).json();
const rarities = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/rarities.json")).json();
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
function bind(array) {
	const binding = [];
	for (const value of array) {
		binding.push(Object.fromEntries(Object.entries(value).map(([key, locales]) => {
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
		})));
	}
	return binding;
}
function supports(locale) {
	return ["en-US", "fr", "pt-BR"].includes(locale);
}
function merge(original, override) {
	for (const [index, value] of override.entries()) {
		if (index >= original.length) {
			original.push(Object.create(null));
		} else {
			original[index] ??= Object.create(null);
		}
		for (const [key, locales] of Object.entries(value)) {
			original[index][key] = Object.create(null);
			for (const [locale, words] of Object.entries(locales)) {
				if (supports(locale)) {
					original[index][key][locale] = words;
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
	const outfits = [];
	for (let k = 0; k < 143; ++k) {
		outfits.push({
			name: keys[`cosmetic_${`${k + 1}`.padStart(3, "0")}`],
		});
	}
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
- [Updates](updates.json)
`);
