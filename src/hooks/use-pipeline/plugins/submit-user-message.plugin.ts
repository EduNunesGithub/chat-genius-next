import { PipelinePlugin, PipelineSchema } from "@/hooks/use-pipeline";

export const submitUserMessage: PipelinePlugin = (ctx, updateCtx) => {
  if (!ctx.userMessage) return ctx;

  const updated: PipelineSchema = {
    ...ctx,
    messages: [...ctx.messages, { content: ctx.userMessage, role: "user" }],
    status: "processing",
  };

  updateCtx(updated);
  return updated;
};
