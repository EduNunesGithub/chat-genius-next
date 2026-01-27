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
    messages: messages,
    status: "streaming",
  });

  const buffer = { value: "" };
  const state: { current: PipelineSchema } = {
    current: {
      ...ctx,
      messages: messages,
      status: "streaming",
    },
  };

  try {
    await chatStream(
      {
        messages: ctx.messages,
        model: "deepseek-chat",
        stream: true,
      },
      (token) => {
        buffer.value += token;

        const messages = [...state.current.messages];
        messages[messages.length - 1] = {
          role: "assistant",
          content: buffer.value,
        };

        state.current = {
          ...state.current,
          messages,
        };

        updateCtx(state.current);
      },
    );

    return {
      ...state.current,
      status: "idle",
      userMessage: undefined,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Stream error";
    return {
      ...state.current,
      error: error,
      status: "error",
    };
  }
};
