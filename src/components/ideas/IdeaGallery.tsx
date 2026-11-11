"use client";

import { useState } from "react";
import { IdeaCard } from "@/components/ideas/IdeaCard";
import { ideaCategories, ideas } from "@/content/ideas";

type Filter = (typeof ideaCategories)[number];

export function IdeaGallery() {
  const [filter, setFilter] = useState<Filter>("Todas");
  const visible = filter === "Todas" ? ideas : ideas.filter((idea) => idea.category === filter);

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar ideias por categoria">
        {ideaCategories.map((category) => (
          <button
            key={category}
            type="button"
            aria-pressed={filter === category}
            onClick={() => setFilter(category)}
            className={`rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.1em] transition-colors ${filter === category ? "border-gold bg-gold text-void" : "border-line bg-carbon text-silver hover:border-gold-line hover:text-chalk"}`}
          >
            {category}
          </button>
        ))}
      </div>
      <p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-ash" aria-live="polite">
        {visible.length} {visible.length === 1 ? "ideia" : "ideias"} em exibição
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((idea, index) => <IdeaCard key={idea.slug} idea={idea} priority={index === 0} />)}
      </div>
    </>
  );
}
