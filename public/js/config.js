// ════════════════════════════════════════════════════════════════
//  js/config.js — Constantes globais e tipos de documentos
// ════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
//  DocFácil IA — app.js  |  Versão Completa com Edição + Landing
// ═══════════════════════════════════════════════════════════════

'use strict';

// ════════════════════════════════════════════════════════════════
//  ⚙️  CONFIGURAÇÃO DA IA — já configurado, não precisa alterar!
//  A rota /api/ia funciona automaticamente no Vercel e Netlify.
//  A key do OpenRouter fica segura no servidor, nunca exposta.
// ════════════════════════════════════════════════════════════════
const WORKER_URL = '/api/ia';

// ════ ESTADO GLOBAL ════
let currentUser  = null;
let currentStep  = 1;
let selectedType = '';
let currentDocId = null;
let currentDocs  = [];
let currentCategory = 'contratos';
let iaHistory    = [];
const TOTAL_STEPS = 6;

// ════════════════════════════════════════════════════════════════
//  TIPOS DE DOCUMENTOS — 40+ em 8 categorias
// ════════════════════════════════════════════════════════════════
const DOC_TYPES = {
  contratos: [
    { id:'servico',       emoji:'🛠️', name:'Prestação de Serviços',         desc:'Contratação de serviços profissionais' },
    { id:'trabalho_pj',  emoji:'👔', name:'Trabalho PJ / Autônomo',          desc:'Contrato de trabalho pessoa jurídica' },
    { id:'aluguel_res',  emoji:'🏠', name:'Aluguel Residencial',             desc:'Locação de imóvel residencial' },
    { id:'aluguel_com',  emoji:'🏢', name:'Aluguel Comercial',              desc:'Locação de imóvel comercial' },
    { id:'compravenda',  emoji:'🤝', name:'Compra e Venda',                 desc:'Contrato de compra e venda de bens' },
    { id:'parceria',     emoji:'💼', name:'Parceria Comercial',             desc:'Acordo de parceria entre empresas' },
    { id:'freelancer',   emoji:'💻', name:'Contrato de Freelancer',          desc:'Prestação de serviços freelance' },
    { id:'influenciador',emoji:'📱', name:'Contrato de Influenciador',       desc:'Parceria com influenciador digital' },
    { id:'nda',          emoji:'🔒', name:'Confidencialidade (NDA)',          desc:'Acordo de não-divulgação' },
    { id:'comissao',     emoji:'💰', name:'Contrato de Comissão',            desc:'Acordo de comissão e vendas' },
  ],
  imobiliario: [
    { id:'locacao_simples',   emoji:'🏠', name:'Locação Simples',            desc:'Contrato de locação básico' },
    { id:'locacao_fiador',    emoji:'👥', name:'Locação com Fiador',          desc:'Locação com garantia de fiador' },
    { id:'recibo_aluguel',    emoji:'🧾', name:'Recibo de Aluguel',           desc:'Comprovante de pagamento de aluguel' },
    { id:'vistoria',          emoji:'🔍', name:'Vistoria do Imóvel',          desc:'Termo de vistoria de entrada/saída' },
    { id:'notif_desocupacao', emoji:'📨', name:'Notificação de Desocupação',  desc:'Aviso formal de saída do imóvel' },
    { id:'acordo_inadimpl',   emoji:'⚠️', name:'Acordo de Inadimplência',     desc:'Regularização de débito de aluguel' },
  ],
  trabalho: [
    { id:'curriculo',         emoji:'📋', name:'Currículo Profissional',      desc:'Currículo formatado e profissional' },
    { id:'carta_apres',       emoji:'✉️', name:'Carta de Apresentação',       desc:'Carta de apresentação profissional' },
    { id:'carta_demissao',    emoji:'🚪', name:'Carta de Demissão',           desc:'Pedido formal de demissão' },
    { id:'decl_experiencia',  emoji:'📜', name:'Declaração de Experiência',   desc:'Declaração de tempo de serviço' },
    { id:'estagio',           emoji:'🎓', name:'Termo de Estágio',            desc:'Contrato de estágio curricular' },
    { id:'autonomo',          emoji:'🔧', name:'Acordo de Autônomo',           desc:'Prestação de serviços autônomo' },
  ],
  declaracoes: [
    { id:'decl_residencia',   emoji:'🏡', name:'Declaração de Residência',    desc:'Comprovante de residência declarado' },
    { id:'decl_renda',        emoji:'💵', name:'Declaração de Renda',         desc:'Declaração de renda mensal' },
    { id:'decl_informal',     emoji:'🤲', name:'Trabalho Informal',           desc:'Declaração de trabalho informal' },
    { id:'decl_comparec',     emoji:'✅', name:'Declaração de Comparec.',     desc:'Comprovante de comparecimento' },
    { id:'decl_respons',      emoji:'📝', name:'Declaração de Responsab.',    desc:'Declaração de responsabilidade' },
    { id:'decl_uniao',        emoji:'💍', name:'União Estável',               desc:'Declaração de convivência' },
  ],
  financeiro: [
    { id:'recibo',            emoji:'🧾', name:'Recibo de Pagamento',         desc:'Comprovante formal de pagamento' },
    { id:'quitacao',          emoji:'✔️', name:'Termo de Quitação',           desc:'Declaração de quitação total' },
    { id:'confissao_divida',  emoji:'💳', name:'Confissão de Dívida',         desc:'Reconhecimento formal de dívida' },
    { id:'parcelamento',      emoji:'📅', name:'Acordo de Parcelamento',      desc:'Parcelamento de dívida em aberto' },
    { id:'nota_servico',      emoji:'📑', name:'Nota Simples de Serviço',     desc:'Nota avulsa de prestação' },
  ],
  juridico: [
    { id:'lgpd_termo',        emoji:'🛡️', name:'Termo LGPD',                  desc:'Consentimento conforme Lei 13.709/2018' },
    { id:'politica_priv',     emoji:'🔐', name:'Política de Privacidade',      desc:'Política para site ou aplicativo' },
    { id:'termo_uso',         emoji:'📋', name:'Termo de Uso',                 desc:'Termos de uso de plataforma' },
    { id:'notif_extra',       emoji:'⚖️', name:'Notificação Extrajudicial',   desc:'Notificação formal entre partes' },
    { id:'acordo_amigavel',   emoji:'🤝', name:'Acordo Amigável',             desc:'Resolução amigável de conflito' },
  ],
  empresarial: [
    { id:'abertura_empresa',  emoji:'🏢', name:'Abertura de Empresa',         desc:'Documentação básica de abertura' },
    { id:'contrato_social',   emoji:'📜', name:'Contrato Social',             desc:'Contrato social básico de empresa' },
    { id:'acordo_socios',     emoji:'🤝', name:'Acordo entre Sócios',         desc:'Acordo de quotas e responsabilidades' },
    { id:'termo_invest',      emoji:'💰', name:'Termo de Investimento',       desc:'Acordo de aporte e investimento' },
    { id:'plano_parceria',    emoji:'📊', name:'Plano de Parceria',           desc:'Plano detalhado de parceria' },
  ],
  extras: [
    { id:'gen_curriculo',     emoji:'🤖', name:'Currículo via IA',            desc:'Currículo gerado automaticamente com IA' },
    { id:'gen_carta',         emoji:'🤖', name:'Carta Formal via IA',         desc:'Carta profissional gerada com IA' },
    { id:'gen_proposta',      emoji:'🤖', name:'Proposta Comercial IA',       desc:'Proposta completa gerada com IA' },
    { id:'gen_email',         emoji:'🤖', name:'E-mail Profissional IA',      desc:'E-mail formal gerado com IA' },
    { id:'gen_contrato_ia',   emoji:'🤖', name:'Contrato Inteligente IA',     desc:'Contrato 100% gerado pela IA' },
  ]
};

