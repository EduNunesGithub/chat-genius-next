"use server";

import { NextRequest, NextResponse } from "next/server";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { z } from "zod";
import { openai } from "@/lib/adapters/openai.server";
import { ChatRequest, chatSchema } from "@/common/chat.common";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const data: ChatRequest = chatSchema.parse(body);

    const messages: ChatCompletionMessageParam[] = data.messages;

    if (data.stream) {
      const stream = await openai.chat.completions.create({
        messages,
        model: data.model ?? "deepseek-chat",
        stream: true,
      });

      const encoder = new TextEncoder();

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              const token = chunk.choices[0]?.delta?.content;
              if (token) controller.enqueue(encoder.encode(token));
            }
            controller.close();
          } catch (err) {
            const error = err instanceof Error ? err.message : "Stream error";
            controller.error(error);
            controller.close();
          }
        },
      });

      return new NextResponse(readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      });
    }

    const completion = await openai.chat.completions.create({
      model: data.model,
      messages,
      stream: false,
    });

    const content: string = completion.choices[0]?.message?.content ?? "";

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (err) {
    const error: string =
      err instanceof z.ZodError
        ? `Validation error: ${err.issues.map((e) => e.message).join(", ")}`
        : err instanceof Error
          ? err.message
          : "Unknown error occurred";

    return new NextResponse(error, {
      status: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
