import { chatStream } from "@/client/api/chat.client";
import type { PipelinePlugin, PipelineSchema } from "@/hooks/use-pipeline";

export const streamChat: PipelinePlugin = async (ctx, updateCtx) => {
  if (!ctx.userMessage) return ctx;

  const messages: PipelineSchema["messages"] = [
    ...ctx.messages,
    { content: "", role: "assistant" },
  ];

  updateCtx({
    ...ctx,
    messages,
    status: "streaming",
  });

  let buffer = "";
  let currentState: PipelineSchema = {
    ...ctx,
    messages,
    status: "streaming",
  };

  try {
    await chatStream(
      {
        messages: ctx.messages,
        model: "gpt-4o-mini",
        stream: true,
      },
      (token) => {
        buffer += token;
        const updatedMessages = [...currentState.messages];
        updatedMessages[updatedMessages.length - 1] = {
          content: buffer,
          role: "assistant",
        };
        currentState = {
          ...currentState,
          messages: updatedMessages,
        };
        updateCtx(currentState);
      },
    );

    return {
      ...currentState,
      status: "idle",
      userMessage: undefined,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Stream error";
    return {
      ...currentState,
      error,
      status: "error",
    };
  }
};
