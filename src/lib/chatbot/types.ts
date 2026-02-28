/** Chatbot types */

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatRequest = {
  orgId: string;
  messages: ChatMessage[];
  sessionId?: string;
};

export type ChatResponse = {
  role: 'assistant';
  content: string;
  toolResults?: ToolResult[];
};

export type ToolResult = {
  tool: string;
  input: Record<string, unknown>;
  output: unknown;
};

export type ChatConfig = {
  model: string;
  maxTokens: number;
  maxTurns: number;
};
