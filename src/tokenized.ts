import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { loadTokenizedNotes } from './utils/loadTokenizedNotes';

const contentScriptId: string = 'tuibyte-tokenized-notes';

export namespace tokenizedNotes {
  const onNoteChangeHandler = async (e: any) => {
    if (e.event !== 2) return;
    loadTokenizedNotes();
  };

  export async function init() {
    await joplin.contentScripts.register(
      ContentScriptType.MarkdownItPlugin,
      contentScriptId,
      './markdown.js'
    );
    await loadTokenizedNotes();
    await joplin.workspace.onNoteChange(onNoteChangeHandler);
    await joplin.workspace.onNoteSelectionChange(loadTokenizedNotes);
  }
}
