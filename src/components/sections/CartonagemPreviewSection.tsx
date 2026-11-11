import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function CartonagemPreviewSection() {
  return (
    <Section id="feito-no-atelie" className="scroll-mt-24">
      <Container>
        <div className="grid overflow-hidden rounded-[28px] border border-gold-line bg-carbon lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[360px] bg-steel lg:min-h-[540px]">
            <Image src="/ideias/caixas-premium.png" alt="Estudo visual de caixas premium com diferentes formas de abertura e acabamento" fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
            <span className="absolute bottom-5 left-5 rounded-full border border-gold-line bg-void/85 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-gold-lum backdrop-blur">Visual conceitual</span>
          </div>
          <div className="flex flex-col justify-center p-7 md:p-11 lg:p-14">
            <p className="eyebrow">A história por trás da peça</p>
            <h2 className="mt-5 text-display text-chalk">Da primeira medida ao último detalhe.</h2>
            <p className="mt-6 text-base leading-relaxed text-silver">
              Uma caixa bem pensada carrega mais do que um produto. Ela traduz cuidado em estrutura, precisão no encontro das paredes e intenção em cada dobra do revestimento.
            </p>
            <ol className="mt-8 space-y-4 border-t border-line pt-7">
              <li className="flex gap-4"><span className="font-mono text-gold">01</span><span className="text-sm text-silver">Corte da estrutura em Holler de 2 mm.</span></li>
              <li className="flex gap-4"><span className="font-mono text-gold">02</span><span className="text-sm text-silver">Montagem, conferência de esquadro e prensagem.</span></li>
              <li className="flex gap-4"><span className="font-mono text-gold">03</span><span className="text-sm text-silver">Revestimento externo e interno com Color Plus.</span></li>
            </ol>
            <div className="mt-9"><Button href="/processos/cartonagem-caixas-premium" variant="outline">Veja a fabricação ilustrada</Button></div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
