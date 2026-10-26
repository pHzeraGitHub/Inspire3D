export type NavItem = {
  label: string;
  href: string;
  /** Rotas ainda não construídas ficam marcadas — o menu mostra "em breve". */
  soon?: boolean;
};

export const primaryNav: NavItem[] = [
  { label: "Início", href: "/#inicio" },
  { label: "Coleções", href: "/#colecoes" },
  { label: "Personalize", href: "/orcamento?categoria=personalizado" },
  { label: "Inspire AI", href: "/#inspire-ai" },
  { label: "Para Empresas", href: "/#empresas" },
  { label: "Nossa História", href: "/sobre" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Coleções",
    items: [
      { label: "Inspire Gifts", href: "/produtos?colecao=inspire-gifts#catalogo" },
      { label: "Inspire Collectibles", href: "/produtos?colecao=inspire-collectibles#catalogo" },
      { label: "Inspire Games", href: "/produtos?colecao=inspire-games#catalogo" },
      { label: "Inspire Solutions", href: "/produtos?colecao=inspire-solutions#catalogo" },
      { label: "Caminho dos Guardiões", href: "/produtos/caminho-dos-guardioes" },
    ],
  },
  {
    title: "Descobrir",
    items: [
      { label: "Todos os produtos", href: "/produtos" },
      { label: "Projetos", href: "/projetos" },
      { label: "Serviços", href: "/servicos" },
      { label: "Nossa história", href: "/sobre" },
      { label: "Contato", href: "/contato" },
    ],
  },
  {
    title: "Comece um projeto",
    items: [
      { label: "Personalize uma ideia", href: "/orcamento?categoria=personalizado" },
      { label: "Orçamento", href: "/orcamento" },
      { label: "Inspire AI", href: "/#inspire-ai" },
      { label: "Para empresas", href: "/#empresas" },
    ],
  },
];

/** Links jurídicos — obrigatórios por LGPD e exigidos no briefing §21. */
export const legalNav: NavItem[] = [
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos de Uso", href: "/termos" },
];
