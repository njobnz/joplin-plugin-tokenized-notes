export interface PluginSettings {
  prefix: string;
  suffix: string;
  folders: string[] | null;
  tags: string[] | null;
  idsOnly: boolean;
  blockFence: boolean;
  renderMarkdown: boolean;
}

export interface TokenizedNote {
  note: any;
  properties: TokenProperties;
}

export interface TokenProperties {
  name: string;
  tag: string;
  token: string;
  renderer: TokenRenderers;
}

export interface TokenRenderers {
  text: boolean;
  inline: boolean;
  markdown: boolean;
}

export interface ProcessTokensResult {
  renderer: TokenRenderers;
}
