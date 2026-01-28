"use server";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/adapters/openai.server";
import { embeddingSchema, EmbeddingRequest } from "@/common/embeddings.common";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await req.json();
    const data: EmbeddingRequest = embeddingSchema.parse(body);

    const response = await openai.embeddings.create({
      input: data.input,
      model: data.model,
    });

    const embedding = response.data[0].embedding;

    return NextResponse.json({ embedding });
  } catch (err) {
    const error: string =
      err instanceof z.ZodError
        ? `Validation error: ${err.issues.map((e) => e.message).join(", ")}`
        : err instanceof Error
          ? err.message
          : "Unknown error occurred";

    return new NextResponse(error, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
