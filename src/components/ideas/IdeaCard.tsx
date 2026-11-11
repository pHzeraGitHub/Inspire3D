import Image from "next/image";
import { whatsappLink } from "@/config/site";
import type { Idea } from "@/content/ideas";

export function IdeaCard({ idea, priority = false }: { idea: Idea; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-carbon shadow-panel transition-colors duration-300 hover:border-gold-line">
      <div className="relative aspect-[4/3] overflow-hidden bg-steel">
        <Image
          src={idea.image}
          alt={idea.alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
        />
        <span className="absolute left-4 top-4 rounded-full border border-gold-line bg-void/85 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-gold-lum backdrop-blur">
          Conceito visual
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="font-mono text-[0.63rem] uppercase tracking-[0.18em] text-gold">{idea.category}</p>
        <h3 className="mt-2 font-display text-xl font-semibold text-chalk">{idea.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-ash">{idea.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label={`Temas de ${idea.title}`}>
          {idea.tags.map((tag) => <li key={tag} className="chip">{tag}</li>)}
        </ul>
        <a
          href={whatsappLink(`Olá! Vi a ideia "${idea.title}" no site da Inspire 3D e gostaria de conversar sobre um projeto parecido.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline mt-6 inline-flex w-fit text-sm font-medium text-gold-lum"
        >
          Conversar sobre esta ideia <span aria-hidden className="ml-2">↗</span>
        </a>
      </div>
    </article>
  );
}
