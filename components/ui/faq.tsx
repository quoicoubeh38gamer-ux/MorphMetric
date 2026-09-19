import { Plus } from "lucide-react";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Native <details> disclosure: keyboard accessible and screen-reader correct
 * with no JavaScript, and it still animates the marker.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <details key={item.q} className="group">
          <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left [&::-webkit-details-marker]:hidden">
            <span className="text-[0.9375rem] font-medium">{item.q}</span>
            <Plus
              className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-45"
              aria-hidden
            />
          </summary>
          <p className="max-w-2xl pb-6 text-sm leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
