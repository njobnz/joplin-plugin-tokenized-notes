import { readSettings as settings } from '../utilities';
import { TokenizedNote, TokenRenderers } from '../types';
import { localStoreNotesKey } from '../constants';

let isRendering = false;

export default _context => {
  return {
    plugin: function (markdownIt, _options) {
      const renderProxy = (tokens, idx, options, env, self) =>
        self.renderToken(tokens, idx, options, env, self);

      /**
       * Processes tokens with optional replacement and Markdown rendering.
       *
       * @param {Function} renderer - The original renderer function.
       * @param {boolean} [replaceContent=true] - Replace token text content.
       * @param {boolean} [renderMarkdown=true] - Render replaced content as Markdown.
       * @returns {Function} Customized render function.
       */
      const renderTokenized = (renderer, renderMarkdown = true, replaceContent = true) =>
        function (tokens, idx, options, env, self) {
          const token = tokens[idx];
          if (settings().fenceOnly && token.tag !== 'code')
            return renderer(tokens, idx, options, env, self);

          const tokenizedNotes = readTokenizedNotes();
          if (tokenizedNotes && replaceContent && !isRendering) {
            const content = token.content;
            const results = processTokens(token, tokenizedNotes);
            const markdown = results.markdown || (renderMarkdown && settings().renderMarkdown);
            if (markdown && !results.text && token.content !== content) {
              try {
                isRendering = true; // Prevent recursion when calling markdownIt.render
                return results.inline
                  ? markdownIt.renderInline(token.content)
                  : markdownIt.render(token.content);
              } catch (error) {
                console.error('Error rendering markdown:', error, tokens);
              } finally {
                isRendering = false;
              }
            }
          }
          return renderer(tokens, idx, options, env, self);
        };

      const renderer = {
        text: markdownIt.renderer.rules.text || renderProxy,
        code_inline: markdownIt.renderer.rules.code_inline || renderProxy,
        code_block: markdownIt.renderer.rules.code_block || renderProxy,
        html_inline: markdownIt.renderer.rules.html_inline || renderProxy,
        html_block: markdownIt.renderer.rules.html_block || renderProxy,
        link_open: markdownIt.renderer.rules.link_open || renderProxy,
        image: markdownIt.renderer.rules.image || renderProxy,
        fence: markdownIt.renderer.rules.fence || renderProxy,
      };

      markdownIt.renderer.rules.text = renderTokenized(renderer.text);
      markdownIt.renderer.rules.code_inline = renderTokenized(renderer.code_inline, false);
      markdownIt.renderer.rules.code_block = renderTokenized(renderer.code_block, false);
      markdownIt.renderer.rules.html_inline = renderTokenized(renderer.html_inline);
      markdownIt.renderer.rules.html_block = renderTokenized(renderer.html_block);
      markdownIt.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const tokenizedNotes = readTokenizedNotes();
        if (tokenizedNotes) {
          const token = tokens[0];
          token.attrSet('href', replaceTokens(decodeURI(token.attrGet('href')), tokenizedNotes));
          token.attrSet('title', replaceTokens(token.attrGet('title'), tokenizedNotes));
        }
        return renderer.link_open(tokens, idx, options, env, self);
      };
      markdownIt.renderer.rules.image = (tokens, idx, options, env, self) => {
        const tokenizedNotes = readTokenizedNotes();
        if (tokenizedNotes) {
          const token = tokens[0];
          token.attrSet('src', replaceTokens(decodeURI(token.attrGet('src')), tokenizedNotes));
          token.attrSet('title', replaceTokens(token.attrGet('title'), tokenizedNotes));
          token.content = replaceTokens(token.content, tokenizedNotes);
          if (token.children && token.children[0])
            // updates alt attribute
            token.children[0].content = replaceTokens(token.content, tokenizedNotes);
        }
        return renderer.image(tokens, idx, options, env, self);
      };
      markdownIt.renderer.rules.fence = (tokens, idx, options, env, self) =>
        renderTokenized(
          renderer.fence,
          tokens[idx].tag !== 'code',
          settings().blockFence || tokens[idx].info.includes('tokenized')
        )(tokens, idx, options, env, self);
    },
  };
};

/**
 * Fetch the tokenized notes from local storage.
 *
 * @returns {Record<string, TokenizedNote>} The tokenized notes from local storage
 */
const readTokenizedNotes = (): Record<string, TokenizedNote> =>
  JSON.parse(localStorage.getItem(localStoreNotesKey));

/**
 * Replaces all tokens in a text string with their corresponding note
 * text and determines the renderer to use.
 *
 * @param {any} token - The input MarketdownIt token
 * @param {Record<string, TokenizedNote>} tokenized - A mapping of tokenzied note titles and ids
 *                                                    to their note object.
 * @returns {any} The renderer settings.
 */
function processTokens(token: any, tokenized: Record<string, TokenizedNote>): TokenRenderers {
  let result = {
    text: false,
    inline: false,
    markdown: false,
  };

  // Set renderer based on first found token
  let found: boolean = false;
  const updateRenderer = renderer => {
    if (found) return;
    found = true;
    result = renderer;
  };

  for (const [name, data] of Object.entries(tokenized)) {
    if (!token.content.includes(name)) continue;
    updateRenderer(data.info.renderer);
    token.content = token.content.split(name).join(data.note?.body || '');
  }

  return result;
}

/**
 * Replaces all tokens in a text string with their corresponding note text.
 *
 * @param {string} text - The input text.
 * @param {Record<string, TokenizedNote>} tokenized - A mapping of tokenzied note titles and ids
 *                                                    to their note object.
 * @returns {string} The replaced text.
 */
function replaceTokens(text: string, tokenized: Record<string, TokenizedNote>): string {
  if (text)
    for (const [name, info] of Object.entries(tokenized))
      text = text.split(name).join(info.note?.body || '');
  return text;
}
