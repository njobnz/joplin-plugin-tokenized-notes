import joplin from 'api';
import { readSettings as settings } from '../settings';

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
  const pattern = new RegExp(
    // Ensures complete tokens are matched, avoiding partial matches.
    `${escape(prefix)}([^${escape(prefix)}${escape(suffix)}]*?)${escape(suffix)}`,
    'g'
  );
  return [...body.matchAll(pattern)].map(match => match[1]);
};

/**
 * Escapes special regex characters in a string.
 *
 * @param {string} str - String to escape.
 * @returns {string} The escaped string.
 */
const escape = (str: string): string => str.replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');
