CREATE TABLE "scripts" (
	"action" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"description" text NOT NULL,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scripts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"embedding" vector(768) NOT NULL,
	"name" varchar(128) NOT NULL,
	"layout" varchar(64) NOT NULL,
	"technical_metadata" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"url" varchar(512) NOT NULL
);
