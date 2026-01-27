import { z } from "zod";

export type ChatRequest = z.infer<typeof chatSchema>;

export const roles = ["assistant", "system", "user"] as const;

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        content: z.string().min(1).max(10240),
        role: z.enum(roles),
      }),
    )
    .min(0)
    .max(100),
  model: z.enum(["deepseek-chat", "deepseek-coder"]).default("deepseek-chat"),
  stream: z.boolean().default(false),
});
