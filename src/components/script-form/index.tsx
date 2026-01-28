"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SendHorizonal } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePipeline } from "@/hooks/use-pipeline";
import { prepareEmbeddingText } from "@/hooks/use-pipeline/plugins/prepare-embedding-text.plugin";
import { generateEmbeddings } from "@/hooks/use-pipeline/plugins/generate-embeddings.plugin";
import { insertScript } from "@/server/api/script.server";

export type FormSchema = z.infer<typeof schema>;

const actions = ["Adicionar", "Alterar", "Remover"] as const;
const layouts = [
  "003 Nova Geração",
  "Showroom Performance",
  "Workspace",
] as const;

export const schema = z.object({
  action: z.enum(actions).nonoptional(),
  description: z.string().min(1).max(3072),
  name: z.string().min(1).max(128),
  layout: z.enum(layouts).nonoptional(),
  url: z.string().min(1).max(512),
});

export const ScriptForm = () => {
  const id = React.useId();

  const { control, handleSubmit, register } = useForm<FormSchema>({
    defaultValues: {
      action: "Adicionar",
      description: "",
      layout: "003 Nova Geração",
      name: "",
      url: "",
    },
    resolver: zodResolver(schema),
  });

  const { context, run } = usePipeline({
    ctx: {
      messages: [],
      status: "idle",
    },
    plugins: [prepareEmbeddingText, generateEmbeddings],
  });

  const onSubmit = async (data: FormSchema) => {
    // const script = await insertScript({
    //   ...data,
    //   embedding: Array.from({ length: 768 }, () => 0),
    //   technical_metadata: "",
    // });

    const embeddingText = `${data.name} - ${data.action} - ${data.layout} - ${data.description}`;

    const result = await run({ embeddingText });

    if (result.status === "error") {
      console.error("Pipeline error:", result.error);
      return;
    }

    console.log(result);

    // console.log(script);
  };

  return (
    <Card className="py-4" onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="px-4">
        <form className="flex flex-col gap-4 w-full">
          <FieldSet className="flex flex-col gap-4 w-full">
            <FieldGroup className="auto-rows-min gap-4 grid grid-cols-1 w-full sm:grid-cols-[8rem_1fr]">
              <Controller
                control={control}
                name="action"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel>Ação</FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Escolha uma ação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {actions.map((action, index) => (
                            <SelectItem key={index} value={action}>
                              {action}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Field className="gap-1">
                <FieldLabel htmlFor={`id-nome-${id}`}>Nome</FieldLabel>
                <Input
                  {...register("name")}
                  id={`id-nome-${id}`}
                  placeholder="WhatsApp Flutuante"
                  type="text"
                />
              </Field>
            </FieldGroup>

            <FieldGroup className="auto-rows-min gap-4 grid grid-cols-1 w-full sm:grid-cols-[16rem_1fr]">
              <Controller
                control={control}
                defaultValue="003 Nova Geração"
                name="layout"
                render={({ field, fieldState }) => (
                  <Field className="gap-1" data-invalid={fieldState.invalid}>
                    <FieldLabel>Layout</FieldLabel>
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Escolha o layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {layouts.map((layout, index) => (
                            <SelectItem key={index} value={layout}>
                              {layout}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              <Field className="gap-1">
                <FieldLabel htmlFor={`id-url-${id}`}>URL do Script</FieldLabel>
                <Input
                  {...register("url")}
                  id={`id-url-${id}`}
                  placeholder="https://example.com"
                  type="text"
                />
              </Field>
            </FieldGroup>

            <FieldGroup className="auto-rows-min gap-4 grid grid-cols-1 w-full">
              <Field className="gap-1">
                <FieldLabel htmlFor={`id-descricao-${id}`}>
                  Descrição
                </FieldLabel>
                <Textarea
                  {...register("description")}
                  id={`id-descricao-${id}`}
                  placeholder="Esse script adicionar o WhatsApp Flutuante na parte inferior direita dos canais de layout..."
                  rows={4}
                />
              </Field>
            </FieldGroup>
          </FieldSet>

          <Button className="ml-auto w-fit" type="submit">
            <SendHorizonal />
            Enviar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
