"use client";

import { ChatRequest } from "@/common/chat.common";

export type Chat = (arg0: Partial<ChatRequest>) => Promise<string>;

export type ChatStream = (
  arg0: Partial<ChatRequest>,
  onToken: (token: string) => void,
) => Promise<void>;

export const chat: Chat = async (data) => {
  const body: ChatRequest = {
    messages: [],
    model: "gpt-4-turbo",
    stream: false,
    ...data,
  };

  const res = await fetch("/api/chat", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const text = await res.text();

  if (!res.ok) throw new Error(text);
  else return text;
};

export const chatStream: ChatStream = async (data, onToken) => {
  const body: ChatRequest = {
    messages: [],
    model: "gpt-4-turbo",
    stream: true,
    ...data,
  };

  const res = await fetch("/api/chat", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!res.ok) throw new Error(await res.text());
  if (!res.body) throw new Error(`No body in response`);

  const decoder = new TextDecoder();
  const reader = res.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const token = decoder.decode(value, { stream: true });
      onToken(token);
    }
  } finally {
    reader.releaseLock();
  }
};
