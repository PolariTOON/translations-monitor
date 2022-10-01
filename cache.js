import fs from "fs";
import fetch from "node-fetch";
const sheets = Object.assign(Object.create(null), {
	"de": "1z07GQkZ-mbmgETg6gevh4MyesWXm8p9krrCL9fPk4kY",
	"el": "16g5njU_1MHnpXT_3f0OufNgychrkbvemLdFMNFKYVqE",
	"en": "1PkJlfOAoW9c7etarwzI3wGG4qPboalXnNRRsXWH2KcA",
	"es": "1BlSbOB_KOquHblgOlpDDB8hTmZLv-_KcRyLVrHg9H5c",
	"fr": "1woLwu7hivuOEHgqab_4tAMeTQmHItawSytPpEZ5Ezec",
	"id": "1AuVrqtigX7HSsxDFsA_ZR8JxG6gch9WkT9TyWmBEK1k",
	"it": "1MiL6iHHAm5QSufcnpiRYSsmZdPaSH-bFWDkB0RzK0r8",
	"ja": "1iER5UvyaAYg35NthhgyuFbdRambiZDbDXMQn8-97RT4",
	"nl": "16JkrPWJeFBx1qP7SddaaVOyhTMqw8bVs4idUG4UbHWg",
	"pl": "1i7pKjm5bq08HRBqJ3PgnDWoYgeZ0C5-Y1rG5XIMVfxg",
	"pt": "1UrM4HTJOw1tu_LaNc-SclHZDtkUphga2G3qdQuH2gYw",
	"ru": "1jY-kaRPmRVjI4ARfF7TY6wc-EOeuR2wLi80ph6Dj2sQ",
	"sv": "1vDyz4JpT0FhxqjvRjGcevve1gVhRx703EnsPUqkO-hM",
	"tr": "1XN24kknIFeW0P37VBxEwzjOdBh9ZrioCDLj1NlW1rLw",
});
const locales = Object.create(null);
for (const [locale, sheet] of Object.entries(sheets)) {
	try {
		const response = await fetch(`https://docs.google.com/spreadsheets/d/${sheet}/export?format=tsv`);
		if (!response.ok) {
			throw new Error(response.statusText);
		}
		const text = await response.text();
		const lines = text.split(/\r\n?|\n/);
		for (const line of lines) {
			const cells = line.split("\t").slice(0, 2);
			if (cells.length < 2) {
				continue;
			}
			const key = cells[0].replace(/^ *([^\t\n ]*?) *$/, "$1");
			if (key === "") {
				continue;
			}
			const value = cells[1].replace(/^ *([^\t\n ]*?) *$/, "$1");
			if (value === "") {
				continue;
			}
			(locales[locale] ??= Object.create(null))[key] ??= value;
		}
		console.log(`Got sheet ${locale}`);
	} catch (error) {
		console.warn(`Error while getting sheet ${locale}`);
	}
}
const keys = Object.create(null);
for (const [locale, values] of Object.entries(locales)) {
	for (const [key, value] of Object.entries(values)) {
		(keys[key] ??= Object.create(null))[locale] ??= value;
	}
}
function sortEntries(entries) {
	entries.sort(([a], [b]) => {
		if (a < b) {
			return -1;
		}
		if (a > b) {
			return 1;
		}
		return 0;
	});
	return entries;
}
const sortedLocales = Object.fromEntries(sortEntries(Object.entries(locales).map(([locale, keys]) => {
	return [
		locale,
		Object.fromEntries(sortEntries(Object.entries(keys))),
	]
})));
const sortedKeys = Object.fromEntries(sortEntries(Object.entries(keys).map(([key, locales]) => {
	return [
		key,
		Object.fromEntries(sortEntries(Object.entries(locales))),
	]
})));
await fs.promises.mkdir("cache", {
	recursive: true,
});
await fs.promises.writeFile(`cache/locales.json`, JSON.stringify(sortedLocales, null, "\t"));
await fs.promises.writeFile(`cache/keys.json`, JSON.stringify(sortedKeys, null, "\t"));
