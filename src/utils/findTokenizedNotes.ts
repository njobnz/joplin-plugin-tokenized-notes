import joplin from 'api';
import { readSettings as settings } from '../settings';

/**
 * Fetches notes based on a search filter and tag settings.
 *
 * If no filter or tags are defined, all notes are returned.
 *
 * @returns {Promise<any[]>} The fetched notes.
 */
export const findTokenizedNotes = async (
  filter: string = '',
  limit: number = 0,
  fields: string[] = null
): Promise<any[]> => {
  const results: any[] = [];

  const fetchNotes = async (path: string[], query?: string): Promise<void> => {
    for (let page = 1; ; page++) {
      try {
        const { items, has_more } = await joplin.data.get(path, {
          page,
          fields: fields ?? ['id', 'parent_id', 'title'],
          ...(query && { query }),
        });
        results.push(...items);
        if (!has_more || (limit > 0 && results.length >= limit)) break;
      } catch (error) {
        console.error('Error fetching notes:', error);
        break;
      }
    }
  };

  const { tag } = settings();
  if (tag || filter) {
    const query = filter ? `tag:${tag} title:${filter}*` : `tag:${tag}`;
    await fetchNotes(['search'], query);
  } else {
    await fetchNotes(['notes']);
  }

  return results;
};
