import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

export const sampleDataTable = pgTable("sample_data", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  message: varchar({ length: 255 }).notNull(),
});

export const scriptsTable = pgTable("scripts", {
  action: varchar({ length: 64 }).notNull(),
  created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  description: text().notNull(),
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  embedding: vector({ dimensions: 1536 }).notNull(),
  name: varchar({ length: 128 }).notNull(),
  layout: varchar({ length: 64 }).notNull(),
  technical_metadata: text().notNull(),
  updated_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
  url: varchar({ length: 512 }).notNull(),
});
