import fs from "fs";
import fetch from "node-fetch";
import jszip from "jszip";
const sheets = Object.create(null);
const token = process.env.SBA_CROWDIN_TOKEN;
const projectId = 610515;
try {
	const buildResponse = await fetch(`https://api.crowdin.com/api/v2/projects/${projectId}/translations/builds`, {
		body: JSON.stringify({}),
		headers: {
			"authorization": `Bearer ${token}`,
			"content-type": "application/json",
		},
		method: "POST",
	});
	if (!buildResponse.ok) {
		throw new Error(buildResponse.statusText);
	}
	const {data: buildData} = await buildResponse.json();
	const {status: buildStatus, id: buildId} = buildData;
	let status = buildStatus;
	while (status !== "finished") {
		const buildResponse = await fetch(`https://api.crowdin.com/api/v2/projects/${projectId}/translations/builds/${buildId}`, {
			headers: {
				"authorization": `Bearer ${token}`,
			},
		});
		if (!buildResponse.ok) {
			throw new Error(buildResponse.statusText);
		}
		const {data: buildData} = await buildResponse.json();
		const {status: buildStatus} = buildData;
		status = buildStatus;
	}
	console.log(`Got build id ${buildId}`);
	await new Promise((resolve) => {
		setTimeout(resolve, 800);
	});
	const downloadResponse = await fetch(`https://api.crowdin.com/api/v2/projects/${projectId}/translations/builds/${buildId}/download`, {
		headers: {
			"authorization": `Bearer ${token}`,
		},
	});
	if (!downloadResponse.ok) {
		throw new Error(downloadResponse.statusText);
	}
	const {data: downloadData} = await buildResponse.json();
	const {url: downloadUrl} = downloadData;
	console.log(`Got download url ${downloadUrl}`);
	await new Promise((resolve) => {
		setTimeout(resolve, 800);
	});
	const response = await fetch(downloadUrl);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	const buffer = Buffer.from(await response.arrayBuffer());
	const zip = await jszip.loadAsync(buffer);
	zip.forEach((path, sheet) => {
		if (sheet.dir) {
			return;
		}
		if (path.includes("/store-")) {
			return;
		}
		const locale = path.split("/")[0].split("-")[0];
		sheets[locale] ??= sheet;
	});
	console.log(`Got zip`);
	await new Promise((resolve) => {
		setTimeout(resolve, 800);
	});
} catch (error) {
	console.warn(`Error while getting project ${projectId}`);
	throw error;
}
const locales = Object.create(null);
const keys = Object.create(null);
for (const locale of Object.keys(sheets)) {
	locales[locale] = Object.create(null);
}
for (const [locale, sheet] of Object.entries(sheets)) {
	try {
		const text = await sheet.async("text");
		const json = JSON.parse(text);
		for (const cells of Object.entries(json)) {
			const key = cells[0].replaceAll(/^ *(.*?) *$/gm, "$1");
			if (typeof cells[1] !== "string") {
				continue;
			}
			const value = cells[1].replaceAll(/^ *(.*?) *$/gm, "$1");
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
