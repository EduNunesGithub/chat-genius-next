"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MessageCircle, Send } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  usePipeline,
  pipelineSchema,
  PipelineSchema,
} from "@/hooks/use-pipeline";
import { streamChat } from "@/hooks/use-pipeline/plugins/stream-chat.plugin";
import { submitUserMessage } from "@/hooks/use-pipeline/plugins/submit-user-message.plugin";

type FormSchema = z.infer<typeof formSchema>;

const pipelineStatusTranslation: Record<PipelineSchema["status"], string> = {
  error: "Ocorreu um erro ❌",
  idle: "Aguardando ação...",
  streaming: "Transmitindo dados...",
};

const formSchema = pipelineSchema.pick({
  userMessage: true,
});

export const UserChat = () => {
  const { register, handleSubmit, reset, watch } = useForm<FormSchema>({
    defaultValues: { userMessage: "" },
    resolver: zodResolver(formSchema),
  });

  const { context, run, queryKey } = usePipeline({
    ctx: {
      messages: [
        {
          role: "system",
          content:
            "Always respond in English, no matter what language the user writes in.",
        },
      ],
      status: "idle",
    },
    plugins: [submitUserMessage, streamChat],
  });

  const formRef = useRef<HTMLFormElement>(null);

  const userMessage = watch("userMessage") ?? "";
  const canSubmit = userMessage.length !== 0 && context.status === "idle";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      e.key !== "Enter" ||
      e.shiftKey ||
      e.nativeEvent.isComposing ||
      !formRef.current
    )
      return;

    e.preventDefault();
    if (canSubmit) formRef.current.requestSubmit();
  };

  const onSubmit = async (data: FormSchema) => {
    reset();
    await run({ userMessage: data.userMessage });
  };

  return (
    <Card
      aria-label="Chat com suporte"
      className="gap-0 overflow-hidden pb-0 pt-0"
      role="region"
    >
      <section className="flex flex-1 flex-col gap-4 items-start overflow-y-auto p-4 w-full">
        {context.messages.map(({ content, role }, index) => {
          if (role === "system") return null;
          else
            return (
              <div
                className={twMerge(
                  "bg-secondary flex flex-col max-w-96 p-4 prose-chat rounded-lg shrink-0 w-fit",
                  role === "assistant" && "mr-auto max-w-3xl",
                  role === "user" && "ml-auto",
                )}
                key={index}
              >
                {content ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <Spinner className="h-4 w-4" />
                )}
              </div>
            );
        })}
      </section>

      <Separator />

      <CardFooter className="bg-secondary flex-col gap-2 p-4 shrink-0">
        <span className="flex gap-2 items-center text-sm w-full">
          {context.status !== "idle" && <Spinner className="h-4 w-4" />}
          {context.status === "idle" && <MessageCircle className="h-4 w-4" />}
          <span>
            <strong>Status: </strong>
            {pipelineStatusTranslation[context.status]}
            {context.error && ` - ${context.error}`}
          </span>
        </span>

        <form
          className="flex items-end justify-end relative w-full"
          onSubmit={handleSubmit(onSubmit)}
          ref={formRef}
        >
          <Textarea
            {...register("userMessage")}
            className="box-content h-18 pr-14 resize-none"
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
          />

          <Button
            aria-label="Enviar mensagem"
            className="absolute bottom-2 right-2"
            disabled={!canSubmit}
            size="icon"
            type="submit"
          >
            <Send />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
