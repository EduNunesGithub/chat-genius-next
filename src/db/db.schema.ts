import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const sampleDataTable = pgTable("sample_data", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  message: varchar({ length: 255 }).notNull(),
});
