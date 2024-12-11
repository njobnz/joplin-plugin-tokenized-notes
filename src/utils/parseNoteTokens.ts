import joplin from 'api';
import { readSettings as settings, escapeRegEx as escape } from '../utilities';

/**
 * Extracts a unique list of tokens from the body of the selected note.
 *
 * Tokens are identified using a configurable prefix and suffix and returned
 * as an array of unique token names.
 *
 * @throws {Error} If the token prefix or suffix is missing in the settings.
 * @returns {Promise<string[]>} An array of unique token names.
 */
export const parseNoteTokens = async (): Promise<string[]> => {
  const { prefix, suffix } = settings();
  const body = (await joplin.workspace.selectedNote())?.body ?? '';
  // prettier-ignore
  const p = escape(prefix), s = escape(suffix), c = p + s;
  const pattern = new RegExp(`${p}([^${c}\n\r\\s][^${c}]*[^${c}\n\r\\s]|[^${c}]{1})${s}`, 'g');
  return [...body.matchAll(pattern)].map(match => match[1]);
};
