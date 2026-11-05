// Part of the APK.audio project — http://APK.audio — made by Anthony Kuzub
// MIT Licence. Free, for everyone, for ever. Full text in LICENSE at the root.
/* The connector and signal-format vocabulary this editor offers (ROAD-3501):
   the CAD's catalogue (vendor/apk-vocabulary, generated from
   EDITORS.CAD.Like.audio/src/connectors and held by check.sh vocabulary +
   webshared), narrowed and extended by config/vocabulary.json — this app's
   own extras are data there, never a list in source. */
import '../vendor/apk-vocabulary/apk-vocabulary.js';

export const VOCABULARY = await globalThis.APKVocabulary.forApp(new URL('../config/vocabulary.json', import.meta.url));
if (VOCABULARY.problems.length) console.warn('[vocabulary]', VOCABULARY.problems.join('; '));
