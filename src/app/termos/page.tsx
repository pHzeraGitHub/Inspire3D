import { PageIntro } from "@/components/layout/PageIntro";
import { LegalDoc } from "@/components/layout/LegalDoc";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";

export const metadata = pageMetadata({
  title: "Termos de Uso",
  description:
    "Regras de uso do site da Inspire 3D e condições gerais dos serviços de modelagem, impressão 3D e acabamento.",
  path: "/termos",
});

export default function TermosPage() {
  return (
    <>
      <PageIntro
        eyebrow="Termos"
        title="As regras do jogo, sem letra miúda."
        description="O que vale ao usar este site e ao contratar uma produção com o estúdio."
      />
      <LegalDoc
        updatedAt="setembro de 2026"
        intro={`Ao navegar em ${site.url} ou solicitar um orçamento, você concorda com os termos abaixo. Eles convivem com a Política de Privacidade e com o que for combinado por escrito em cada projeto.`}
        sections={[
          {
            heading: "O que este site é",
            body: [
              `Este site apresenta os serviços e o portfólio da ${site.name} e permite solicitar orçamento.`,
              "Ele não é uma loja: nenhum pedido é fechado automaticamente pelo site e nenhum pagamento é processado aqui.",
            ],
          },
          {
            heading: "Orçamentos e estimativas",
            body: [
              "Valores e prazos exibidos de forma automática são estimativas baseadas nas informações que você enviou. Não constituem proposta comercial.",
              "A proposta válida é aquela enviada pelo estúdio após análise técnica do projeto, e vale pelo prazo indicado nela.",
              "Alterações de escopo, escala, material ou acabamento depois do aceite podem alterar preço e prazo, sempre com novo aceite seu.",
            ],
          },
          {
            heading: "Arquivos e propriedade intelectual",
            body: [
              "Você continua sendo o titular dos arquivos e do projeto que enviar. Usamos o material apenas para orçar e produzir a sua peça.",
              "Ao enviar um arquivo ou uma referência, você declara ter os direitos necessários sobre ele e assume a responsabilidade por essa declaração.",
              "Recusamos pedidos que envolvam reprodução de personagens, marcas ou obras protegidas sem autorização do titular, bem como conteúdo ilegal, armas funcionais ou peças que ofereçam risco.",
              "A modelagem desenvolvida pelo estúdio, quando houver, permanece de titularidade da Inspire 3D, salvo cessão expressa por escrito na proposta.",
            ],
          },
          {
            heading: "Produção, prazo e entrega",
            body: [
              "O prazo começa a contar a partir do aceite da proposta e da aprovação do render ou do arquivo final, o que ocorrer por último.",
              "Peças fabricadas por impressão 3D têm variações inerentes ao processo — linhas de camada, pequenas diferenças de tom e tolerâncias dimensionais típicas da tecnologia escolhida. Isso não caracteriza defeito.",
              "Quando a peça for enviada por transportadora, o risco de extravio ou avaria no transporte segue as regras da transportadora contratada.",
            ],
          },
          {
            heading: "Peças sob medida e arrependimento",
            body: [
              "Produtos personalizados, feitos sob encomenda conforme especificação do cliente, não admitem devolução por simples arrependimento depois de iniciada a produção.",
              "Defeito de fabricação, divergência em relação ao que foi aprovado ou avaria na entrega são corrigidos por reimpressão ou reparo, sem custo, mediante comunicação em até 7 dias corridos do recebimento, com fotos.",
              "Para compras a distância, os direitos previstos no Código de Defesa do Consumidor são respeitados nos limites em que se aplicam a produtos personalizados.",
            ],
          },
          {
            heading: "Pagamento",
            body: [
              "As condições de pagamento, incluindo eventual sinal para início da produção, são as descritas na proposta aceita.",
              "A produção começa após a confirmação do pagamento acordado para o início.",
            ],
          },
          {
            heading: "Uso do site",
            body: [
              "É vedado tentar comprometer a segurança do site, enviar arquivos maliciosos, automatizar envios em massa de formulários ou copiar o conteúdo e a identidade visual da Inspire 3D sem autorização.",
              "Textos, layout, ilustrações e marca deste site pertencem à Inspire 3D.",
            ],
          },
          {
            heading: "Limitação de responsabilidade",
            body: [
              "O site é oferecido no estado em que se encontra. Não garantimos disponibilidade ininterrupta nem ausência total de erros.",
              "A responsabilidade do estúdio relativa a um projeto limita-se ao valor efetivamente pago por aquele projeto.",
            ],
          },
          {
            heading: "Contato e foro",
            body: [
              `Dúvidas sobre estes termos: WhatsApp ${site.contact.whatsappLabel}${site.contact.email ? ` ou ${site.contact.email}` : ""}.`,
              "Aplica-se a legislação brasileira. O foro competente deve ser definido junto com a assessoria jurídica antes da publicação.",
            ],
          },
        ]}
      />
    </>
  );
}
