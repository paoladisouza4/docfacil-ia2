// ═══════════════════════════════════════════════════════════════
//  DocFácil IA — app.js  |  Conteúdo EXCLUSIVO deste arquivo
//  Funções de auth/nav/firebase foram movidas para app-core.js
//  Funções de wizard foram movidas para wizard.js
//  Funções de render foram movidas para render.js
//  Funções de PDF foram movidas para pdf.js
// ═══════════════════════════════════════════════════════════════

'use strict';

// ════════════════════════════════════════════════════════════════
//  ⚙️  CONFIGURAÇÃO DA IA
// ════════════════════════════════════════════════════════════════
const WORKER_URL = '/api/ia';

// ════ ESTADO GLOBAL ════
let currentUser     = null;
let currentStep     = 1;
let selectedType    = '';
let currentDocId    = null;
let currentDocs     = [];
let currentCategory = 'contratos';
let iaHistory       = [];
const TOTAL_STEPS   = 6;

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
];

// ════════════════════════════════════════════════════════════════
//  WIZARD ADAPTATIVO — labels e campos por tipo de documento
// ════════════════════════════════════════════════════════════════
const WIZARD_CONFIG = {
  servico: {
    step2: { title:'Quem contrata e quem executa?', sub:'Informe os dados do contratante e do prestador de serviços' },
    step3: { title:'Qual serviço será prestado?', sub:'Descreva o serviço, prazo e local de execução' },
    step4: { title:'Valor e forma de pagamento', sub:'Defina os valores e condições financeiras do contrato' },
    step6: { title:'Informações finais do contrato', sub:'Foro, rescisão e demais disposições legais' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  trabalho_pj: {
    step2: { title:'Empresa contratante e profissional PJ', sub:'Informe os dados da empresa e do profissional contratado' },
    step3: { title:'Qual serviço o PJ irá prestar?', sub:'Descreva as atividades, carga horária e local' },
    step4: { title:'Honorários e forma de pagamento', sub:'Defina o valor mensal ou por projeto e dados bancários' },
    step6: { title:'Cláusulas finais do contrato PJ', sub:'Foro, rescisão e ausência de vínculo empregatício' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  freelancer: {
    step2: { title:'Contratante e Freelancer', sub:'Dados de quem contrata e quem executa o projeto' },
    step3: { title:'Qual projeto será desenvolvido?', sub:'Descreva o projeto, entregas e cronograma' },
    step4: { title:'Valor do projeto e pagamento', sub:'Honorários, etapas de pagamento e dados bancários' },
    step6: { title:'Cláusulas finais', sub:'Foro competente e condições de rescisão' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  aluguel_res: {
    step2: { title:'Locador e Locatário', sub:'Dados de quem aluga e de quem vai morar no imóvel' },
    step3: { title:'Imóvel a ser alugado', sub:'Endereço completo e características do imóvel residencial' },
    step4: { title:'Valor e condições do aluguel', sub:'Aluguel mensal, vencimento e dados de pagamento' },
    step6: { title:'Dados finais da locação', sub:'Foro, rescisão e lei do inquilinato' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  aluguel_com: {
    step2: { title:'Locador e Locatário', sub:'Dados do proprietário e do locatário comercial' },
    step3: { title:'Imóvel comercial a ser locado', sub:'Endereço completo e características do imóvel comercial' },
    step4: { title:'Valor e condições do aluguel comercial', sub:'Aluguel mensal, IPTU, condomínio e pagamento' },
    step6: { title:'Dados finais da locação comercial', sub:'Foro, rescisão e legislação aplicável' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  locacao_simples: {
    step2: { title:'Locador e Locatário', sub:'Dados do proprietário e de quem vai locar o imóvel' },
    step3: { title:'Imóvel a ser locado', sub:'Endereço e características do imóvel' },
    step4: { title:'Valor e condições do aluguel', sub:'Aluguel mensal, vencimento e dados de pagamento' },
    step6: { title:'Dados finais', sub:'Foro e condições de rescisão' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  locacao_fiador: {
    step2: { title:'Locador, Locatário e Fiador', sub:'Dados do proprietário, de quem vai morar e do fiador' },
    step3: { title:'Imóvel a ser locado', sub:'Endereço e características do imóvel' },
    step4: { title:'Valor e condições do aluguel', sub:'Aluguel mensal, vencimento e dados de pagamento' },
    step6: { title:'Dados finais com fiança', sub:'Foro, rescisão e condições da garantia' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  compravenda: {
    step2: { title:'Vendedor e Comprador', sub:'Dados de quem vende e de quem compra o bem' },
    step3: { title:'O que está sendo vendido?', sub:'Descreva o bem: veículo, imóvel, equipamento etc.' },
    step4: { title:'Preço e forma de pagamento', sub:'Valor total, parcelas e dados para pagamento' },
    step6: { title:'Garantias e disposições finais', sub:'Foro, evicção e vícios ocultos' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  parceria: {
    step2: { title:'Parceiro A e Parceiro B', sub:'Dados de ambos os parceiros comerciais' },
    step3: { title:'Objeto da parceria', sub:'Descreva o negócio, as metas e a divisão de responsabilidades' },
    step4: { title:'Remuneração e resultados', sub:'Como os resultados serão divididos ou pagos' },
    step6: { title:'Dados finais da parceria', sub:'Foro, prazo e condições de encerramento' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  plano_parceria: {
    step2: { title:'Parceiro A e Parceiro B', sub:'Dados de ambos os parceiros do plano comercial' },
    step3: { title:'O que a parceria vai fazer?', sub:'Descreva o plano, metas e divisão de tarefas' },
    step4: { title:'Investimento e retorno', sub:'Valores envolvidos e forma de divisão dos resultados' },
    step6: { title:'Dados finais', sub:'Foro e condições de encerramento da parceria' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  influenciador: {
    step2: { title:'Marca/Empresa e Influenciador Digital', sub:'Dados da marca contratante e do influenciador' },
    step3: { title:'Conteúdo a ser criado', sub:'Descreva o tipo de conteúdo, plataformas e entregáveis' },
    step4: { title:'Cachê e pagamento', sub:'Valor do cachê, forma e data de pagamento' },
    step6: { title:'Dados finais do contrato', sub:'Direitos autorais, foro e rescisão' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  nda: {
    step2: { title:'Parte Divulgante e Parte Receptora', sub:'Quem compartilha e quem recebe as informações confidenciais' },
    step3: { title:'Quais informações serão protegidas?', sub:'Descreva as informações confidenciais e o contexto do acordo' },
    step4: { title:'Penalidade por violação', sub:'Valor da multa em caso de quebra de sigilo' },
    step6: { title:'Vigência e foro do NDA', sub:'Prazo de confidencialidade e foro competente' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  comissao: {
    step2: { title:'Comitente (empresa) e Comissionado', sub:'Dados da empresa contratante e do representante comercial' },
    step3: { title:'O que será vendido?', sub:'Produtos/serviços a representar e região de atuação' },
    step4: { title:'Comissão e pagamento', sub:'Percentual ou valor fixo de comissão e prazo de pagamento' },
    step6: { title:'Dados finais do contrato', sub:'Lei 4.886/65, foro e condições de rescisão' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  autonomo: {
    step2: { title:'Contratante e Profissional Autônomo', sub:'Dados de quem contrata e do profissional autônomo' },
    step3: { title:'Qual serviço autônomo será prestado?', sub:'Descreva o serviço, local e prazo de execução' },
    step4: { title:'Valor e pagamento', sub:'Remuneração pelo serviço e forma de pagamento' },
    step6: { title:'Dados finais', sub:'Foro e ausência de vínculo empregatício' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  estagio: {
    step2: { title:'Empresa concedente e Estagiário', sub:'Dados da empresa e do estudante estagiário' },
    step3: { title:'Atividades e carga horária do estágio', sub:'Descreva as atividades e o horário de trabalho' },
    step4: { title:'Bolsa-auxílio e benefícios', sub:'Valor da bolsa e auxílio-transporte' },
    step6: { title:'Dados finais do termo', sub:'Lei 11.788/2008, foro e condições do estágio' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  recibo_aluguel: {
    step2: { title:'Locador (recebedor) e Locatário (pagante)', sub:'Dados de quem recebe e de quem pagou o aluguel' },
    step3: { title:'Referência do aluguel', sub:'Período de referência e imóvel relacionado ao recibo' },
    step4: { title:'Valor recebido', sub:'Valor do aluguel e encargos pagos nesta competência' },
    step6: { title:'Dados do recibo', sub:'Local de emissão e informações adicionais' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  vistoria: {
    step2: { title:'Proprietário e Locatário/Ocupante', sub:'Dados de quem entrega e quem recebe o imóvel' },
    step3: { title:'Imóvel a ser vistoriado', sub:'Endereço completo e características do imóvel' },
    step4: { title:'Não aplicável', sub:'A vistoria não tem valores financeiros' },
    step6: { title:'Dados finais da vistoria', sub:'Data, local e observações finais' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  notif_desocupacao: {
    step2: { title:'Notificante (proprietário) e Notificado (inquilino)', sub:'Dados de quem notifica e quem deve desocupar' },
    step3: { title:'Imóvel a ser desocupado', sub:'Endereço do imóvel e motivo da notificação' },
    step4: { title:'Não aplicável', sub:'Notificações não têm valores financeiros' },
    step6: { title:'Dados da notificação', sub:'Prazo para desocupação e foro competente' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: false,
  },
  acordo_inadimpl: {
    step2: { title:'Locador (credor) e Locatário (devedor)', sub:'Dados do proprietário e do locatário inadimplente' },
    step3: { title:'Débito em aberto', sub:'Descreva os meses em atraso e o total devedor' },
    step4: { title:'Valor do débito e acordo de pagamento', sub:'Total da dívida, parcelas e dados para pagamento' },
    step6: { title:'Dados finais do acordo', sub:'Consequências do descumprimento e foro' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  recibo: {
    step2: { title:'Quem recebe e quem pagou', sub:'Dados do recebedor e do pagante' },
    step3: { title:'Pelo que está sendo pago?', sub:'Descreva o serviço, produto ou motivo do pagamento' },
    step4: { title:'Valor recebido', sub:'Valor pago, forma e data do pagamento' },
    step6: { title:'Local de emissão', sub:'Cidade e data do recibo' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  quitacao: {
    step2: { title:'Credor e Devedor', sub:'Dados de quem deu a quitação e de quem pagou' },
    step3: { title:'O que está sendo quitado?', sub:'Descreva a dívida ou obrigação que está sendo quitada' },
    step4: { title:'Valor quitado', sub:'Valor total pago e forma de pagamento' },
    step6: { title:'Dados do termo', sub:'Local e data da quitação' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  confissao_divida: {
    step2: { title:'Credor e Devedor', sub:'Dados de quem é credor e de quem confessa a dívida' },
    step3: { title:'Qual é a dívida?', sub:'Descreva a origem e natureza do débito confessado' },
    step4: { title:'Valor da dívida e pagamento', sub:'Total devido, juros e forma de quitação' },
    step6: { title:'Dados finais', sub:'Foro e condições de cobrança em caso de inadimplência' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  parcelamento: {
    step2: { title:'Credor e Devedor', sub:'Dados de quem é credor e de quem vai parcelar' },
    step3: { title:'Qual dívida está sendo parcelada?', sub:'Descreva a origem do débito e o total a parcelar' },
    step4: { title:'Valor e condições do parcelamento', sub:'Total, número de parcelas e vencimentos' },
    step6: { title:'Dados finais do parcelamento', sub:'Foro e consequências do não pagamento' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  nota_servico: {
    step2: { title:'Prestador e Tomador do serviço', sub:'Dados de quem prestou e quem recebeu o serviço' },
    step3: { title:'Serviço prestado', sub:'Descreva o serviço executado e a data de realização' },
    step4: { title:'Valor do serviço', sub:'Valor cobrado e forma de pagamento' },
    step6: { title:'Local de emissão', sub:'Cidade e data da nota' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  curriculo: {
    step2: { title:'Dados pessoais do candidato', sub:'Suas informações de contato e identificação' },
    step3: { title:'Objetivo e experiência', sub:'Área de atuação, experiências e formação acadêmica' },
    step4: { title:'Não aplicável', sub:'Currículo não tem valores financeiros' },
    step6: { title:'Não aplicável', sub:'Currículo não tem dados jurídicos' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: true,
  },
  carta_apres: {
    step2: { title:'Remetente e Destinatário', sub:'Seus dados e da empresa/pessoa para quem está se apresentando' },
    step3: { title:'Assunto e conteúdo da carta', sub:'Vaga ou oportunidade e principais pontos da apresentação' },
    step4: { title:'Não aplicável', sub:'Carta de apresentação não tem valores' },
    step6: { title:'Não aplicável', sub:'Não há disposições jurídicas' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: true,
  },
  carta_demissao: {
    step2: { title:'Seus dados e da empresa', sub:'Informações para a carta de pedido de demissão' },
    step3: { title:'Dados da demissão', sub:'Motivo, data de saída e aviso prévio' },
    step4: { title:'Não aplicável', sub:'Carta de demissão não tem valores financeiros' },
    step6: { title:'Não aplicável', sub:'Não há disposições jurídicas na carta' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_experiencia: {
    step2: { title:'Declarante e Declarado', sub:'Empresa que declara e funcionário declarado' },
    step3: { title:'Período e atividades', sub:'Tempo de serviço e principais atividades exercidas' },
    step4: { title:'Não aplicável', sub:'Declaração de experiência não tem valores' },
    step6: { title:'Não aplicável', sub:'Não há disposições jurídicas na declaração' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: true,
  },
  decl_residencia: {
    step2: { title:'Dados do declarante', sub:'Suas informações para a declaração de residência' },
    step3: { title:'Endereço declarado', sub:'Endereço completo de residência' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores' },
    step6: { title:'Não aplicável', sub:'Não há disposições jurídicas' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_renda: {
    step2: { title:'Dados do declarante', sub:'Suas informações para a declaração de renda' },
    step3: { title:'Fonte de renda', sub:'Descreva sua atividade e renda mensal' },
    step4: { title:'Valor da renda', sub:'Informe sua renda mensal aproximada' },
    step6: { title:'Não aplicável', sub:'Não há disposições jurídicas' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_informal: {
    step2: { title:'Dados do trabalhador informal', sub:'Informações para a declaração de trabalho informal' },
    step3: { title:'Tipo de trabalho', sub:'Descreva a atividade informal exercida' },
    step4: { title:'Renda mensal', sub:'Informe a renda mensal aproximada' },
    step6: { title:'Não aplicável', sub:'Não há disposições jurídicas' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_comparec: {
    step2: { title:'Declarante e quem compareceu', sub:'Empresa/órgão que declara e pessoa que compareceu' },
    step3: { title:'Motivo do comparecimento', sub:'Data, hora e motivo do comparecimento' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores' },
    step6: { title:'Não aplicável', sub:'Não há disposições jurídicas' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  decl_respons: {
    step2: { title:'Dados do declarante', sub:'Suas informações para a declaração de responsabilidade' },
    step3: { title:'Responsabilidade assumida', sub:'Descreva o que está sendo declarado' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores' },
    step6: { title:'Não aplicável', sub:'Não há disposições jurídicas' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_uniao: {
    step2: { title:'Dados do casal', sub:'Informações de ambos os conviventes' },
    step3: { title:'Dados da união', sub:'Data de início e endereço comum do casal' },
    step4: { title:'Não aplicável', sub:'Declaração de união não tem valores' },
    step6: { title:'Não aplicável', sub:'Não há disposições jurídicas' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  lgpd_termo: {
    step2: { title:'Controlador dos dados e Titular', sub:'Empresa que trata os dados e a pessoa titular' },
    step3: { title:'Quais dados serão tratados?', sub:'Descreva os dados coletados e a finalidade do tratamento' },
    step4: { title:'Não aplicável', sub:'Termo LGPD não tem valores financeiros' },
    step6: { title:'Vigência do consentimento', sub:'Prazo e condições de revogação do consentimento' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  politica_priv: {
    step2: { title:'Responsável pela política', sub:'Dados da empresa responsável pelo tratamento de dados' },
    step3: { title:'Dados coletados e finalidade', sub:'Descreva que dados são coletados e por quê' },
    step4: { title:'Não aplicável', sub:'Política de privacidade não tem valores financeiros' },
    step6: { title:'Vigência da política', sub:'Data de vigência e canal de contato para o DPO' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  termo_uso: {
    step2: { title:'Responsável pela plataforma', sub:'Dados da empresa ou pessoa responsável pela plataforma' },
    step3: { title:'Regras de uso', sub:'Descreva as regras e condições de uso da plataforma' },
    step4: { title:'Não aplicável', sub:'Termos de uso não têm valores financeiros' },
    step6: { title:'Vigência dos termos', sub:'Data de vigência e como o usuário será notificado de alterações' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  notif_extra: {
    step2: { title:'Notificante e Notificado', sub:'Quem notifica e quem receberá a notificação' },
    step3: { title:'Motivo da notificação', sub:'Descreva claramente o que está sendo notificado e o que se exige' },
    step4: { title:'Valor em disputa (se houver)', sub:'Informe o valor envolvido na notificação, se aplicável' },
    step6: { title:'Prazo e foro', sub:'Prazo para cumprimento e foro para ações judiciais' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  acordo_amigavel: {
    step2: { title:'Parte A e Parte B', sub:'Dados das partes que chegaram ao acordo' },
    step3: { title:'O que está sendo acordado?', sub:'Descreva a situação e os termos do acordo amigável' },
    step4: { title:'Valor do acordo', sub:'Quantia envolvida no acordo e forma de pagamento' },
    step6: { title:'Dados finais do acordo', sub:'Foro e consequências do descumprimento' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  abertura_empresa: {
    step2: { title:'Sócio(s) fundador(es)', sub:'Dados dos sócios que vão abrir a empresa' },
    step3: { title:'Dados da empresa a abrir', sub:'Nome, atividade, sede e capital social da empresa' },
    step4: { title:'Capital social', sub:'Valor do capital social e distribuição entre os sócios' },
    step6: { title:'Dados finais', sub:'Local de registro e informações adicionais' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  contrato_social: {
    step2: { title:'Sócios da empresa', sub:'Dados dos sócios que vão constituir a sociedade' },
    step3: { title:'Dados da empresa', sub:'Nome, objeto social, sede e estrutura da empresa' },
    step4: { title:'Capital social e quotas', sub:'Valor total do capital e divisão entre os sócios' },
    step6: { title:'Administração e foro', sub:'Quem administra a empresa e onde serão resolvidas disputas' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: true,
  },
  acordo_socios: {
    step2: { title:'Sócio A e Sócio B', sub:'Dados dos sócios que estão firmando o acordo' },
    step3: { title:'Objeto do acordo societário', sub:'O que está sendo regulamentado entre os sócios' },
    step4: { title:'Valores e quotas', sub:'Capital envolvido e participação de cada sócio' },
    step6: { title:'Dados finais do acordo', sub:'Foro e condições de saída dos sócios' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
  termo_invest: {
    step2: { title:'Investidor e Empresa Investida', sub:'Dados de quem aporta o capital e da empresa que recebe' },
    step3: { title:'Projeto a ser financiado', sub:'Descreva o negócio, produto ou projeto que receberá investimento' },
    step4: { title:'Valor do aporte e retorno', sub:'Valor investido, forma de retorno e prazo' },
    step6: { title:'Dados finais do investimento', sub:'Foro e condições de saída do investidor' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
  },
};

const WIZARD_DEFAULT = {
  step2: { title:'Dados das Partes', sub:'Informe os dados de ambas as partes' },
  step3: { title:'Objeto e Prazo', sub:'Descreva detalhadamente o objeto deste documento' },
  step4: { title:'Valores e Pagamento', sub:'Defina as condições financeiras' },
  step6: { title:'Dados Finais', sub:'Informações legais e foro competente' },
  mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
};

// ════════════════════════════════════════════════════════════════
//  REGRAS DO WIZARD — steps ativos por tipo
// ════════════════════════════════════════════════════════════════
const DOC_WIZARD_RULES = {
  servico:        { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  trabalho_pj:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  freelancer:     { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  autonomo:       { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  aluguel_res:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  aluguel_com:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  locacao_simples:{ tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  locacao_fiador: { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  compravenda:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  parceria:       { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  plano_parceria: { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  influenciador:  { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  nda:            { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  comissao:       { tem_parte_b:true,  tem_valores:true,  tem_clausulas:true,  tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  estagio:        { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
  recibo_aluguel: { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  vistoria:       { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  notif_desocupacao:{ tem_parte_b:true,tem_valores:false, tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  acordo_inadimpl:{ tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  recibo:         { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  quitacao:       { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  confissao_divida:{ tem_parte_b:true, tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  parcelamento:   { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  nota_servico:   { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  curriculo:      { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  carta_apres:    { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  carta_demissao: { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_experiencia:{ tem_parte_b:true, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:true  },
  decl_residencia:{ tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_renda:     { tem_parte_b:false, tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_informal:  { tem_parte_b:false, tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_comparec:  { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  decl_respons:   { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_uniao:     { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  lgpd_termo:     { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  politica_priv:  { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  termo_uso:      { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  notif_extra:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  acordo_amigavel:{ tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:false },
  abertura_empresa:{ tem_parte_b:true, tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  contrato_social: { tem_parte_b:true, tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:false },
  acordo_socios:  { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:false },
  termo_invest:   { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
};
const DOC_WIZARD_DEFAULT = { tem_parte_b:true, tem_valores:true, tem_clausulas:true, tem_juridico:true, tem_obrigacoes:true, tem_prazo:true };

function getActiveSteps(typeId) {
  const r = DOC_WIZARD_RULES[typeId] || DOC_WIZARD_DEFAULT;
  const steps = [1, 2];
  steps.push(3); // sempre mostra step 3
  if (r.tem_valores)   steps.push(4);
  if (r.tem_clausulas) steps.push(5);
  if (r.tem_juridico)  steps.push(6);
  return steps;
}

function applyWizardRules(typeId) {
  const r = DOC_WIZARD_RULES[typeId] || DOC_WIZARD_DEFAULT;
  const cfg = WIZARD_CONFIG[typeId] || WIZARD_DEFAULT;
  const hasCustomForm = window.DocFormularios?.temFormEspecifico(typeId);
  const customCfg = window.DocFormularios?.getCfg(typeId);

  // ── Formulário específico vs padrão ──
  const s2custom  = document.getElementById('step-2-custom-content');
  const s2default = document.getElementById('step-2-default-content');
  const s3custom  = document.getElementById('step-3-custom-content');
  const s3default = document.getElementById('step-3-default-content');

  // Limpa containers custom antes de injetar (FIX Bug 3 - causa 2)
  if (s2custom)  s2custom.innerHTML  = '';
  if (s3custom)  s3custom.innerHTML  = '';

  if (hasCustomForm) {
    if (s2custom)  s2custom.style.display  = '';
    if (s2default) s2default.style.display = 'none';
    if (customCfg?.step3) {
      if (s3custom)  s3custom.style.display  = '';
      if (s3default) s3default.style.display = 'none';
    } else {
      if (s3custom)  s3custom.style.display  = 'none';
      if (s3default) s3default.style.display = '';
    }
    // Injeta formulários específicos
    window.DocFormularios.renderStep(typeId, 2, 'step-2-custom-content');
    if (customCfg?.step3) {
      window.DocFormularios.renderStep(typeId, 3, 'step-3-custom-content');
    }
  } else {
    if (s2custom)  s2custom.style.display  = 'none';
    if (s2default) s2default.style.display = '';
    if (s3custom)  s3custom.style.display  = 'none';
    if (s3default) s3default.style.display = '';
  }

  // ── Parte B ──
  const parteBSection = document.getElementById('parte-b-section');
  const testemunhasSection = document.getElementById('testemunhas-section');
  if (parteBSection) parteBSection.style.display = r.tem_parte_b ? '' : 'none';
  if (testemunhasSection) testemunhasSection.style.display = r.tem_parte_b ? '' : 'none';
  window._docTemParteB = r.tem_parte_b;

  // ── Step 3: campos condicionais ──
  const obrigAField = document.getElementById('obj_obrig_a')?.closest('.field');
  const obrigBField = document.getElementById('obj_obrig_b')?.closest('.field');
  const entregField = document.getElementById('obj_entregaveis')?.closest('.field');
  const prazoFields = document.getElementById('prazo-fields');
  if (obrigAField) obrigAField.style.display = r.tem_obrigacoes ? '' : 'none';
  if (obrigBField) obrigBField.style.display = (r.tem_obrigacoes && r.tem_parte_b) ? '' : 'none';
  if (entregField) entregField.style.display = r.tem_obrigacoes ? '' : 'none';
  if (prazoFields) prazoFields.style.display = r.tem_prazo ? '' : 'none';

  // ── Steps na barra de progresso ──
  const activeSteps = getActiveSteps(typeId);
  window._activeSteps = activeSteps;
  window._totalSteps  = activeSteps.length;
  updateStepIndicator();
  updateWizardProgressBar(activeSteps);

  // ── Títulos e subtítulos ──
  const s2title = document.querySelector('#step-2 .wizard-title');
  const s2sub   = document.querySelector('#step-2 .wizard-subtitle');
  const s3title = document.querySelector('#step-3 .wizard-title');
  const s3sub   = document.querySelector('#step-3 .wizard-subtitle');
  const s4title = document.querySelector('#step-4 .wizard-title');
  const s4sub   = document.querySelector('#step-4 .wizard-subtitle');
  const s6title = document.querySelector('#step-6 .wizard-title');
  const s6sub   = document.querySelector('#step-6 .wizard-subtitle');

  if (s2title) s2title.textContent = cfg.step2?.title || 'Dados das Partes';
  if (s2sub)   s2sub.textContent   = cfg.step2?.sub   || 'Informe os dados das partes';
  if (s3title) s3title.textContent = cfg.step3?.title || 'Objeto e Prazo';
  if (s3sub)   s3sub.textContent   = cfg.step3?.sub   || 'Descreva o objeto';
  if (s4title) s4title.textContent = cfg.step4?.title || 'Valores e Pagamento';
  if (s4sub)   s4sub.textContent   = cfg.step4?.sub   || 'Defina as condições financeiras';
  if (s6title) s6title.textContent = cfg.step6?.title || 'Dados Finais';
  if (s6sub)   s6sub.textContent   = cfg.step6?.sub   || 'Informações legais e foro';

  const roleALabel = document.getElementById('role-a-label');
  if (roleALabel) roleALabel.textContent = getRoleA(typeId);
  const roleBLabel = document.getElementById('role-b-label');
  if (roleBLabel) roleBLabel.textContent = getRoleB(typeId);
}

function updateWizardProgressBar(activeSteps) {
  for (let i = 1; i <= 6; i++) {
    const step = document.getElementById('ws-' + i);
    const conn = document.getElementById('wc-' + i);
    if (step) step.style.display = activeSteps.includes(i) ? '' : 'none';
    if (conn) conn.style.display = activeSteps.includes(i) && activeSteps.includes(i+1) ? '' : 'none';
  }
}

function updateStepIndicator() {
  const activeSteps = window._activeSteps || [1,2,3,4,5,6];
  const pos = activeSteps.indexOf(currentStep) + 1;
  const el = document.getElementById('step-indicator');
  if (el) el.textContent = `Etapa ${pos} de ${activeSteps.length}`;
}

function getAllTypes() { return Object.values(DOC_TYPES).flat(); }

// ════════════════════════════════════════════════════════════════
//  GERAÇÃO DE DOCUMENTOS
// ════════════════════════════════════════════════════════════════

function V(id) { return (document.getElementById(id)?.value || '').trim(); }

function generateDocument() {
  const allT     = getAllTypes();
  const typeInfo = allT.find(t => t.id === selectedType) || { name:'Documento', emoji:'📄' };
  const now      = new Date();
  const dateStr  = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const num      = `CTR-${now.getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;

  const pa = buildParty('p_a');
  const pb = window._docTemParteB !== false ? buildParty('p_b') : { nome:'', doc:'', nac:'', est:'', prof:'', end:'', tel:'', email:'', rg:'' };
  const t1 = testemunhasAtivas
    ? { nome: V('test1_nome') || '___________________________', doc: V('test1_doc') || '___________________' }
    : { nome: null, doc: null };
  const t2 = testemunhasAtivas
    ? { nome: V('test2_nome') || '___________________________', doc: V('test2_doc') || '___________________' }
    : { nome: null, doc: null };

  const defaultObrigA = {
    aluguel_res: 'entregar o imóvel em perfeitas condições de habitabilidade, manter o uso pacífico e cumprir as obrigações previstas na Lei do Inquilinato',
    aluguel_com: 'entregar o imóvel em perfeitas condições de uso, manter a posse pacífica e cumprir as obrigações previstas na Lei do Inquilinato',
    locacao_simples: 'entregar o imóvel em perfeitas condições, garantir a posse tranquila e cumprir a Lei do Inquilinato',
    locacao_fiador: 'entregar o imóvel em perfeitas condições, garantir a posse tranquila e cumprir a Lei do Inquilinato',
    compravenda: 'entregar o bem livre e desembaraçado de ônus, transferir a propriedade e responder pela evicção e vícios ocultos',
    parceria: 'aportar os recursos, conhecimento e infraestrutura acordados, participar das decisões estratégicas e cumprir as metas estabelecidas',
    plano_parceria: 'aportar os recursos, conhecimento e infraestrutura acordados, participar das decisões estratégicas e cumprir as metas estabelecidas',
    comissao: 'fornecer informações, materiais e suporte necessários às vendas, pagar as comissões nos prazos acordados e manter o COMISSIONADO informado',
    nda: 'fornecer as informações confidenciais necessárias para os fins acordados e zelar pela integridade das informações compartilhadas',
    estagio: 'oferecer atividades compatíveis com a área de formação, designar supervisor responsável e garantir condições adequadas de trabalho',
    contrato_social: 'integralizar as quotas no valor e prazo acordados e participar ativamente da gestão da sociedade',
    acordo_socios: 'integralizar as quotas no valor acordado e participar das decisões conforme este instrumento',
    termo_invest: 'aportar os recursos no valor e prazo acordados e acompanhar a execução do plano de negócios',
  };
  const defaultObrigB = {
    aluguel_res: 'pagar o aluguel e encargos pontualmente, usar o imóvel exclusivamente para fins residenciais, conservá-lo e devolvê-lo nas mesmas condições',
    aluguel_com: 'pagar o aluguel e encargos pontualmente, usar o imóvel exclusivamente para fins comerciais, conservá-lo e devolvê-lo nas mesmas condições',
    locacao_simples: 'pagar o aluguel pontualmente, conservar o imóvel e devolvê-lo nas mesmas condições ao final da locação',
    locacao_fiador: 'pagar o aluguel pontualmente, conservar o imóvel e devolvê-lo nas mesmas condições ao final da locação',
    compravenda: 'efetuar o pagamento no prazo e forma acordados e receber o bem nas condições descritas neste instrumento',
    parceria: 'executar as atividades operacionais acordadas, contribuir com conhecimento e relacionamento e cumprir as metas estabelecidas',
    plano_parceria: 'executar as atividades operacionais acordadas, contribuir com conhecimento e relacionamento e cumprir as metas estabelecidas',
    comissao: 'promover ativamente as vendas, manter relacionamento ético com clientes, prestar contas regularmente e não representar concorrentes',
    nda: 'manter absoluto sigilo sobre as informações recebidas, utilizá-las apenas para os fins acordados e protegê-las com o mesmo cuidado que protege suas próprias informações',
    estagio: 'cumprir a carga horária, zelar pelo sigilo das informações da empresa e cumprir as normas internas',
    contrato_social: 'integralizar as quotas no valor e prazo acordados e participar das atividades da sociedade conforme o objeto social',
    acordo_socios: 'integralizar as quotas no valor acordado e cumprir as obrigações deste instrumento',
    termo_invest: 'utilizar os recursos exclusivamente para as finalidades descritas, prestar contas regularmente e não alienar ativos sem anuência do investidor',
  };

  const obj = {
    desc:        V('obj_desc')        || 'objeto conforme acordado entre as partes',
    inicio:      V('obj_inicio')      ? formatDate(V('obj_inicio')) : dateStr,
    fim:         V('obj_fim')         ? formatDate(V('obj_fim'))    : 'indeterminado',
    vigencia:    V('obj_vigencia')    || '',
    local:       V('obj_local')       || '',
    obrig_a:     V('obj_obrig_a')     || defaultObrigA[selectedType] || 'cumprir integralmente as obrigações assumidas neste instrumento',
    obrig_b:     V('obj_obrig_b')     || defaultObrigB[selectedType] || 'cumprir integralmente as obrigações assumidas neste instrumento',
    entregaveis: V('obj_entregaveis') || '',
  };
  const val = {
    total:    V('val_total')    || '0,00',
    forma:    V('val_forma')    || 'à vista',
    venc:     V('val_venc')     || 'na data acordada',
    banco:    V('val_banco')    || '',
    reajuste: V('val_reajuste') || '',
    multa:    V('val_multa')    || '2%',
    juros:    V('val_juros')    || '1% ao mês',
    cond:     V('val_cond')     || '',
  };
  const jur = {
    foro:       V('jur_foro')       || 'Comarca do domicílio das partes',
    rescisao:   V('jur_rescisao')   || '30 dias',
    multa_resc: V('jur_multa_resc') || '10% sobre o valor total do contrato',
    resolucao:  V('jur_resolucao')  || 'pelo Poder Judiciário',
    local:      V('jur_local')      || '',
    extra:      V('jur_extra')      || '',
  };

  const selectedClauses = CLAUSES.filter(c => document.getElementById('cb-'+c.id)?.checked);
  const roleA    = getRoleA(selectedType);
  const roleB    = getRoleB(selectedType);
  const docTitle = getDocTitle(selectedType);
  const vigText  = obj.vigencia && obj.vigencia !== ''
    ? `por prazo ${obj.vigencia === 'indeterminado' ? 'indeterminado' : 'determinado de ' + obj.vigencia}`
    : obj.fim && obj.fim !== 'indeterminado'
      ? `de ${obj.inicio} a ${obj.fim}`
      : `a partir de ${obj.inicio}`;

  let clausN = 5;
  const extraClauses = selectedClauses.map(c => buildExtraClause(c, ++clausN, pa, pb)).join('');

  const html = buildDocHTML({ num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN: clausN + 1, typeInfo, type: selectedType });

  const docObj = {
    id: num, type: selectedType, typeInfo,
    title: `${typeInfo.name} — ${pa.nome}`,
    pa, pb, val, obj, jur,
    html,
    status: 'rascunho',
    createdAt: new Date().toISOString(),
    signedAt: null,
  };

  saveDocFS(docObj).then(() => {
    currentDocs.unshift(docObj);
    renderDocsBadge();
    viewDocument(num);
    showNotif('Documento gerado com sucesso! 🎉', '✅');
  });
}

function buildParty(prefix) {
  return {
    nome:  V(`${prefix}_nome`) || (prefix === 'p_a' ? 'CONTRATANTE' : 'CONTRATADO'),
    doc:   V(`${prefix}_doc`)  || '',
    rg:    V(`${prefix}_rg`)   || '',
    nac:   V(`${prefix}_nac`)  || 'Brasileiro(a)',
    est:   V(`${prefix}_est`)  || 'solteiro(a)',
    prof:  V(`${prefix}_prof`) || '',
    end:   V(`${prefix}_end`)  || '',
    tel:   V(`${prefix}_tel`)  || '',
    email: V(`${prefix}_email`)|| '',
  };
}

// ── buildDocHTML ── delega para DocDispatcher
function buildDocHTML(params) {
  if (window.DocDispatcher) {
    return window.DocDispatcher.build(params);
  }
  console.warn('DocDispatcher não carregado');
  return `<p>Erro: módulos de documento não carregados.</p>`;
}

// ════════════════════════════════════════════════════════════════
//  EDIÇÃO DE DOCUMENTO
// ════════════════════════════════════════════════════════════════

function editCurrentDoc() {
  if (!currentDocId) return;
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;
  const editableHtml = makeEditableHTML(d.html, d);
  document.getElementById('edit-inline-content').innerHTML = editableHtml;
  const first = document.querySelector('.edit-field');
  if (first) setTimeout(() => first.focus(), 300);
  gotoPage('edit');
}

function makeEditableHTML(html, d) {
  let result = html;
  const fieldMap = [
    { val: d.pa?.nome,   field: 'pa_nome'   },
    { val: d.pa?.doc,    field: 'pa_doc'    },
    { val: d.pa?.prof,   field: 'pa_prof'   },
    { val: d.pa?.end,    field: 'pa_end'    },
    { val: d.pa?.tel,    field: 'pa_tel'    },
    { val: d.pa?.email,  field: 'pa_email'  },
    { val: d.pb?.nome,   field: 'pb_nome'   },
    { val: d.pb?.doc,    field: 'pb_doc'    },
    { val: d.pb?.prof,   field: 'pb_prof'   },
    { val: d.pb?.end,    field: 'pb_end'    },
    { val: d.pb?.tel,    field: 'pb_tel'    },
    { val: d.pb?.email,  field: 'pb_email'  },
    { val: d.val?.total, field: 'val_total' },
    { val: d.val?.forma, field: 'val_forma' },
    { val: d.val?.venc,  field: 'val_venc'  },
    { val: d.val?.banco, field: 'val_banco' },
    { val: d.val?.multa, field: 'val_multa' },
    { val: d.val?.juros, field: 'val_juros' },
    { val: d.obj?.desc,  field: 'obj_desc'  },
    { val: d.obj?.local, field: 'obj_local' },
    { val: d.obj?.obrig_a, field: 'obj_obrig_a' },
    { val: d.obj?.obrig_b, field: 'obj_obrig_b' },
    { val: d.obj?.entregaveis, field: 'obj_entregaveis' },
    { val: d.jur?.foro,       field: 'jur_foro'   },
    { val: d.jur?.local,      field: 'jur_local'  },
    { val: d.jur?.rescisao,   field: 'jur_rescisao' },
    { val: d.jur?.multa_resc, field: 'jur_multa_resc' },
    { val: d.jur?.extra,      field: 'jur_extra'  },
  ];

  fieldMap.forEach(({ val, field }) => {
    if (!val || val === 'undefined' || val === '—' || val === 'null') return;
    const escaped = val.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      const regex = new RegExp(escaped, 'g');
      result = result.replace(regex,
        `<span class="edit-field" contenteditable="true" data-field="${field}" onblur="onFieldEdit(this)" oninput="markDirty()" title="Clique para editar">${val}</span>`
      );
    } catch(e) { /* skip invalid regex */ }
  });

  result = result.replace(
    /<p>([^<]*(?:<(?!\/p>)[^<]*)*)<\/p>/g,
    (match, inner) => {
      if (inner.includes('edit-field') || inner.includes('sig-') || inner.length < 3) return match;
      return `<p class="edit-para" contenteditable="true" oninput="markDirty()" title="Clique para editar o parágrafo">${inner}</p>`;
    }
  );
  return result;
}

function onFieldEdit(el) { el.dataset.modified = 'true'; }

function markDirty() {
  const btn = document.querySelector('#page-edit .btn-sm');
  if (btn && !btn.textContent.includes('*')) btn.textContent = '💾 Salvar*';
}

function saveEdit() {
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  const fields = document.querySelectorAll('#edit-inline-content .edit-field');
  const updated = {};
  fields.forEach(el => { if (el.dataset.field) updated[el.dataset.field] = el.textContent.trim(); });

  if (updated.pa_nome)      d.pa  = { ...d.pa,  nome:      updated.pa_nome      };
  if (updated.pa_doc)       d.pa  = { ...d.pa,  doc:       updated.pa_doc       };
  if (updated.pa_prof)      d.pa  = { ...d.pa,  prof:      updated.pa_prof      };
  if (updated.pa_end)       d.pa  = { ...d.pa,  end:       updated.pa_end       };
  if (updated.pa_tel)       d.pa  = { ...d.pa,  tel:       updated.pa_tel       };
  if (updated.pa_email)     d.pa  = { ...d.pa,  email:     updated.pa_email     };
  if (updated.pb_nome)      d.pb  = { ...d.pb,  nome:      updated.pb_nome      };
  if (updated.pb_doc)       d.pb  = { ...d.pb,  doc:       updated.pb_doc       };
  if (updated.pb_prof)      d.pb  = { ...d.pb,  prof:      updated.pb_prof      };
  if (updated.pb_end)       d.pb  = { ...d.pb,  end:       updated.pb_end       };
  if (updated.pb_tel)       d.pb  = { ...d.pb,  tel:       updated.pb_tel       };
  if (updated.pb_email)     d.pb  = { ...d.pb,  email:     updated.pb_email     };
  if (updated.val_total)    d.val = { ...d.val, total:     updated.val_total    };
  if (updated.val_forma)    d.val = { ...d.val, forma:     updated.val_forma    };
  if (updated.val_venc)     d.val = { ...d.val, venc:      updated.val_venc     };
  if (updated.val_banco)    d.val = { ...d.val, banco:     updated.val_banco    };
  if (updated.val_multa)    d.val = { ...d.val, multa:     updated.val_multa    };
  if (updated.val_juros)    d.val = { ...d.val, juros:     updated.val_juros    };
  if (updated.obj_desc)     d.obj = { ...d.obj, desc:      updated.obj_desc     };
  if (updated.obj_local)    d.obj = { ...d.obj, local:     updated.obj_local    };
  if (updated.obj_obrig_a)  d.obj = { ...d.obj, obrig_a:   updated.obj_obrig_a  };
  if (updated.obj_obrig_b)  d.obj = { ...d.obj, obrig_b:   updated.obj_obrig_b  };
  if (updated.obj_entregaveis) d.obj = { ...d.obj, entregaveis: updated.obj_entregaveis };
  if (updated.jur_foro)     d.jur = { ...d.jur, foro:      updated.jur_foro     };
  if (updated.jur_local)    d.jur = { ...d.jur, local:     updated.jur_local    };
  if (updated.jur_rescisao) d.jur = { ...d.jur, rescisao:  updated.jur_rescisao };
  if (updated.jur_multa_resc) d.jur = { ...d.jur, multa_resc: updated.jur_multa_resc };
  if (updated.jur_extra)    d.jur = { ...d.jur, extra:     updated.jur_extra    };
  d.editedAt = new Date().toISOString();

  if (d.generatedByAI) {
    const tmp = document.createElement('div');
    tmp.innerHTML = document.getElementById('edit-inline-content').innerHTML;
    tmp.querySelectorAll('.edit-field, .edit-para').forEach(el => {
      const text = el.textContent;
      const tag  = el.tagName.toLowerCase() === 'span' ? null : el.tagName.toLowerCase();
      if (tag) {
        const newEl = document.createElement(tag);
        newEl.innerHTML = el.innerHTML.replace(/<span[^>]*>([^<]*)<\/span>/g, '$1');
        el.replaceWith(newEl);
      } else {
        el.replaceWith(document.createTextNode(text));
      }
    });
    d.html = tmp.innerHTML;
  } else {
    const now     = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
    const roleA   = getRoleA(d.type);
    const roleB   = getRoleB(d.type);
    const vigText = d.obj.vigencia
      ? `por prazo ${d.obj.vigencia === 'indeterminado' ? 'indeterminado' : 'determinado de ' + d.obj.vigencia}`
      : `de ${d.obj.inicio || dateStr} a ${d.obj.fim || 'indeterminado'}`;
    d.html = buildDocHTML({
      num: d.id, docTitle: getDocTitle(d.type), dateStr,
      pa: d.pa, pb: d.pb,
      t1: { nome: null, doc: null }, t2: { nome: null, doc: null },
      obj: d.obj, val: d.val, jur: d.jur,
      roleA, roleB, vigText,
      extraClauses: '', finalClauseN: 6, typeInfo: d.typeInfo, type: d.type,
    });
  }

  // FIX Bug 5: await o save antes de tentar navegar
  updateDocFS(d).then(() => {
    showNotif('Documento atualizado! ✏️', '✏️');
    viewDocument(d.id);
  });
}

// FIX Bug 5: saveEditAndDownload aguarda save completar antes do PDF
async function saveEditAndDownload() {
  const d = currentDocs.find(d => d.id === currentDocId);
  if (!d) return;

  const fields = document.querySelectorAll('#edit-inline-content .edit-field');
  const updated = {};
  fields.forEach(el => { if (el.dataset.field) updated[el.dataset.field] = el.textContent.trim(); });
  // aplica campos no objeto d (reutiliza lógica de saveEdit indiretamente)
  saveEdit(); // salva sync na memória
  await updateDocFS(d); // aguarda Firestore
  downloadPDF();
}

function cancelEdit() { gotoPage('document'); viewDocument(currentDocId); }

// ════════════════════════════════════════════════════════════════
//  CURRÍCULO PDF — download dedicado
// ════════════════════════════════════════════════════════════════
function downloadPDFCurriculo(d) {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });

  const pa  = d.pa || {};
  const obj = d.obj || {};
  const lm = 20, rm = 190, W = rm - lm;
  let y = 20;

  pdf.setFont('helvetica','bold');
  pdf.setFontSize(20);
  pdf.setTextColor(30,30,30);
  pdf.text(pa.nome || 'Nome do Candidato', lm, y);
  y += 7;

  pdf.setFont('helvetica','normal');
  pdf.setFontSize(11);
  pdf.setTextColor(100,100,100);
  pdf.text(pa.prof || '', lm, y);
  y += 5;

  pdf.setFillColor(201,169,110);
  pdf.rect(lm, y, W, 0.7, 'F');
  y += 4;

  pdf.setFontSize(9);
  pdf.setTextColor(80,80,80);
  const contatos = [pa.tel, pa.email, pa.end].filter(Boolean);
  if (contatos.length) { pdf.text(contatos.join('   |   '), lm, y); y += 5; }

  pdf.setDrawColor(220,220,220);
  pdf.line(lm, y, rm, y);
  y += 6;

  function secao(titulo, texto) {
    if (!texto || texto === 'N/A — Currículo não usa este campo') return;
    pdf.setFont('helvetica','bold');
    pdf.setFontSize(10);
    pdf.setTextColor(30,30,30);
    pdf.text(titulo.toUpperCase(), lm, y);
    y += 1;
    pdf.setFillColor(201,169,110);
    pdf.rect(lm, y, 30, 0.4, 'F');
    y += 5;

    pdf.setFont('helvetica','normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(50,50,50);
    const linhas = pdf.splitTextToSize(texto, W);
    for (const l of linhas) {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.text(l, lm, y);
      y += 4.5;
    }
    y += 3;
  }

  secao('Objetivo Profissional', obj.obrig_a);
  secao('Experiência Profissional', obj.desc);
  secao('Formação e Habilidades', obj.entregaveis);

  if (obj.local && obj.local !== 'Ex: São Paulo - SP ou Remoto') {
    pdf.setFont('helvetica','italic');
    pdf.setFontSize(9);
    pdf.setTextColor(100,100,100);
    pdf.text('LinkedIn / Portfólio: ' + obj.local, lm, y);
    y += 5;
  }

  const totalPages = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFillColor(220,220,220);
    pdf.rect(lm, 285, W, 0.3, 'F');
    pdf.setFont('helvetica','italic');
    pdf.setFontSize(7);
    pdf.setTextColor(160);
    pdf.text('Gerado pelo DocFácil · docfacil-ia.vercel.app', lm, 289);
    pdf.text(`${i} / ${totalPages}`, rm, 289, { align:'right' });
  }

  pdf.save(`Curriculo_${(pa.nome||'').replace(/\s+/g,'_')}.pdf`);
  showNotif('Currículo baixado com sucesso! 📄', '📄');
}

// ════════════════════════════════════════════════════════════════
//  ASSISTENTE IA
// ════════════════════════════════════════════════════════════════

const IA_SYSTEM = `Você é o assistente de escrita e preenchimento de documentos do DocFácil, plataforma de modelos de documentos profissionais.
Ajude os usuários a: entender como preencher cada campo dos modelos, explicar o significado de termos nos documentos, sugerir qual modelo usar para cada situação, dar sugestões de redação.
Responda sempre em português brasileiro. Seja claro, prático e objetivo.
IMPORTANTE: Você NÃO presta assessoria ou consultoria jurídica. Se o usuário pedir orientação jurídica específica (ex: posso processar, tenho direito a, o que devo fazer legalmente), responda que não pode dar esse tipo de orientação e recomende consultar um advogado inscrito na OAB.
Você pode explicar o que significam termos e cláusulas nos documentos, mas não pode recomendar ações jurídicas.`;

function iaKeydown(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendIA(); } }

async function sendIA() {
  const input = document.getElementById('ia-input');
  const msg   = input.value.trim();
  if (!msg) return;

  addIAMsg(msg, 'user');
  input.value = '';

  const btn = document.getElementById('ia-send-btn');
  btn.disabled = true;
  const typId = addIATyping();
  iaHistory.push({ role:'user', content: msg });

  try {
    const res   = await callIA({ system: IA_SYSTEM, messages: iaHistory, max_tokens: 1200 });
    const reply = res.content?.[0]?.text || 'Desculpe, não consegui processar. Tente novamente.';
    iaHistory.push({ role:'assistant', content: reply });
    removeIATyping(typId);
    addIAMsg(reply, 'bot');
  } catch (err) {
    removeIATyping(typId);
    addIAMsg('⚠️ Erro ao conectar com a IA. Tente novamente em instantes.', 'bot');
  }
  btn.disabled = false;
}

async function callIA({ system = '', messages = [], max_tokens = 1500, model = 'claude-sonnet-4-20250514' }) {
  const res = await fetch(WORKER_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, max_tokens, system, messages }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erro ${res.status}`);
  }
  return res.json();
}

function sendIASug(msg) { document.getElementById('ia-input').value = msg; sendIA(); }

function addIAMsg(text, from) {
  const msgs = document.getElementById('ia-messages');
  const div  = document.createElement('div');
  div.className = `ia-msg ia-msg-${from}`;
  const fmt = text.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  div.innerHTML = `<div class="ia-msg-avatar">${from === 'bot' ? '🤖' : '👤'}</div><div class="ia-msg-bubble">${fmt}</div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function addIATyping() {
  const msgs = document.getElementById('ia-messages');
  const id   = 'typ-' + Date.now();
  const div  = document.createElement('div');
  div.className = 'ia-msg ia-msg-bot'; div.id = id;
  div.innerHTML = `<div class="ia-msg-avatar">🤖</div><div class="ia-msg-bubble" style="padding:12px 18px;"><div class="ia-typing"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return id;
}
function removeIATyping(id) { document.getElementById(id)?.remove(); }

// ════════════════════════════════════════════════════════════════
//  MODAL DE DADOS — Extras IA
// ════════════════════════════════════════════════════════════════

const IA_MODAL_FIELDS = {
  gen_curriculo: {
    titulo: '📋 Currículo via IA',
    sub: 'Preencha seus dados e a IA cria seu currículo completo',
    campos: [
      { id:'ia_nome',        label:'Nome completo *',          placeholder:'Ex: João da Silva Santos',   full:true },
      { id:'ia_profissao',   label:'Profissão / Cargo *',      placeholder:'Ex: Desenvolvedor Full Stack' },
      { id:'ia_experiencia', label:'Anos de experiência *',    placeholder:'Ex: 5 anos' },
      { id:'ia_cidade',      label:'Cidade / Estado',          placeholder:'Ex: São Paulo, SP' },
      { id:'ia_email',       label:'E-mail profissional',      placeholder:'Ex: joao@email.com' },
      { id:'ia_telefone',    label:'Telefone / WhatsApp',      placeholder:'Ex: (11) 99999-9999' },
      { id:'ia_habilidades', label:'Principais habilidades *', placeholder:'Ex: JavaScript, React, Node.js, SQL', full:true },
      { id:'ia_formacao',    label:'Formação acadêmica',       placeholder:'Ex: Ciência da Computação — USP (2018)', full:true },
      { id:'ia_objetivo',    label:'Objetivo profissional',    placeholder:'Ex: Busco oportunidade em empresas de tecnologia...', full:true, textarea:true },
    ]
  },
  gen_carta: {
    titulo: '✉️ Carta Formal via IA',
    sub: 'Preencha os dados e a IA redige sua carta profissional',
    campos: [
      { id:'ia_remetente',   label:'Seu nome (remetente) *',   placeholder:'Ex: João da Silva Santos',   full:true },
      { id:'ia_destinatario',label:'Destinatário *',           placeholder:'Ex: Dr. Carlos Mendes',      full:true },
      { id:'ia_empresa',     label:'Empresa / Instituição',    placeholder:'Ex: Empresa ABC Ltda',       full:true },
      { id:'ia_assunto',     label:'Assunto da carta *',       placeholder:'Ex: Solicitação de reunião comercial', full:true },
      { id:'ia_objetivo',    label:'O que você quer comunicar? *', placeholder:'Explique o objetivo da carta...', full:true, textarea:true },
      { id:'ia_cidade',      label:'Cidade / Data',            placeholder:'Ex: São Paulo, abril de 2026' },
    ]
  },
  gen_proposta: {
    titulo: '📊 Proposta Comercial via IA',
    sub: 'Informe os dados e a IA monta sua proposta completa',
    campos: [
      { id:'ia_empresa',     label:'Sua empresa / nome *',     placeholder:'Ex: Silva Tecnologia ME',    full:true },
      { id:'ia_cliente',     label:'Nome do cliente *',        placeholder:'Ex: Empresa XYZ Ltda',       full:true },
      { id:'ia_servico',     label:'Serviço oferecido *',      placeholder:'Ex: Desenvolvimento de sistema web', full:true },
      { id:'ia_valor',       label:'Valor aproximado',         placeholder:'Ex: R$ 5.000,00' },
      { id:'ia_prazo',       label:'Prazo de entrega',         placeholder:'Ex: 30 dias' },
      { id:'ia_descricao',   label:'Descreva o projeto *',     placeholder:'Detalhe o que será entregue, metodologia, diferenciais...', full:true, textarea:true },
    ]
  },
  gen_email: {
    titulo: '📧 E-mail Profissional via IA',
    sub: 'Informe os dados e a IA redige o e-mail perfeito',
    campos: [
      { id:'ia_remetente',   label:'Seu nome *',               placeholder:'Ex: João Silva',             full:true },
      { id:'ia_destinatario',label:'Para quem é o e-mail? *',  placeholder:'Ex: Gerente de RH, Cliente, Fornecedor', full:true },
      { id:'ia_tipo',        label:'Tipo de e-mail *',
        select: ['Apresentação comercial','Proposta de serviço','Agradecimento pós-reunião','Follow-up de proposta','Solicitação de reunião','Cobrança amigável','Outro'] },
      { id:'ia_objetivo',    label:'O que quer comunicar? *',  placeholder:'Ex: Quero apresentar meu serviço de...', full:true, textarea:true },
    ]
  },
  gen_contrato_ia: {
    titulo: '📜 Contrato Inteligente via IA',
    sub: 'Preencha os dados e a IA gera um contrato completo e personalizado',
    campos: [
      { id:'ia_contratante', label:'Nome do Contratante *',    placeholder:'Ex: João da Silva ou Empresa LTDA', full:true },
      { id:'ia_cpf_a',       label:'CPF/CNPJ do Contratante', placeholder:'Ex: 000.000.000-00' },
      { id:'ia_contratado',  label:'Nome do Contratado *',     placeholder:'Ex: Maria Souza ou Empresa ME',     full:true },
      { id:'ia_cpf_b',       label:'CPF/CNPJ do Contratado',  placeholder:'Ex: 000.000.000-00' },
      { id:'ia_servico',     label:'Objeto do contrato *',     placeholder:'Ex: Desenvolvimento de site institucional', full:true },
      { id:'ia_valor',       label:'Valor total (R$) *',       placeholder:'Ex: 3.000,00' },
      { id:'ia_prazo',       label:'Prazo / Vigência *',       placeholder:'Ex: 60 dias ou 6 meses' },
      { id:'ia_pagamento',   label:'Forma de pagamento',       placeholder:'Ex: 50% entrada e 50% na entrega' },
      { id:'ia_cidade',      label:'Cidade da assinatura',     placeholder:'Ex: São Paulo, SP' },
      { id:'ia_detalhes',    label:'Detalhes adicionais',      placeholder:'Inclua qualquer informação extra relevante...', full:true, textarea:true },
    ]
  },
};

function openIAModal() {
  if (!selectedType || !selectedType.startsWith('gen_')) return;
  const config = IA_MODAL_FIELDS[selectedType];
  if (!config) { generateWithAI({}); return; }

  const campos = config.campos.map(c => {
    if (c.select) {
      return `<div class="field ${c.full ? 'form-full' : ''}"><label>${c.label}</label><select id="${c.id}">${c.select.map(op => `<option value="${op}">${op}</option>`).join('')}</select></div>`;
    }
    if (c.textarea) {
      return `<div class="field ${c.full ? 'form-full' : ''}"><label>${c.label}</label><textarea id="${c.id}" rows="3" placeholder="${c.placeholder}"></textarea></div>`;
    }
    return `<div class="field ${c.full ? 'form-full' : ''}"><label>${c.label}</label><input id="${c.id}" placeholder="${c.placeholder}"/></div>`;
  }).join('');

  document.getElementById('ia-modal-title').textContent = config.titulo;
  document.getElementById('ia-modal-sub').textContent   = config.sub;
  document.getElementById('ia-modal-campos').innerHTML  = campos;
  document.getElementById('ia-modal-overlay').style.display = 'flex';
}

function closeIAModal() {
  document.getElementById('ia-modal-overlay').style.display = 'none';
}

function confirmarGeracaoIA() {
  const config = IA_MODAL_FIELDS[selectedType];
  if (!config) return;
  const dados = {};
  config.campos.forEach(c => {
    const el = document.getElementById(c.id);
    if (el) dados[c.id] = el.value.trim();
  });
  const obrigatorios = config.campos.filter(c => c.label.includes('*'));
  const vazio = obrigatorios.find(c => !dados[c.id]);
  if (vazio) { showNotif(`Preencha: ${vazio.label.replace(' *','')}`, '⚠️'); return; }
  closeIAModal();
  generateWithAI(dados);
}

async function generateWithAI(dados = {}) {
  const allT     = getAllTypes();
  const typeInfo = allT.find(t => t.id === selectedType) || { name:'Documento', emoji:'🤖' };

  showIALoading(`Gerando "${typeInfo.name}" com IA...`);

  const prompts = {
    gen_curriculo: `Crie um currículo profissional COMPLETO e PERSONALIZADO em HTML para:
Nome: ${dados.ia_nome}
Profissão: ${dados.ia_profissao}
Experiência: ${dados.ia_experiencia}
Cidade/Estado: ${dados.ia_cidade || 'não informado'}
E-mail: ${dados.ia_email || 'não informado'}
Telefone: ${dados.ia_telefone || 'não informado'}
Habilidades: ${dados.ia_habilidades}
Formação: ${dados.ia_formacao || 'não informado'}
Objetivo: ${dados.ia_objetivo || 'não informado'}
Use HTML com as classes: doc-main-title, doc-subtitle, clausula, clausula-title, clausula-body.
Crie seções: Dados Pessoais, Objetivo Profissional, Experiência Profissional (2-3 experiências coerentes), Formação Acadêmica, Habilidades, Idiomas.
Use APENAS os dados fornecidos. Retorne SOMENTE o HTML, sem markdown.`,

    gen_carta: `Redija uma carta formal profissional COMPLETA em HTML para:
Remetente: ${dados.ia_remetente}
Destinatário: ${dados.ia_destinatario}
Empresa: ${dados.ia_empresa || ''}
Assunto: ${dados.ia_assunto}
Objetivo: ${dados.ia_objetivo}
Local/Data: ${dados.ia_cidade || 'São Paulo, ' + new Date().toLocaleDateString('pt-BR', {month:'long', year:'numeric'})}
Use HTML profissional. Inclua: cabeçalho, data, destinatário, corpo com 3 parágrafos, despedida e assinatura.
Retorne SOMENTE o HTML.`,

    gen_proposta: `Crie uma proposta comercial COMPLETA em HTML para:
Empresa: ${dados.ia_empresa}
Cliente: ${dados.ia_cliente}
Serviço: ${dados.ia_servico}
Valor: ${dados.ia_valor || 'a definir'}
Prazo: ${dados.ia_prazo || 'a definir'}
Descrição: ${dados.ia_descricao}
Use HTML profissional com seções: Apresentação, Escopo, Metodologia, Investimento, Próximos Passos.
Retorne SOMENTE o HTML.`,

    gen_email: `Redija um e-mail profissional COMPLETO em HTML para:
Remetente: ${dados.ia_remetente}
Destinatário: ${dados.ia_destinatario}
Tipo: ${dados.ia_tipo}
Objetivo: ${dados.ia_objetivo}
Use HTML com formatação de e-mail profissional. Inclua: assunto, saudação, corpo e assinatura.
Retorne SOMENTE o HTML.`,

    gen_contrato_ia: `Redija um contrato profissional COMPLETO em HTML para:
Contratante: ${dados.ia_contratante} — CPF/CNPJ: ${dados.ia_cpf_a || 'não informado'}
Contratado: ${dados.ia_contratado} — CPF/CNPJ: ${dados.ia_cpf_b || 'não informado'}
Objeto: ${dados.ia_servico}
Valor: R$ ${dados.ia_valor}
Prazo: ${dados.ia_prazo}
Pagamento: ${dados.ia_pagamento || 'à vista'}
Cidade: ${dados.ia_cidade || 'não informado'}
Detalhes: ${dados.ia_detalhes || 'não informado'}
Use HTML profissional com cláusulas numeradas em romano (I, II, III...).
Inclua: Objeto, Obrigações, Valor, Prazo, Rescisão, Disposições Gerais e Assinaturas.
Retorne SOMENTE o HTML.`,
  };

  const prompt = prompts[selectedType] || `Gere um documento profissional com os dados: ${JSON.stringify(dados)}. Retorne SOMENTE o HTML.`;

  try {
    const res  = await callIA({ system: 'Você é um redator especialista em documentos profissionais brasileiros. Retorne SOMENTE HTML válido, sem markdown, sem explicações.', messages: [{ role:'user', content: prompt }], max_tokens: 4000 });
    const html = res.content?.[0]?.text || '<p>Erro ao gerar documento.</p>';
    const cleanHtml = html.replace(/```html\n?/g,'').replace(/```\n?/g,'').trim();

    const num     = `IA-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;
    const docObj  = {
      id: num, type: selectedType, typeInfo,
      title: `${typeInfo.name} — ${Object.values(dados)[0] || 'IA'}`,
      pa: { nome: Object.values(dados)[0] || 'Usuário' }, pb: {},
      val: {}, obj: {}, jur: {},
      html: cleanHtml,
      generatedByAI: true,
      status: 'rascunho',
      createdAt: new Date().toISOString(),
      signedAt: null,
    };

    hideIALoading();
    saveDocFS(docObj).then(() => {
      currentDocs.unshift(docObj);
      renderDocsBadge();
      viewDocument(num);
      showNotif(`${typeInfo.emoji} ${typeInfo.name} gerado com sucesso!`, '✅');
    });
  } catch (err) {
    hideIALoading();
    showNotif('Erro ao gerar com IA. Tente novamente.', '⚠️');
    console.error('IA error:', err);
  }
}

function showIALoading(msg = 'Gerando documento com IA...') {
  const overlay = document.getElementById('ia-loading-overlay');
  const text    = document.getElementById('ia-loading-text');
  if (overlay) overlay.style.display = 'flex';
  if (text)    text.textContent = msg;
  document.body.style.overflow = 'hidden';
}

function hideIALoading() {
  const overlay = document.getElementById('ia-loading-overlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// ════════════════════════════════════════════════════════════════
//  CLÁUSULAS EXTRAS
// ════════════════════════════════════════════════════════════════

function buildExtraClause(clause, num, pa, pb) {
  const R = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'];
  const nA = pa?.nome || 'CONTRATANTE';
  const nB = pb?.nome || 'CONTRATADO';
  const bodies = {
    lgpd: `<p>${num}.1. As partes comprometem-se a tratar os dados pessoais trocados neste instrumento em conformidade com a Lei 13.709/2018 (LGPD), adotando medidas técnicas e organizacionais adequadas para proteção.</p><p>${num}.2. Os dados serão utilizados exclusivamente para as finalidades previstas neste instrumento.</p>`,
    exclusividade: `<p>${num}.1. Durante a vigência deste instrumento, ${nB} compromete-se a não prestar serviços similares a empresas concorrentes de ${nA}, sem prévia autorização por escrito.</p>`,
    propriedade: `<p>${num}.1. Toda criação, obra, software, projeto ou produto resultante dos serviços prestados será de propriedade exclusiva de ${nA}, sendo vedada a utilização por ${nB} sem autorização expressa.</p>`,
    sigilo: `<p>${num}.1. As partes comprometem-se a manter em absoluto sigilo todas as informações, dados, documentos e estratégias trocadas em razão deste instrumento, durante e após a vigência.</p>`,
    subcontratacao: `<p>${num}.1. É vedada a subcontratação, total ou parcial, do objeto deste instrumento sem prévia e expressa anuência por escrito da outra parte.</p>`,
    reembolso: `<p>${num}.1. As despesas operacionais comprovadamente necessárias para a execução do objeto, quando previamente aprovadas por ${nA}, serão reembolsadas mediante apresentação de documentos fiscais.</p>`,
    garantia: `<p>${num}.1. ${nB} garante a execução do objeto com qualidade profissional, comprometendo-se a corrigir eventuais defeitos ou inadequações sem custo adicional no prazo de 30 dias após a notificação.</p>`,
    forca_maior: `<p>${num}.1. Nenhuma das partes será responsabilizada por descumprimento decorrente de caso fortuito ou força maior, assim entendidos os eventos imprevisíveis e inevitáveis alheios à vontade das partes.</p>`,
    antisuborno: `<p>${num}.1. As partes declaram conhecer e cumprir a Lei 12.846/2013 (Lei Anticorrupção), comprometendo-se a não oferecer, prometer, dar ou aceitar vantagens indevidas.</p>`,
    resolucao: `<p>${num}.1. Este instrumento poderá ser rescindido antecipadamente por mútuo acordo, mediante comunicação por escrito com antecedência mínima de 15 dias, sem incidência de multa rescisória.</p>`,
    penalidade: `<p>${num}.1. O descumprimento de quaisquer obrigações previstas neste instrumento sujeitará a parte infratora ao pagamento de multa compensatória equivalente a 10% do valor total do contrato, além das perdas e danos.</p>`,
  };
  return `<div class="clausula"><div class="clausula-title">Cláusula ${R[num] || num} — ${clause.name}</div><div class="clausula-body">${bodies[clause.id] || `<p>${num}.1. ${clause.desc}.</p>`}</div></div>`;
}

// ════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════

function getDocTitle(type) {
  const t = {
    servico:'Contrato de Prestação de Serviços', trabalho_pj:'Contrato de Trabalho PJ / Autônomo',
    aluguel_res:'Contrato de Locação Residencial', aluguel_com:'Contrato de Locação Comercial',
    compravenda:'Contrato de Compra e Venda', parceria:'Contrato de Parceria Comercial',
    freelancer:'Contrato de Prestação de Serviços Freelancer',
    influenciador:'Contrato de Parceria com Influenciador Digital',
    nda:'Acordo de Confidencialidade e Não-Divulgação (NDA)',
    comissao:'Contrato de Representação Comercial e Comissão',
    locacao_simples:'Contrato de Locação de Imóvel', locacao_fiador:'Contrato de Locação com Fiador',
    recibo_aluguel:'Recibo de Pagamento de Aluguel', vistoria:'Termo de Vistoria de Imóvel',
    notif_desocupacao:'Notificação de Desocupação de Imóvel', acordo_inadimpl:'Acordo de Regularização de Inadimplência',
    curriculo:'Currículo Profissional', carta_apres:'Carta de Apresentação Profissional',
    carta_demissao:'Carta de Pedido de Demissão',
    decl_experiencia:'Declaração de Experiência e Tempo de Serviço',
    estagio:'Termo de Compromisso de Estágio', autonomo:'Acordo de Prestação de Serviços Autônomos',
    decl_residencia:'Declaração de Residência', decl_renda:'Declaração de Renda Mensal',
    decl_informal:'Declaração de Trabalho Informal', decl_comparec:'Declaração de Comparecimento',
    decl_respons:'Declaração de Responsabilidade', decl_uniao:'Declaração de União Estável',
    recibo:'Recibo de Pagamento', quitacao:'Termo de Quitação de Débito',
    confissao_divida:'Confissão de Dívida', parcelamento:'Acordo de Parcelamento de Dívida',
    nota_servico:'Nota Simples de Prestação de Serviço',
    lgpd_termo:'Termo de Consentimento e Tratamento de Dados (LGPD)',
    politica_priv:'Política de Privacidade', termo_uso:'Termos de Uso',
    notif_extra:'Notificação Extrajudicial', acordo_amigavel:'Acordo Amigável entre Partes',
    abertura_empresa:'Requerimento de Abertura de Empresa',
    contrato_social:'Contrato Social', acordo_socios:'Acordo entre Sócios',
    termo_invest:'Termo de Investimento', plano_parceria:'Plano de Parceria Comercial',
  };
  return t[type] || 'Documento Profissional';
}

function getRoleA(type) {
  const r = {
    aluguel_res:'LOCADOR', aluguel_com:'LOCADOR', locacao_simples:'LOCADOR', locacao_fiador:'LOCADOR',
    compravenda:'VENDEDOR', trabalho_pj:'CONTRATANTE', freelancer:'CONTRATANTE',
    influenciador:'CONTRATANTE', nda:'PARTE DIVULGANTE', comissao:'COMITENTE',
    recibo:'PAGANTE', recibo_aluguel:'LOCADOR', quitacao:'CREDOR',
    confissao_divida:'CREDOR', parcelamento:'CREDOR', autonomo:'CONTRATANTE',
    estagio:'EMPRESA CONCEDENTE', acordo_socios:'SÓCIO A', parceria:'PARCEIRO A',
    plano_parceria:'PARTE A', notif_extra:'NOTIFICANTE', acordo_amigavel:'PARTE A',
    termo_invest:'INVESTIDOR', contrato_social:'SÓCIO ADMINISTRADOR',
  };
  return r[type] || 'CONTRATANTE';
}

function getRoleB(type) {
  const r = {
    aluguel_res:'LOCATÁRIO', aluguel_com:'LOCATÁRIO', locacao_simples:'LOCATÁRIO', locacao_fiador:'LOCATÁRIO',
    compravenda:'COMPRADOR', trabalho_pj:'CONTRATADO', freelancer:'FREELANCER',
    influenciador:'INFLUENCIADOR', nda:'PARTE RECEPTORA', comissao:'COMISSIONADO',
    recibo:'BENEFICIÁRIO', recibo_aluguel:'LOCATÁRIO', quitacao:'DEVEDOR',
    confissao_divida:'DEVEDOR', parcelamento:'DEVEDOR', autonomo:'PRESTADOR',
    estagio:'ESTAGIÁRIO', acordo_socios:'SÓCIO B', parceria:'PARCEIRO B',
    plano_parceria:'PARTE B', notif_extra:'NOTIFICADO', acordo_amigavel:'PARTE B',
    termo_invest:'EMPRESA INVESTIDA', contrato_social:'SÓCIO',
  };
  return r[type] || 'CONTRATADO';
}

function valorExtenso(val) {
  if (!val) return 'valor a ser definido';
  const n = parseFloat(val.replace(/\./g,'').replace(',','.'));
  if (isNaN(n) || n === 0) return 'valor a ser definido';

  const unidades = ['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
  const dezenas  = ['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
  const centenas = ['','cem','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];

  function porExtenso(num) {
    if (num === 0)   return '';
    if (num === 100) return 'cem';
    if (num < 20)    return unidades[num];
    if (num < 100) {
      const d = Math.floor(num / 10);
      const u = num % 10;
      return dezenas[d] + (u ? ' e ' + unidades[u] : '');
    }
    const c    = Math.floor(num / 100);
    const rest = num % 100;
    return centenas[c] + (rest ? ' e ' + porExtenso(rest) : '');
  }

  const inteiro  = Math.floor(n);
  const centavos = Math.round((n - inteiro) * 100);

  let textoInteiro = '';
  if (inteiro === 0) {
    textoInteiro = 'zero';
  } else if (inteiro < 1000) {
    textoInteiro = porExtenso(inteiro) + (inteiro === 1 ? ' real' : ' reais');
  } else if (inteiro < 1000000) {
    const mil  = Math.floor(inteiro / 1000);
    const rest = inteiro % 1000;
    textoInteiro = (mil === 1 ? 'mil' : porExtenso(mil) + ' mil')
      + (rest ? ' e ' + porExtenso(rest) : '')
      + (inteiro === 1000 ? ' reais' : ' reais');
  } else {
    const mi   = Math.floor(inteiro / 1000000);
    const rest = inteiro % 1000000;
    textoInteiro = porExtenso(mi) + (mi === 1 ? ' milhão' : ' milhões')
      + (rest ? ' e ' + porExtenso(rest) : '')
      + ' de reais';
  }

  if (centavos === 0) return textoInteiro;
  const textoCent = porExtenso(centavos) + (centavos === 1 ? ' centavo' : ' centavos');
  return inteiro === 0 ? textoCent : textoInteiro + ' e ' + textoCent;
}

function formatDate(d) {
  if (!d) return '';
  const [y,m,day] = d.split('-');
  const months = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  return `${parseInt(day)} de ${months[parseInt(m)-1]} de ${y}`;
}

function formatCurrency(input) {
  let v = input.value.replace(/\D/g,'');
  v = (parseInt(v || '0') / 100).toFixed(2);
  v = v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  input.value = v;
}

function showNotif(msg, icon = '✅') {
  const n = document.getElementById('notif');
  document.getElementById('notif-icon').textContent = icon;
  document.getElementById('notif-text').textContent  = msg;
  n.classList.add('show');
  setTimeout(() => n.classList.remove('show'), 3500);
}
