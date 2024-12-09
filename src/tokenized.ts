import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { registerSettings } from './settings';
import { loadTokenizedNotes } from './utils/loadTokenizedNotes';
import { findTokenizedNotes } from './utils/findTokenizedNotes';
import { markdownScriptId, codeMirrorScriptId, getFilteredTokensCmd } from './constants';

export namespace tokenizedNotes {
  const getFilteredTokens = async (query: any) => {
    const noteId = (await joplin.workspace.selectedNote())?.id;
    const tokens = await findTokenizedNotes(query?.prefix, 10);
    const filter = tokens.filter(note => note.id !== noteId);
    filter.sort((a, b) => a.title.localeCompare(b.title));
    return filter;
  };

  const onMessageHandler = async (message: any) => {
    switch (message?.command) {
      case getFilteredTokensCmd:
        return getFilteredTokens(message?.query);
      default:
        console.error('Unknown command', message);
        return { error: 'Unknown command', message };
    }
  };

  const onNoteChangeHandler = async (e: any) => {
    if (e.event !== 2) return;
    loadTokenizedNotes();
  };

  const registerMarkdown = async () => {
    await joplin.contentScripts.register(
      ContentScriptType.MarkdownItPlugin,
      markdownScriptId,
      './plugins/markdownIt.js'
    );
    await joplin.contentScripts.onMessage(markdownScriptId, onMessageHandler);
  };

  const registerCodeMirror = async () => {
    await joplin.contentScripts.register(
      ContentScriptType.CodeMirrorPlugin,
      codeMirrorScriptId,
      './plugins/codeMirror.js'
    );
    await joplin.contentScripts.onMessage(codeMirrorScriptId, onMessageHandler);
  };

  export async function init() {
    await registerSettings();
    await registerMarkdown();
    await registerCodeMirror();
    await joplin.workspace.onNoteChange(onNoteChangeHandler);
    await joplin.workspace.onNoteSelectionChange(loadTokenizedNotes);
  }
}
