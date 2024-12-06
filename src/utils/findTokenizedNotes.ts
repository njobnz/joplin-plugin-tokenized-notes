import joplin from 'api';
import { readSettings as settings } from '../settings';

/**
 * Fetches notes based on folder and tag settings.
 *
 * If no folders or tags are defined, all notes are fetched.
 *
 * @returns {Promise<any[]>} The fetched notes.
 */
export const findTokenizedNotes = async (): Promise<any[]> => {
  const results: any[] = [];
  const fetchPaginatedNotes = async (path: string[]) => {
    for (let page = 1; ; page++) {
      try {
        const result = await joplin.data.get(path, { page });
        results.push(...result.items);
        if (!result.has_more) break;
      } catch (error) {
        break;
      }
    }
  };

  const { folders, tags } = settings();
  if (!folders.length && !tags.length) await fetchPaginatedNotes(['notes']);
  for (const id of folders) await fetchPaginatedNotes(['folders', id, 'notes']);
  for (const id of tags) await fetchPaginatedNotes(['tags', id, 'notes']);

  return results;
};
