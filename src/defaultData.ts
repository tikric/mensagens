import { FacebookGroup, MessageTemplate, ScheduleCampaign, FacebookAccount } from "./types";

export const defaultGroups: FacebookGroup[] = [
  {
    id: "g-1",
    name: "Empreendimentos e Negócios Locais SP",
    url: "https://www.facebook.com/groups/negocios-sp-exemplo-ficticio",
    category: "Negócios / Networking",
    dailyLimit: 3,
    postsCountToday: 1,
    active: true,
    notes: "Grupo focado em divulgação comercial em São Paulo."
  },
  {
    id: "g-2",
    name: "Desapegos, Vendas e Trocas Zona Sul",
    url: "https://www.facebook.com/groups/desapegos-sul-exemplo-ficticio",
    category: "Classificados / Desapego",
    dailyLimit: 5,
    postsCountToday: 2,
    active: true,
    notes: "Grupo com alto engajamento. Evitar links suspeitos."
  },
  {
    id: "g-3",
    name: "Marketing Digital e Copywriting Brasil",
    url: "https://www.facebook.com/groups/mkt-brasil-exemplo-ficticio",
    category: "Marketing / Vendas",
    dailyLimit: 2,
    postsCountToday: 0,
    active: true,
    notes: "Somente posts informativos ou de alto valor."
  },
  {
    id: "g-4",
    name: "Vagas de TI e Home Office 2026",
    url: "https://www.facebook.com/groups/vagas-ti-exemplo-ficticio",
    category: "Vagas / Trabalho",
    dailyLimit: 4,
    postsCountToday: 0,
    active: false,
    notes: "Focado em oportunidades remotas."
  },
  {
    id: "g-5",
    name: "Moradores Centro e Higienópolis SP",
    url: "https://www.facebook.com/groups/moradores-centro-exemplo-ficticio",
    category: "Comunidade Local",
    dailyLimit: 1,
    postsCountToday: 1,
    active: true,
    notes: "Regras rígidas sobre posts comerciais duplicados."
  }
];

export const defaultTemplates: MessageTemplate[] = [
  {
    id: "t-1",
    title: "Vaga de Consultor de Marketing",
    text: "Olá pessoal! Estamos buscando 1 consultor de marketing freelance para atuar em projetos de e-commerce neste trimestre. Remuneração atrativa e 100% Home Office. Interessados podem acessar o formulário de aplicação aqui: https://vagas.exemplo.com/mkt-freelance ou comentar 'Quero saber mais'. 🚀",
    variations: [
      "Amigos do grupo, tudo bem? Temos 1 vaga aberta de consultor de marketing digital remoto temporário. Se você tem experiência em e-commerce e busca renda extra, candidate-se: https://vagas.exemplo.com/mkt-freelance. Comente para detalhes!",
      "Oportunidade de Trabalho Remoto 🚀 Estamos contratando profissional de marketing freelance para otimizar nossas vendas digitais. Ótimos ganhos e horários flexíveis. Toque no link para se inscrever: https://vagas.exemplo.com/mkt-freelance",
      "Quem aqui trabalha com marketing e procura novas demandas freela? Busco parceiro de e-commerce focado em conversão. Atuação imediata, home-office. Link do formulário: https://vagas.exemplo.com/mkt-freelance. Dúvidas? Comente abaixo.",
      "Vaga urgente para Consultor de Conversão Digital. Se você domina tráfego ou copy e quer trabalhar de qualquer lugar, aplique em: https://vagas.exemplo.com/mkt-freelance. Deixe uma reação e entraremos em contato!",
      "Atenção pessoal! Procurando um consultor especializado em funis de e-commerce. Trabalho por projeto, com boa remuneração semanal. Inscrições no link: https://vagas.exemplo.com/mkt-freelance."
    ],
    tags: ["Trabalho/Freela", "Marketing"],
    createdAt: new Date().toLocaleDateString("pt-BR")
  },
  {
    id: "t-2",
    title: "Oferta de Mentoria de Negócios Gratuita",
    text: "Amanhã à noite farei uma aula gratuita ao vivo no YouTube mostrando o funil exato que usamos para faturar R$ 10k/mês com serviços locais. Sem enrolação ou pitch de vendas absurdo, apenas conteúdo estratégico. Quer garantir sua vaga? Inscreva-se no link: http://aula.exemplo.com/esgotando-vagas-sp 🎯",
    variations: [
      "Quero convidar os empreendedores daqui do grupo para uma aula gratuita prática amanhã! Vou abrir o funil que gera mais de R$ 10.000 mensais com negócios de bairro. Cadastre-se sem compromisso: http://aula.exemplo.com/esgotando-vagas-sp",
      "Mentoria gratuita na prática! Amanhã, no meu canal do YouTube, vou desenhar o passo a passo para escalar faturamento de prestadores de serviços. Garanta seu acesso exclusivo aqui: http://aula.exemplo.com/esgotando-vagas-sp 🎯",
      "Atenção pequenos empresários! Quer aprender a atrair clientes qualificados todos os dias sem gastar rios de dinheiro em anúncios? Participe da nossa mentoria gratuita amanhã. Link do convite: http://aula.exemplo.com/esgotando-vagas-sp",
      "Vou revelar amanhã às 20h o roteiro exato que usei para impulsionar 4 negócios locais este mês. Aula 100% gratuita. Inscreva-se antes que as vagas se encerrem no link: http://aula.exemplo.com/esgotando-vagas-sp",
      "Quer alavancar suas vendas de forma inteligente? Vou compartilhar minhas táticas em uma masterclass ao vivo gratuita amanhã. Clique no link para garantir sua cadeira Virtual: http://aula.exemplo.com/esgotando-vagas-sp"
    ],
    tags: ["Estratégia", "Negócios"],
    createdAt: new Date().toLocaleDateString("pt-BR")
  }
];

export const defaultCampaign: ScheduleCampaign = {
  active: false,
  startHour: "08:00",
  endHour: "18:00",
  intervalMinutes: 30,
  messagesPerGroupPerDay: 3,
  useAiVariations: true,
  randomizeDelay: true
};

export const defaultAccounts: FacebookAccount[] = [
  {
    id: "acc-1",
    name: "Carlos Silva (Perfil Principal)",
    email: "carlos.silva.mkt@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    status: "logged_in",
    accessToken: "EAAGbZA81928392183981293812903_SIMULATED",
    cookieString: "c_user=1000859385931; xs=45%3A9f823hf98a; spin=r.1009_SIMULATED",
    groupsCount: 12
  },
  {
    id: "acc-2",
    name: "Fernanda Melo (Perfil Contingência 1)",
    email: "nanda.melo.vendas@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    status: "logged_in",
    accessToken: "EAAGbZA72382173921831293129383_SIMULATED",
    cookieString: "c_user=1000723891238; xs=12%3A7h34gf78d3; spin=r.2001_SIMULATED",
    groupsCount: 8
  },
  {
    id: "acc-3",
    name: "Suporte Comercial (Perfil Novas Contas)",
    email: "comercial.suporte@outlook.com",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    status: "not_logged",
    groupsCount: 0
  }
];

