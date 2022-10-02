import fs from "fs";
const keys = JSON.parse(await fs.promises.readFile("cache/keys.json"));
const warns = [];
for (const [key, locales] of Object.entries(keys)) {
	const length = locales["en"].length !== 0 ? 1 : 0;
	const extraLocales = Object.keys(locales).filter((locale) => {
		return locales[locale].length > length;
	}).map((locale) => {
		const {length} = locales[locale];
		if (length === 1) {
			return locale;
		}
		return `${locale} (${length})`;
	});
	if (extraLocales.length !== 0) {
		warns.push(`${key} has extra translations ${extraLocales}`);
	}
	const missingLocales = Object.keys(locales).filter((locale) => {
		return locales[locale].length < length;
	});
	if (missingLocales.length !== 0) {
		warns.push(`${key} has missing translations ${missingLocales}`);
	}
}
await fs.promises.mkdir("lint", {
	recursive: true,
});
await fs.promises.writeFile("lint/keys.txt", warns.length !== 0 ? `${warns.join("\n")}\n` : "");
