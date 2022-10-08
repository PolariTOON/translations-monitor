import fs from "fs";
const locales = JSON.parse(await fs.promises.readFile("cache/locales.json"));
const keys = JSON.parse(await fs.promises.readFile("cache/keys.json"));
const localeWarns = Object.create(null);
for (const locale of Object.keys(locales)) {
	localeWarns[locale] = Object.create(null);
	localeWarns[locale].extra = [];
	localeWarns[locale].missing = [];
}
const keyWarns = Object.create(null);
for (const [key, locales] of Object.entries(keys)) {
	keyWarns[key] = Object.create(null);
	keyWarns[key].extra = [];
	keyWarns[key].missing = [];
	const length = locales["en"].length !== 0 ? 1 : 0;
	const extraLocales = Object.keys(locales).filter((locale) => {
		return locales[locale].length > length;
	});
	for (const locale of extraLocales) {
		const {length} = locales[locale];
		localeWarns[locale].extra.push(length === 1 ? key : `${key} (${length})`);
		keyWarns[key].extra.push(length === 1 ? locale : `${locale} (${length})`);
	}
	const missingLocales = Object.keys(locales).filter((locale) => {
		return locales[locale].length < length;
	});
	for (const locale of missingLocales) {
		localeWarns[locale].missing.push(key);
		keyWarns[key].missing.push(locale);
	}
}
await fs.promises.mkdir("lint", {
	recursive: true,
});
await fs.promises.mkdir("lint/locales", {
	recursive: true,
});
await fs.promises.mkdir("lint/keys", {
	recursive: true,
});
const formattedLocaleWarns = [];
for (const [locale, warns] of Object.entries(localeWarns)) {
	const {extra, missing} = warns;
	const formattedLocaleWarn = [];
	if (extra.length !== 0) {
		formattedLocaleWarns.push(`${locale} has extra translations ${extra}`);
		formattedLocaleWarn.push(`The following keys have extra translations:\n${extra.map((extra) => {
			return `- ${extra}`;
		}).join("\n")}\n`);
	}
	if (missing.length !== 0) {
		formattedLocaleWarns.push(`${locale} has missing translations ${missing}`);
		formattedLocaleWarn.push(`The following keys have missing translations:\n${missing.map((missing) => {
			return `- ${missing}`;
		}).join("\n")}\n`);
	}
	await fs.promises.writeFile(`lint/locales/${locale}.txt`, formattedLocaleWarn.join(""));
}
const formattedKeyWarns = [];
for (const [key, warns] of Object.entries(keyWarns)) {
	const {extra, missing} = warns;
	const formattedKeyWarn = [];
	if (extra.length !== 0) {
		formattedKeyWarns.push(`${key} has extra translations ${extra}`);
		formattedKeyWarn.push(`The following locales have extra translations:\n${extra.map((extra) => {
			return `- ${extra}`;
		}).join("\n")}\n`);
	}
	if (missing.length !== 0) {
		formattedKeyWarns.push(`${key} has missing translations ${missing}`);
		formattedKeyWarn.push(`The following locales have missing translations:\n${missing.map((missing) => {
			return `- ${missing}`;
		}).join("\n")}\n`);
	}
	await fs.promises.writeFile(`lint/keys/${key}.txt`, formattedKeyWarn.join(""));
}
await fs.promises.writeFile("lint/locales.txt", formattedLocaleWarns.length !== 0 ? `${formattedLocaleWarns.join("\n")}\n` : "");
await fs.promises.writeFile("lint/keys.txt", formattedKeyWarns.length !== 0 ? `${formattedKeyWarns.join("\n")}\n` : "");
