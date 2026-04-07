"use client";

import type { IdeationBadges as IdeationBadgesType } from "@/lib/ideationBadges";

type Props = {
  badges: IdeationBadgesType;
};

const badgeStyle =
  "rounded border border-[#2a2a2a] bg-[#1a1a1a] px-[10px] py-1 text-[11px] uppercase tracking-[1px] text-[#888]";

export function IdeationBadges({ badges }: Props) {
  const items: { key: string; label: string; value: string }[] = [];
  if (badges.territorio) {
    items.push({ key: "t", label: "TERRITORIO", value: badges.territorio });
  }
  if (badges.perfil) {
    items.push({ key: "p", label: "PERFIL", value: badges.perfil });
  }
  if (badges.tension) {
    items.push({ key: "ten", label: "TENSIÓN", value: badges.tension });
  }
  if (badges.hook) {
    items.push({ key: "h", label: "HOOK", value: badges.hook });
  }

  if (items.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap gap-2 border-b border-[#2a2a2a] pb-4">
      {items.map((item) => (
        <span key={item.key} className={badgeStyle} title={item.value}>
          <span className="text-[#666]">{item.label}: </span>
          {item.value}
        </span>
      ))}
    </div>
  );
}
