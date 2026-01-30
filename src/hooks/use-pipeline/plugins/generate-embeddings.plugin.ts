import { generateEmbedding } from "@/client/api/embeddings.client";
import type { PipelinePlugin } from "@/hooks/use-pipeline";

export const generateEmbeddings: PipelinePlugin = async (ctx, updateCtx) => {
  if (!ctx.embeddingText) return ctx;

  updateCtx({ ...ctx, status: "processing" });

  try {
    const embedding = await generateEmbedding(
      ctx.embeddingText,
      "text-embedding-3-small",
    );
    return {
      ...ctx,
      embedding,
      status: "idle",
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Embedding error";
    return {
      ...ctx,
      error,
      status: "error",
    };
  }
};