const CLAUSES = [
  { id:'lgpd',          name:'LGPD — Proteção de Dados',      desc:'Conformidade com Lei 13.709/2018' },
  { id:'exclusividade', name:'Exclusividade',                 desc:'Vedação de serviços a concorrentes' },
  { id:'propriedade',   name:'Propriedade Intelectual',       desc:'Titularidade de obras e criações' },
  { id:'sigilo',        name:'Sigilo e Confidencialidade',    desc:'Obrigação de sigilo das informações' },
  { id:'subcontratacao',name:'Vedação de Subcontratação',     desc:'Proibição de subcontratar sem anuência' },
  { id:'reembolso',     name:'Reembolso de Despesas',         desc:'Cobertura de despesas operacionais' },
  { id:'garantia',      name:'Garantia de Execução',          desc:'Garantia de qualidade e prazo' },
  { id:'forca_maior',   name:'Força Maior',                   desc:'Isenção por eventos imprevisíveis' },
  { id:'antisuborno',   name:'Anticorrupção',                 desc:'Conformidade com Lei 12.846/2013' },
  { id:'resolucao',     name:'Resolução Antecipada',          desc:'Encerramento antecipado por mútuo acordo' },
  { id:'penalidade',    name:'Penalidade por Descumprimento', desc:'Sanções em caso de inadimplemento' },
  // Testemunhas gerenciadas no Step 2 com toggle dedicado
];

// ════════════════════════════════════════════════════════════════
//  LANDING PAGE
// ════════════════════════════════════════════════════════════════

