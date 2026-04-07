"use client";

import type { IdeationBadges as IdeationBadgesType } from "@/lib/ideationBadges";

type Props = {
  badges: IdeationBadgesType;
};

const badgeStyle =
  "rounded-full border border-neutral-200/90 bg-neutral-50/90 px-3 py-1.5 text-xs font-medium text-neutral-700";

export function IdeationBadges({ badges }: Props) {
  const items: { key: string; label: string; value: string }[] = [];
  if (badges.territorio) {
    items.push({ key: "t", label: "Territorio", value: badges.territorio });
  }
  if (badges.perfil) {
    items.push({ key: "p", label: "Perfil", value: badges.perfil });
  }
  if (badges.tension) {
    items.push({ key: "ten", label: "Tensión", value: badges.tension });
  }
  if (badges.hook) {
    items.push({ key: "h", label: "Hook", value: badges.hook });
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-8 flex flex-wrap gap-2 border-b border-neutral-200/90 pb-6">
      {items.map((item) => (
        <span key={item.key} className={badgeStyle} title={item.value}>
          <span className="text-neutral-400">{item.label}: </span>
          {item.value}
        </span>
      ))}
    </div>
  );
}
