import { z } from "zod";

export type ChatRequest = z.infer<typeof chatSchema>;

export const roles = ["assistant", "system", "user"] as const;

export const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        content: z.string().min(1).max(409600),
        role: z.enum(roles),
      }),
    )
    .min(0)
    .max(100),
  model: z
    .enum([
      "deepseek-chat",
      "deepseek-coder",
      "gpt-4o",
      "gpt-4o-mini",
      "gpt-4-turbo",
      "gpt-3.5-turbo",
    ])
    .default("deepseek-chat"),
  stream: z.boolean().default(false),
});
