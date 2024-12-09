import joplin from 'api';
import { tokenizedNotes } from './tokenized';

joplin.plugins.register({
  onStart: async function () {
    await tokenizedNotes.init();
  },
});
