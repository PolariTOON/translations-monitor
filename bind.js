import fs from "fs";
import fetch from "node-fetch";
const bears = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/bears.json")).json();
const challenges = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/challenges.json")).json();
const levels = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/levels.json")).json();
const missions = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/missions.json")).json();
const outfits = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/outfits.json")).json();
const parts = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/parts.json")).json();
const rarities = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/rarities.json")).json();
const updates = await (await fetch("https://raw.githubusercontent.com/SuperBearAdventure/shicka/master/src/bindings/updates.json")).json();
const keys = JSON.parse(await fs.promises.readFile("cache/keys.json"));
function capitalize(word, locale) {
	const characters = [...word];
	const firstCharacter = characters.slice(0, 1).join("").toLocaleUpperCase(locale);
	const lastCharacters = characters.slice(1).join("");
	return `${firstCharacter}${lastCharacters}`;
}
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
	if (locale === "sv") {
		return "sv-SE";
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
						words ?? source ?? null,
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
	for (let k = 0; k < 5; ++k) {
		outfits.push({
			name: keys["cosmetic_default"],
		});
	}
	for (let k = 0; k < 111; ++k) {
		outfits.push({
			name: keys[`cosmetic_${`${k + 1}`.padStart(3, "0")}`],
		});
	}
	return outfits;
}
function computeParts() {
	const parts = [];
	const outfitsByPart = [
		[13, 28, 32, 41, 49, 54, 59, 63, 84, 90, 103],
		[15, 16, 52, 64],
		[14, 18, 22, 35, 39, 40, 43, 70, 73, 74, 79, 82, 101, 111],
		[19, 20, 21, 29, 36, 42, 68, 69, 77, 78, 80, 85, 93],
	].map((partOutfits) => {
		return partOutfits.map((index) => {
			return keys[`cosmetic_${`${index}`.padStart(3, "0")}`];
		})
	}).concat([
		[keys["filter_00"], keys["photo_contribution"]],
	]);
	for (const partOutfits of outfitsByPart) {
		const partCounts = Object.create(null);
		for (const locales of partOutfits) {
			const source = locales["en"];
			for (const locale of Object.keys(locales)) {
				partCounts[locale] ??= Object.create(null);
				const words = locales[locale];
				for (const word of (words ?? source).split(/ +/)) {
					const lowerCaseWord = word.toLocaleLowerCase(locale);
					partCounts[locale][lowerCaseWord] ??= 0;
					partCounts[locale][lowerCaseWord] += 1;
				}
			}
		}
		const part = Object.create(null);
		for (const [locale, counts] of Object.entries(partCounts)) {
			let maxWord = null;
			let maxCount = -1;
			for (const [word, count] of Object.entries(counts)) {
				if (count > maxCount) {
					maxWord = word;
					maxCount = count;
				}
			}
			if (maxWord != null) {
				part[locale] = capitalize(maxWord, locale);
			}
		}
		parts.push({
			name: part,
		});
	}
	return parts;
}
function computeRarities() {
	const rarities = [];
	rarities.push({
		name: keys["cosmetic_default"],
	});
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
		name: keys["char_maybee"],
	});
	return rarities;
}
merge(bears, bind(computeBears()));
merge(challenges, bind(computeChallenges()));
merge(levels, bind(computeLevels()));
merge(outfits, bind(computeOutfits()));
merge(parts, bind(computeParts()));
merge(rarities, bind(computeRarities()));
await fs.promises.mkdir("bind", {
	recursive: true,
});
await fs.promises.writeFile(`bind/bears.json`, `${JSON.stringify(bears, null, "\t")}\n`);
await fs.promises.writeFile(`bind/challenges.json`, `${JSON.stringify(challenges, null, "\t")}\n`);
await fs.promises.writeFile(`bind/levels.json`, `${JSON.stringify(levels, null, "\t")}\n`);
await fs.promises.writeFile(`bind/missions.json`, `${JSON.stringify(missions, null, "\t")}\n`);
await fs.promises.writeFile(`bind/outfits.json`, `${JSON.stringify(outfits, null, "\t")}\n`);
await fs.promises.writeFile(`bind/parts.json`, `${JSON.stringify(parts, null, "\t")}\n`);
await fs.promises.writeFile(`bind/rarities.json`, `${JSON.stringify(rarities, null, "\t")}\n`);
await fs.promises.writeFile(`bind/updates.json`, `${JSON.stringify(updates, null, "\t")}\n`);
