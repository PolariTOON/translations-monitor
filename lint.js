import fs from "fs";
const keys = JSON.parse(await fs.promises.readFile("cache/keys.json"));
const knownLocales = [
	"de",
	"el",
	"en",
	"es",
	"fr",
	"id",
	"it",
	"ja",
	"nl",
	"pl",
	"pt",
	"ru",
	"sv",
	"tr",
];
const warns = [];
for (const [key, locales] of Object.entries(keys)) {
	const en = locales["en"];
	if (en == null) {
		const extraLocales = Object.keys(locales).filter((locale) => {
			return locale !== "en";
		});
		if (extraLocales.length !== 0) {
			warns.push(`${key} has extra translations ${extraLocales}`);
		}
		continue;
	}
	const missingLocales = knownLocales.filter((locale) => {
		return locale !== "en" && locales[locale] == null;
	});
	if (missingLocales.length !== 0) {
		warns.push(`${key} has missing translations ${missingLocales}`);
	}
}
await fs.promises.mkdir("lint", {
	recursive: true,
});
await fs.promises.writeFile("lint/keys.txt", warns.length !== 0 ? `${warns.join("\n")}\n` : "");
