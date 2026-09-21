import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";

/** Cabeçalho padrão das páginas internas — mantém o ritmo visual da Home. */
export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pt-[136px] pb-16 md:pt-[168px] md:pb-24">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(110%_80%_at_60%_0%,#15181E_0%,#08090B_60%)]" />
        <div className="grid-backdrop" />
        <div className="halo -right-20 -top-20 size-[420px] opacity-70" />
        <div className="noise" />
      </div>

      <Container className="relative">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 max-w-3xl text-display font-semibold text-chalk">{title}</h1>
        {description ? <p className="mt-6 max-w-xl text-lead text-ash">{description}</p> : null}
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </section>
  );
}
