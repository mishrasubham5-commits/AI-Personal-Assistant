"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

export function ChatInterface() {
  const formRef = useRef<HTMLFormElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => input.trim().length > 0 && !isLoading,
    [input, isLoading],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmedInput,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmedInput }),
      });

      const payload = (await response.json()) as { response?: string; error?: string };

      if (!response.ok || !payload.response) {
        throw new Error(payload.error || "Something went wrong while generating text.");
      }

      const assistantResponse = payload.response;

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantResponse,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while generating text.";

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: message,
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy(id: string, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1800);
    } catch {
      setCopiedId(null);
    }
  }

  return (
    <main className="flex h-screen w-full flex-col overflow-hidden bg-black lg:flex-row">
      <section className="w-full shrink-0 border-b border-white/10 bg-black px-5 py-5 lg:h-full lg:w-[380px] lg:border-b-0 lg:border-r lg:px-8 lg:py-8">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div className="inline-flex w-fit items-center rounded-full border border-white/15 bg-black px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-slate-200">
              IAM AI Policies Co-Pilot
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center lg:mt-0 lg:basis-[30%]">
            <div className="relative h-[110px] w-full max-w-[320px] lg:h-full lg:max-w-full">
              <Image src="/ameriprise-logo.svg" alt="Ameriprise" fill className="object-contain" />
            </div>
          </div>

          <div className="mt-6 flex flex-1 flex-col gap-4 lg:mt-0 lg:basis-[55%] lg:pt-6">
            <div className="rounded-3xl border border-white/10 bg-neutral-950/60 p-5">
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                Ameriprise - AI IAM Policy Copilot
              </h1>
            </div>

            <div className="rounded-3xl border border-white/10 bg-neutral-950/60 p-5">
              <p className="text-base leading-7 text-slate-200">
                Analyze IAM roles, permissions, access controls, SoD conflicts, and compliance requirements using natural language.
              </p>
            </div>

            <div className="mt-auto rounded-3xl border border-white/10 bg-neutral-950/60 px-5 py-4 text-sm text-slate-300">
              Policy corpus: ameriprise_iam_policy.md
            </div>
          </div>

          <div className="hidden lg:block flex-1" />
        </div>
      </section>

      <section className="flex h-full flex-1 flex-col bg-black">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5 lg:px-8">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-2xl rounded-3xl border border-dashed border-white/15 bg-black px-7 py-8 text-center">
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-200">
                  Start Review
                </p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  Describe the access request.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Include identity type, business unit, role/permission needed, duration, and business justification.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isAssistant = message.role === "assistant";

              return (
                <article
                  key={message.id}
                  className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-3xl rounded-[24px] px-4 py-3 shadow-lg sm:px-5 ${
                      isAssistant
                        ? message.isError
                          ? "border border-red-400/30 bg-black text-red-100"
                          : "border border-white/10 bg-black text-slate-100"
                        : "border border-white/10 bg-black text-slate-100"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em]">
                      <span className={isAssistant ? "text-slate-400" : "text-slate-900/75"}>
                        {isAssistant ? (message.isError ? "Error" : "Assistant") : "You"}
                      </span>
                      {isAssistant && !message.isError ? (
                        <button
                          type="button"
                          onClick={() => handleCopy(message.id, message.content)}
                          className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-slate-300 transition hover:border-sky-400/40 hover:text-white"
                        >
                          {copiedId === message.id ? "Copied" : "Copy"}
                        </button>
                      ) : null}
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-7 sm:text-[15px]">
                      {message.content}
                    </p>
                  </div>
                </article>
              );
            })
          )}

          {isLoading ? (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-black px-4 py-3 text-sm text-slate-300">
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-600 border-t-white" />
                Analyzing policy...
              </div>
            </div>
          ) : null}
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="border-t border-white/10 bg-black px-5 py-4 lg:px-8"
        >
          <div className="rounded-[28px] border border-white/10 bg-black p-3 shadow-inner shadow-black/30">
            <label htmlFor="prompt" className="sr-only">
              Describe the access request
            </label>
            <textarea
              id="prompt"
              rows={4}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (canSubmit) {
                    formRef.current?.requestSubmit();
                  }
                }
              }}
              placeholder="Example: Contractor (CONT) needs PORTFOLIO_READ + REPORT_GENERATE for 30 days for BU-001. Check SoD and decide."
              className="w-full border-0 bg-transparent px-2 py-2 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500"
            />
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <p className="text-xs text-slate-400">
                Press Enter to send. Use Shift + Enter for a new line.
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black px-4 py-2 text-sm font-medium text-white transition hover:border-white/25 hover:bg-neutral-950 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-black disabled:text-slate-500"
              >
                {isLoading ? (
                  <>
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-white" />
                    Analyzing
                  </>
                ) : (
                  "Analyze"
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
