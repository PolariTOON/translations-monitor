# Super Bear Adventure translations monitor

Tool used by the community to evaluate the quality of Super Bear Adventure translations

## Environment variables

```shell
$ export SBA_CROWDIN_TOKEN=<your-crowdin-token-here>
```

## Scripts

### `bind`

- Regenerates JSON bindings for Shicka based on the cache
- Merges new bindings with old bindings

### `cache`

- Retrieves, aggregates, indexes, sorts and stores JSON snapshots for all the translation sheets

### `lint`

- Generates TXT reports for all the keys and all the locales based on the cache
- Tells if a given key has extra, missing, multiple or transparent translations
- Tells if a translation for a given key and a given locale is required or optional
- Displays the completion level for both required and optional translations
