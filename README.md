# Tokenized Notes for Joplin

A plugin for Joplin that enables referencing content from other notes using placeholder tokens.

## Usage

### Referencing Notes

To reference the content of another note, use the following syntax:

```
%%Title of Another Note%%
```

This will display the content of the note titled "**Title of Another Note**" in the markdown viewer.

Alternatively, reference a note using its ID:

```
%%4a7fbc2e5d9a36e10cf8b4d7ea12c390%%
```

### Renderer Tags

Tokens can include rendering tags to control content display:

| Token Syntax  | Description                     |
| ------------- | ------------------------------- |
| `%%Token%%`   | Use the default renderer.       |
| `%%(Token)%%` | Render markdown content.        |
| `%%[Token]%%` | Render markdown inline.         |
| `%%{Token}%%` | Render as plain text (default). |

#### Example:

- `%%(Note with Markdown)%%` will render the markdown content of the note.
- `%%{Plain Text Note}%%` will display the raw text of the note.

### Autocomplete

Typing the opening tag (%%) triggers a dropdown menu listing available note titles. Selecting a title will autocomplete the token.

## Acknowledgments

- [Note Variables Plugin](https://github.com/DanteCoder/JoplinPluginNoteVariables)
- [Quick Links Plugin for Joplin](https://github.com/roman-r-m/joplin-plugin-quick-links)
- [Joplin Note Link System](https://github.com/ylc395/joplin-plugin-note-link-system)
- [Embed search in note](https://github.com/ambrt/joplin-plugin-embed-search)

## License

This project is licensed under the [MIT License](LICENCE.md). See `LICENSE.md` for details.

