"use client";

import React from "react";
import { roles } from "@/app/api/chat/route";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

export type PipelinePlugin = (
  ctx: PipelineSchema,
  updateCtx: (ctx: PipelineSchema) => void,
) => PipelineSchema | Promise<PipelineSchema>;

export type PipelineSchema = z.infer<typeof pipelineSchema>;

export type UsePipelineParams = {
  ctx: PipelineSchema;
  queryKey?: string[];
  plugins: PipelinePlugin[];
};

export const pipelineSchema = z.object({
  error: z.string().optional(),
  messages: z
    .array(z.object({ content: z.string(), role: z.enum(roles) }))
    .default([]),
  status: z.enum(["idle", "streaming", "error"]).default("idle"),
  userMessage: z.string().optional(),
});

export const usePipeline = ({
  ctx,
  plugins,
  queryKey: queryKeyProp,
}: UsePipelineParams) => {
  const generatedId = React.useId();
  const queryClient = useQueryClient();
  const queryKey = queryKeyProp ?? ["pipeline", generatedId];
  const context = queryClient.getQueryData<PipelineSchema>(queryKey) ?? ctx;

  const mutation = useMutation({
    mutationFn: async (partial: Partial<PipelineSchema>) => {
      const merged = pipelineSchema.parse({
        ...context,
        ...partial,
      });

      const updateCtx = (next: PipelineSchema) =>
        queryClient.setQueryData(queryKey, next);
      const current: { data: PipelineSchema } = { data: merged };

      for (const plugin of plugins) {
        current.data = await plugin(current.data, updateCtx);
      }

      return current.data;
    },
    onError: (err) => {
      const error = err instanceof Error ? err.message : "Unknown error";
      queryClient.setQueryData(queryKey, {
        ...context,
        error: error,
        status: "error",
      });
    },
    onSuccess: (result) => queryClient.setQueryData(queryKey, result),
  });

  return {
    context,
    isLoading: mutation.isPending,
    queryKey: queryKey,
    run: mutation.mutateAsync,
  };
};
