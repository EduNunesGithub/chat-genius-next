"use client";

import { EmbeddingRequest } from "@/common/embeddings.common";

export const generateEmbedding = async (
  input: string,
  model: EmbeddingRequest["model"] = "text-embedding-3-small",
): Promise<number[]> => {
  const body: EmbeddingRequest = { input, model };

  const res = await fetch("/api/embeddings", {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  return data.embedding;
};
