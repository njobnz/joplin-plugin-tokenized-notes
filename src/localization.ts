interface AppLocalization {
  settings__appName: string;
  settings__description: string;

  setting__folders: string;
  setting__folders__description: string;
  setting__tags: string;
  setting__tags__description: string;
  setting__prefix: string;
  setting__prefix__description: string;
  setting__suffix: string;
  setting__suffix__description: string;
  setting__idsOnly: string;
  setting__idsOnly__description: string;
  setting__blockFence: string;
  setting__blockFence__description: string;
  setting__renderMarkdown: string;
  setting__renderMarkdown__description: string;
}

const defaultStrings: AppLocalization = {
  settings__appName: 'Tokenized Notes',
  settings__description: 'Reference content from other notes using tokens.',

  setting__idsOnly: 'Note IDs only',
  setting__idsOnly__description: 'Allows only note IDs to be used as tokens.',
  setting__folders: 'Folders',
  setting__folders__description: 'Filter usable notes to a list of folder IDs.',
  setting__tags: 'Tags',
  setting__tags__description: 'Filter usable notes to a list of tag IDs.',
  setting__prefix: 'Token prefix',
  setting__prefix__description: 'Opening tag for tokens (default: %%).',
  setting__suffix: 'Token suffix',
  setting__suffix__description: 'Closing tag for tokens (default: %%).',
  setting__blockFence: 'Always replace in code blocks',
  setting__blockFence__description:
    'Automatically replace tokens in block code fences (```). Write `tokenized` in the block header to replace tokens in that block when disabled.',
  setting__renderMarkdown: 'Always render markdown (caution)',
  setting__renderMarkdown__description:
    'Always render markdown found in tokenized notes without using ( and ) tags. Markdown in code blocks is not rendered. This feature is highly experimental and may cause markdown rendering issues.',
};

const localizations: Record<string, AppLocalization> = {
  en: defaultStrings,

  es: {
    ...defaultStrings,
  },
};

let localization: AppLocalization | undefined;

const languages = [...navigator.languages];
for (const language of navigator.languages) {
  const localeSep = language.indexOf('-');

  if (localeSep !== -1) {
    languages.push(language.substring(0, localeSep));
  }
}

for (const locale of languages) {
  if (locale in localizations) {
    localization = localizations[locale];
    break;
  }
}

if (!localization) {
  console.log('No supported localization found. Falling back to default.');
  localization = defaultStrings;
}

export default localization!;
