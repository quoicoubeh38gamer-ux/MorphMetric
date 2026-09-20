"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Sparkle } from "lucide-react";
import type { FaceReport } from "@/lib/ai/types";
import { store } from "@/lib/store";
import { buildCoachTopics, type CoachTopic } from "@/lib/ai/coach";
import { PageHeader } from "@/components/dashboard/page-header";
import { Loading, NoAnalysis } from "@/components/dashboard/empty-state";

interface Turn {
  topic: CoachTopic;
}

export default function InsightsPage() {
  const [report, setReport] = useState<FaceReport | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReport(store.getReport());
    setLoaded(true);
  }, []);

  const topics = useMemo(() => (report ? buildCoachTopics(report) : []), [report]);
  const asked = new Set(turns.map((t) => t.topic.id));
  const remaining = topics.filter((t) => !asked.has(t.id));

  function ask(topic: CoachTopic) {
    setTurns((t) => [...t, { topic }]);
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
  }

  if (!loaded) return <Loading />;
  if (!report) {
    return (
      <>
        <PageHeader title="Insights" description="Your results, explained." />
        <NoAnalysis what="the coach" />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Insights"
        description="Ask anything about your own report. Every answer is derived from your measurements — there is no chatbot here and nothing is guessed or sent anywhere."
      />

      <div className="mt-8 space-y-4">
        {turns.length === 0 ? (
          <div className="card-base flex items-start gap-3 p-5">
            <Sparkle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <p className="text-sm leading-relaxed text-muted">
              Pick a question below. Answers quote your own numbers, so you can always check them
              against the Measurements page.
            </p>
          </div>
        ) : null}

        {turns.map(({ topic }, i) => (
          <motion.div
            key={`${topic.id}-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {topic.question}
              </p>
            </div>
            <div className="card-base max-w-[92%] p-5">
              {topic.paragraphs.map((para, j) => (
                <p
                  key={j}
                  className={
                    para.startsWith("•")
                      ? "mt-2 pl-1 text-sm leading-relaxed text-muted first:mt-0"
                      : "mt-3 text-sm leading-relaxed text-muted first:mt-0"
                  }
                >
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {remaining.length > 0 ? (
        <div className="sticky bottom-4 mt-8">
          <div className="card-base p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" /> Suggested questions
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {remaining.slice(0, 8).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => ask(t)}
                  className="focus-ring rounded-full border border-border px-3.5 py-1.5 text-left text-[0.8125rem] text-muted transition-colors hover:border-foreground/20 hover:text-foreground"
                >
                  {t.question}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-8 text-center text-sm text-muted">
          That is every question this report can answer. Re-scan to generate new ones.
        </p>
      )}
    </>
  );
}
