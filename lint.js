import fs from "fs";
const locales = JSON.parse(await fs.promises.readFile("cache/locales.json"));
const keys = JSON.parse(await fs.promises.readFile("cache/keys.json"));
const localeCount = Object.keys(locales).length - 1;
const keyCount = Object.keys(keys).filter((key) => {
	return keys[key]["en"].length !== 0;
}).length;
const localeWarns = Object.create(null);
const keyWarns = Object.create(null);
for (const locale of Object.keys(locales)) {
	localeWarns[locale] = Object.create(null);
	localeWarns[locale].extra = [];
	localeWarns[locale].missing = [];
	localeWarns[locale].multiple = [];
	localeWarns[locale].transparent = [];
}
for (const [key, locales] of Object.entries(keys)) {
	keyWarns[key] = Object.create(null);
	keyWarns[key].extra = [];
	keyWarns[key].missing = [];
	keyWarns[key].multiple = [];
	keyWarns[key].transparent = [];
	const length = locales["en"].length;
	const extraLocales = Object.keys(locales).filter((locale) => {
		return length < 1 && locales[locale].length > 0;
	});
	const missingLocales = Object.keys(locales).filter((locale) => {
		return length > 0 && locales[locale].length < 1;
	});
	const multipleLocales = Object.keys(locales).filter((locale) => {
		return length > 0 && locales[locale].length > 1;
	});
	const transparentLocales = Object.keys(locales).filter((locale) => {
		return locale !== "en" && locales[locale].filter((transparent) => {
			return locales["en"].includes(transparent);
		}).length > 0;
	});
	for (const locale of extraLocales) {
		localeWarns[locale].extra.push(key);
		keyWarns[key].extra.push(locale);
	}
	for (const locale of missingLocales) {
		localeWarns[locale].missing.push(key);
		keyWarns[key].missing.push(locale);
	}
	for (const locale of multipleLocales) {
		const {length} = locales[locale];
		localeWarns[locale].multiple.push(`${key} (${length})`);
		keyWarns[key].multiple.push(`${locale} (${length})`);
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
	formattedLocaleWarn.push(`Translation coverage: ${((1 - warns.missing.length / keyCount) * 100).toFixed(2)}%\n`);
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
	formattedKeyWarn.push(`Translation coverage: ${((1 - warns.missing.length / localeCount) * 100).toFixed(2)}%\n`);
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
