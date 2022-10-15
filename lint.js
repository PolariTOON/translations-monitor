import fs from "fs";
const locales = JSON.parse(await fs.promises.readFile("cache/locales.json"));
const keys = JSON.parse(await fs.promises.readFile("cache/keys.json"));
const localeWarns = Object.create(null);
const keyWarns = Object.create(null);
for (const locale of Object.keys(locales)) {
	localeWarns[locale] = Object.create(null);
	localeWarns[locale].extra = [];
	localeWarns[locale].missing = [];
	localeWarns[locale].transparent = [];
}
for (const [key, locales] of Object.entries(keys)) {
	keyWarns[key] = Object.create(null);
	keyWarns[key].extra = [];
	keyWarns[key].missing = [];
	keyWarns[key].transparent = [];
	const length = locales["en"].length !== 0 ? 1 : 0;
	const extraLocales = Object.keys(locales).filter((locale) => {
		return locales[locale].length > length;
	});
	const missingLocales = Object.keys(locales).filter((locale) => {
		return locales[locale].length < length;
	});
	const transparentLocales = Object.keys(locales).filter((locale) => {
		return locale !== "en" && locales[locale].filter((transparent) => {
			return locales["en"].includes(transparent);
		}).length !== 0;
	});
	for (const locale of extraLocales) {
		const {length} = locales[locale];
		localeWarns[locale].extra.push(length === 1 ? key : `${key} (${length})`);
		keyWarns[key].extra.push(length === 1 ? locale : `${locale} (${length})`);
	}
	for (const locale of missingLocales) {
		localeWarns[locale].missing.push(key);
		keyWarns[key].missing.push(locale);
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
	for (const [warn, keys] of Object.entries(warns)) {
		if (keys.length === 0) {
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
	for (const [warn, locales] of Object.entries(warns)) {
		if (locales.length === 0) {
			continue;
		}
		formattedKeyWarns.push(`${key} has ${warn} translations ${locales.join(", ")}`);
		formattedKeyWarn.push(`The following locales have ${warn} translations:\n${locales.map((locale) => {
			return `- ${locale}`;
		}).join("\n")}\n`);
	}
	await fs.promises.writeFile(`lint/keys/${key.replace(/[./]/g, "_")}.txt`, formattedKeyWarn.join(""));
}
await fs.promises.writeFile("lint/locales.txt", formattedLocaleWarns.length !== 0 ? `${formattedLocaleWarns.join("\n")}\n` : "");
await fs.promises.writeFile("lint/keys.txt", formattedKeyWarns.length !== 0 ? `${formattedKeyWarns.join("\n")}\n` : "");
