interface AppLocalization {
  settings__appName: string;
  settings__description: string;

  setting__autocomplete: string;
  setting__autocomplete__description: string;
  setting__fenceOnly: string;
  setting__fenceOnly__description: string;
  setting__idOnly: string;
  setting__idOnly__description: string;
  setting__tag: string;
  setting__tag__description: string;
  setting__prefix: string;
  setting__prefix__description: string;
  setting__suffix: string;
  setting__suffix__description: string;
  setting__blockFence: string;
  setting__blockFence__description: string;
  setting__renderMarkdown: string;
  setting__renderMarkdown__description: string;
}

const defaultStrings: AppLocalization = {
  settings__appName: 'Tokenized Notes',
  settings__description: 'Reference content from other notes using placeholder tokens.',

  setting__autocomplete: 'Autocomplete',
  setting__autocomplete__description:
    'Display a dropdown of token suggestions in the editor when the opening tag is entered.',
  setting__fenceOnly: 'Code blocks only',
  setting__fenceOnly__description: 'Only replace tokens found in fenced code blocks (```).',
  setting__idOnly: 'Note IDs only',
  setting__idOnly__description: 'Allow only note IDs to be used as tokens.',
  setting__tag: 'Tag filter',
  setting__tag__description:
    'Restrict token titles to notes with the specified tag name. Notes without this tag can still be referenced by ID.',
  setting__prefix: 'Token prefix',
  setting__prefix__description: 'Opening tag for tokens. (default: %%)',
  setting__suffix: 'Token suffix',
  setting__suffix__description: 'Closing tag for tokens. (default: %%)',
  setting__blockFence: 'Always replace in code blocks',
  setting__blockFence__description:
    'Automatically replace tokens in fenced code blocks (```). To enable token replacement for a specific block, write `tokenized` in the header.',
  setting__renderMarkdown: 'Always render markdown (caution)',
  setting__renderMarkdown__description:
    'Always render markdown found in referenced notes without using ( ) tags. Markdown is not rendered in code blocks. This feature is highly experimental and may cause rendering issues.',
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
