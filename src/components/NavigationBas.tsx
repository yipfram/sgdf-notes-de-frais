"use client";

import { BanknotesIcon, CreditCardIcon } from "@heroicons/react/24/outline";

export type VueApplication = "carte" | "remboursement";

const items = [
  { vue: "carte" as const, label: "Carte", icon: CreditCardIcon },
  {
    vue: "remboursement" as const,
    label: "Remboursement",
    icon: BanknotesIcon,
  },
];

export function NavigationBas({
  vueActive,
  onChangerVue,
}: {
  readonly vueActive: VueApplication;
  readonly onChangerVue: (vue: VueApplication) => void;
}) {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(24,24,27,0.08)] backdrop-blur"
    >
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2">
        {items.map((item) => {
          const isActive = vueActive === item.vue;
          const Icon = item.icon;

          return (
            <button
              key={item.vue}
              type="button"
              onClick={() => onChangerVue(item.vue)}
              aria-current={isActive ? "page" : undefined}
              className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
