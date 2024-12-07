import { ContentScriptContext } from 'api/types';
import type * as CodeMirrorAutocompleteType from '@codemirror/autocomplete';
import type { CompletionContext, CompletionResult, Completion } from '@codemirror/autocomplete';
import type { EditorView } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import { readSettings as settings } from '../settings';
import { escapeRegEx as escape } from '../utilities';
import { getFilteredTokensCmd } from '../constants';

export default async (CodeMirror: any, _context: ContentScriptContext) => {
  const { autocompletion, insertCompletionText } =
    require('@codemirror/autocomplete') as typeof CodeMirrorAutocompleteType;

  const completeToken = async (context: CompletionContext): Promise<CompletionResult> => {
    const { prefix, suffix, idOnly, autocomplete } = settings();
    if (!autocomplete) return null;

    // prettier-ignore
    const wrap = i => i.split('').map(c => `[${escape(c)}]`).join('');
    const pattern = new RegExp(`${wrap(prefix)}[^()\\[\\]{};>,.\`'" ]*`);
    const match = context.matchBefore(pattern);

    if (!match || (match.from === match.to && !context.explicit)) return null;

    const tokens = await _context.postMessage({
      command: getFilteredTokensCmd,
      query: {
        prefix: match.text.substring(prefix.length),
      },
    });

    if (!tokens && tokens.length) return null;

    const createApplyCompletionFn = (noteTitle: string, noteId: string) => {
      return (view: EditorView, _completion: Completion, from: number, to: number) => {
        // TODO: Replace idOnly here with user choice of note id or title from autocomplete dropdown
        // TODO: Let the user select the renderer before inserting the token
        const tokenName = idOnly ? noteId : noteTitle;
        const tokenText = `${prefix}${tokenName}${suffix}`;
        view.dispatch(insertCompletionText(view.state, tokenText, from, to));
      };
    };

    const completions: Completion[] = [];
    for (const note of tokens) {
      completions.push({
        apply: createApplyCompletionFn(note.title, note.id),
        label: note.title,
        detail: `(${note.id})`,
      });
    }

    return {
      from: match.from,
      options: completions,
      filter: false,
    };
  };

  const extension: Extension = CodeMirror.joplinExtensions
    ? CodeMirror.joplinExtensions.completionSource(completeToken)
    : autocompletion({ override: [completeToken] });

  CodeMirror.addExtension([
    extension,
    autocompletion({ tooltipClass: () => 'tokenized-notes-autocompletion' }),
  ]);
};
