import joplin from 'api';
import { registerSettings } from './settings';
import { tokenizedNotes } from './tokenized';

joplin.plugins.register({
  onStart: async function () {
    await registerSettings();
    tokenizedNotes.init();
  },
});
