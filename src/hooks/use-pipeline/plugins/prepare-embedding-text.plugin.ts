import type { PipelinePlugin } from "@/hooks/use-pipeline";

export const prepareEmbeddingText: PipelinePlugin = (ctx, updateCtx) => {
  if (!ctx.embeddingText) return ctx;

  const updated = {
    ...ctx,
    embeddingText: ctx.embeddingText,
  };

  updateCtx(updated);
  return updated;
};
