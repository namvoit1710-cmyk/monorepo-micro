import type { ChatAdapter } from "./adapter";

export interface ChatProviderConfig {
  adapter: ChatAdapter;

  suggestions?: ChatSuggestion[];

  placeholder?: string;

  welcome?: ChatWelcomeConfig;

  markdown?: boolean;

  codeHighlight?: boolean;
}

export interface ChatSuggestion {
  label: string;

  message?: string;

  icon?: string;
}

export interface ChatWelcomeConfig {
  title?: string;

  subtitle?: string;

  avatarUrl?: string;
}
