"use client";

import { useMemo, useState } from "react";
import { ArrowUp, ShieldCheck, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button, textareaClass } from "@/components/ui";
import type { ChatAnswer } from "@/lib/types";

type Turn = { question: string; response: ChatAnswer };

export function AskPassport({
  token,
  questions,
}: {
  token: string;
  questions: string[];
}) {
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState("");
  const [asking, setAsking] = useState(false);
  const [ratings, setRatings] = useState<Record<number, string>>({});
  const visitorId = useMemo(() => {
    if (typeof window === "undefined") return "visitor_server";
    const existing = window.localStorage.getItem("portrayVisitorId");
    if (existing) return existing;
    const created = crypto.randomUUID();
    window.localStorage.setItem("portrayVisitorId", created);
    return created;
  }, []);

  async function ask(value = question) {
    const trimmed = value.trim();
    if (!trimmed || asking) return;
    setAsking(true);
    setStatus("");
    try {
      const response = await fetch(`/api/share/${token}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, visitorId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not answer this question");
      setTurns((current) => [...current, { question: trimmed, response: data }]);
      setQuestion("");
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setAsking(false);
    }
  }

  async function rateTurn(index: number, helpful: boolean) {
    const turn = turns[index];
    if (!turn || ratings[index]) return;
    const response = await fetch(`/api/share/${token}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        helpful,
        question: turn.question,
        answer: turn.response.answer,
      }),
    });
    if (response.ok) {
      setRatings((current) => ({ ...current, [index]: helpful ? "Helpful" : "Needs context" }));
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold text-path-green">
        <ShieldCheck size={15} /> Evidence-based answers only
      </div>
      <h2 className="path-title mt-4 font-serif text-3xl font-black text-ink">
        Ask this Passport
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Explore the work, talent signals, direction, and next edge. Follow-ups stay within this private session and authorized evidence.
      </p>

      {!turns.length ? (
        <div className="mt-6 grid gap-2">
          {questions.slice(0, 4).map((item) => (
            <button
              className="rounded-2xl border border-line bg-white p-3 text-left text-sm leading-5 text-ink transition hover:border-path-green/40 hover:bg-muted"
              key={item}
              type="button"
              onClick={() => ask(item)}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-6 grid max-h-[420px] gap-5 overflow-y-auto pr-1">
        {turns.map((turn, index) => (
          <div className="border-t border-line pt-5" key={`${turn.question}-${index}`}>
            <p className="text-sm font-semibold text-ink">{turn.question}</p>
            <p className="mt-3 text-sm leading-6 text-foreground">{turn.response.answer}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {turn.response.citations.map((citation) => (
                <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-muted-foreground" key={citation.sourceId}>
                  {citation.label}
                </span>
              ))}
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground">
                {turn.response.confidence}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {ratings[index] ? (
                <span className="text-xs text-muted-foreground">Feedback: {ratings[index]}</span>
              ) : (
                <>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-ink" type="button" onClick={() => rateTurn(index, true)}><ThumbsUp size={13} /> Helpful</button>
                  <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-ink" type="button" onClick={() => rateTurn(index, false)}><ThumbsDown size={13} /> Needs context</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-6">
        <textarea
          className={`${textareaClass} min-h-24 pr-14`}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Ask about the work, strengths, fit, or next edge..."
          maxLength={800}
        />
        <Button className="absolute bottom-3 right-3 h-9 min-h-9 w-9 px-0" type="button" onClick={() => ask()} disabled={asking || !question.trim()} aria-label="Ask question">
          <ArrowUp size={15} />
        </Button>
      </div>
      {status ? <p className="mt-3 text-sm text-red-700">{status}</p> : null}
    </div>
  );
}
