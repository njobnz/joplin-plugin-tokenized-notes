import joplin from 'api';
import { readSettings as settings } from '../settings';
import { parseNoteTokens } from './parseNoteTokens';
import { findTokenizedNotes } from './findTokenizedNotes';
import { TokenizedNote, TokenProperties, TokenRenderers } from 'src/types';

/**
 * Fetches notes for parsed tokens, matching by ID or title.
 *
 * Returns a map of tokens with their associated note data.
 *
 * @returns {Promise<Map<string, TokenizedNote>>} Map of tokens to notes.
 */
export const fetchTokenizedNotes = async (): Promise<Map<string, TokenizedNote>> => {
  const tokens: Map<string, TokenizedNote> = new Map();
  const result = await parseNoteTokens();
  const items = settings().idsOnly ? [] : await findTokenizedNotes();

  for (const key of result) {
    const properties = parseToken(key);
    const name = properties.name;
    const item =
      items.find(i => i.id === name || i.title === name) || (validId(name) ? { id: name } : null);

    if (item) {
      try {
        const note = await joplin.data.get(['notes', item.id], {
          fields: ['id', 'parent_id', 'title', 'body'],
        });
        tokens.set(properties.token, { note, properties });
      } catch {}
    }
  }

  return tokens;
};

/**
 * Parses a token and extracts its properties and modifiers, including name and optional renderer modifier.
 *
 * @param {string} tag - The input token.
 * @returns {Object} An object containing the token name and renderer type.
 */
function parseToken(tag): TokenProperties {
  enum Renderer {
    Text,
    Inline,
    Markdown,
  }

  const patterns = [
    { regex: /^\{(.*)\}$/, renderer: Renderer.Text },
    { regex: /^\[(.*)\]$/, renderer: Renderer.Inline },
    { regex: /^\((.*)\)$/, renderer: Renderer.Markdown },
  ];

  const rendererConfig = (renderer: Renderer = null): TokenRenderers => {
    return {
      text: renderer === Renderer.Text,
      inline: renderer === Renderer.Inline,
      markdown: renderer === Renderer.Markdown || renderer === Renderer.Inline,
    };
  };

  const { prefix, suffix } = settings();
  const token = prefix + tag + suffix;

  const matches = patterns.find(({ regex }) => regex.test(tag));
  const name = matches ? tag.match(matches.regex)[1] : tag;
  const renderer = rendererConfig(matches?.renderer);

  return { name, tag, token, renderer };
}

/**
 * Validates a 32-character hexadecimal Joplin ID.
 *
 * @param {string} str String to validate.
 * @returns {boolean} Validation result.
 */
const validId = (str: string): boolean => /^[0-9A-Fa-f]{32}$/g.test(str);
