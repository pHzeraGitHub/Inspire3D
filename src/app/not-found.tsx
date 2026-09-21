import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Eyebrow";

export default function NotFound() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden py-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(100%_80%_at_50%_20%,#15181E_0%,#08090B_60%)]" />
        <div className="grid-backdrop" />
        <div className="noise" />
      </div>

      <Container className="relative text-center">
        <Eyebrow>Erro 404</Eyebrow>
        <h1 className="mt-6 text-display font-semibold text-chalk">
          Esta peça não <span className="gold-text">existe</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lead text-ash">
          O endereço que você abriu não faz parte do site — ou ainda não saiu da bancada.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/">Voltar para a Home</Button>
          <Button href="/orcamento" variant="outline">
            Pedir orçamento
          </Button>
        </div>
      </Container>
    </section>
  );
}
