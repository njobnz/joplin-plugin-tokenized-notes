import { fetchTokenizedNotes } from './fetchTokenizedNotes';
import { localStoreNotesKey } from '../constants';

/**
 * Retrieves tokenized notes and saves them to localStorage.
 */
export const loadTokenizedNotes = async (): Promise<void> => {
  const notes = await fetchTokenizedNotes();
  localStorage.setItem(localStoreNotesKey, JSON.stringify(Object.fromEntries(notes)));
};
