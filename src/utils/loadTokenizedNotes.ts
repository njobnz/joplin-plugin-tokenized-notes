import { fetchTokenizedNotes } from './fetchTokenizedNotes';

/**
 * Retrieves tokenized notes and saves them to localStorage.
 */
export const loadTokenizedNotes = async (): Promise<void> => {
  const notes = await fetchTokenizedNotes();
  localStorage.setItem('TokenizedNotes.Notes', JSON.stringify(Object.fromEntries(notes)));
};
