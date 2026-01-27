"use server";

import * as z from "zod";
import { scriptsTable } from "@/db/db.schema";
import { db } from "@/lib/adapters/drizzle.server";

export type SchemaInsertScript = z.infer<typeof schemaInsertScript>;

const schemaInsertScript = z.object({
  action: z.string().max(64),
  created_at: z.date().optional(),
  description: z.string(),
  embedding: z.array(z.number()).length(768),
  layout: z.string().max(64),
  name: z.string().max(128),
  technical_metadata: z.string(),
  updated_at: z.date().optional(),
  url: z.string().max(512),
});

export const insertScript = async (data: SchemaInsertScript) => {
  await db.insert(scriptsTable).values(data);
};
