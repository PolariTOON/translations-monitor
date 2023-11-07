import fs from "fs";
import fetch from "node-fetch";
const sheets = Object.assign(Object.create(null), {
	"de": process.env.SBA_TRANSLATION_SHEET_DE_ID,
	"el": process.env.SBA_TRANSLATION_SHEET_EL_ID,
	"en": process.env.SBA_TRANSLATION_SHEET_EN_ID,
	"es": process.env.SBA_TRANSLATION_SHEET_ES_ID,
	"fr": process.env.SBA_TRANSLATION_SHEET_FR_ID,
	"id": process.env.SBA_TRANSLATION_SHEET_ID_ID,
	"it": process.env.SBA_TRANSLATION_SHEET_IT_ID,
	"nl": process.env.SBA_TRANSLATION_SHEET_NL_ID,
	"pl": process.env.SBA_TRANSLATION_SHEET_PL_ID,
	"pt": process.env.SBA_TRANSLATION_SHEET_PT_ID,
	"ru": process.env.SBA_TRANSLATION_SHEET_RU_ID,
	"tr": process.env.SBA_TRANSLATION_SHEET_TR_ID,
});
const locales = Object.create(null);
const keys = Object.create(null);
for (const locale of Object.keys(sheets)) {
	locales[locale] = Object.create(null);
}
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
			const key = cells[0].replace(/^ *([^\t\n]*?) *$/, "$1");
			if (key === "") {
				continue;
			}
			const value = cells[1].replace(/^ *([^\t\n]*?) *$/, "$1");
			if (value === "") {
				continue;
			}
			for (const locale of Object.keys(sheets)) {
				locales[locale][key] ??= null;
			}
			locales[locale][key] ??= value;
		}
		console.log(`Got sheet ${locale}`);
		await new Promise((resolve) => {
			setTimeout(resolve, 800);
		});
	} catch (error) {
		console.warn(`Error while getting sheet ${locale}`);
		throw error;
	}
}
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
	];
})));
const sortedKeys = Object.fromEntries(sortEntries(Object.entries(keys).map(([key, locales]) => {
	return [
		key,
		Object.fromEntries(sortEntries(Object.entries(locales))),
	];
})));
await fs.promises.mkdir("cache", {
	recursive: true,
});
await fs.promises.writeFile(`cache/locales.json`, `${JSON.stringify(sortedLocales, null, "\t")}\n`);
await fs.promises.writeFile(`cache/keys.json`, `${JSON.stringify(sortedKeys, null, "\t")}\n`);
