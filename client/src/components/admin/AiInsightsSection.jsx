import { Sparkles } from "lucide-react";
import { useGetSalesInsightsQuery } from "../../features/admin/adminAiApi";

// Every insight below is generated from the same real aggregates already
// rendered as charts/stats above on the Dashboard — see
// server/services/aiService.js's generateSalesInsights, which feeds the
// model analyticsService's numbers and nothing else.
export default function AiInsightsSection({ range }) {
  const { data, isLoading, isError } = useGetSalesInsightsQuery(range);
  const insights = data?.data?.insights ?? [];
  const degraded = data?.data?.degraded;

  if (isError) return null;

  return (
    <div className="border border-line p-5">
      <h2 className="label mb-4 flex items-center gap-2 text-accent">
        <Sparkles size={13} strokeWidth={1.5} /> AI Insights
      </h2>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 animate-pulse bg-line" />
          ))}
        </div>
      )}

      {!isLoading && insights.length === 0 && (
        <p className="text-sm text-muted">
          {degraded
            ? "AI insights are temporarily unavailable — the numbers above are still live."
            : "Not enough data yet in this range to generate insights."}
        </p>
      )}

      {!isLoading && insights.length > 0 && (
        <ul className="flex flex-col divide-y divide-line">
          {insights.map((insight, i) => (
            <li key={i} className="py-3">
              <p className="text-sm font-medium">{insight.summary}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{insight.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
