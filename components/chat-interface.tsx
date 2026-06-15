"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
};

const suggestionPrompts = [
  "Write a polite follow-up email for a delayed payment.",
  "Create a LinkedIn post about consistency and growth.",
  "Draft a short client update message in my style.",
];

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
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:px-8">
      <section className="mb-6 flex flex-col justify-between rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur xl:p-8 lg:sticky lg:top-6 lg:mb-0 lg:h-[calc(100vh-3rem)] lg:w-[30%]">
        <div className="space-y-6">
          <div className="inline-flex w-fit items-center rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-sky-200">
            AI Writing Assistant
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Shubham AI Bot
            </h1>
            <p className="max-w-md text-sm leading-7 text-slate-300 sm:text-base">
              Write emails, LinkedIn posts, blogs and messages in my style.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {suggestionPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-left text-sm text-slate-200 transition hover:border-sky-400/40 hover:bg-slate-900"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 via-slate-900/80 to-sky-500/10 p-5">
          <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-300">
            <span>Creative Flow</span>
            <span>70% Workspace</span>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              Learns from your tone file
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              Generates clean, original writing
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
              No database. No saved backend history.
            </div>
          </div>
        </div>
      </section>

      <section className="flex min-h-[70vh] flex-col rounded-[28px] border border-white/10 bg-slate-950/70 shadow-2xl shadow-slate-950/20 backdrop-blur lg:h-[calc(100vh-3rem)] lg:w-[70%]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Writing Workspace</h2>
            <p className="text-sm text-slate-400">
              Ask for emails, posts, blogs, replies, captions, or polished rewrites.
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[320px] items-center justify-center">
              <div className="max-w-xl rounded-[28px] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center">
                <p className="text-sm uppercase tracking-[0.22em] text-sky-300">Start Writing</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  Tell the assistant what you want to write.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  The response is generated from your prompt plus the `writing-style.md`
                  reference file, and nothing is saved in a database.
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
                          ? "border border-red-400/30 bg-red-500/10 text-red-100"
                          : "border border-white/10 bg-white/[0.05] text-slate-100"
                        : "bg-sky-500 text-slate-950"
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
              <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-slate-300">
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-sky-400" />
                Writing in your style...
              </div>
            </div>
          ) : null}
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="border-t border-white/10 bg-slate-950/80 p-4 sm:p-6"
        >
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-3 shadow-inner shadow-slate-950/20">
            <label htmlFor="prompt" className="sr-only">
              Describe what you want to write
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
              placeholder="Ask for an email, LinkedIn post, blog paragraph, or reply in your style..."
              className="w-full border-0 bg-transparent px-2 py-2 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500"
            />
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
              <p className="text-xs text-slate-400">
                Press Enter to send. Use Shift + Enter for a new line.
              </p>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-sky-400 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
              >
                {isLoading ? (
                  <>
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-slate-950" />
                    Generating
                  </>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
