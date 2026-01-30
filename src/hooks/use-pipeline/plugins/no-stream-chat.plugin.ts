import { chat } from "@/client/api/chat.client";
import type { PipelinePlugin, PipelineSchema } from "@/hooks/use-pipeline";

export const noStreamChat: PipelinePlugin = async (ctx, updateCtx) => {
  if (ctx.messages.length === 0) return ctx;

  updateCtx({
    ...ctx,
    status: "streaming",
  });

  try {
    const response = await chat({
      messages: ctx.messages,
      model: "gpt-4o-mini",
      stream: false,
    });

    const messages: PipelineSchema["messages"] = [
      ...ctx.messages,
      { content: response, role: "assistant" },
    ];

    return {
      ...ctx,
      messages: messages,
      status: "idle",
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Chat error";
    return {
      ...ctx,
      error: error,
      status: "error",
    };
  }
};
