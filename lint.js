import fs from "fs";
const locales = JSON.parse(await fs.promises.readFile("cache/locales.json"));
const keys = JSON.parse(await fs.promises.readFile("cache/keys.json"));
const localeWarns = Object.create(null);
const keyWarns = Object.create(null);
function isRequired(locale, key) {
	return ["el", "en", "ru"].includes(locale) || ["filter_00"].includes(key) || !key.startsWith("char_bear_") && !key.startsWith("filter_") && !["char_baaren", "char_capitalos", "char_capitalus", "char_crogo", "char_maybee", "char_shicka", "char_tristopio", "char_violette", "cosmetic_094", "cosmetic_104", "iap_premium_title", "pmk_bear_1", "pmk_bear_2", "pmk_bear_3", "pmk_bear_4"].includes(key);
}
for (const locale of Object.keys(locales)) {
	localeWarns[locale] = Object.create(null);
	localeWarns[locale].extra = [];
	localeWarns[locale]["extra, but optional,"] = [];
	localeWarns[locale].missing = [];
	localeWarns[locale]["missing, but optional,"] = [];
	localeWarns[locale].transparent = [];
}
for (const [key, locales] of Object.entries(keys)) {
	keyWarns[key] = Object.create(null);
	keyWarns[key].extra = [];
	keyWarns[key]["extra, but optional,"] = [];
	keyWarns[key].missing = [];
	keyWarns[key]["missing, but optional,"] = [];
	keyWarns[key].transparent = [];
	const source = locales["en"];
	const extraLocales = Object.keys(locales).filter((locale) => {
		return source == null && locales[locale] != null;
	});
	const extraButOptionalLocales = Object.keys(locales).filter((locale) => {
		return source != null && !isRequired(locale, key) && locales[locale] != null;
	});
	const missingLocales = Object.keys(locales).filter((locale) => {
		return source != null && isRequired(locale, key) && locales[locale] == null;
	});
	const missingButOptionalLocales = Object.keys(locales).filter((locale) => {
		return source != null && !isRequired(locale, key) && locales[locale] == null;
	});
	const transparentLocales = Object.keys(locales).filter((locale) => {
		return locale !== "en" && source != null && locales[locale] != null && source === locales[locale];
	});
	for (const locale of extraLocales) {
		localeWarns[locale].extra.push(key);
		keyWarns[key].extra.push(locale);
	}
	for (const locale of extraButOptionalLocales) {
		localeWarns[locale]["extra, but optional,"].push(key);
		keyWarns[key]["extra, but optional,"].push(locale);
	}
	for (const locale of missingLocales) {
		localeWarns[locale].missing.push(key);
		keyWarns[key].missing.push(locale);
	}
	for (const locale of missingButOptionalLocales) {
		localeWarns[locale]["missing, but optional,"].push(key);
		keyWarns[key]["missing, but optional,"].push(locale);
	}
	for (const locale of transparentLocales) {
		localeWarns[locale].transparent.push(key);
		keyWarns[key].transparent.push(locale);
	}
}
await fs.promises.mkdir("lint", {
	recursive: true,
});
await fs.promises.rm("lint/locales", {
	force: true,
	recursive: true,
});
await fs.promises.mkdir("lint/locales", {
	recursive: true,
});
await fs.promises.rm("lint/keys", {
	force: true,
	recursive: true,
});
await fs.promises.mkdir("lint/keys", {
	recursive: true,
});
const formattedLocaleWarns = [];
const formattedKeyWarns = [];
for (const [locale, warns] of Object.entries(localeWarns)) {
	const formattedLocaleWarn = [];
	const requiredMissingKeyCount = warns.missing.length;
	const requiredKeyCount = Object.keys(keys).filter((key) => {
		const source = keys[key]["en"];
		return source != null && isRequired(locale, key);
	}).length;
	const optionalMissingKeyCount = warns["missing, but optional,"].length;
	const optionalKeyCount = Object.keys(keys).filter((key) => {
		const source = keys[key]["en"];
		return source != null && !isRequired(locale, key);
	}).length;
	const levels = [
		`${requiredKeyCount - requiredMissingKeyCount} / ${requiredKeyCount} required (${((1 - (requiredKeyCount > 0 ? requiredMissingKeyCount / requiredKeyCount : 0)) * 100).toFixed(2)}%)`,
		`${optionalKeyCount - optionalMissingKeyCount} / ${optionalKeyCount} optional (${((1 - (optionalKeyCount > 0 ? optionalMissingKeyCount / optionalKeyCount : 0)) * 100).toFixed(2)}%)`,
	];
	formattedLocaleWarn.push(`Translation coverage: ${levels.join(", ")}\n`);
	for (const [warn, keys] of Object.entries(warns)) {
		if (keys.length < 1) {
			continue;
		}
		formattedLocaleWarns.push(`${locale} has ${warn} translations ${keys.join(", ")}`);
		formattedLocaleWarn.push(`The following keys have ${warn} translations:\n${keys.map((key) => {
			return `- ${key}`;
		}).join("\n")}\n`);
	}
	await fs.promises.writeFile(`lint/locales/${locale.replace(/[./]/g, "_")}.txt`, formattedLocaleWarn.join(""));
}
for (const [key, warns] of Object.entries(keyWarns)) {
	const formattedKeyWarn = [];
	const requiredMissingLocaleCount = warns.missing.length;
	const requiredLocaleCount = Object.keys(locales).filter((locale) => {
		const source = keys[key]["en"];
		return source != null && isRequired(locale, key);
	}).length;
	const optionalMissingLocaleCount = warns["missing, but optional,"].length;
	const optionalLocaleCount = Object.keys(locales).filter((locale) => {
		const source = keys[key]["en"];
		return source != null && !isRequired(locale, key);
	}).length;
	const levels = [
		`${requiredLocaleCount - requiredMissingLocaleCount} / ${requiredLocaleCount} required (${((1 - (requiredLocaleCount > 0 ? requiredMissingLocaleCount / requiredLocaleCount : 0)) * 100).toFixed(2)}%)`,
		`${optionalLocaleCount - optionalMissingLocaleCount} / ${optionalLocaleCount} optional (${((1 - (optionalLocaleCount > 0 ? optionalMissingLocaleCount / optionalLocaleCount : 0)) * 100).toFixed(2)}%)`,
	];
	formattedKeyWarn.push(`Translation coverage: ${levels.join(", ")}\n`);
	for (const [warn, locales] of Object.entries(warns)) {
		if (locales.length < 1) {
			continue;
		}
		formattedKeyWarns.push(`${key} has ${warn} translations ${locales.join(", ")}`);
		formattedKeyWarn.push(`The following locales have ${warn} translations:\n${locales.map((locale) => {
			return `- ${locale}`;
		}).join("\n")}\n`);
	}
	await fs.promises.writeFile(`lint/keys/${key.replace(/[./]/g, "_")}.txt`, formattedKeyWarn.join(""));
}
await fs.promises.writeFile("lint/locales.txt", formattedLocaleWarns.length > 0 ? `${formattedLocaleWarns.join("\n")}\n` : "");
await fs.promises.writeFile("lint/keys.txt", formattedKeyWarns.length > 0 ? `${formattedKeyWarns.join("\n")}\n` : "");
await fs.promises.writeFile(`lint/readme.md`, `\
# Lint

- [Translation report by locale](locales.txt)
- [Translation report by key](keys.txt)
- [Locales](locales)
- [Keys](keys)
`);
await fs.promises.writeFile(`lint/locales/readme.md`, `\
# Locales

${Object.keys(locales).map((locale) => {
	return `\
- [Translation coverage for locale \`${locale}\`](${locale}.txt)
`;
}).join("")}\
`);
await fs.promises.writeFile(`lint/keys/readme.md`, `\
# Keys

${Object.keys(keys).map((key) => {
	return `\
- [Translation coverage for key \`${key}\`](${key}.txt)
`;
}).join("")}\
`);
