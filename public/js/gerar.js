// ════════════════════════════════════════════════════════════════
//  js/gerar.js — Geração de documentos
//  generateDocument, buildParty, buildDocHTML (dispatcher)
// ════════════════════════════════════════════════════════════════

function V(id) { return (document.getElementById(id)?.value || '').trim(); }


// ════════════════════════════════════════════════════════════════
//  WIZARD ADAPTATIVO — labels e campos por tipo de documento
// ════════════════════════════════════════════════════════════════

const WIZARD_CONFIG = {
  // ── Contratos ──
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
    step2: { title:'Locador (proprietário) e Locatário', sub:'Informe os dados do proprietário e do inquilino' },
    step3: { title:'Imóvel e prazo da locação', sub:'Descreva o imóvel completo com endereço e características' },
    step3labels: { desc:'Descrição completa do imóvel *', local:'Cidade onde o imóvel está localizado' },
    step4: { title:'Valor do aluguel e encargos', sub:'Defina o valor do aluguel, vencimento e dados para pagamento' },
    step4labels: { forma:'Frequência do aluguel', venc:'Dia de vencimento (ex: dia 10)', banco:'Dados para pagamento (Pix, conta bancária)' },
    step6: { title:'Dados finais do contrato', sub:'Foro da comarca onde o imóvel está localizado' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  aluguel_com: {
    step2: { title:'Locador (proprietário) e Locatário', sub:'Informe os dados do proprietário e do locatário comercial' },
    step3: { title:'Imóvel comercial e prazo', sub:'Descreva o imóvel comercial completo com endereço' },
    step4: { title:'Valor do aluguel comercial', sub:'Aluguel, encargos, vencimento e dados de pagamento' },
    step6: { title:'Dados finais do contrato', sub:'Foro da comarca onde o imóvel está localizado' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  locacao_simples: {
    step2: { title:'Locador (proprietário) e Locatário', sub:'Dados do dono do imóvel e de quem vai alugar' },
    step3: { title:'Imóvel e período da locação', sub:'Informe o endereço completo e o período do aluguel' },
    step4: { title:'Valor e condições do aluguel', sub:'Valor mensal, vencimento e como será pago' },
    step6: { title:'Dados finais', sub:'Foro e condições de rescisão do contrato' },
    mostrarValor: true, mostrarPrazo: true, mostrarObrig: false,
  },
  locacao_fiador: {
    step2: { title:'Locador, Locatário e Fiador', sub:'Dados do proprietário, inquilino e do fiador garante' },
    step3: { title:'Imóvel e período da locação', sub:'Endereço completo do imóvel e período acordado' },
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
  // ── Imobiliário ──
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
  // ── Financeiro ──
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
  // ── Trabalho ──
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
    step6: { title:'Não aplicável', sub:'Carta não tem dados jurídicos' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: true,
  },
  carta_demissao: {
    step2: { title:'Dados do funcionário', sub:'Seus dados e do RH ou chefia para quem está pedindo demissão' },
    step3: { title:'Motivo e data de saída', sub:'Cargo que ocupa e razão da demissão' },
    step4: { title:'Não aplicável', sub:'Carta de demissão não tem valores financeiros' },
    step6: { title:'Aviso prévio e data de saída', sub:'Prazo do aviso prévio e data efetiva de desligamento' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  decl_experiencia: {
    step2: { title:'Empresa declarante e Profissional', sub:'Dados da empresa que declara e do profissional' },
    step3: { title:'Cargo e atividades exercidas', sub:'Função, período trabalhado e principais atividades' },
    step4: { title:'Não aplicável', sub:'Declaração de experiência não tem valores financeiros' },
    step6: { title:'Dados da declaração', sub:'Local de emissão e informações adicionais' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: true,
  },
  // ── Declarações ──
  decl_residencia: {
    step2: { title:'Dados do declarante', sub:'Seus dados pessoais para a declaração de residência' },
    step3: { title:'Endereço de residência', sub:'Informe o endereço completo que está declarando' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores financeiros' },
    step6: { title:'Local e data da declaração', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_renda: {
    step2: { title:'Dados do declarante', sub:'Seus dados pessoais para a declaração de renda' },
    step3: { title:'Fonte de renda', sub:'Descreva de onde vem sua renda (emprego, negócio, etc.)' },
    step4: { title:'Valor da renda mensal', sub:'Informe o valor aproximado da sua renda mensal' },
    step6: { title:'Local e data', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_informal: {
    step2: { title:'Dados do declarante', sub:'Seus dados pessoais para a declaração de trabalho informal' },
    step3: { title:'Atividade informal', sub:'Descreva o tipo de trabalho informal que exerce' },
    step4: { title:'Renda aproximada', sub:'Informe a renda mensal aproximada da atividade' },
    step6: { title:'Local e data', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: true, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_comparec: {
    step2: { title:'Declarante (empresa/órgão) e quem compareceu', sub:'Dados de quem emite e de quem compareceu' },
    step3: { title:'Motivo e data do comparecimento', sub:'Quando e para que a pessoa compareceu' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores financeiros' },
    step6: { title:'Local e data da declaração', sub:'Onde e quando está sendo emitida' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  decl_respons: {
    step2: { title:'Dados do declarante', sub:'Seus dados pessoais para a declaração de responsabilidade' },
    step3: { title:'Pelo que está se responsabilizando?', sub:'Descreva claramente o que está declarando assumir' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores financeiros' },
    step6: { title:'Local e data', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: false, mostrarPrazo: false, mostrarObrig: false,
  },
  decl_uniao: {
    step2: { title:'Companheiro(a) 1 e Companheiro(a) 2', sub:'Dados de ambos os conviventes da união estável' },
    step3: { title:'Dados da união', sub:'Data de início da convivência e endereço comum' },
    step4: { title:'Não aplicável', sub:'Declaração não tem valores financeiros' },
    step6: { title:'Local e data', sub:'Onde e quando está sendo emitida a declaração' },
    mostrarValor: false, mostrarPrazo: true, mostrarObrig: false,
  },
  // ── Jurídico ──
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
  // ── Empresarial ──
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

// Configuração padrão para tipos não mapeados
const WIZARD_DEFAULT = {
  step2: { title:'Dados das Partes', sub:'Informe os dados de ambas as partes' },
  step3: { title:'Objeto e Prazo', sub:'Descreva detalhadamente o objeto deste documento' },
  step4: { title:'Valores e Pagamento', sub:'Defina as condições financeiras' },
  step6: { title:'Dados Finais', sub:'Informações legais e foro competente' },
  mostrarValor: true, mostrarPrazo: true, mostrarObrig: true,
};

function applyWizardConfig(typeId) {
  const cfg = WIZARD_CONFIG[typeId] || WIZARD_DEFAULT;

  // Step 2
  const s2title = document.querySelector('#step-2 .wizard-title');
  const s2sub   = document.querySelector('#step-2 .wizard-subtitle');
  if (s2title) s2title.textContent = cfg.step2.title;
  if (s2sub)   s2sub.textContent   = cfg.step2.sub;

  // Step 3
  const s3title = document.querySelector('#step-3 .wizard-title');
  const s3sub   = document.querySelector('#step-3 .wizard-subtitle');
  if (s3title) s3title.textContent = cfg.step3.title;
  if (s3sub)   s3sub.textContent   = cfg.step3.sub;

  // Step 3 labels personalizados
  if (cfg.step3labels) {
    const descLabel = document.querySelector('label[for="obj_desc"], #step-3 label:first-of-type');
    const localLabel = document.querySelector('label[for="obj_local"]');
    // Usa querySelector por conteúdo não é confiável, então busca por textarea
    const descArea = document.getElementById('obj_desc');
    if (descArea && cfg.step3labels.desc) {
      const lbl = descArea.previousElementSibling;
      if (lbl && lbl.tagName === 'LABEL') lbl.textContent = cfg.step3labels.desc;
    }
  }

  // Step 4
  const s4title = document.querySelector('#step-4 .wizard-title');
  const s4sub   = document.querySelector('#step-4 .wizard-subtitle');
  if (s4title) s4title.textContent = cfg.step4.title;
  if (s4sub)   s4sub.textContent   = cfg.step4.sub;

  // Step 4: oculta campos de valor quando não aplicável
  const valContainer = document.querySelector('#step-4 .form-grid');
  if (valContainer) {
    valContainer.style.opacity = cfg.mostrarValor ? '1' : '0.4';
  }

  // Step 6
  const s6title = document.querySelector('#step-6 .wizard-title');
  const s6sub   = document.querySelector('#step-6 .wizard-subtitle');
  if (s6title) s6title.textContent = cfg.step6.title;
  if (s6sub)   s6sub.textContent   = cfg.step6.sub;

  // Obrigações no step 3 — oculta se não relevante
  const obrigSection = document.getElementById('obj_obrig_a')?.closest('.field')?.parentElement;
  const obrigAField = document.getElementById('obj_obrig_a')?.closest('.field');
  const obrigBField = document.getElementById('obj_obrig_b')?.closest('.field');
  if (obrigAField) obrigAField.style.display = cfg.mostrarObrig ? '' : 'none';
  if (obrigBField) obrigBField.style.display = cfg.mostrarObrig ? '' : 'none';
}


// ════════════════════════════════════════════════════════════════
//  REGRAS DO WIZARD — o que mostrar por tipo de documento
// ════════════════════════════════════════════════════════════════
const DOC_WIZARD_RULES = {
  // tem_parte_b: mostra seção de Parte B
  // tem_valores: mostra etapa de valores
  // tem_clausulas: mostra etapa de cláusulas
  // tem_juridico: mostra etapa jurídica
  // tem_obrigacoes: mostra campos de obrigações no step 3
  // tem_prazo: mostra campos de prazo/vigência no step 3
  // uma_parte: documento de uma só parte (declarações, currículos)

  // Contratos — duas partes, tudo
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
  // Imobiliário
  recibo_aluguel: { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  vistoria:       { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  notif_desocupacao:{ tem_parte_b:true,tem_valores:false, tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  acordo_inadimpl:{ tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  // Financeiro
  recibo:         { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  quitacao:       { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  confissao_divida:{ tem_parte_b:true, tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  parcelamento:   { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  nota_servico:   { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  // Trabalho — uma parte
  curriculo:      { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  carta_apres:    { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  carta_demissao: { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_experiencia:{ tem_parte_b:true, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:true  },
  // Declarações — uma parte
  decl_residencia:{ tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_renda:     { tem_parte_b:false, tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_informal:  { tem_parte_b:false, tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_comparec:  { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  decl_respons:   { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  decl_uniao:     { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:true  },
  // Jurídico
  lgpd_termo:     { tem_parte_b:true,  tem_valores:false, tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:true  },
  politica_priv:  { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  termo_uso:      { tem_parte_b:false, tem_valores:false, tem_clausulas:false, tem_juridico:false, tem_obrigacoes:true,  tem_prazo:false },
  notif_extra:    { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:false, tem_prazo:false },
  acordo_amigavel:{ tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:false },
  // Empresarial
  abertura_empresa:{ tem_parte_b:true, tem_valores:true,  tem_clausulas:false, tem_juridico:false, tem_obrigacoes:false, tem_prazo:false },
  contrato_social: { tem_parte_b:true, tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:false },
  acordo_socios:  { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:false },
  termo_invest:   { tem_parte_b:true,  tem_valores:true,  tem_clausulas:false, tem_juridico:true,  tem_obrigacoes:true,  tem_prazo:true  },
};
const DOC_WIZARD_DEFAULT = { tem_parte_b:true, tem_valores:true, tem_clausulas:true, tem_juridico:true, tem_obrigacoes:true, tem_prazo:true };

// Retorna os steps ativos para o tipo selecionado
function getActiveSteps(typeId) {
  const r = DOC_WIZARD_RULES[typeId] || DOC_WIZARD_DEFAULT;
  const steps = [1, 2]; // Tipo e Partes sempre
  if (r.tem_prazo || r.tem_obrigacoes) steps.push(3); // Objeto
  else steps.push(3); // sempre mostra step 3 (descrição obrigatória)
  if (r.tem_valores) steps.push(4);
  if (r.tem_clausulas) steps.push(5);
  if (r.tem_juridico) steps.push(6);
  return steps;
}

function applyWizardRules(typeId) {
  const r = DOC_WIZARD_RULES[typeId] || DOC_WIZARD_DEFAULT;
  const cfg = WIZARD_CONFIG[typeId] || WIZARD_DEFAULT;

  // ── Parte B ──
  const parteBSection = document.getElementById('parte-b-section');
  const testemunhasSection = document.getElementById('testemunhas-section');
  if (parteBSection) parteBSection.style.display = r.tem_parte_b ? '' : 'none';
  if (testemunhasSection) testemunhasSection.style.display = r.tem_parte_b ? '' : 'none';

  // Validação step 2: se não tem parte B, não exige p_b_nome
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
  const totalSteps = activeSteps.length;
  window._activeSteps = activeSteps;
  window._totalSteps = totalSteps;

  // Atualiza indicador de steps
  updateStepIndicator();

  // ── Aplica títulos e subtítulos ──
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

  // ── Label Parte A ──
  const roleALabel = document.getElementById('role-a-label');
  if (roleALabel) roleALabel.textContent = getRoleA(typeId);
  const roleBLabel = document.getElementById('role-b-label');
  if (roleBLabel) roleBLabel.textContent = getRoleB(typeId);

  // ── Atualiza barra de progresso visual ──
  updateWizardProgressBar(activeSteps);
}

function updateWizardProgressBar(activeSteps) {
  // Mostra/oculta steps e conectores na barra
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

function generateDocument() {
  const allT    = getAllTypes();
  const typeInfo = allT.find(t => t.id === selectedType) || { name:'Documento', emoji:'📄' };
  const now     = new Date();
  const dateStr = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const num     = `CTR-${now.getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`;

  const pa = buildParty('p_a');
  const pb = window._docTemParteB !== false ? buildParty('p_b') : { nome:'', doc:'', nac:'', est:'', prof:'', end:'', tel:'', email:'', rg:'' };
  const t1 = testemunhasAtivas
    ? { nome: V('test1_nome') || '___________________________', doc: V('test1_doc') || '___________________' }
    : { nome: null, doc: null };
  const t2 = testemunhasAtivas
    ? { nome: V('test2_nome') || '___________________________', doc: V('test2_doc') || '___________________' }
    : { nome: null, doc: null };

  // Obrigações padrão específicas por tipo de documento
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
  const roleA = getRoleA(selectedType);
  const roleB = getRoleB(selectedType);
  const docTitle = getDocTitle(selectedType);
  const vigText = obj.vigencia && obj.vigencia !== ''
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

function buildDocHTML({ num, docTitle, dateStr, pa, pb, t1, t2, obj, val, jur, roleA, roleB, vigText, extraClauses, finalClauseN, typeInfo, type }) {
  const roman = ['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];

  const partyLine = (p, role) => {
    let line = `<strong>${p.nome || role}</strong>`;
    if (p.nac && p.nac !== 'undefined') line += `, ${p.nac}`;
    if (p.est && p.est !== 'undefined') line += `, ${p.est}`;
    if (p.prof && p.prof !== 'undefined' && p.prof) line += `, ${p.prof}`;
    if (p.doc && p.doc !== 'undefined' && p.doc) line += `, portador(a) do CPF/CNPJ nº <strong>${p.doc}</strong>`;
    if (p.rg  && p.rg  !== 'undefined' && p.rg)  line += `, RG nº ${p.rg}`;
    if (p.end && p.end !== 'undefined' && p.end)  line += `, residente/domiciliado(a) em ${p.end}`;
    if (p.tel && p.tel !== 'undefined' && p.tel)  line += `, tel.: ${p.tel}`;
    if (p.email && p.email !== 'undefined' && p.email) line += `, e-mail: ${p.email}`;
    return line + '.';
  };

  const aviso = `<div class="doc-aviso-oab">AVISO: Este modelo de referência não constitui assessoria jurídica. Para situações específicas, consulte um advogado inscrito na OAB.</div>`;

  const cabecalho = `
  <div class="doc-masthead">
    <div class="masthead-logo">DocFácil · Gerador de Modelos de Documentos</div>
    <div class="masthead-num">Nº ${num}</div>
  </div>
  <div class="doc-main-title">${docTitle}</div>`;

  // ── Documentos com templates específicos ──
  const t = type || selectedType;

  // ════ LOCAÇÃO RESIDENCIAL / COMERCIAL / SIMPLES / COM FIADOR ════
  if (['aluguel_res','aluguel_com','locacao_simples','locacao_fiador'].includes(t)) {
    const tipoImovel = t === 'aluguel_com' ? 'comercial' : 'residencial';
    const lei = 'Lei nº 8.245/1991 (Lei do Inquilinato)';
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Locação · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">LOCADOR:</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO:</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
      ${t === 'locacao_fiador' ? `<div class="party"><div class="party-role">FIADOR:</div><p>_____________________________, portador(a) do CPF nº _____________________, residente em _____________________________.</p></div>` : ''}
    </div>
    <p>As partes acima qualificadas têm entre si justo e acordado o presente Contrato de Locação, regido pela ${lei} e pelo Código Civil Brasileiro, mediante as seguintes cláusulas:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Do Imóvel Locado</div><div class="clausula-body">
      <p>1.1. O LOCADOR cede ao LOCATÁRIO, para uso exclusivamente <strong>${tipoImovel}</strong>, o imóvel localizado em: <strong>${obj.desc}</strong></p>
      <p>1.2. O imóvel é entregue em perfeitas condições de uso e habitabilidade, conforme Termo de Vistoria a ser anexado e assinado por ambas as partes no ato da entrega das chaves.</p>
      <p>1.3. É expressamente vedada a sublocação, empréstimo ou cessão do imóvel, no todo ou em parte, sem prévia e expressa autorização por escrito do LOCADOR.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Do Prazo</div><div class="clausula-body">
      <p>2.1. A locação terá prazo <strong>${vigText}</strong>, com início em <strong>${obj.inicio}</strong> e término previsto em <strong>${obj.fim}</strong>.</p>
      <p>2.2. Findo o prazo, caso nenhuma das partes manifeste intenção de encerrar o contrato, a locação prosseguirá por prazo indeterminado, podendo ser rescindida mediante aviso prévio de 30 (trinta) dias, nos termos do art. 46 da Lei do Inquilinato.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Do Aluguel e Condições de Pagamento</div><div class="clausula-body">
      <p>3.1. O aluguel mensal é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), a ser pago até o dia <strong>${val.venc}</strong> de cada mês.</p>
      <p>3.2. O pagamento será efetuado mediante: <strong>${val.banco || 'dados a serem informados pelo LOCADOR'}</strong>.</p>
      <p>3.3. O não pagamento no prazo estipulado acarretará multa moratória de <strong>${val.multa}</strong> sobre o valor do aluguel em atraso, acrescida de juros de mora de <strong>${val.juros}</strong>, calculados pro rata die, além de correção monetária pelo índice <strong>${val.reajuste || 'IGPM/FGV'}</strong>, nos termos do art. 17 da Lei do Inquilinato.</p>
      ${val.reajuste ? `<p>3.4. O valor do aluguel será reajustado anualmente pelo índice <strong>${val.reajuste}</strong>, nos termos da legislação vigente.</p>` : '<p>3.4. O valor do aluguel será reajustado anualmente pelo IGPM/FGV, nos termos da legislação vigente.</p>'}
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula IV — Das Obrigações do Locador</div><div class="clausula-body">
      <p>4.1. São obrigações do LOCADOR: (a) entregar o imóvel em condições de uso; (b) garantir o uso pacífico do imóvel durante a locação; (c) responder pelos vícios ou defeitos anteriores à locação; (d) pagar os impostos e taxas incidentes sobre o imóvel (IPTU), salvo convenção em contrário.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula V — Das Obrigações do Locatário</div><div class="clausula-body">
      <p>5.1. São obrigações do LOCATÁRIO: (a) pagar o aluguel e os encargos no prazo convencionado; (b) utilizar o imóvel somente para uso ${tipoImovel}; (c) conservar e zelar pelo imóvel, responsabilizando-se pelos danos causados; (d) pagar as contas de consumo (água, luz, gás e demais utilidades); (e) não realizar obras ou modificações sem prévia autorização por escrito do LOCADOR; (f) restituir o imóvel ao final da locação nas mesmas condições em que o recebeu, conforme Termo de Vistoria.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula VI — Da Rescisão</div><div class="clausula-body">
      <p>6.1. O descumprimento de qualquer cláusula deste contrato ensejará sua rescisão imediata, sem prejuízo das penalidades cabíveis.</p>
      <p>6.2. Em caso de rescisão antecipada pelo LOCATÁRIO, será devida multa de <strong>${jur.multa_resc}</strong>, proporcional ao período faltante, nos termos do art. 4º da Lei do Inquilinato.</p>
      <p>6.3. A desocupação do imóvel deverá ser comunicada com antecedência mínima de <strong>${jur.rescisao}</strong>.</p>
    </div></div>

    ${t === 'locacao_fiador' ? `<div class="clausula"><div class="clausula-title">Cláusula VII — Da Fiança</div><div class="clausula-body">
      <p>7.1. O FIADOR acima qualificado, em caráter solidário e como principal pagador, garante o cumprimento de todas as obrigações assumidas pelo LOCATÁRIO neste instrumento, respondendo pelo pagamento do aluguel, encargos, multas e demais obrigações decorrentes deste contrato até a efetiva desocupação e entrega das chaves do imóvel.</p>
    </div></div>` : ''}

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[t === 'locacao_fiador' ? 8 : 7]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Este contrato é regido pela ${lei} e pelo Código Civil (Lei nº 10.406/2002). As partes elegem o foro <strong>${jur.foro || 'Comarca do local do imóvel'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">LOCADOR</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">LOCATÁRIO</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      ${t === 'locacao_fiador' ? `<div class="sig-grid"><div class="sig-item"><div class="sig-line"></div><div class="sig-name">_____________________________</div><div class="sig-role">FIADOR</div><div class="sig-doc">CPF: _____________________</div></div><div class="sig-item"></div></div>` : ''}
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ RECIBO DE PAGAMENTO ════
  if (['recibo','recibo_aluguel'].includes(t)) {
    return `${cabecalho}
    <div class="doc-subtitle">Documento comprobatório de pagamento · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Dados do Recibo</div>
      <div class="party"><div class="party-role">RECEBEDOR:</div><p>${partyLine(pa,'RECEBEDOR')}</p></div>
      <div class="party"><div class="party-role">PAGANTE:</div><p>${partyLine(pb,'PAGANTE')}</p></div>
    </div>

    <div class="clausula"><div class="clausula-title">Declaração de Recebimento</div><div class="clausula-body">
      <p>Declaro que recebi de <strong>${pb.nome}</strong>, a quantia de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
      <p>Forma de pagamento: <strong>${val.forma}</strong>${val.banco ? ' — ' + val.banco : ''}.</p>
      <p>Período de referência: <strong>${obj.inicio} a ${obj.fim !== 'indeterminado' ? obj.fim : obj.inicio}</strong>.</p>
      <p>Por ser verdade, firmo o presente recibo, dando plena, geral e irrevogável quitação da referida quantia, para que produza seus efeitos legais.</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">RECEBEDOR</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PAGANTE</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
    </div>
    ${aviso}`;
  }

  // ════ DECLARAÇÕES ════
  if (['decl_residencia','decl_renda','decl_informal','decl_comparec','decl_respons','decl_uniao'].includes(t)) {
    const declTextos = {
      decl_residencia: `Declaro, para os devidos fins, que resido no endereço: <strong>${obj.desc || obj.local}</strong>, nesta cidade, há aproximadamente <strong>${obj.vigencia || 'tempo indeterminado'}</strong>. Declaro ainda que as informações prestadas são verdadeiras e assumo total responsabilidade civil e criminal por esta declaração.`,
      decl_renda: `Declaro, para os devidos fins, que minha renda ${obj.vigencia === '1 mês' ? 'mensal' : 'aproximada'} é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), proveniente de: <strong>${obj.desc}</strong>. Declaro que as informações são verdadeiras e assumo total responsabilidade por esta declaração.`,
      decl_informal: `Declaro, para os devidos fins, que exerço atividade de trabalho informal como <strong>${pa.prof || obj.desc}</strong>, auferindo renda aproximada de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}) mensais. Declaro que as informações são verdadeiras.`,
      decl_comparec: `Declaro, para os devidos fins, que <strong>${pb.nome}</strong>, portador(a) do CPF nº <strong>${pb.doc}</strong>, compareceu a este estabelecimento/local em <strong>${obj.inicio}</strong>, no período de <strong>${obj.desc}</strong>. Esta declaração é fornecida a pedido do(a) interessado(a).`,
      decl_respons: `Declaro, para os devidos fins, que me responsabilizo por: <strong>${obj.desc}</strong>. Assumo toda responsabilidade civil decorrente desta declaração, isentando terceiros de quaisquer ônus.`,
      decl_uniao: `Declaramos, para os devidos fins legais, que vivemos em União Estável desde <strong>${obj.inicio}</strong>, de forma pública, contínua e duradoura, com o objetivo de constituir família, nos termos do art. 1.723 do Código Civil Brasileiro (Lei nº 10.406/2002). Declaramos ainda que não possuímos impedimentos legais para a união e que as informações prestadas são verdadeiras.`,
    };
    return `${cabecalho}
    <div class="doc-subtitle">${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Declarante${t === 'decl_uniao' ? 's' : ''}</div>
      <div class="party"><div class="party-role">DECLARANTE${t === 'decl_uniao' ? ' 1' : ''}:</div><p>${partyLine(pa,'DECLARANTE')}</p></div>
      ${t === 'decl_uniao' ? `<div class="party"><div class="party-role">DECLARANTE 2:</div><p>${partyLine(pb,'DECLARANTE 2')}</p></div>` : ''}
    </div>
    <div class="clausula"><div class="clausula-body"><p>${declTextos[t]}</p>${jur.extra ? `<p>${jur.extra}</p>` : ''}</div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">DECLARANTE</div><div class="sig-doc">${pa.doc ? 'CPF: ' + pa.doc : ''}</div></div>
        ${t === 'decl_uniao' ? `<div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">DECLARANTE 2</div><div class="sig-doc">${pb.doc ? 'CPF: ' + pb.doc : ''}</div></div>` : '<div class="sig-item"></div>'}
      </div>
    </div>
    ${aviso}`;
  }

  // ════ CONFISSÃO DE DÍVIDA / PARCELAMENTO / QUITAÇÃO ════
  if (['confissao_divida','parcelamento','quitacao'].includes(t)) {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">CREDOR:</div><p>${partyLine(pa,'CREDOR')}</p></div>
      <div class="party"><div class="party-role">DEVEDOR:</div><p>${partyLine(pb,'DEVEDOR')}</p></div>
    </div>
    <p>As partes acima qualificadas celebram o presente instrumento mediante as seguintes condições:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — ${t === 'quitacao' ? 'Da Quitação' : t === 'confissao_divida' ? 'Da Dívida Confessada' : 'Do Parcelamento'}</div><div class="clausula-body">
      ${t === 'quitacao'
        ? `<p>1.1. O CREDOR declara ter recebido do DEVEDOR a quantia de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
           <p>1.2. Dando plena, geral e irrevogável quitação da referida quantia, nada mais tendo a reclamar a qualquer título, presente ou futuro, em razão da dívida ora quitada.</p>`
        : t === 'confissao_divida'
        ? `<p>1.1. O DEVEDOR reconhece e confessa, por este instrumento, ser devedor ao CREDOR da quantia de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
           <p>1.2. O DEVEDOR compromete-se a quitar o débito até <strong>${obj.fim}</strong>, mediante <strong>${val.forma}</strong>.</p>`
        : `<p>1.1. O DEVEDOR reconhece o débito de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}) perante o CREDOR e compromete-se a pagá-lo de forma parcelada.</p>
           <p>1.2. O pagamento será realizado em parcelas de <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>, mediante ${val.banco || 'forma a ser acordada'}.</p>`
      }
      <p>${t === 'quitacao' ? '1.3.' : '1.3.'} O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de mora de <strong>${val.juros}</strong>, nos termos do art. 395 do Código Civil.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Do Foro</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'da Comarca do domicílio do devedor'}</strong> para dirimir eventuais litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CREDOR</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">DEVEDOR</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ NDA / CONFIDENCIALIDADE ════
  if (t === 'nda') {
    return `${cabecalho}
    <div class="doc-subtitle">Acordo de Não-Divulgação — Non-Disclosure Agreement · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARTE DIVULGANTE:</div><p>${partyLine(pa,'PARTE DIVULGANTE')}</p></div>
      <div class="party"><div class="party-role">PARTE RECEPTORA:</div><p>${partyLine(pb,'PARTE RECEPTORA')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Confidencialidade, comprometendo-se a observar as seguintes cláusulas:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Das Informações Confidenciais</div><div class="clausula-body">
      <p>1.1. Consideram-se confidenciais todas as informações relacionadas a: <strong>${obj.desc}</strong>, incluindo, mas não se limitando a: dados técnicos, financeiros, comerciais, estratégicos, segredos de negócio, know-how, projetos, planos, códigos-fonte e quaisquer outros dados revelados por uma parte à outra.</p>
      <p>1.2. As obrigações de confidencialidade não se aplicam a informações que: (a) sejam ou se tornem de domínio público sem culpa da Parte Receptora; (b) já eram de conhecimento da Parte Receptora antes da divulgação; (c) sejam exigidas por determinação judicial ou legal.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações</div><div class="clausula-body">
      <p>2.1. A PARTE RECEPTORA compromete-se a: (a) manter as informações confidenciais em sigilo absoluto; (b) não divulgar, reproduzir ou utilizar as informações para fins outros que não os previstos neste acordo; (c) restringir o acesso às informações apenas às pessoas que necessitem conhecê-las para os fins acordados.</p>
      <p>2.2. A vigência das obrigações de sigilo é de <strong>${vigText}</strong>, a contar da data de assinatura deste instrumento.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Das Penalidades</div><div class="clausula-body">
      <p>3.1. O descumprimento das obrigações deste acordo sujeitará a parte infratora ao pagamento de multa de <strong>R$ ${val.total || '10.000,00'}</strong>, sem prejuízo de perdas e danos apurados em juízo e demais sanções legais cabíveis.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Do Foro</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PARTE DIVULGANTE</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PARTE RECEPTORA</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ FREELANCER / PRESTAÇÃO DE SERVIÇOS / PJ / AUTÔNOMO ════
  if (['servico','freelancer','trabalho_pj','autonomo'].includes(t)) {
    const tipoContrato = t === 'freelancer' ? 'Freelancer' : t === 'trabalho_pj' ? 'Trabalho PJ' : t === 'autonomo' ? 'Autônomo' : 'Prestação de Serviços';
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de ${tipoContrato} · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">CONTRATANTE:</div><p>${partyLine(pa,'CONTRATANTE')}</p></div>
      <div class="party"><div class="party-role">CONTRATADO:</div><p>${partyLine(pb,'CONTRATADO')}</p></div>
    </div>
    <p>As partes celebram o presente instrumento mediante as seguintes cláusulas e condições, ficando expressamente acordado que a presente relação é de natureza civil, não gerando qualquer vínculo empregatício entre as partes, nos termos do art. 593 e seguintes do Código Civil:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. O CONTRATADO prestará ao CONTRATANTE os seguintes serviços: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Entregáveis: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} Os serviços serão prestados ${vigText}, com início em <strong>${obj.inicio}</strong>${obj.fim !== 'indeterminado' ? ` e término em <strong>${obj.fim}</strong>` : ''}, no local: <strong>${obj.local || 'a ser definido entre as partes'}</strong>.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações do Contratante</div><div class="clausula-body">
      <p>2.1. Compete ao CONTRATANTE: ${obj.obrig_a || 'efetuar o pagamento nos prazos estabelecidos; fornecer as informações e subsídios necessários à execução dos serviços; comunicar ao CONTRATADO eventuais alterações no escopo com antecedência mínima de 5 dias úteis'}.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações do Contratado</div><div class="clausula-body">
      <p>3.1. Compete ao CONTRATADO: ${obj.obrig_b || 'executar os serviços com qualidade, diligência e nos prazos acordados; manter o CONTRATANTE informado sobre o andamento dos trabalhos; responsabilizar-se pelos impostos e contribuições decorrentes de sua atividade autônoma'}.</p>
      <p>3.2. O CONTRATADO declara possuir plena capacidade técnica para a prestação dos serviços ora contratados, respondendo por eventuais falhas na execução.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Remuneração</div><div class="clausula-body">
      <p>4.1. Pela prestação dos serviços, o CONTRATANTE pagará ao CONTRATADO o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, com vencimento em <strong>${val.venc}</strong>.</p>
      <p>4.2. O pagamento será realizado mediante: <strong>${val.banco || 'dados bancários a serem informados pelo CONTRATADO'}</strong>.</p>
      ${val.reajuste ? `<p>4.3. O valor será reajustado pelo índice <strong>${val.reajuste}</strong>.</p>` : ''}
      <p>${val.reajuste ? '4.4.' : '4.3.'} O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de mora de <strong>${val.juros}</strong>, nos termos do art. 395 do Código Civil.</p>
      ${val.cond ? `<p>Condições especiais: ${val.cond}.</p>` : ''}
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula V — Da Rescisão</div><div class="clausula-body">
      <p>5.1. Qualquer das partes poderá rescindir o presente instrumento mediante notificação escrita com antecedência mínima de <strong>${jur.rescisao}</strong>.</p>
      <p>5.2. A rescisão imotivada implicará multa de <strong>${jur.multa_resc}</strong>.</p>
      <p>5.3. Em caso de rescisão por descumprimento, a parte faltosa responderá por perdas e danos.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula VI — Da Ausência de Vínculo Empregatício</div><div class="clausula-body">
      <p>6.1. O presente instrumento não gera vínculo empregatício, societário ou associativo entre as partes. O CONTRATADO exercerá suas atividades com autonomia, podendo prestar serviços a outros clientes, desde que não haja conflito de interesses com o CONTRATANTE.</p>
      <p>6.2. O CONTRATADO é responsável pelo recolhimento de seus próprios tributos, previdência social e demais encargos decorrentes de sua atividade.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Este instrumento é regido pelo Código Civil (Lei nº 10.406/2002). Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CONTRATANTE</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">CONTRATADO</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ INFLUENCIADOR DIGITAL ════
  if (t === 'influenciador') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Parceria Comercial com Influenciador Digital · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">CONTRATANTE (MARCA/EMPRESA):</div><p>${partyLine(pa,'CONTRATANTE')}</p></div>
      <div class="party"><div class="party-role">INFLUENCIADOR DIGITAL:</div><p>${partyLine(pb,'INFLUENCIADOR')}</p></div>
    </div>
    <p>As partes celebram o presente instrumento de parceria comercial para criação e divulgação de conteúdo digital, conforme as seguintes cláusulas:</p>

    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto e Escopo da Parceria</div><div class="clausula-body">
      <p>1.1. O INFLUENCIADOR compromete-se a criar e publicar conteúdo digital promovendo: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Entregáveis: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} A parceria vigorará ${vigText}, com início em <strong>${obj.inicio}</strong>.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações do Influenciador</div><div class="clausula-body">
      <p>2.1. O INFLUENCIADOR compromete-se a: (a) criar conteúdo autêntico e alinhado com as diretrizes da marca; (b) identificar o conteúdo patrocinado conforme as normas do CONAR e BACEN; (c) não associar a marca a conteúdos polêmicos, ofensivos ou que violem a legislação; (d) manter as métricas e resultados informados ao CONTRATANTE.</p>
      <p>2.2. O INFLUENCIADOR declara ser titular dos canais/perfis utilizados e possuir audiência verdadeira, respondendo por quaisquer irregularidades neste sentido.</p>
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula III — Da Remuneração</div><div class="clausula-body">
      <p>3.1. Pela execução da parceria, o CONTRATANTE pagará ao INFLUENCIADOR o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      ${val.cond ? `<p>3.2. Condições especiais: ${val.cond}.</p>` : ''}
    </div></div>

    <div class="clausula"><div class="clausula-title">Cláusula IV — Dos Direitos Autorais</div><div class="clausula-body">
      <p>4.1. O CONTRATANTE terá direito de uso do conteúdo produzido pelo INFLUENCIADOR pelo período de <strong>${vigText}</strong>, podendo ser prorrogado mediante acordo entre as partes e pagamento adicional a ser negociado.</p>
    </div></div>

    ${extraClauses}

    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>

    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CONTRATANTE</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">INFLUENCIADOR DIGITAL</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      ${t1.nome ? `<div class="witnesses-block">
        <div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>` : ""}
    </div>
    ${aviso}`;
  }

  // ════ COMPRA E VENDA ════
  if (t === 'compravenda') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Compra e Venda · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">VENDEDOR:</div><p>${partyLine(pa,'VENDEDOR')}</p></div>
      <div class="party"><div class="party-role">COMPRADOR:</div><p>${partyLine(pb,'COMPRADOR')}</p></div>
    </div>
    <p>As partes celebram o presente Contrato de Compra e Venda, nos termos dos arts. 481 a 532 do Código Civil (Lei nº 10.406/2002), mediante as seguintes cláusulas:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. O VENDEDOR vende ao COMPRADOR, em caráter irrevogável e irretratável: <strong>${obj.desc}</strong></p>
      <p>1.2. O bem objeto deste contrato é vendido no estado em que se encontra, sendo de responsabilidade do COMPRADOR verificar suas condições antes da assinatura.</p>
      ${obj.entregaveis ? `<p>1.3. Características adicionais: ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Preço e Forma de Pagamento</div><div class="clausula-body">
      <p>2.1. O preço total da venda é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), pago <strong>${val.forma}</strong>.</p>
      <p>2.2. O pagamento será efetuado mediante: <strong>${val.banco || 'dados a serem informados pelo VENDEDOR'}</strong>.</p>
      ${val.cond ? `<p>2.3. Condições especiais: ${val.cond}</p>` : ''}
      <p>${val.cond ? '2.4.' : '2.3.'} O atraso no pagamento acarretará multa de <strong>${val.multa}</strong> e juros de mora de <strong>${val.juros}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Entrega e Transferência</div><div class="clausula-body">
      <p>3.1. O bem será entregue ao COMPRADOR em <strong>${obj.fim !== 'indeterminado' ? obj.fim : obj.inicio}</strong>, no local: <strong>${obj.local || 'a ser acordado entre as partes'}</strong>.</p>
      <p>3.2. A transferência definitiva da propriedade ocorrerá após o pagamento integral do preço. Até lá, o bem permanece em nome do VENDEDOR.</p>
      <p>3.3. As despesas de transferência, registro e tributos incidentes sobre a transação serão de responsabilidade do <strong>COMPRADOR</strong>, salvo acordo em contrário.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Das Garantias</div><div class="clausula-body">
      <p>4.1. O VENDEDOR garante que o bem está livre e desembaraçado de quaisquer ônus, dívidas, hipotecas ou restrições, respondendo por eventuais vícios ocultos nos termos do art. 441 do Código Civil.</p>
      <p>4.2. O VENDEDOR responde pela evicção, nos termos dos arts. 447 a 457 do Código Civil.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong> para dirimir quaisquer litígios.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">VENDEDOR</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">COMPRADOR</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ PARCERIA COMERCIAL ════
  if (t === 'parceria' || t === 'plano_parceria') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Parceria Comercial · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARCEIRO A:</div><p>${partyLine(pa,'PARCEIRO A')}</p></div>
      <div class="party"><div class="party-role">PARCEIRO B:</div><p>${partyLine(pb,'PARCEIRO B')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Parceria Comercial, comprometendo-se a atuar de forma colaborativa para os fins descritos neste instrumento:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto da Parceria</div><div class="clausula-body">
      <p>1.1. As partes estabelecem parceria comercial para: <strong>${obj.desc}</strong></p>
      ${obj.entregaveis ? `<p>1.2. Escopo e metas: ${obj.entregaveis}</p>` : ''}
      <p>${obj.entregaveis ? '1.3.' : '1.2.'} A parceria vigorará ${vigText}, com início em <strong>${obj.inicio}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações e Responsabilidades</div><div class="clausula-body">
      <p>2.1. Compete ao PARCEIRO A: ${obj.obrig_a || 'aportar recursos, conhecimento e infraestrutura conforme acordado'}.</p>
      <p>2.2. Compete ao PARCEIRO B: ${obj.obrig_b || 'executar as atividades operacionais e de relacionamento conforme acordado'}.</p>
      <p>2.3. As decisões estratégicas serão tomadas em conjunto, mediante acordo entre as partes.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Remuneração e Divisão de Resultados</div><div class="clausula-body">
      <p>3.1. Os resultados financeiros e a remuneração da parceria correspondem a <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), pagos <strong>${val.forma}</strong>, com vencimento em <strong>${val.venc || 'data acordada entre as partes'}</strong>.</p>
      <p>3.2. Os pagamentos serão realizados mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>, com vencimento <strong>${val.venc || 'conforme apuração dos resultados'}</strong>.</p>
      ${val.cond ? `<p>3.3. Condições especiais: ${val.cond}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Confidencialidade</div><div class="clausula-body">
      <p>4.1. As partes comprometem-se a manter sigilo sobre todas as informações estratégicas, comerciais e financeiras obtidas em razão desta parceria, durante toda a vigência e por 2 (dois) anos após o encerramento.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula V — Da Rescisão</div><div class="clausula-body">
      <p>5.1. A parceria poderá ser encerrada por qualquer das partes mediante aviso prévio de <strong>${jur.rescisao}</strong>, devendo as obrigações em curso ser finalizadas.</p>
      <p>5.2. O encerramento imotivado implicará multa de <strong>${jur.multa_resc}</strong>.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Este instrumento não gera vínculo societário entre as partes. Fica eleito o foro de <strong>${jur.foro || 'Comarca do domicílio das partes'}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PARCEIRO A</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PARCEIRO B</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ COMISSÃO / REPRESENTAÇÃO COMERCIAL ════
  if (t === 'comissao') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Representação Comercial e Comissão · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">COMITENTE (Empresa):</div><p>${partyLine(pa,'COMITENTE')}</p></div>
      <div class="party"><div class="party-role">COMISSIONADO (Representante):</div><p>${partyLine(pb,'COMISSIONADO')}</p></div>
    </div>
    <p>As partes celebram o presente Contrato de Representação Comercial, nos termos da Lei nº 4.886/1965 e alterações:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. O COMISSIONADO fica autorizado a representar comercialmente o COMITENTE na venda de: <strong>${obj.desc}</strong></p>
      <p>1.2. Área de atuação: <strong>${obj.local || 'todo o território nacional'}</strong>.</p>
      <p>1.3. A representação vigorará ${vigText}, a partir de <strong>${obj.inicio}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Comissão</div><div class="clausula-body">
      <p>2.1. O COMISSIONADO receberá comissão de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}) ou equivalente a <strong>${val.forma}</strong> sobre as vendas realizadas.</p>
      <p>2.2. O pagamento das comissões ocorrerá <strong>${val.venc || 'mensalmente até o 10º dia do mês subsequente'}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      <p>2.3. As comissões são devidas no momento da efetivação do pagamento pelo cliente final ao COMITENTE.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações do Comissionado</div><div class="clausula-body">
      <p>3.1. O COMISSIONADO compromete-se a: (a) promover ativamente as vendas dos produtos/serviços do COMITENTE; (b) manter relacionamento ético com os clientes; (c) prestar contas regularmente ao COMITENTE; (d) não representar empresas concorrentes sem autorização prévia.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Rescisão</div><div class="clausula-body">
      <p>4.1. O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de <strong>${jur.rescisao}</strong>, nos termos do art. 34 da Lei nº 4.886/1965.</p>
      <p>4.2. Em caso de rescisão sem justa causa pelo COMITENTE, será devida indenização ao COMISSIONADO conforme legislação vigente.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Regido pela Lei nº 4.886/1965 e Código Civil. Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">COMITENTE</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">COMISSIONADO</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ VISTORIA DO IMÓVEL ════
  if (t === 'vistoria') {
    return `${cabecalho}
    <div class="doc-subtitle">Termo de Vistoria de Imóvel · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Identificação</div>
      <div class="party"><div class="party-role">LOCADOR / PROPRIETÁRIO:</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO / OCUPANTE:</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">1. Identificação do Imóvel</div><div class="clausula-body">
      <p>Imóvel localizado em: <strong>${obj.desc}</strong></p>
      <p>Data da vistoria: <strong>${obj.inicio}</strong> | Tipo: <strong>${obj.local || 'Residencial'}</strong></p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. Estado de Conservação Geral</div><div class="clausula-body">
      <p>As partes declaram que o imóvel foi vistoriado e se encontra nas seguintes condições:</p>
      <p><strong>Paredes e pintura:</strong> _____________________________________________</p>
      <p><strong>Pisos e revestimentos:</strong> _____________________________________________</p>
      <p><strong>Janelas e portas:</strong> _____________________________________________</p>
      <p><strong>Instalações elétricas:</strong> _____________________________________________</p>
      <p><strong>Instalações hidráulicas:</strong> _____________________________________________</p>
      <p><strong>Telhado / Laje:</strong> _____________________________________________</p>
      <p><strong>Área externa / Jardim:</strong> _____________________________________________</p>
      ${obj.entregaveis ? `<p><strong>Observações adicionais:</strong> ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Itens Entregues</div><div class="clausula-body">
      <p>Chaves: _______ cópias | Controle de portão: _______ | Outros: _____________</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">4. Declaração das Partes</div><div class="clausula-body">
      <p>As partes declaram que as informações acima correspondem ao estado real do imóvel na data da vistoria, comprometendo-se o LOCATÁRIO a devolvê-lo nas mesmas condições ao final da locação, salvo desgaste natural pelo uso.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">LOCADOR / PROPRIETÁRIO</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">LOCATÁRIO / OCUPANTE</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ NOTIFICAÇÃO DE DESOCUPAÇÃO ════
  if (t === 'notif_desocupacao') {
    return `${cabecalho}
    <div class="doc-subtitle">Notificação Extrajudicial de Desocupação · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Identificação</div>
      <div class="party"><div class="party-role">NOTIFICANTE (Proprietário/Locador):</div><p>${partyLine(pa,'NOTIFICANTE')}</p></div>
      <div class="party"><div class="party-role">NOTIFICADO (Locatário/Ocupante):</div><p>${partyLine(pb,'NOTIFICADO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Da Notificação</div><div class="clausula-body">
      <p>O NOTIFICANTE, por meio do presente instrumento, notifica formalmente o NOTIFICADO para que desocupe o imóvel situado em: <strong>${obj.desc}</strong>, no prazo de <strong>${jur.rescisao || '30 (trinta) dias'}</strong>, contados do recebimento desta notificação.</p>
      <p>Motivo da notificação: <strong>${obj.local || 'encerramento do contrato de locação'}</strong>.</p>
      ${obj.entregaveis ? `<p>Observações: ${obj.entregaveis}</p>` : ''}
      <p>Caso o imóvel não seja desocupado no prazo estipulado, o NOTIFICANTE adotará as medidas judiciais cabíveis, incluindo ação de despejo, com todos os ônus decorrentes ao NOTIFICADO, nos termos da Lei nº 8.245/1991.</p>
      <p>Esta notificação serve como prova formal do aviso prévio legalmente exigido.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">NOTIFICANTE</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">Ciente: ${pb.nome}</div><div class="sig-role">NOTIFICADO</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ACORDO DE INADIMPLÊNCIA ════
  if (t === 'acordo_inadimpl') {
    return `${cabecalho}
    <div class="doc-subtitle">Acordo de Regularização de Débito Locatício · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">LOCADOR (CREDOR):</div><p>${partyLine(pa,'LOCADOR')}</p></div>
      <div class="party"><div class="party-role">LOCATÁRIO (DEVEDOR):</div><p>${partyLine(pb,'LOCATÁRIO')}</p></div>
    </div>
    <p>As partes celebram o presente Acordo de Regularização, mediante as seguintes condições:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Débito</div><div class="clausula-body">
      <p>1.1. O LOCATÁRIO reconhece o débito de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), referente a: <strong>${obj.desc}</strong>.</p>
      <p>1.2. As partes concordam que o valor acima representa o total da dívida, incluindo aluguéis, encargos, multas e juros devidos até <strong>${obj.inicio}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Acordo de Pagamento</div><div class="clausula-body">
      <p>2.1. O LOCATÁRIO compromete-se a quitar o débito <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      <p>2.2. O LOCATÁRIO compromete-se ainda a manter os aluguéis futuros em dia, sob pena de rescisão imediata deste acordo.</p>
      <p>2.3. O descumprimento deste acordo ensejará a retomada imediata das medidas judiciais pelo LOCADOR, sem necessidade de nova notificação.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Quitação Condicionada</div><div class="clausula-body">
      <p>3.1. O LOCADOR concede ao LOCATÁRIO a quitação condicionada ao cumprimento integral deste acordo. O descumprimento de qualquer parcela tornará o acordo sem efeito, restaurando integralmente o débito original.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">LOCADOR</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">LOCATÁRIO</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ CARTA DE APRESENTAÇÃO ════
  if (t === 'carta_apres') {
    return `${cabecalho}
    <div class="doc-subtitle">${dateStr}</div>
    <div style="margin-bottom:24px;">
      <p><strong>${pa.nome}</strong>${pa.prof ? ' — ' + pa.prof : ''}</p>
      ${pa.end ? `<p>${pa.end}</p>` : ''}
      ${pa.tel ? `<p>Tel.: ${pa.tel}</p>` : ''}
      ${pa.email ? `<p>E-mail: ${pa.email}</p>` : ''}
    </div>
    <div style="margin-bottom:24px;">
      <p>A/C: <strong>${pb.nome || 'Responsável de Recursos Humanos'}</strong></p>
      ${pb.end ? `<p>${pb.end}</p>` : ''}
    </div>
    <p><strong>Assunto: ${obj.desc || 'Carta de Apresentação Profissional'}</strong></p><br>
    <div class="clausula"><div class="clausula-body">
      <p>Prezado(a) ${pb.nome || 'Senhor(a)'},</p>
      <p>Venho, por meio desta carta, apresentar-me como candidato(a) à oportunidade em sua empresa. Sou <strong>${pa.nome}</strong>, ${pa.prof ? pa.prof + ', ' : ''}com ${obj.local || 'experiência na área'}.</p>
      <p>${obj.obrig_a || 'Ao longo da minha trajetória profissional, desenvolvi competências que acredito serem relevantes para contribuir com os objetivos de sua organização. Tenho interesse genuíno em fazer parte de sua equipe e acredito que meu perfil se alinha aos valores e necessidades da empresa.'}</p>
      <p>${obj.obrig_b || 'Coloco-me à disposição para uma entrevista, quando poderemos conversar mais detalhadamente sobre como posso agregar valor à sua equipe.'}</p>
      <p>Agradeço a atenção dispensada e aguardo um retorno.</p>
    </div></div>
    <div style="margin-top:40px;">
      <p>Atenciosamente,</p><br>
      <div class="sig-line" style="max-width:300px;"></div>
      <p><strong>${pa.nome}</strong></p>
      ${pa.prof ? `<p>${pa.prof}</p>` : ''}
    </div>
    ${aviso}`;
  }

  // ════ CARTA DE DEMISSÃO ════
  if (t === 'carta_demissao') {
    return `${cabecalho}
    <div class="doc-subtitle">${dateStr}</div>
    <div style="margin-bottom:24px;">
      <p>De: <strong>${pa.nome}</strong>${pa.prof ? ' — ' + pa.prof : ''}</p>
      <p>Para: <strong>${pb.nome || 'Departamento de Recursos Humanos'}</strong></p>
    </div>
    <p><strong>Assunto: Pedido de Demissão</strong></p><br>
    <div class="clausula"><div class="clausula-body">
      <p>Prezado(a) ${pb.nome || 'Senhor(a)'},</p>
      <p>Venho, por meio desta carta, formalizar meu pedido de demissão do cargo de <strong>${pa.prof || 'cargo que ocupo'}</strong> nesta empresa, a partir desta data.</p>
      <p>${obj.desc || 'Esta decisão foi tomada após cuidadosa reflexão sobre minha trajetória profissional e objetivos de carreira. Agradeço imensamente pela oportunidade de crescimento e aprendizado proporcionados durante meu período na empresa.'}</p>
      <p>Comprometo-me a cumprir o aviso prévio de <strong>${jur.rescisao || '30 (trinta) dias'}</strong>, conforme previsto em contrato e na legislação trabalhista vigente, garantindo a plena transição das minhas responsabilidades.</p>
      <p>Agradeço a todos os colegas e lideranças pela convivência e peço que confirmem o recebimento desta carta.</p>
    </div></div>
    <div style="margin-top:40px;">
      <p>Respeitosamente,</p><br>
      <div class="sig-line" style="max-width:300px;"></div>
      <p><strong>${pa.nome}</strong></p>
      <p>${pa.doc ? 'CPF: ' + pa.doc : ''}</p>
      <p>${dateStr}</p>
    </div>
    <div style="margin-top:30px;padding:16px;border:1px solid #ddd;border-radius:4px;">
      <p><strong>Ciente:</strong></p><br>
      <div class="sig-line" style="max-width:300px;"></div>
      <p>${pb.nome || 'Representante da Empresa'}</p>
      <p>Data: ___/___/______</p>
    </div>
    ${aviso}`;
  }

  // ════ DECLARAÇÃO DE EXPERIÊNCIA ════
  if (t === 'decl_experiencia') {
    return `${cabecalho}
    <div class="doc-subtitle">${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Dados da Empresa Declarante</div>
      <div class="party"><div class="party-role">EMPRESA:</div><p>${partyLine(pa,'EMPRESA')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Declaração de Experiência Profissional</div><div class="clausula-body">
      <p>Declaramos, para os devidos fins, que <strong>${pb.nome}</strong>, portador(a) do CPF nº <strong>${pb.doc}</strong>, prestou serviços a esta empresa no cargo/função de <strong>${pb.prof || obj.desc}</strong>, pelo período de <strong>${obj.inicio}</strong> a <strong>${obj.fim !== 'indeterminado' ? obj.fim : 'atual'}</strong>.</p>
      <p>Durante o período mencionado, o(a) profissional demonstrou: <strong>${obj.obrig_b || 'competência técnica, comprometimento e responsabilidade no exercício de suas funções'}</strong>.</p>
      ${obj.entregaveis ? `<p>Atividades desenvolvidas: ${obj.entregaveis}</p>` : ''}
      <p>Esta declaração é fornecida a pedido do(a) interessado(a) para os fins que se fizerem necessários, sendo verdadeiras todas as informações aqui prestadas.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">Representante Legal</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ESTÁGIO ════
  if (t === 'estagio') {
    return `${cabecalho}
    <div class="doc-subtitle">Termo de Compromisso de Estágio · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">EMPRESA CONCEDENTE:</div><p>${partyLine(pa,'EMPRESA CONCEDENTE')}</p></div>
      <div class="party"><div class="party-role">ESTAGIÁRIO(A):</div><p>${partyLine(pb,'ESTAGIÁRIO')}</p></div>
    </div>
    <p>As partes celebram o presente Termo de Compromisso de Estágio, nos termos da Lei nº 11.788/2008 (Lei do Estágio), mediante as seguintes condições:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Estágio</div><div class="clausula-body">
      <p>1.1. A EMPRESA CONCEDENTE recebe o(a) ESTAGIÁRIO(A) para realização de estágio na área de: <strong>${obj.desc}</strong></p>
      <p>1.2. O estágio terá duração de <strong>${vigText}</strong>, com início em <strong>${obj.inicio}</strong> e término em <strong>${obj.fim}</strong>, conforme art. 11 da Lei nº 11.788/2008.</p>
      <p>1.3. Carga horária: <strong>${obj.local || '6 horas diárias, 30 horas semanais'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Bolsa-Auxílio</div><div class="clausula-body">
      <p>2.1. Será paga ao(à) ESTAGIÁRIO(A) bolsa-auxílio no valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, além de auxílio-transporte conforme legislação vigente.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações</div><div class="clausula-body">
      <p>3.1. A EMPRESA CONCEDENTE compromete-se a: oferecer atividades compatíveis com a área de formação do estagiário; designar supervisor responsável; garantir condições de segurança; conceder recesso de 30 dias a cada 12 meses.</p>
      <p>3.2. O(A) ESTAGIÁRIO(A) compromete-se a: cumprir a carga horária estabelecida; zelar pelo sigilo das informações da empresa; cumprir as normas internas da empresa.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>O presente estágio não gera vínculo empregatício, nos termos do art. 3º da Lei nº 11.788/2008. Foro: <strong>${jur.foro}</strong>.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">EMPRESA CONCEDENTE</div><div class="sig-doc">${pa.doc ? 'CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">ESTAGIÁRIO(A)</div><div class="sig-doc">${pb.doc ? 'CPF: ' + pb.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ NOTA SIMPLES DE SERVIÇO ════
  if (t === 'nota_servico') {
    return `${cabecalho}
    <div class="doc-subtitle">Nota de Prestação de Serviço · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Dados</div>
      <div class="party"><div class="party-role">PRESTADOR:</div><p>${partyLine(pa,'PRESTADOR')}</p></div>
      <div class="party"><div class="party-role">TOMADOR:</div><p>${partyLine(pb,'TOMADOR')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Descrição do Serviço</div><div class="clausula-body">
      <p><strong>Serviço prestado:</strong> ${obj.desc}</p>
      <p><strong>Data de execução:</strong> ${obj.inicio}</p>
      ${obj.local ? `<p><strong>Local:</strong> ${obj.local}</p>` : ''}
      ${obj.entregaveis ? `<p><strong>Detalhes:</strong> ${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">Valor</div><div class="clausula-body">
      <p><strong>Valor total: R$ ${val.total}</strong> (${valorExtenso(val.total)})</p>
      <p>Forma de pagamento: ${val.forma} | Vencimento: ${val.venc}</p>
      ${val.banco ? `<p>Dados para pagamento: ${val.banco}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-body">
      <p>Declaro ter prestado os serviços acima descritos e que as informações são verdadeiras.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PRESTADOR DE SERVIÇO</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">TOMADOR — Ciente</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ LGPD / PRIVACIDADE / TERMOS DE USO ════
  if (['lgpd_termo','politica_priv','termo_uso'].includes(t)) {
    const titulos = {
      lgpd_termo: 'Termo de Consentimento para Tratamento de Dados Pessoais',
      politica_priv: 'Política de Privacidade',
      termo_uso: 'Termos de Uso da Plataforma',
    };
    return `${cabecalho}
    <div class="doc-subtitle">${titulos[t]} · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Responsável pelo Tratamento</div>
      <div class="party"><div class="party-role">CONTROLADOR DOS DADOS:</div><p>${partyLine(pa,'EMPRESA/RESPONSÁVEL')}</p></div>
    </div>
    ${t === 'lgpd_termo' ? `
    <div class="clausula"><div class="clausula-title">1. Finalidade do Tratamento</div><div class="clausula-body">
      <p>O(A) CONTROLADOR(A) acima identificado(a) trata dados pessoais do titular para as seguintes finalidades: <strong>${obj.desc}</strong></p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. Dados Coletados</div><div class="clausula-body">
      <p>Serão coletados os seguintes dados: <strong>${obj.entregaveis || 'nome, e-mail, CPF e demais dados necessários para a prestação do serviço'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Direitos do Titular</div><div class="clausula-body">
      <p>Nos termos da Lei nº 13.709/2018 (LGPD), o titular tem direito a: (a) confirmação de tratamento; (b) acesso aos dados; (c) correção; (d) anonimização ou eliminação; (e) portabilidade; (f) informação sobre compartilhamento; (g) revogação do consentimento a qualquer tempo.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">4. Prazo de Conservação</div><div class="clausula-body">
      <p>Os dados serão mantidos pelo prazo de <strong>${vigText}</strong> ou pelo tempo necessário ao cumprimento das finalidades descritas, exceto quando houver obrigação legal de guarda por prazo superior.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">5. Consentimento</div><div class="clausula-body">
      <p>O titular declara ter lido e compreendido este termo, consentindo livremente com o tratamento de seus dados pessoais conforme descrito acima, nos termos do art. 8º da LGPD.</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome || 'TITULAR DOS DADOS'}</div><div class="sig-role">TITULAR</div><div class="sig-doc">${pb.doc ? 'CPF: ' + pb.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">CONTROLADOR</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
      </div>
    </div>` : `
    <div class="clausula"><div class="clausula-title">1. Sobre ${t === 'politica_priv' ? 'a Política de Privacidade' : 'os Termos de Uso'}</div><div class="clausula-body">
      <p>Este documento regula: <strong>${obj.desc}</strong></p>
      <p>Vigência: ${vigText} | Última atualização: ${dateStr}</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. ${t === 'politica_priv' ? 'Dados Coletados e Finalidade' : 'Uso da Plataforma'}</div><div class="clausula-body">
      <p>${obj.obrig_a || (t === 'politica_priv' ? 'Coletamos dados necessários para prestação dos serviços, conforme a Lei nº 13.709/2018 (LGPD).' : 'O uso da plataforma implica aceitação integral destes termos.')}</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Responsabilidades</div><div class="clausula-body">
      <p>${obj.obrig_b || 'As partes comprometem-se a respeitar a legislação aplicável e as disposições deste documento.'}</p>
      ${obj.entregaveis ? `<p>${obj.entregaveis}</p>` : ''}
    </div></div>
    <div class="clausula"><div class="clausula-title">4. Contato e Atualizações</div><div class="clausula-body">
      <p>Para dúvidas: <strong>${pa.email || 'contato a ser informado'}</strong>. Este documento pode ser atualizado a qualquer momento, com aviso prévio aos usuários.</p>
    </div></div>`}
    ${aviso}`;
  }

  // ════ NOTIFICAÇÃO EXTRAJUDICIAL ════
  if (t === 'notif_extra') {
    return `${cabecalho}
    <div class="doc-subtitle">Notificação Extrajudicial · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Identificação das Partes</div>
      <div class="party"><div class="party-role">NOTIFICANTE:</div><p>${partyLine(pa,'NOTIFICANTE')}</p></div>
      <div class="party"><div class="party-role">NOTIFICADO:</div><p>${partyLine(pb,'NOTIFICADO')}</p></div>
    </div>
    <div class="clausula"><div class="clausula-title">Da Notificação</div><div class="clausula-body">
      <p>O(A) NOTIFICANTE, por meio do presente instrumento, notifica formalmente o(a) NOTIFICADO(A) a respeito de: <strong>${obj.desc}</strong></p>
      <p>${obj.obrig_a || 'O NOTIFICADO deverá adotar as providências cabíveis no prazo de <strong>' + (jur.rescisao || '15 dias') + '</strong> a contar do recebimento desta notificação.'}</p>
      ${obj.entregaveis ? `<p>${obj.entregaveis}</p>` : ''}
      <p>O não atendimento desta notificação no prazo estipulado implicará a adoção das medidas legais cabíveis, incluindo as de ordem judicial, com todos os ônus decorrentes ao NOTIFICADO.</p>
      <p>Esta notificação serve como prova do conhecimento formal pelo NOTIFICADO sobre os fatos e exigências aqui descritos.</p>
      ${jur.extra ? `<p>${jur.extra}</p>` : ''}
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">NOTIFICANTE</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">Ciente: ${pb.nome}</div><div class="sig-role">NOTIFICADO</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ACORDO AMIGÁVEL ════
  if (t === 'acordo_amigavel') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento de Acordo Amigável entre Partes · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">PARTE A:</div><p>${partyLine(pa,'PARTE A')}</p></div>
      <div class="party"><div class="party-role">PARTE B:</div><p>${partyLine(pb,'PARTE B')}</p></div>
    </div>
    <p>As partes, de comum acordo e sem necessidade de intervenção judicial, celebram o presente instrumento de composição amigável:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto do Acordo</div><div class="clausula-body">
      <p>1.1. As partes acordam a resolução amigável relativa a: <strong>${obj.desc}</strong></p>
      <p>1.2. Ficam acordadas as seguintes obrigações: ${obj.obrig_a && obj.obrig_b ? `<br>— PARTE A: ${obj.obrig_a}<br>— PARTE B: ${obj.obrig_b}` : obj.entregaveis || 'conforme negociado entre as partes'}.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Pagamento</div><div class="clausula-body">
      <p>2.1. Fica acordado o pagamento de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), de forma <strong>${val.forma}</strong>, com vencimento <strong>${val.venc}</strong>, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
      <p>2.2. O descumprimento das obrigações acordadas acarretará multa de <strong>${val.multa}</strong> sobre o valor em atraso.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Da Quitação</div><div class="clausula-body">
      <p>3.1. O cumprimento integral deste acordo implica plena, geral e irrevogável quitação recíproca entre as partes, relativamente ao objeto aqui descrito, nada mais tendo a reclamar uma da outra a qualquer título.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">PARTE A</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">PARTE B</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ CONTRATO SOCIAL ════
  if (t === 'contrato_social') {
    return `${cabecalho}
    <div class="doc-subtitle">Contrato Social de Sociedade Limitada · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Sócios</div>
      <div class="party"><div class="party-role">SÓCIO ADMINISTRADOR:</div><p>${partyLine(pa,'SÓCIO ADMINISTRADOR')}</p></div>
      <div class="party"><div class="party-role">SÓCIO:</div><p>${partyLine(pb,'SÓCIO')}</p></div>
    </div>
    <p>Os sócios acima qualificados constituem, por este instrumento, uma Sociedade Limitada, regida pelo Código Civil (arts. 1.052 a 1.087), mediante as seguintes cláusulas:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Da Denominação e Sede</div><div class="clausula-body">
      <p>1.1. A sociedade será denominada <strong>${obj.desc}</strong>, com sede em <strong>${obj.local || 'endereço a ser registrado'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Do Objeto Social</div><div class="clausula-body">
      <p>2.1. A sociedade tem por objeto: <strong>${obj.obrig_a || obj.entregaveis || 'atividades a serem descritas conforme CNAE'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Do Capital Social</div><div class="clausula-body">
      <p>3.1. O capital social é de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), dividido entre os sócios:</p>
      <p>— ${pa.nome}: R$ ____________ (_____%)</p>
      <p>— ${pb.nome}: R$ ____________ (_____%)</p>
      <p>3.2. O capital social está totalmente subscrito e integralizado nesta data.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Da Administração</div><div class="clausula-body">
      <p>4.1. A sociedade será administrada pelo(a) sócio(a) <strong>${pa.nome}</strong>, que terá poderes para praticar todos os atos de gestão necessários ao funcionamento da empresa.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula V — Da Distribuição de Lucros</div><div class="clausula-body">
      <p>5.1. Os lucros e resultados serão distribuídos proporcionalmente à participação de cada sócio no capital social, após apuração contábil.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula VI — Da Retirada e Exclusão de Sócios</div><div class="clausula-body">
      <p>6.1. Qualquer sócio poderá retirar-se da sociedade mediante aviso prévio de <strong>${jur.rescisao}</strong>, apurando-se seus haveres na forma da lei.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Regido pelo Código Civil. Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">SÓCIO ADMINISTRADOR</div><div class="sig-doc">${pa.doc ? 'CPF: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">SÓCIO</div><div class="sig-doc">${pb.doc ? 'CPF: ' + pb.doc : ''}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ACORDO ENTRE SÓCIOS ════
  if (t === 'acordo_socios') {
    return `${cabecalho}
    <div class="doc-subtitle">Acordo de Sócios · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Sócios</div>
      <div class="party"><div class="party-role">SÓCIO A:</div><p>${partyLine(pa,'SÓCIO A')}</p></div>
      <div class="party"><div class="party-role">SÓCIO B:</div><p>${partyLine(pb,'SÓCIO B')}</p></div>
    </div>
    <p>Os sócios celebram o presente Acordo para regular direitos e obrigações societárias:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
      <p>1.1. Este acordo regula: <strong>${obj.desc}</strong></p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Das Quotas e Participações</div><div class="clausula-body">
      <p>2.1. As quotas sociais são distribuídas: SÓCIO A: _____% | SÓCIO B: _____%.</p>
      <p>2.2. Qualquer transferência de quotas requer aprovação prévia e por escrito do outro sócio.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações dos Sócios</div><div class="clausula-body">
      <p>3.1. SÓCIO A: ${obj.obrig_a || 'responsável pela área de gestão e administração'}.</p>
      <p>3.2. SÓCIO B: ${obj.obrig_b || 'responsável pela área operacional e comercial'}.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Das Decisões</div><div class="clausula-body">
      <p>4.1. Decisões estratégicas exigem aprovação de ambos os sócios. Decisões operacionais podem ser tomadas individualmente dentro das respectivas áreas de responsabilidade.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula V — Da Saída de Sócio</div><div class="clausula-body">
      <p>5.1. Em caso de saída, o sócio retirante deverá oferecer suas quotas primeiramente ao(s) outro(s) sócio(s), pelo valor patrimonial apurado. Prazo de exercício do direito de preferência: ${jur.rescisao}.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">SÓCIO A</div><div class="sig-doc">${pa.doc ? 'CPF: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">SÓCIO B</div><div class="sig-doc">${pb.doc ? 'CPF: ' + pb.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ TERMO DE INVESTIMENTO ════
  if (t === 'termo_invest') {
    return `${cabecalho}
    <div class="doc-subtitle">Instrumento Particular de Investimento · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Qualificação das Partes</div>
      <div class="party"><div class="party-role">INVESTIDOR:</div><p>${partyLine(pa,'INVESTIDOR')}</p></div>
      <div class="party"><div class="party-role">EMPRESA INVESTIDA:</div><p>${partyLine(pb,'EMPRESA')}</p></div>
    </div>
    <p>As partes celebram o presente Termo de Investimento nos seguintes termos:</p>
    <div class="clausula"><div class="clausula-title">Cláusula I — Do Investimento</div><div class="clausula-body">
      <p>1.1. O INVESTIDOR aporta na EMPRESA o valor de <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), destinado a: <strong>${obj.desc}</strong></p>
      <p>1.2. O aporte será realizado ${val.forma}, mediante: <strong>${val.banco || 'a definir entre as partes'}</strong>.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula II — Da Contrapartida</div><div class="clausula-body">
      <p>2.1. Em contrapartida ao investimento, a EMPRESA oferece: <strong>${obj.obrig_b || 'participação societária / retorno financeiro conforme acordado'}</strong>.</p>
      <p>2.2. A forma de retorno do investimento: ${val.cond || 'conforme negociação entre as partes'}.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula III — Das Obrigações da Empresa</div><div class="clausula-body">
      <p>3.1. A EMPRESA compromete-se a: (a) utilizar os recursos exclusivamente para as finalidades descritas; (b) prestar contas regularmente ao INVESTIDOR; (c) não alienar ativos estratégicos sem anuência do INVESTIDOR.</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">Cláusula IV — Do Prazo</div><div class="clausula-body">
      <p>4.1. Este instrumento vigorará ${vigText}, podendo ser renovado por acordo entre as partes.</p>
    </div></div>
    ${extraClauses}
    <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
      <p>Foro: <strong>${jur.foro}</strong>.${jur.extra ? ' ' + jur.extra : ''}</p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">INVESTIDOR</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">EMPRESA INVESTIDA</div><div class="sig-doc">${pb.doc ? 'CNPJ: ' + pb.doc : ''}</div></div>
      </div>
      <div class="witnesses-block"><div class="witnesses-title">Testemunhas</div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
      </div>
    </div>${aviso}`;
  }

  // ════ ABERTURA DE EMPRESA ════
  if (t === 'abertura_empresa') {
    return `${cabecalho}
    <div class="doc-subtitle">Requerimento de Constituição de Empresa · ${dateStr}</div>
    <div class="parties-block">
      <div class="parties-title">Requerente</div>
      <div class="party"><div class="party-role">SÓCIO / TITULAR:</div><p>${partyLine(pa,'REQUERENTE')}</p></div>
      ${pb.nome && pb.nome !== '—' ? `<div class="party"><div class="party-role">SÓCIO 2:</div><p>${partyLine(pb,'SÓCIO 2')}</p></div>` : ''}
    </div>
    <div class="clausula"><div class="clausula-title">1. Dados da Empresa a Constituir</div><div class="clausula-body">
      <p><strong>Nome Empresarial:</strong> ${obj.desc}</p>
      <p><strong>Tipo jurídico:</strong> ${obj.local || 'Sociedade Limitada (LTDA) / MEI / ME'}</p>
      <p><strong>Endereço da sede:</strong> ${pa.end || 'a preencher'}</p>
      <p><strong>Capital social:</strong> R$ ${val.total} (${valorExtenso(val.total)})</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">2. Objeto Social (Atividade)</div><div class="clausula-body">
      <p>${obj.obrig_a || obj.entregaveis || 'Descrição das atividades a serem exercidas — consulte o CNAE correspondente.'}</p>
    </div></div>
    <div class="clausula"><div class="clausula-title">3. Administração</div><div class="clausula-body">
      <p>O(A) administrador(a) da empresa será: <strong>${pa.nome}</strong>, responsável pela representação legal e gestão do negócio.</p>
    </div></div>
    <div class="clausula"><div class="clausula-body">
      <p><em>⚠️ Este documento é um modelo de referência para organização das informações. Para constituição legal da empresa, registre o contrato social na Junta Comercial do seu estado ou utilize o Portal do Empreendedor (MEI/ME).</em></p>
    </div></div>
    <div class="signatures-block">
      <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
      <div class="sig-grid">
        <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">REQUERENTE / SÓCIO</div><div class="sig-doc">${pa.doc ? 'CPF: ' + pa.doc : ''}</div></div>
        ${pb.nome && pb.nome !== '—' ? `<div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">SÓCIO 2</div><div class="sig-doc">${pb.doc ? 'CPF: ' + pb.doc : ''}</div></div>` : '<div class="sig-item"></div>'}
      </div>
    </div>${aviso}`;
  }

  // ════ TEMPLATE GENÉRICO MELHORADO ════
  return `${cabecalho}
  <div class="doc-subtitle">Instrumento Particular · ${dateStr}</div>
  <div class="parties-block">
    <div class="parties-title">Qualificação das Partes</div>
    <div class="party"><div class="party-role">${roleA}:</div><p>${partyLine(pa,roleA)}</p></div>
    <div class="party"><div class="party-role">${roleB}:</div><p>${partyLine(pb,roleB)}</p></div>
  </div>
  <p>As partes acima qualificadas têm entre si justo e acordado o presente instrumento, que se regerá pelas seguintes cláusulas e condições:</p>

  <div class="clausula"><div class="clausula-title">Cláusula I — Do Objeto</div><div class="clausula-body">
    <p>1.1. O presente instrumento tem por objeto: <strong>${obj.desc}</strong></p>
    ${obj.entregaveis ? `<p>1.2. Escopo: ${obj.entregaveis}</p>` : ''}
    <p>${obj.entregaveis ? '1.3.' : '1.2.'} Prazo: ${vigText}, local: <strong>${obj.local || 'a ser definido'}</strong>.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula II — Das Obrigações</div><div class="clausula-body">
    <p>2.1. Compete ao <strong>${roleA}</strong>: ${obj.obrig_a}.</p>
    <p>2.2. Compete ao <strong>${roleB}</strong>: ${obj.obrig_b}.</p>
    <p>2.3. Ambas as partes comprometem-se a agir com boa-fé e transparência.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula III — Do Valor e Pagamento</div><div class="clausula-body">
    <p>3.1. Valor: <strong>R$ ${val.total}</strong> (${valorExtenso(val.total)}), pago <strong>${val.forma}</strong>, vencimento: <strong>${val.venc}</strong>.</p>
    <p>3.2. Pagamento via: <strong>${val.banco || 'a ser informado'}</strong>.</p>
    ${val.reajuste ? `<p>3.3. Reajuste anual: <strong>${val.reajuste}</strong>.</p>` : ''}
    <p>${val.reajuste ? '3.4.' : '3.3.'} Multa por atraso: <strong>${val.multa}</strong> + juros de <strong>${val.juros}</strong>.</p>
    ${val.cond ? `<p>Condições especiais: ${val.cond}.</p>` : ''}
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula IV — Da Vigência e Rescisão</div><div class="clausula-body">
    <p>4.1. Vigência: ${vigText}.</p>
    <p>4.2. Rescisão mediante aviso prévio de <strong>${jur.rescisao}</strong>.</p>
    <p>4.3. Rescisão imotivada: multa de <strong>${jur.multa_resc}</strong>.</p>
  </div></div>

  <div class="clausula"><div class="clausula-title">Cláusula V — Da Responsabilidade</div><div class="clausula-body">
    <p>5.1. As partes respondem pelos danos causados por ação ou omissão culposa ou dolosa, nos termos do art. 186 do Código Civil.</p>
    <p>5.2. Força maior e caso fortuito excluem a responsabilidade, nos termos do art. 393 do Código Civil.</p>
  </div></div>

  ${extraClauses}

  <div class="clausula"><div class="clausula-title">Cláusula ${roman[finalClauseN]} — Das Disposições Gerais</div><div class="clausula-body">
    <p>${finalClauseN}.1. Regido pelo Código Civil (Lei nº 10.406/2002).</p>
    <p>${finalClauseN}.2. Alterações somente por Termo Aditivo escrito.</p>
    ${jur.extra ? `<p>${finalClauseN}.3. ${jur.extra}</p>` : ''}
    <p>Foro: <strong>${jur.foro}</strong>, resolução <strong>${jur.resolucao}</strong>.</p>
  </div></div>

  <div class="signatures-block">
    <div class="signatures-title">${jur.local ? jur.local + ', ' + dateStr : dateStr}, ${dateStr}</div>
    <div class="sig-grid">
      <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pa.nome}</div><div class="sig-role">${roleA}</div><div class="sig-doc">${pa.doc ? 'CPF/CNPJ: ' + pa.doc : ''}</div></div>
      <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${pb.nome}</div><div class="sig-role">${roleB}</div><div class="sig-doc">${pb.doc ? 'CPF/CNPJ: ' + pb.doc : ''}</div></div>
    </div>
    <div class="witnesses-block">
      <div class="witnesses-title">Testemunhas</div>
      <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t1.nome}</div><div class="sig-doc">${t1.doc ? 'CPF: ' + t1.doc : ''}</div></div>
      <div class="sig-item"><div class="sig-line"></div><div class="sig-name">${t2.nome}</div><div class="sig-doc">${t2.doc ? 'CPF: ' + t2.doc : ''}</div></div>
    </div>
  </div>
  ${aviso}`;
}

// ════════════════════════════════════════════════════════════════
//  EDIÇÃO DE DOCUMENTO
// ════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════
//  EDIÇÃO INLINE — Estilo Word
// ════════════════════════════════════════════════════════════════

