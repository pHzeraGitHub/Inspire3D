export type NavItem = {
  label: string;
  href: string;
  /** Rotas ainda não construídas ficam marcadas — o menu mostra "em breve". */
  soon?: boolean;
};

export const primaryNav: NavItem[] = [
  /* "Serviços" substitui "O que fabricamos": a página cobre a mesma coisa com
     mais profundidade, e manter os dois confundiria — além de somar um sexto
     item que apertaria o header no primeiro breakpoint em que ele aparece. */
  { label: "Serviços", href: "/servicos" },
  { label: "Processo", href: "/#processo" },
  { label: "Tecnologias", href: "/#tecnologias" },
  { label: "Projetos", href: "/projetos" },
  { label: "Inspire AI", href: "/#inspire-ai" },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: "Fabricação",
    items: [
      { label: "Todos os serviços", href: "/servicos" },
      { label: "Colecionáveis & Action Figures", href: "/#fabricamos" },
      { label: "Board Games", href: "/#fabricamos" },
      { label: "Decoração & Design", href: "/#fabricamos" },
      { label: "Protótipos & Peças Funcionais", href: "/#fabricamos" },
      { label: "Personalizados", href: "/#fabricamos" },
    ],
  },
  {
    title: "Estúdio",
    items: [
      { label: "Processo", href: "/#processo" },
      { label: "Como funciona", href: "/servicos#como-funciona" },
      { label: "Tecnologias", href: "/#tecnologias" },
      { label: "Projetos", href: "/projetos" },
      { label: "Sobre a Inspire 3D", href: "/sobre" },
      { label: "Produtos", href: "/produtos", soon: true },
    ],
  },
  {
    title: "Comercial",
    items: [
      { label: "Orçamento inteligente", href: "/orcamento" },
      { label: "Para empresas", href: "/servicos#empresas" },
      { label: "Contato", href: "/contato" },
      { label: "Inspire AI", href: "/#inspire-ai", soon: true },
    ],
  },
];

/** Links jurídicos — obrigatórios por LGPD e exigidos no briefing §21. */
export const legalNav: NavItem[] = [
  { label: "Política de Privacidade", href: "/politica-de-privacidade" },
  { label: "Termos de Uso", href: "/termos" },
];
