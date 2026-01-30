"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { roles } from "@/common/chat.common";

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
  embedding: z.array(z.number()).optional(),
  embeddingText: z.string().optional(),
  error: z.string().optional(),
  messages: z
    .array(z.object({ content: z.string(), role: z.enum(roles) }))
    .optional()
    .default([]),
  status: z
    .enum(["idle", "processing", "streaming", "loading", "error"])
    .optional()
    .default("idle"),
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

  const { data: context } = useQuery({
    gcTime: Infinity,
    initialData: ctx,
    queryFn: () => ctx,
    queryKey,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: async (partial: Partial<PipelineSchema>) => {
      const merged = pipelineSchema.parse({
        ...context,
        ...partial,
      });
      let current = merged;
      const updateCtx = (next: PipelineSchema) =>
        queryClient.setQueryData(queryKey, next);
      for (const plugin of plugins) {
        current = await plugin(current, updateCtx);
      }
      return current;
    },
    onError: (err) => {
      const error = err instanceof Error ? err.message : "Unknown error";
      queryClient.setQueryData(queryKey, {
        ...context,
        error,
        status: "error" as const,
      });
    },
    onSuccess: (result) => {
      queryClient.setQueryData(queryKey, result);
    },
  });

  return {
    context,
    isLoading: mutation.isPending,
    queryKey,
    run: mutation.mutateAsync,
  };
};
