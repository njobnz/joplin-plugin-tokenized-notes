export interface PluginSettings {
  prefix: string;
  suffix: string;
  tag: string[] | null;
  idOnly: boolean;
  fenceOnly: boolean;
  blockFence: boolean;
  renderMarkdown: boolean;
  autocomplete: boolean;
}

export interface TokenizedNote {
  note: any;
  info: TokenInfo;
}

export interface TokenInfo {
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
