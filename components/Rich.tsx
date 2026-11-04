// Texte avec les repères « [à compléter : …] » mis en évidence (RG01 rendue visible, RG-A05).
import type { ElementType } from "react";

export function Rich({ text, as: Tag = "span", className }: { text: string; as?: ElementType; className?: string }) {
  const parts = String(text ?? "").split(/(\[à compléter[^\]]*\])/i);
  return (
    <Tag className={className}>
      {parts.map((p, n) =>
        !p ? null : /^\[à compléter/i.test(p) ? (
          <span key={n} className="todo">
            {p}
          </span>
        ) : (
          p
        ),
      )}
    </Tag>
  );
}
