import { PageIntro } from "@/components/layout/PageIntro";
import { LegalDoc } from "@/components/layout/LegalDoc";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/config/site";

export const metadata = pageMetadata({
  title: "Política de Privacidade",
  description:
    "Como a Inspire 3D coleta, usa, armazena e protege os dados pessoais e os arquivos enviados pelos clientes, conforme a LGPD.",
  path: "/politica-de-privacidade",
});

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <PageIntro
        eyebrow="Privacidade"
        title="O que fazemos com os seus dados."
        description="Em linguagem direta: quais dados pedimos, por que pedimos, por quanto tempo guardamos e como você pede para apagá-los."
      />
      <LegalDoc
        updatedAt="setembro de 2026"
        intro={`Esta política explica o tratamento de dados pessoais pela ${site.name} no site ${site.url}, em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018).`}
        sections={[
          {
            heading: "Quem é o controlador",
            body: [
              `A ${site.name} é a controladora dos dados tratados neste site. Para qualquer assunto relacionado a privacidade, o canal é ${site.contact.email}.`,
              "A razão social e o CNPJ do controlador devem ser preenchidos antes da publicação do site.",
            ],
          },
          {
            heading: "Quais dados coletamos",
            body: [
              "Dados que você envia voluntariamente em formulários de orçamento e contato: nome, e-mail, telefone ou WhatsApp, empresa (quando aplicável) e a descrição do projeto.",
              "Arquivos que você anexa ao pedido de orçamento: modelos 3D (STL, OBJ, 3MF, STEP), imagens de referência e documentos.",
              "Dados técnicos de navegação gerados automaticamente, como endereço IP, tipo de dispositivo e páginas visitadas, quando ferramentas de analytics estiverem ativas e você tiver consentido.",
              "Não coletamos dados sensíveis e não solicitamos documentos de identificação ou dados de pagamento por este site.",
            ],
          },
          {
            heading: "Por que tratamos esses dados",
            body: [
              "Para responder ao seu contato, analisar a viabilidade técnica do projeto, elaborar orçamento e executar a produção — base legal: execução de contrato ou procedimentos preliminares a ele.",
              "Para cumprir obrigações fiscais e legais decorrentes de um pedido efetivado — base legal: cumprimento de obrigação legal.",
              "Para melhorar o site e entender como ele é usado — base legal: consentimento, solicitado antes da ativação de qualquer ferramenta de medição.",
            ],
          },
          {
            heading: "Seus arquivos e projetos",
            body: [
              "Modelos e imagens enviados são usados exclusivamente para analisar, orçar e produzir a sua peça.",
              "Não publicamos, revendemos, licenciamos nem usamos o seu projeto em portfólio, redes sociais ou material de divulgação sem a sua autorização expressa.",
              "Ao enviar um arquivo, você declara ter os direitos necessários sobre ele. Não produzimos peças que violem direitos autorais ou de marca de terceiros.",
            ],
          },
          {
            heading: "Com quem compartilhamos",
            body: [
              "Com prestadores de serviço estritamente necessários à operação — hospedagem do site, envio de e-mail transacional e, quando houver, transporte da encomenda.",
              "Com autoridades públicas, quando houver obrigação legal ou ordem judicial.",
              "Não vendemos dados pessoais e não os cedemos para publicidade de terceiros.",
            ],
          },
          {
            heading: "Por quanto tempo guardamos",
            body: [
              "Dados de contato e orçamentos não convertidos: até 24 meses, para retomar a conversa caso você volte.",
              "Dados de pedidos realizados: pelo prazo exigido pela legislação fiscal aplicável.",
              "Arquivos 3D: mantidos enquanto durar o projeto e por período razoável após a entrega, para reposição e reimpressão. Você pode pedir a exclusão antes disso.",
            ],
          },
          {
            heading: "Seus direitos",
            body: [
              "Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade e exclusão dos seus dados, além de revogar consentimento a qualquer momento.",
              `Basta escrever para ${site.contact.email}. Respondemos no prazo legal e podemos pedir informações adicionais apenas para confirmar a sua identidade.`,
            ],
          },
          {
            heading: "Segurança",
            body: [
              "O site é servido sobre HTTPS e os formulários validam o conteúdo enviado. O acesso aos arquivos de projeto é restrito a quem trabalha na sua peça.",
              "Nenhum sistema é imune a incidentes. Caso ocorra um incidente de segurança relevante, comunicaremos você e a Autoridade Nacional de Proteção de Dados conforme a lei.",
            ],
          },
          {
            heading: "Cookies",
            body: [
              "Cookies essenciais mantêm o site funcionando e não exigem consentimento.",
              "Cookies de medição e marketing só são ativados após o seu aceite e podem ser recusados sem prejuízo ao uso do site.",
            ],
          },
          {
            heading: "Alterações desta política",
            body: [
              "Podemos atualizar este documento. A data de atualização no topo indica a versão vigente, e mudanças relevantes serão sinalizadas no site.",
            ],
          },
        ]}
      />
    </>
  );
}
