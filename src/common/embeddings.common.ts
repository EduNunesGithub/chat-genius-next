import { z } from "zod";

export type EmbeddingRequest = z.infer<typeof embeddingSchema>;

export const EMBEDDING_DIMENSIONS = {
  "text-embedding-3-small": 1536,
  "text-embedding-3-large": 3072,
} as const;

export const EMBEDDING_MODELS: (keyof typeof EMBEDDING_DIMENSIONS)[] = [
  "text-embedding-3-large",
  "text-embedding-3-small",
];

export const embeddingSchema = z.object({
  input: z.string().min(1).max(8192),
  model: z.enum(EMBEDDING_MODELS).default("text-embedding-3-small"),
});
