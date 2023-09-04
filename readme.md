# Super Bear Adventure translations monitor

Tool used by the community to evaluate the quality of Super Bear Adventure translations

## Environment variables

```shell
$ export SBA_TRANSLATION_SHEET_DE_ID=<your-german-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_EL_ID=<your-greek-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_EN_ID=<your-english-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_ES_ID=<your-spanish-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_FR_ID=<your-french-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_ID_ID=<your-indonesian-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_IT_ID=<your-italian-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_JA_ID=<your-japanese-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_NL_ID=<your-dutch-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_PL_ID=<your-polish-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_PT_ID=<your-portuguese-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_RU_ID=<your-russian-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_SV_ID=<your-swedish-translation-sheet-id-here>
$ export SBA_TRANSLATION_SHEET_TR_ID=<your-turkish-translation-sheet-id-here>
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
