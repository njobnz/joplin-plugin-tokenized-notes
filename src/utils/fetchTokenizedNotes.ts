import joplin from 'api';
import { TokenizedNote, TokenInfo, TokenRenderers } from '../types';
import { readSettings as settings, validateJoplinId as validId } from '../utilities';
import { findTokenizedNotes } from './findTokenizedNotes';
import { parseNoteTokens } from './parseNoteTokens';

/**
 * Fetches notes for parsed tokens, matching by ID or title.
 *
 * Returns a map of tokens with their associated note data.
 *
 * @returns {Promise<Map<string, TokenizedNote>>} Map of tokens to notes.
 */
export const fetchTokenizedNotes = async (): Promise<Map<string, TokenizedNote>> => {
  const { idOnly } = settings();
  const fields = ['id', 'title', 'body'];
  const tokens: Map<string, TokenizedNote> = new Map();
  const result = await parseNoteTokens();
  const notes = idOnly ? [] : await findTokenizedNotes('', 0, fields);

  const fetchNoteById = async (noteId: string) => {
    try {
      return await joplin.data.get(['notes', noteId], { fields });
    } catch (error) {
      console.error('Error fetching note:', error);
      return null;
    }
  };

  for (const key of result) {
    const info = parseToken(key);
    const { name, token } = info;
    const note =
      notes.find(i => i.id === name || i.title === name) ||
      (validId(name) ? await fetchNoteById(name) : null);
    if (note) tokens.set(token, { note, info });
  }

  return tokens;
};

/**
 * Parses a token and extracts its properties and modifiers, including name and optional renderer modifier.
 *
 * @param {string} tag - The input token.
 * @returns {Object} An object containing the token name and renderer type.
 */
function parseToken(tag): TokenInfo {
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
