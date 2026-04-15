// ══════════════════════════════════════════════════════════════
//  documentTypes.js — Engine central do sistema DocFácil
//  Cada documento define: id, title, category, fields, template
//  Para adicionar um novo tipo: basta inserir um novo objeto.
//  O sistema suporta 100+ documentos sem alterar o core.
// ══════════════════════════════════════════════════════════════

// ── Categorias ──────────────────────────────────────────────
export const CATEGORIES = {
  contratos:   { label: '📜 Contratos',     emoji: '📜' },
  imobiliario: { label: '🏠 Imobiliário',   emoji: '🏠' },
  trabalho:    { label: '💼 Trabalho',      emoji: '💼' },
  declaracoes: { label: '🧍 Declarações',   emoji: '🧍' },
  financeiro:  { label: '💰 Financeiro',    emoji: '💰' },
  juridico:    { label: '⚖️ Jurídico',      emoji: '⚖️' },
  empresarial: { label: '🏢 Empresarial',   emoji: '🏢' },
  extras:      { label: '🤖 IA',            emoji: '🤖' },
}

// ── Tipos de campo suportados ────────────────────────────────
// text | textarea | date | select | money | toggle | hidden

// ── Cláusulas opcionais (step 5) ────────────────────────────
export const CLAUSES = [
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
]

// ── Schema de documento ──────────────────────────────────────
// steps: quais etapas ficam ativas [1=tipo,2=partes,3=objeto,4=valor,5=cláusulas,6=jurídico]
// parteB: boolean
// testemunhas: boolean
// labels: { parteA, parteB, step2title }
// fields.step2Extra / step3 / step4 / step6Extra
// hints: { desc, obrigA, obrigB }

export const DOC_TYPES = {

  // ══════════════════════════════════════
  //  CONTRATOS
  // ══════════════════════════════════════

  servico: {
    id: 'servico', emoji: '🛠️',
    name: 'Prestação de Serviços',
    desc: 'Contratação de serviços profissionais',
    category: 'contratos',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Contratante', parteB:'Contratado', step2title:'Contratante e Contratado' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Descrição dos Serviços *',      type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Entregáveis / Escopo',          type:'textarea' },
        { id:'obj_local',       label:'Local de Execução / Foro',      type:'text' },
        { id:'obj_inicio',      label:'Data de Início',                type:'date' },
        { id:'obj_fim',         label:'Data de Término',               type:'date' },
        { id:'obj_obrig_a',     label:'Obrigações do Contratante',     type:'textarea' },
        { id:'obj_obrig_b',     label:'Obrigações do Contratado',      type:'textarea' },
      ],
      step4: [
        { id:'val_total',    label:'Valor Total (R$) *', type:'money', required:true },
        { id:'val_forma',    label:'Forma de Pagamento', type:'select',
          options:['à vista','parcelado','mensalmente','por entrega'] },
        { id:'val_venc',     label:'Vencimento',         type:'text' },
        { id:'val_banco',    label:'PIX / Dados Bancários', type:'text' },
        { id:'val_multa',    label:'Multa por Atraso',   type:'select',
          options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros',    label:'Juros de Mora',      type:'select',
          options:['1% ao mês','0,5% ao mês','2% ao mês','Taxa SELIC'] },
        { id:'val_reajuste', label:'Reajuste (índice)',  type:'select',
          options:['Sem reajuste','IGPM','IPCA','INPC'] },
        { id:'val_cond',     label:'Condições Especiais', type:'textarea' },
      ],
      step6Extra: [
        { id:'jur_rescisao',   label:'Aviso Prévio para Rescisão', type:'select',
          options:['30 dias','15 dias','60 dias','90 dias'] },
        { id:'jur_multa_resc', label:'Multa por Rescisão',         type:'select',
          options:['10% sobre o valor total do contrato','20% sobre o valor total do contrato','equivalente a 1 (um) mês de contrato','sem multa rescisória'] },
      ],
    },
    hints: {
      desc:   'Ex: Desenvolvimento de site institucional com até 10 páginas, painel administrativo e integração com redes sociais',
      obrigA: 'Ex: Efetuar os pagamentos nos prazos acordados e fornecer as informações e materiais necessários',
      obrigB: 'Ex: Executar os serviços com qualidade e nos prazos acordados, manter o contratante informado',
    },
  },

  freelancer: {
    id: 'freelancer', emoji: '💻',
    name: 'Contrato de Freelancer',
    desc: 'Prestação de serviços freelance',
    category: 'contratos',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Contratante', parteB:'Freelancer', step2title:'Contratante e Freelancer' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Descrição do Projeto *', type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Entregáveis',            type:'textarea' },
        { id:'obj_local',       label:'Local / Foro',           type:'text' },
        { id:'obj_inicio',      label:'Data de Início',         type:'date' },
        { id:'obj_fim',         label:'Data de Entrega',        type:'date' },
        { id:'obj_obrig_a',     label:'Obrigações do Contratante', type:'textarea' },
        { id:'obj_obrig_b',     label:'Obrigações do Freelancer',  type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor do Projeto (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',      type:'select',
          options:['à vista','50% início + 50% entrega','parcelado','por milestone'] },
        { id:'val_venc',  label:'Vencimento',              type:'text' },
        { id:'val_banco', label:'PIX / Dados Bancários',   type:'text' },
        { id:'val_multa', label:'Multa por Atraso',        type:'select',
          options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros', label:'Juros de Mora',           type:'select',
          options:['1% ao mês','0,5% ao mês','2% ao mês'] },
        { id:'val_cond',  label:'Condições Especiais',     type:'textarea' },
      ],
      step6Extra: [
        { id:'jur_rescisao',   label:'Aviso Prévio para Rescisão', type:'select',
          options:['30 dias','15 dias','60 dias'] },
        { id:'jur_multa_resc', label:'Multa por Rescisão',         type:'select',
          options:['10% sobre o valor total do contrato','20% sobre o valor total do contrato','sem multa rescisória'] },
      ],
    },
    hints: {
      desc:   'Ex: Criação de identidade visual completa (logo, paleta de cores, tipografia e manual de marca)',
      obrigA: 'Ex: Pagar os honorários no prazo, fornecer briefing completo e aprovar revisões em até 5 dias úteis',
      obrigB: 'Ex: Entregar os arquivos nos formatos acordados, realizar até 3 rodadas de revisão',
    },
  },

  trabalho_pj: {
    id: 'trabalho_pj', emoji: '👔',
    name: 'Trabalho PJ / Autônomo',
    desc: 'Contrato de trabalho pessoa jurídica',
    category: 'contratos',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Contratante', parteB:'Contratado PJ', step2title:'Empresa e Profissional PJ' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Descrição dos Serviços *',      type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Escopo / Relatórios Previstos', type:'textarea' },
        { id:'obj_local',       label:'Local / Foro',                  type:'text' },
        { id:'obj_inicio',      label:'Início do Contrato',            type:'date' },
        { id:'obj_fim',         label:'Término do Contrato',           type:'date' },
        { id:'obj_obrig_a',     label:'Obrigações do Contratante',     type:'textarea' },
        { id:'obj_obrig_b',     label:'Obrigações do Contratado PJ',   type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor Mensal / Total (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',          type:'select',
          options:['mensalmente contra NF','à vista contra NF','parcelado'] },
        { id:'val_venc',  label:'Vencimento da NF',            type:'text' },
        { id:'val_banco', label:'PIX / Dados Bancários',       type:'text' },
        { id:'val_multa', label:'Multa por Atraso',            type:'select',
          options:['2%','1%','3%','5%'] },
        { id:'val_juros', label:'Juros de Mora',               type:'select',
          options:['1% ao mês','0,5% ao mês','2% ao mês'] },
      ],
      step6Extra: [
        { id:'jur_rescisao',   label:'Aviso Prévio',   type:'select', options:['30 dias','15 dias','60 dias'] },
        { id:'jur_multa_resc', label:'Multa por Rescisão', type:'select',
          options:['10% sobre o valor total do contrato','sem multa rescisória'] },
      ],
    },
    hints: {
      desc:   'Ex: Consultoria em gestão financeira, análise de balanços e relatórios mensais',
      obrigA: 'Ex: Efetuar o pagamento da NF no prazo, fornecer acesso às informações necessárias',
      obrigB: 'Ex: Emitir NF, cumprir os prazos, manter sigilo e pagar seus próprios impostos',
    },
  },

  compravenda: {
    id: 'compravenda', emoji: '🤝',
    name: 'Compra e Venda',
    desc: 'Contrato de compra e venda de bens',
    category: 'contratos',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Vendedor', parteB:'Comprador', step2title:'Vendedor e Comprador' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Descrição do Bem *',         type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Características Adicionais', type:'textarea' },
        { id:'obj_local',       label:'Local de Entrega / Foro',    type:'text' },
        { id:'obj_inicio',      label:'Data do Contrato',           type:'date' },
        { id:'obj_fim',         label:'Data de Entrega do Bem',     type:'date' },
        { id:'obj_obrig_a',     label:'Obrigações do Vendedor',     type:'textarea' },
        { id:'obj_obrig_b',     label:'Obrigações do Comprador',    type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Preço de Venda (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',    type:'select',
          options:['à vista','parcelado','financiado','permuta'] },
        { id:'val_banco', label:'PIX / Dados Bancários', type:'text' },
        { id:'val_multa', label:'Multa por Atraso',      type:'select', options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros', label:'Juros de Mora',         type:'select', options:['1% ao mês','0,5% ao mês','2% ao mês'] },
        { id:'val_cond',  label:'Condições Especiais',   type:'textarea' },
      ],
    },
    hints: {
      desc:   'Ex: Veículo Fiat Uno 2018, placa ABC-1234. OU: Lote 15, Quadra 8, Jardim das Flores',
      obrigA: 'Ex: Entregar o bem livre de dívidas, transferir a propriedade e fornecer todos os documentos',
      obrigB: 'Ex: Efetuar o pagamento conforme acordado e receber o bem nas condições descritas',
    },
  },

  parceria: {
    id: 'parceria', emoji: '💼',
    name: 'Parceria Comercial',
    desc: 'Acordo de parceria entre empresas',
    category: 'contratos',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Parceiro A', parteB:'Parceiro B', step2title:'Parceiros' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Objeto da Parceria *',              type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Metas e Escopo',                    type:'textarea' },
        { id:'obj_local',       label:'Local de Operação / Foro',          type:'text' },
        { id:'obj_inicio',      label:'Início da Parceria',                type:'date' },
        { id:'obj_fim',         label:'Término (vazio = indeterminado)',   type:'date' },
        { id:'obj_obrig_a',     label:'Responsabilidades do Parceiro A',   type:'textarea' },
        { id:'obj_obrig_b',     label:'Responsabilidades do Parceiro B',   type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor / Remuneração (R$)', type:'money' },
        { id:'val_forma', label:'Divisão / Forma',          type:'text' },
        { id:'val_venc',  label:'Periodicidade',            type:'text' },
        { id:'val_banco', label:'PIX / Dados Bancários',    type:'text' },
        { id:'val_cond',  label:'Condições Especiais',      type:'textarea' },
      ],
      step6Extra: [
        { id:'jur_rescisao',   label:'Aviso Prévio para Encerramento', type:'select', options:['30 dias','15 dias','60 dias','90 dias'] },
        { id:'jur_multa_resc', label:'Multa por Rescisão Imotivada',   type:'select',
          options:['10% sobre o valor total do contrato','20% sobre o valor total do contrato','sem multa rescisória'] },
      ],
    },
    hints: {
      desc:   'Ex: Parceria para operação de loja de cosméticos na cidade de Foz do Iguaçu/PR',
      obrigA: 'Ex: Fornecer capital inicial, espaço físico e gestão administrativa',
      obrigB: 'Ex: Realizar as vendas, atender os clientes e executar as operações diárias',
    },
  },

  nda: {
    id: 'nda', emoji: '🔒',
    name: 'Confidencialidade (NDA)',
    desc: 'Acordo de não-divulgação',
    category: 'contratos',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Parte Divulgante', parteB:'Parte Receptora', step2title:'Partes do Acordo' },
    fields: {
      step3: [
        { id:'obj_desc',   label:'Informações Confidenciais Abrangidas *', type:'textarea', required:true },
        { id:'obj_local',  label:'Cidade / Foro',                          type:'text' },
        { id:'obj_inicio', label:'Início da Vigência',                     type:'date' },
        { id:'obj_fim',    label:'Término da Vigência',                    type:'date' },
        { id:'obj_obrig_a', label:'Obrigações da Parte Divulgante', type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações da Parte Receptora',  type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Multa por Descumprimento (R$)', type:'money' },
      ],
    },
    hints: {
      desc:   'Ex: Projeto XYZ — código-fonte, base de clientes, estratégias de marketing e dados financeiros',
      obrigA: 'Ex: Compartilhar apenas as informações necessárias para avaliação da parceria',
      obrigB: 'Ex: Manter sigilo absoluto e utilizar as informações apenas para avaliação da parceria',
    },
  },

  comissao: {
    id: 'comissao', emoji: '💰',
    name: 'Contrato de Comissão',
    desc: 'Acordo de comissão e vendas',
    category: 'contratos',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Comitente (Empresa)', parteB:'Comissionado (Representante)', step2title:'Comitente e Comissionado' },
    fields: {
      step3: [
        { id:'obj_desc',   label:'Produto / Serviço a Ser Representado *', type:'textarea', required:true },
        { id:'obj_local',  label:'Área de Atuação / Território',           type:'text' },
        { id:'obj_inicio', label:'Início da Representação',                type:'date' },
        { id:'obj_fim',    label:'Término',                                type:'date' },
        { id:'obj_obrig_a', label:'Obrigações do Comitente',     type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações do Comissionado',  type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor / Percentual de Comissão *', type:'text', required:true },
        { id:'val_forma', label:'Base de Cálculo',                  type:'text' },
        { id:'val_venc',  label:'Prazo para Pagamento',             type:'text' },
        { id:'val_banco', label:'PIX / Dados Bancários',            type:'text' },
      ],
      step6Extra: [
        { id:'jur_rescisao', label:'Aviso Prévio (Lei 4.886/65)', type:'select', options:['30 dias','60 dias','90 dias'] },
      ],
    },
    hints: {
      desc:   'Ex: Venda de planos de internet corporativa da empresa XYZ Telecom na região sul do Brasil',
      obrigA: 'Ex: Fornecer materiais de vendas, treinamento e pagar as comissões no prazo',
      obrigB: 'Ex: Prospectar clientes ativamente e não representar concorrentes',
    },
  },

  influenciador: {
    id: 'influenciador', emoji: '📱',
    name: 'Contrato de Influenciador',
    desc: 'Parceria com influenciador digital',
    category: 'contratos',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Marca / Empresa', parteB:'Influenciador Digital', step2title:'Marca e Influenciador' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Produto / Serviço e Entregas *',             type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Entregas (posts, reels, stories, quantidade)', type:'textarea' },
        { id:'obj_local',       label:'Plataformas / Foro',                         type:'text' },
        { id:'obj_inicio',      label:'Início da Parceria',                         type:'date' },
        { id:'obj_fim',         label:'Término da Parceria',                        type:'date' },
        { id:'obj_obrig_a',     label:'Obrigações da Marca',                        type:'textarea' },
        { id:'obj_obrig_b',     label:'Obrigações do Influenciador',               type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor da Parceria (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',        type:'select',
          options:['à vista','por publicação','mensalmente','parcelado'] },
        { id:'val_venc',  label:'Vencimento',                type:'text' },
        { id:'val_banco', label:'PIX / Dados Bancários',     type:'text' },
        { id:'val_cond',  label:'Condições Especiais',       type:'textarea' },
      ],
    },
    hints: {
      desc:   'Ex: 4 posts no Instagram e 2 Reels por mês divulgando a marca X, com hashtags e marcação',
      obrigA: 'Ex: Fornecer produtos, briefing criativo e aprovar os conteúdos antes da publicação',
      obrigB: 'Ex: Criar conteúdo autêntico, publicar nas datas acordadas e informar métricas mensalmente',
    },
  },

  autonomo: {
    id: 'autonomo', emoji: '🔧',
    name: 'Acordo de Autônomo',
    desc: 'Prestação de serviços autônomo',
    category: 'contratos',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Contratante', parteB:'Autônomo', step2title:'Contratante e Autônomo' },
    fields: {
      step3: [
        { id:'obj_desc',    label:'Descrição dos Serviços *',   type:'textarea', required:true },
        { id:'obj_local',   label:'Local de Execução / Foro',   type:'text' },
        { id:'obj_inicio',  label:'Data de Início',             type:'date' },
        { id:'obj_fim',     label:'Data de Conclusão',          type:'date' },
        { id:'obj_obrig_a', label:'Obrigações do Contratante',  type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações do Autônomo',     type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor dos Serviços (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',         type:'select',
          options:['à vista','após conclusão','parcelado'] },
        { id:'val_venc',  label:'Vencimento',                 type:'text' },
        { id:'val_banco', label:'PIX / Dados Bancários',      type:'text' },
        { id:'val_multa', label:'Multa por Atraso',           type:'select', options:['2%','1%','3%','5%'] },
        { id:'val_juros', label:'Juros de Mora',              type:'select', options:['1% ao mês','0,5% ao mês','2% ao mês'] },
      ],
    },
    hints: {
      desc:   'Ex: Serviços de eletricidade residencial, instalação de tomadas e quadro de distribuição',
      obrigA: 'Ex: Efetuar o pagamento após conclusão e fornecer os materiais necessários',
      obrigB: 'Ex: Executar os serviços com qualidade, usar EPI adequado',
    },
  },

  plano_parceria: {
    id: 'plano_parceria', emoji: '📊',
    name: 'Plano de Parceria',
    desc: 'Plano detalhado de parceria',
    category: 'contratos',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Parceiro A', parteB:'Parceiro B', step2title:'Parceiros' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Objeto / Produto da Parceria *', type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Metas e Métricas',               type:'textarea' },
        { id:'obj_local',       label:'Local / Foro',                   type:'text' },
        { id:'obj_inicio',      label:'Início',                         type:'date' },
        { id:'obj_obrig_a',     label:'Responsabilidades do Parceiro A', type:'textarea' },
        { id:'obj_obrig_b',     label:'Responsabilidades do Parceiro B', type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor da Parceria (R$)', type:'money' },
        { id:'val_forma', label:'Divisão de Resultados',  type:'text' },
        { id:'val_venc',  label:'Periodicidade',          type:'text' },
        { id:'val_banco', label:'PIX / Dados Bancários',  type:'text' },
        { id:'val_cond',  label:'Condições Especiais',    type:'textarea' },
      ],
      step6Extra: [
        { id:'jur_rescisao',   label:'Aviso Prévio',      type:'select', options:['30 dias','60 dias','90 dias'] },
        { id:'jur_multa_resc', label:'Multa por Rescisão', type:'select',
          options:['10% sobre o valor total do contrato','sem multa rescisória'] },
      ],
    },
    hints: {
      desc:   'Ex: Parceria para desenvolvimento de software de gestão para pequenas empresas',
      obrigA: 'Ex: Desenvolver o produto, fornecer suporte técnico e realizar atualizações',
      obrigB: 'Ex: Prospecção de clientes, vendas e relacionamento comercial',
    },
  },

  // ══════════════════════════════════════
  //  IMOBILIÁRIO
  // ══════════════════════════════════════

  aluguel_res: {
    id: 'aluguel_res', emoji: '🏠',
    name: 'Aluguel Residencial',
    desc: 'Locação de imóvel residencial',
    category: 'imobiliario',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Locador', parteB:'Locatário', step2title:'Locador e Locatário' },
    fields: {
      step3: [
        { id:'obj_desc',    label:'Descrição do Imóvel *',         type:'textarea', required:true },
        { id:'obj_local',   label:'Cidade / Foro',                 type:'text' },
        { id:'obj_inicio',  label:'Início da Locação',             type:'date' },
        { id:'obj_fim',     label:'Fim da Locação',                type:'date' },
        { id:'obj_obrig_a', label:'Obrigações do Locador',         type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações do Locatário',       type:'textarea' },
      ],
      step4: [
        { id:'val_total',    label:'Valor do Aluguel Mensal (R$) *', type:'money', required:true },
        { id:'val_forma',    label:'Frequência',                     type:'select', options:['mensalmente','à vista','quinzenalmente'] },
        { id:'val_venc',     label:'Dia de Vencimento',              type:'text' },
        { id:'val_banco',    label:'PIX / Dados Bancários',          type:'text' },
        { id:'val_multa',    label:'Multa por Atraso',               type:'select', options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros',    label:'Juros de Mora',                  type:'select', options:['1% ao mês','0,5% ao mês','2% ao mês'] },
        { id:'val_reajuste', label:'Índice de Reajuste',             type:'select', options:['Sem reajuste','IGPM','IPCA','INPC'] },
      ],
    },
    hints: {
      desc:   'Ex: Apartamento 2 quartos, Rua das Flores 123, Apto 45, Bairro Centro — Cidade/UF, CEP 00000-000',
      obrigA: 'Ex: Entregar o imóvel limpo e em boas condições, realizar reparos necessários antes da entrega',
      obrigB: 'Ex: Pagar o aluguel até o dia acordado, conservar o imóvel e devolvê-lo nas mesmas condições',
    },
  },

  aluguel_com: {
    id: 'aluguel_com', emoji: '🏢',
    name: 'Aluguel Comercial',
    desc: 'Locação de imóvel comercial',
    category: 'imobiliario',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Locador', parteB:'Locatário', step2title:'Locador e Locatário' },
    fields: {
      step3: [
        { id:'obj_desc',    label:'Descrição do Imóvel Comercial *', type:'textarea', required:true },
        { id:'obj_local',   label:'Cidade / Foro',                   type:'text' },
        { id:'obj_inicio',  label:'Início da Locação',               type:'date' },
        { id:'obj_fim',     label:'Fim da Locação',                  type:'date' },
        { id:'obj_obrig_a', label:'Obrigações do Locador',           type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações do Locatário',         type:'textarea' },
      ],
      step4: [
        { id:'val_total',    label:'Valor do Aluguel Mensal (R$) *', type:'money', required:true },
        { id:'val_venc',     label:'Vencimento',                     type:'text' },
        { id:'val_banco',    label:'PIX / Dados Bancários',          type:'text' },
        { id:'val_multa',    label:'Multa por Atraso',               type:'select', options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros',    label:'Juros de Mora',                  type:'select', options:['1% ao mês','0,5% ao mês','2% ao mês'] },
        { id:'val_reajuste', label:'Índice de Reajuste (IGPM/IPCA)', type:'select', options:['Sem reajuste','IGPM','IPCA','INPC'] },
      ],
    },
    hints: {
      desc:   'Ex: Sala comercial 80m², Av. Brasil 500, Sala 12, Centro Empresarial — Cidade/UF',
      obrigA: 'Ex: Entregar o imóvel em condições de uso comercial, garantir acesso e funcionamento',
      obrigB: 'Ex: Pagar o aluguel e taxas condominiais, usar o imóvel apenas para fins comerciais',
    },
  },

  locacao_simples: {
    id: 'locacao_simples', emoji: '🏠',
    name: 'Locação Simples',
    desc: 'Contrato de locação básico',
    category: 'imobiliario',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Locador', parteB:'Locatário', step2title:'Locador e Locatário' },
    fields: {
      step3: [
        { id:'obj_desc',    label:'Descrição do Imóvel *',     type:'textarea', required:true },
        { id:'obj_local',   label:'Cidade / Foro',             type:'text' },
        { id:'obj_inicio',  label:'Início',                    type:'date' },
        { id:'obj_fim',     label:'Término',                   type:'date' },
        { id:'obj_obrig_a', label:'Obrigações do Locador',     type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações do Locatário',   type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor Mensal (R$) *', type:'money', required:true },
        { id:'val_venc',  label:'Vencimento',           type:'text' },
        { id:'val_banco', label:'PIX / Dados Bancários', type:'text' },
        { id:'val_multa', label:'Multa por Atraso',      type:'select', options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros', label:'Juros de Mora',         type:'select', options:['1% ao mês','0,5% ao mês','2% ao mês'] },
      ],
    },
    hints: {
      desc:   'Ex: Casa 3 quartos, Rua das Palmeiras 45, Jardim América — Cidade/UF',
      obrigA: 'Ex: Entregar o imóvel em boas condições e garantir a posse tranquila',
      obrigB: 'Ex: Pagar o aluguel pontualmente e conservar o imóvel',
    },
  },

  locacao_fiador: {
    id: 'locacao_fiador', emoji: '👥',
    name: 'Locação com Fiador',
    desc: 'Locação com garantia de fiador',
    category: 'imobiliario',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Locador', parteB:'Locatário', step2title:'Locador, Locatário e Fiador' },
    fields: {
      step2Extra: [
        { id:'fiador_nome', label:'Nome do Fiador',     type:'text', required:true },
        { id:'fiador_doc',  label:'CPF do Fiador',      type:'text', required:true },
        { id:'fiador_end',  label:'Endereço do Fiador', type:'text' },
      ],
      step3: [
        { id:'obj_desc',    label:'Descrição do Imóvel *',     type:'textarea', required:true },
        { id:'obj_local',   label:'Cidade / Foro',             type:'text' },
        { id:'obj_inicio',  label:'Início da Locação',         type:'date' },
        { id:'obj_fim',     label:'Fim da Locação',            type:'date' },
        { id:'obj_obrig_a', label:'Obrigações do Locador',     type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações do Locatário',   type:'textarea' },
      ],
      step4: [
        { id:'val_total',    label:'Valor Mensal (R$) *',   type:'money', required:true },
        { id:'val_venc',     label:'Vencimento',             type:'text' },
        { id:'val_banco',    label:'PIX / Dados Bancários',  type:'text' },
        { id:'val_multa',    label:'Multa por Atraso',       type:'select', options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros',    label:'Juros de Mora',          type:'select', options:['1% ao mês','0,5% ao mês','2% ao mês'] },
        { id:'val_reajuste', label:'Índice de Reajuste',     type:'select', options:['Sem reajuste','IGPM','IPCA','INPC'] },
      ],
    },
    hints: {
      desc:   'Ex: Apartamento 3 quartos, Rua X 100, Bairro Y — Cidade/UF, CEP 00000-000',
      obrigA: 'Ex: Manter o imóvel em condições de habitabilidade e respeitar a posse',
      obrigB: 'Ex: Pagar aluguel e encargos em dia, não sublocar sem autorização',
    },
  },

  recibo_aluguel: {
    id: 'recibo_aluguel', emoji: '🧾',
    name: 'Recibo de Aluguel',
    desc: 'Comprovante de pagamento de aluguel',
    category: 'imobiliario',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Locador', parteB:'Locatário', step2title:'Locador e Locatário' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Mês de Referência e Endereço do Imóvel *', type:'textarea', required:true },
        { id:'obj_local', label:'Cidade',                                   type:'text' },
      ],
      step4: [
        { id:'val_total', label:'Valor do Aluguel (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',       type:'select',
          options:['dinheiro','PIX','transferência','depósito'] },
        { id:'val_banco', label:'Dados do Pagamento',       type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Aluguel referente ao mês de novembro de 2026 do imóvel na Rua das Flores, 123 — Apto 45',
      obrigA: '', obrigB: '',
    },
  },

  vistoria: {
    id: 'vistoria', emoji: '🔍',
    name: 'Vistoria do Imóvel',
    desc: 'Termo de vistoria de entrada/saída',
    category: 'imobiliario',
    steps: [1,2,3,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Locador / Vistoriador', parteB:'Locatário', step2title:'Locador e Locatário' },
    fields: {
      step3: [
        { id:'obj_desc',   label:'Descrição do Imóvel e Itens Vistoriados *', type:'textarea', required:true },
        { id:'obj_local',  label:'Cidade',                                    type:'text' },
        { id:'obj_inicio', label:'Data da Vistoria',                          type:'date' },
      ],
    },
    hints: {
      desc: 'Ex: Casa 3 quartos — estado de paredes, pisos, janelas, instalações elétricas e hidráulicas',
      obrigA: '', obrigB: '',
    },
  },

  notif_desocupacao: {
    id: 'notif_desocupacao', emoji: '📨',
    name: 'Notificação de Desocupação',
    desc: 'Aviso formal de saída do imóvel',
    category: 'imobiliario',
    steps: [1,2,3,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Locador / Notificante', parteB:'Locatário / Notificado', step2title:'Locador e Locatário' },
    fields: {
      step3: [
        { id:'obj_desc',   label:'Endereço do Imóvel *',       type:'textarea', required:true },
        { id:'obj_local',  label:'Cidade',                     type:'text' },
        { id:'obj_fim',    label:'Prazo para Desocupação',     type:'date' },
        { id:'obj_obrig_a', label:'Condições para Devolução', type:'textarea' },
      ],
    },
    hints: {
      desc: 'Ex: Imóvel na Rua das Palmeiras 45, Jardim América — Cidade/UF, CEP 00000-000',
      obrigA: 'Ex: Aguardar desocupação no prazo e realizar vistoria final', obrigB: '',
    },
  },

  acordo_inadimpl: {
    id: 'acordo_inadimpl', emoji: '⚠️',
    name: 'Acordo de Inadimplência',
    desc: 'Regularização de débito de aluguel',
    category: 'imobiliario',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Locador / Credor', parteB:'Locatário / Devedor', step2title:'Locador e Locatário' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Descrição da Inadimplência *', type:'textarea', required:true },
        { id:'obj_local', label:'Cidade / Foro',                type:'text' },
      ],
      step4: [
        { id:'val_total', label:'Valor Total em Aberto (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Regularização',        type:'text' },
        { id:'val_venc',  label:'Prazo para Regularização',      type:'date' },
        { id:'val_multa', label:'Multa Prevista',                type:'select', options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros', label:'Juros de Mora',                 type:'select', options:['1% ao mês','0,5% ao mês','2% ao mês'] },
      ],
    },
    hints: {
      desc: 'Ex: Aluguéis em atraso dos meses de setembro e outubro de 2026',
      obrigA: '', obrigB: '',
    },
  },

  // ══════════════════════════════════════
  //  TRABALHO
  // ══════════════════════════════════════

  estagio: {
    id: 'estagio', emoji: '🎓',
    name: 'Termo de Estágio',
    desc: 'Contrato de estágio curricular',
    category: 'trabalho',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Empresa Concedente', parteB:'Estagiário', step2title:'Empresa e Estagiário' },
    fields: {
      step2Extra: [
        { id:'instituicao_nome', label:'Nome da Instituição de Ensino', type:'text' },
        { id:'instituicao_cnpj', label:'CNPJ da Instituição',           type:'text' },
      ],
      step3: [
        { id:'obj_desc',    label:'Atividades do Estágio *',     type:'textarea', required:true },
        { id:'obj_local',   label:'Local de Estágio / Foro',    type:'text' },
        { id:'obj_inicio',  label:'Início do Estágio',          type:'date' },
        { id:'obj_fim',     label:'Término do Estágio',         type:'date' },
        { id:'obj_obrig_a', label:'Obrigações da Empresa',      type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações do Estagiário',   type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Bolsa-Auxílio (R$)', type:'money' },
        { id:'val_venc',  label:'Dia de Pagamento',   type:'text' },
        { id:'val_cond',  label:'Benefícios Adicionais', type:'text' },
      ],
    },
    hints: {
      desc:   'Ex: Estágio no Marketing Digital — criação de conteúdo, gestão de redes sociais e análise de métricas',
      obrigA: 'Ex: Designar supervisor, oferecer atividades compatíveis com a área de formação',
      obrigB: 'Ex: Cumprir o horário, realizar as atividades com dedicação e manter sigilo',
    },
  },

  curriculo: {
    id: 'curriculo', emoji: '📋',
    name: 'Currículo Profissional',
    desc: 'Currículo formatado e profissional',
    category: 'trabalho',
    steps: [1,2,3],
    parteB: false, testemunhas: false,
    labels: { parteA:'Candidato', step2title:'Dados do Candidato' },
    fields: {
      step2Extra: [
        { id:'pa_email',    label:'E-mail Profissional',  type:'text' },
        { id:'pa_telefone', label:'Telefone / WhatsApp',  type:'text' },
        { id:'pa_linkedin', label:'LinkedIn (URL)',        type:'text' },
      ],
      step3: [
        { id:'obj_desc',        label:'Objetivo Profissional / Área de Interesse *', type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Experiências Profissionais',                  type:'textarea' },
        { id:'obj_obrig_a',     label:'Formação Acadêmica',                          type:'textarea' },
        { id:'obj_obrig_b',     label:'Habilidades e Competências',                  type:'textarea' },
      ],
    },
    hints: {
      desc:   'Ex: Área de Tecnologia da Informação — Desenvolvimento Web e Mobile',
      obrigA: 'Ex: Bacharelado em Ciência da Computação — Universidade X (2018-2022)',
      obrigB: 'Ex: JavaScript, React, Node.js, comunicação, trabalho em equipe',
    },
  },

  carta_apres: {
    id: 'carta_apres', emoji: '✉️',
    name: 'Carta de Apresentação',
    desc: 'Carta de apresentação profissional',
    category: 'trabalho',
    steps: [1,2,3,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Remetente', parteB:'Destinatário / Empresa', step2title:'Remetente e Destinatário' },
    fields: {
      step3: [
        { id:'obj_desc',    label:'Assunto / Vaga ou Oportunidade *', type:'textarea', required:true },
        { id:'obj_obrig_a', label:'Principais Competências / Motivação', type:'textarea' },
        { id:'obj_local',   label:'Cidade',                           type:'text' },
      ],
    },
    hints: {
      desc:   'Ex: Candidatura à vaga de Desenvolvedor Full Stack',
      obrigA: 'Ex: 5 anos de experiência em React e Node.js, projetos em produção, inglês avançado',
      obrigB: '',
    },
  },

  carta_demissao: {
    id: 'carta_demissao', emoji: '🚪',
    name: 'Carta de Demissão',
    desc: 'Pedido formal de demissão',
    category: 'trabalho',
    steps: [1,2,3,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Demissionário', parteB:'Empresa / Empregador', step2title:'Funcionário e Empresa' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Cargo / Função que Está Deixando *', type:'textarea', required:true },
        { id:'obj_fim',   label:'Data do Último Dia de Trabalho',     type:'date' },
        { id:'obj_local', label:'Cidade',                             type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Pedido de demissão do cargo de Analista de Marketing, com aviso prévio de 30 dias',
      obrigA: '', obrigB: '',
    },
  },

  decl_experiencia: {
    id: 'decl_experiencia', emoji: '📜',
    name: 'Declaração de Experiência',
    desc: 'Declaração de tempo de serviço',
    category: 'trabalho',
    steps: [1,2,3,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Empresa Declarante', parteB:'Ex-Funcionário', step2title:'Empresa e Funcionário' },
    fields: {
      step3: [
        { id:'obj_desc',    label:'Cargo e Período de Trabalho *',      type:'textarea', required:true },
        { id:'obj_obrig_a', label:'Principais Atividades Realizadas',   type:'textarea' },
        { id:'obj_inicio',  label:'Data de Admissão',                   type:'date' },
        { id:'obj_fim',     label:'Data de Desligamento',               type:'date' },
        { id:'obj_local',   label:'Cidade',                             type:'text' },
      ],
    },
    hints: {
      desc:   'Ex: Cargo: Gerente de Vendas | Período: janeiro de 2022 a outubro de 2026',
      obrigA: 'Ex: Gestão de equipe de 10 vendedores, prospecção de clientes, elaboração de relatórios',
      obrigB: '',
    },
  },

  // ══════════════════════════════════════
  //  DECLARAÇÕES
  // ══════════════════════════════════════

  decl_residencia: {
    id: 'decl_residencia', emoji: '🏡',
    name: 'Declaração de Residência',
    desc: 'Comprovante de residência declarado',
    category: 'declaracoes',
    steps: [1,2,3,6],
    parteB: false, testemunhas: false,
    labels: { parteA:'Declarante', step2title:'Declarante' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Endereço de Residência Declarado *', type:'textarea', required:true },
        { id:'obj_local', label:'Cidade',                             type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Rua das Flores, 123, Apto 45, Bairro Centro — Cidade/UF, CEP 00000-000',
      obrigA: '', obrigB: '',
    },
  },

  decl_renda: {
    id: 'decl_renda', emoji: '💵',
    name: 'Declaração de Renda',
    desc: 'Declaração de renda mensal',
    category: 'declaracoes',
    steps: [1,2,3,4,6],
    parteB: false, testemunhas: false,
    labels: { parteA:'Declarante', step2title:'Declarante' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Fonte e Natureza da Renda *', type:'textarea', required:true },
        { id:'obj_local', label:'Cidade',                      type:'text' },
      ],
      step4: [
        { id:'val_total', label:'Renda Mensal Declarada (R$) *', type:'money', required:true },
      ],
    },
    hints: {
      desc: 'Ex: Renda proveniente de atividade autônoma como designer gráfico, prestação de serviços a terceiros',
      obrigA: '', obrigB: '',
    },
  },

  decl_informal: {
    id: 'decl_informal', emoji: '🤲',
    name: 'Trabalho Informal',
    desc: 'Declaração de trabalho informal',
    category: 'declaracoes',
    steps: [1,2,3,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Empregador / Declarante', parteB:'Trabalhador', step2title:'Empregador e Trabalhador' },
    fields: {
      step3: [
        { id:'obj_desc',   label:'Atividade Exercida e Período *', type:'textarea', required:true },
        { id:'obj_local',  label:'Cidade',                         type:'text' },
        { id:'obj_inicio', label:'Data de Início',                 type:'date' },
        { id:'obj_fim',    label:'Data de Término',                type:'date' },
      ],
    },
    hints: {
      desc: 'Ex: Serviços gerais na propriedade rural, incluindo manutenção e limpeza',
      obrigA: '', obrigB: '',
    },
  },

  decl_comparec: {
    id: 'decl_comparec', emoji: '✅',
    name: 'Declaração de Comparec.',
    desc: 'Comprovante de comparecimento',
    category: 'declaracoes',
    steps: [1,2,3,6],
    parteB: false, testemunhas: false,
    labels: { parteA:'Declarante / Empresa', step2title:'Declarante' },
    fields: {
      step3: [
        { id:'obj_desc',   label:'Motivo e Local do Comparecimento *', type:'textarea', required:true },
        { id:'obj_inicio', label:'Data do Comparecimento',             type:'date' },
        { id:'obj_local',  label:'Cidade',                             type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Comparecimento para realização de exame médico periódico no Hospital X, em Curitiba/PR',
      obrigA: '', obrigB: '',
    },
  },

  decl_respons: {
    id: 'decl_respons', emoji: '📝',
    name: 'Declaração de Responsab.',
    desc: 'Declaração de responsabilidade',
    category: 'declaracoes',
    steps: [1,2,3,6],
    parteB: false, testemunhas: false,
    labels: { parteA:'Responsável / Declarante', step2title:'Declarante' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Objeto da Responsabilidade Declarada *', type:'textarea', required:true },
        { id:'obj_local', label:'Cidade',                                  type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Responsabilidade pela guarda e conservação do veículo Fiat Palio, placa XYZ-0000',
      obrigA: '', obrigB: '',
    },
  },

  decl_uniao: {
    id: 'decl_uniao', emoji: '💍',
    name: 'União Estável',
    desc: 'Declaração de convivência',
    category: 'declaracoes',
    steps: [1,2,3,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Declarante A', parteB:'Declarante B', step2title:'Declarantes' },
    fields: {
      step3: [
        { id:'obj_desc',   label:'Descrição da União Estável *', type:'textarea', required:true },
        { id:'obj_inicio', label:'Início da União',              type:'date' },
        { id:'obj_local',  label:'Cidade',                       type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: União estável estabelecida desde janeiro de 2020, em residência comum na cidade de Curitiba/PR',
      obrigA: '', obrigB: '',
    },
  },

  // ══════════════════════════════════════
  //  FINANCEIRO
  // ══════════════════════════════════════

  recibo: {
    id: 'recibo', emoji: '🧾',
    name: 'Recibo de Pagamento',
    desc: 'Comprovante formal de pagamento',
    category: 'financeiro',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Recebedor', parteB:'Pagante', step2title:'Recebedor e Pagante' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Referência do Pagamento *', type:'textarea', required:true },
        { id:'obj_local', label:'Cidade',                    type:'text' },
      ],
      step4: [
        { id:'val_total', label:'Valor Recebido (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',     type:'select',
          options:['dinheiro','PIX','transferência','cheque','cartão'] },
        { id:'val_banco', label:'Dados do Pagamento',     type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Pagamento referente à prestação de serviços de pintura residencial realizados em novembro de 2026',
      obrigA: '', obrigB: '',
    },
  },

  quitacao: {
    id: 'quitacao', emoji: '✔️',
    name: 'Termo de Quitação',
    desc: 'Declaração de quitação total',
    category: 'financeiro',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Credor', parteB:'Devedor', step2title:'Credor e Devedor' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Referência da Dívida Quitada *', type:'textarea', required:true },
        { id:'obj_local', label:'Cidade',                         type:'text' },
      ],
      step4: [
        { id:'val_total', label:'Valor Quitado (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',   type:'select',
          options:['dinheiro','PIX','transferência','cheque'] },
        { id:'val_banco', label:'Dados do Pagamento',   type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Pagamento integral do contrato de prestação de serviços firmado em janeiro de 2026',
      obrigA: '', obrigB: '',
    },
  },

  confissao_divida: {
    id: 'confissao_divida', emoji: '💳',
    name: 'Confissão de Dívida',
    desc: 'Reconhecimento formal de dívida',
    category: 'financeiro',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Credor', parteB:'Devedor', step2title:'Credor e Devedor' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Origem e Descrição da Dívida *', type:'textarea', required:true },
        { id:'obj_local', label:'Cidade / Foro',                  type:'text' },
      ],
      step4: [
        { id:'val_total', label:'Valor Total da Dívida (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',            type:'select',
          options:['à vista','parcelado','em parcela única'] },
        { id:'val_venc',  label:'Vencimento',                    type:'text' },
        { id:'val_multa', label:'Multa por Atraso',              type:'select', options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros', label:'Juros de Mora',                 type:'select', options:['1% ao mês','0,5% ao mês','2% ao mês'] },
      ],
    },
    hints: {
      desc: 'Ex: Valor referente a empréstimo pessoal concedido em outubro de 2026, acrescido de juros acordados',
      obrigA: '', obrigB: '',
    },
  },

  parcelamento: {
    id: 'parcelamento', emoji: '📅',
    name: 'Acordo de Parcelamento',
    desc: 'Parcelamento de dívida em aberto',
    category: 'financeiro',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Credor', parteB:'Devedor', step2title:'Credor e Devedor' },
    fields: {
      step3: [
        { id:'obj_desc',  label:'Descrição do Débito a Parcelar *', type:'textarea', required:true },
        { id:'obj_local', label:'Cidade / Foro',                    type:'text' },
      ],
      step4: [
        { id:'val_total', label:'Valor Total a Parcelar (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Quantidade de Parcelas',         type:'text' },
        { id:'val_venc',  label:'Vencimento das Parcelas',        type:'text' },
        { id:'val_banco', label:'PIX / Dados Bancários',          type:'text' },
        { id:'val_multa', label:'Multa por Atraso',               type:'select', options:['2%','1%','3%','5%','10%'] },
        { id:'val_juros', label:'Juros de Mora',                  type:'select', options:['1% ao mês','0,5% ao mês','2% ao mês'] },
      ],
    },
    hints: {
      desc: 'Ex: Saldo devedor de aluguel dos meses de setembro, outubro e novembro de 2026',
      obrigA: '', obrigB: '',
    },
  },

  nota_servico: {
    id: 'nota_servico', emoji: '📑',
    name: 'Nota Simples de Serviço',
    desc: 'Nota avulsa de prestação',
    category: 'financeiro',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Prestador de Serviços', parteB:'Tomador dos Serviços', step2title:'Prestador e Tomador' },
    fields: {
      step3: [
        { id:'obj_desc',   label:'Serviços Prestados *', type:'textarea', required:true },
        { id:'obj_local',  label:'Cidade',               type:'text' },
        { id:'obj_inicio', label:'Período de Prestação', type:'date' },
      ],
      step4: [
        { id:'val_total', label:'Valor dos Serviços (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Pagamento',         type:'select',
          options:['à vista','PIX','transferência','cheque'] },
        { id:'val_banco', label:'PIX / Dados Bancários',      type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Consultoria em TI realizada durante o mês de outubro de 2026 — 20 horas técnicas',
      obrigA: '', obrigB: '',
    },
  },

  // ══════════════════════════════════════
  //  JURÍDICO
  // ══════════════════════════════════════

  lgpd_termo: {
    id: 'lgpd_termo', emoji: '🛡️',
    name: 'Termo LGPD',
    desc: 'Consentimento conforme Lei 13.709/2018',
    category: 'juridico',
    steps: [1,2,3,6],
    parteB: false, testemunhas: false,
    labels: { parteA:'Controlador de Dados (Empresa)', step2title:'Empresa / Responsável' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Dados Pessoais Tratados e Finalidade *', type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Direitos dos Titulares Garantidos',       type:'textarea' },
        { id:'obj_local',       label:'Cidade / Foro',                          type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Tratamento de nome, e-mail, CPF e telefone para fins de cadastro e prestação de serviços',
      obrigA: '', obrigB: '',
    },
  },

  politica_priv: {
    id: 'politica_priv', emoji: '🔐',
    name: 'Política de Privacidade',
    desc: 'Política para site ou aplicativo',
    category: 'juridico',
    steps: [1,2,3,6],
    parteB: false, testemunhas: false,
    labels: { parteA:'Empresa / Responsável', step2title:'Empresa' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Escopo da Política de Privacidade *', type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Dados Coletados e Finalidades',       type:'textarea' },
        { id:'obj_local',       label:'Cidade / Foro',                      type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Política de privacidade do site XYZ — dados coletados, finalidade e direitos dos usuários',
      obrigA: '', obrigB: '',
    },
  },

  termo_uso: {
    id: 'termo_uso', emoji: '📋',
    name: 'Termo de Uso',
    desc: 'Termos de uso de plataforma',
    category: 'juridico',
    steps: [1,2,3,6],
    parteB: false, testemunhas: false,
    labels: { parteA:'Empresa / Plataforma', step2title:'Empresa' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Plataforma / Serviço e Escopo *', type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Regras de Uso e Restrições',      type:'textarea' },
        { id:'obj_local',       label:'Cidade / Foro',                   type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Termos de uso da plataforma XYZ para acesso e utilização dos serviços de gestão financeira',
      obrigA: '', obrigB: '',
    },
  },

  notif_extra: {
    id: 'notif_extra', emoji: '⚖️',
    name: 'Notificação Extrajudicial',
    desc: 'Notificação formal entre partes',
    category: 'juridico',
    steps: [1,2,3,4,6],
    parteB: true, testemunhas: false,
    labels: { parteA:'Notificante', parteB:'Notificado', step2title:'Notificante e Notificado' },
    fields: {
      step3: [
        { id:'obj_desc',    label:'Objeto da Notificação *',     type:'textarea', required:true },
        { id:'obj_fim',     label:'Prazo para Regularização',    type:'date' },
        { id:'obj_local',   label:'Cidade / Foro',               type:'text' },
        { id:'obj_obrig_a', label:'Obrigações do Notificante',   type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações do Notificado',    type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor em Disputa (R$, se aplicável)', type:'money' },
        { id:'val_multa', label:'Multa por Descumprimento',            type:'text' },
      ],
    },
    hints: {
      desc:   'Ex: Cobrança de valores em atraso referentes a serviços prestados e não pagos',
      obrigA: 'Ex: Aguardar a regularização no prazo e dar quitação após o cumprimento',
      obrigB: 'Ex: Regularizar a situação descrita no prazo estabelecido',
    },
  },

  acordo_amigavel: {
    id: 'acordo_amigavel', emoji: '🤝',
    name: 'Acordo Amigável',
    desc: 'Resolução amigável de conflito',
    category: 'juridico',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Parte A', parteB:'Parte B', step2title:'Partes do Acordo' },
    fields: {
      step3: [
        { id:'obj_desc',    label:'Objeto do Acordo / Litígio Resolvido *', type:'textarea', required:true },
        { id:'obj_local',   label:'Cidade / Foro',                          type:'text' },
        { id:'obj_obrig_a', label:'Obrigações da Parte A',                  type:'textarea' },
        { id:'obj_obrig_b', label:'Obrigações da Parte B',                  type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor do Acordo (R$, se aplicável)', type:'money' },
        { id:'val_forma', label:'Forma de Pagamento',                 type:'text' },
        { id:'val_venc',  label:'Vencimento',                         type:'text' },
      ],
    },
    hints: {
      desc:   'Ex: Resolução amigável sobre contrato de prestação de serviços de janeiro de 2026',
      obrigA: 'Ex: Aceitar as condições acordadas e dar quitação após o cumprimento integral',
      obrigB: 'Ex: Cumprir as obrigações acordadas no prazo estabelecido',
    },
  },

  // ══════════════════════════════════════
  //  EMPRESARIAL
  // ══════════════════════════════════════

  abertura_empresa: {
    id: 'abertura_empresa', emoji: '🏢',
    name: 'Abertura de Empresa',
    desc: 'Documentação básica de abertura',
    category: 'empresarial',
    steps: [1,2,3,6],
    parteB: false, testemunhas: false,
    labels: { parteA:'Responsável / Sócio Principal', step2title:'Dados da Empresa' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Nome, Atividade e Capital da Empresa *', type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Endereço da Sede',                       type:'textarea' },
        { id:'obj_local',       label:'Cidade / Foro',                          type:'text' },
      ],
    },
    hints: {
      desc: 'Ex: Nome: XYZ Serviços Ltda | Atividade: consultoria em TI | Capital: R$ 10.000,00',
      obrigA: '', obrigB: '',
    },
  },

  contrato_social: {
    id: 'contrato_social', emoji: '📜',
    name: 'Contrato Social',
    desc: 'Contrato social básico de empresa',
    category: 'empresarial',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Sócio A', parteB:'Sócio B', step2title:'Sócios' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Nome e Atividade da Empresa *', type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Endereço da Sede',              type:'textarea' },
        { id:'obj_local',       label:'Cidade / Foro',                 type:'text' },
        { id:'obj_obrig_a',     label:'Função do Sócio A',             type:'textarea' },
        { id:'obj_obrig_b',     label:'Função do Sócio B',             type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Capital Social Total (R$) *',       type:'money', required:true },
        { id:'val_forma', label:'Divisão de Quotas (ex: 50%/50%)',   type:'text' },
        { id:'val_cond',  label:'Distribuição de Lucros',            type:'text' },
      ],
    },
    hints: {
      desc:   'Ex: Nome: XYZ Comércio e Serviços Ltda | Atividade: comércio varejista de artigos de vestuário',
      obrigA: 'Ex: Integralizar R$ X correspondente a X% do capital social e assumir a administração',
      obrigB: 'Ex: Integralizar R$ X correspondente a X% do capital social e participar das decisões',
    },
  },

  acordo_socios: {
    id: 'acordo_socios', emoji: '🤝',
    name: 'Acordo entre Sócios',
    desc: 'Acordo de quotas e responsabilidades',
    category: 'empresarial',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Sócio A', parteB:'Sócio B', step2title:'Sócios' },
    fields: {
      step3: [
        { id:'obj_desc',    label:'Empresa e Objeto do Acordo *',   type:'textarea', required:true },
        { id:'obj_local',   label:'Cidade / Foro',                  type:'text' },
        { id:'obj_obrig_a', label:'Responsabilidades do Sócio A',   type:'textarea' },
        { id:'obj_obrig_b', label:'Responsabilidades do Sócio B',   type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Capital Social / Quotas (R$)', type:'money' },
        { id:'val_forma', label:'Divisão de Resultados',        type:'text' },
      ],
    },
    hints: {
      desc:   'Ex: Regulamentação das relações societárias da empresa XYZ Ltda, CNPJ 00.000.000/0001-00',
      obrigA: 'Ex: Responder pela gestão administrativa e financeira da empresa',
      obrigB: 'Ex: Responder pela área comercial e de relacionamento com clientes',
    },
  },

  termo_invest: {
    id: 'termo_invest', emoji: '💰',
    name: 'Termo de Investimento',
    desc: 'Acordo de aporte e investimento',
    category: 'empresarial',
    steps: [1,2,3,4,5,6],
    parteB: true, testemunhas: true,
    labels: { parteA:'Investidor', parteB:'Empresa Investida', step2title:'Investidor e Empresa' },
    fields: {
      step3: [
        { id:'obj_desc',        label:'Objeto / Projeto de Investimento *', type:'textarea', required:true },
        { id:'obj_entregaveis', label:'Metas e Métricas de Desempenho',     type:'textarea' },
        { id:'obj_local',       label:'Cidade / Foro',                      type:'text' },
        { id:'obj_inicio',      label:'Início do Aporte',                   type:'date' },
        { id:'obj_fim',         label:'Prazo do Investimento',              type:'date' },
        { id:'obj_obrig_a',     label:'Obrigações do Investidor',           type:'textarea' },
        { id:'obj_obrig_b',     label:'Obrigações da Empresa',              type:'textarea' },
      ],
      step4: [
        { id:'val_total', label:'Valor Total do Aporte (R$) *', type:'money', required:true },
        { id:'val_forma', label:'Forma de Aporte',              type:'select',
          options:['em parcela única','em 2 parcelas','mensalmente','por milestone'] },
        { id:'val_venc',  label:'Datas dos Aportes',            type:'text' },
        { id:'val_cond',  label:'Participação / Equity',        type:'text' },
      ],
    },
    hints: {
      desc:   'Ex: Desenvolvimento de plataforma de e-commerce para moda, meta de 1.000 clientes em 6 meses',
      obrigA: 'Ex: Aportar recursos em 2 parcelas e acompanhar relatórios mensais de desempenho',
      obrigB: 'Ex: Apresentar relatório mensal de uso dos recursos e metas atingidas',
    },
  },

  // ══════════════════════════════════════
  //  EXTRAS — IA
  // ══════════════════════════════════════

  gen_curriculo:    { id:'gen_curriculo',    emoji:'🤖', name:'Currículo via IA',        desc:'Currículo gerado automaticamente com IA',  category:'extras', isAI:true, steps:[1] },
  gen_carta:        { id:'gen_carta',        emoji:'🤖', name:'Carta Formal via IA',     desc:'Carta profissional gerada com IA',          category:'extras', isAI:true, steps:[1] },
  gen_proposta:     { id:'gen_proposta',     emoji:'🤖', name:'Proposta Comercial IA',   desc:'Proposta completa gerada com IA',           category:'extras', isAI:true, steps:[1] },
  gen_email:        { id:'gen_email',        emoji:'🤖', name:'E-mail Profissional IA',  desc:'E-mail formal gerado com IA',               category:'extras', isAI:true, steps:[1] },
  gen_contrato_ia:  { id:'gen_contrato_ia',  emoji:'🤖', name:'Contrato Inteligente IA', desc:'Contrato 100% gerado pela IA',              category:'extras', isAI:true, steps:[1] },
}

// ── Helpers ──────────────────────────────────────────────────

/** Retorna array de tipos por categoria */
export function getTypesByCategory(cat) {
  return Object.values(DOC_TYPES).filter(t => t.category === cat)
}

/** Retorna um tipo pelo id */
export function getDocType(id) {
  return DOC_TYPES[id] || null
}

/** Título legível do documento */
export const DOC_TITLES = {
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
  carta_demissao:'Carta de Pedido de Demissão', decl_experiencia:'Declaração de Experiência e Tempo de Serviço',
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
}

export function getDocTitle(type) {
  return DOC_TITLES[type] || 'Documento Profissional'
}

export function getRoleA(type) {
  const r = {
    aluguel_res:'LOCADOR', aluguel_com:'LOCADOR', locacao_simples:'LOCADOR', locacao_fiador:'LOCADOR',
    compravenda:'VENDEDOR', trabalho_pj:'CONTRATANTE', freelancer:'CONTRATANTE',
    influenciador:'CONTRATANTE', nda:'PARTE DIVULGANTE', comissao:'COMITENTE',
    recibo:'RECEBEDOR', recibo_aluguel:'LOCADOR', quitacao:'CREDOR',
    confissao_divida:'CREDOR', parcelamento:'CREDOR', autonomo:'CONTRATANTE',
    estagio:'EMPRESA CONCEDENTE', acordo_socios:'SÓCIO A', parceria:'PARCEIRO A',
    plano_parceria:'PARTE A', notif_extra:'NOTIFICANTE', acordo_amigavel:'PARTE A',
    termo_invest:'INVESTIDOR', contrato_social:'SÓCIO ADMINISTRADOR',
  }
  return r[type] || 'CONTRATANTE'
}

export function getRoleB(type) {
  const r = {
    aluguel_res:'LOCATÁRIO', aluguel_com:'LOCATÁRIO', locacao_simples:'LOCATÁRIO', locacao_fiador:'LOCATÁRIO',
    compravenda:'COMPRADOR', trabalho_pj:'CONTRATADO', freelancer:'FREELANCER',
    influenciador:'INFLUENCIADOR', nda:'PARTE RECEPTORA', comissao:'COMISSIONADO',
    recibo:'PAGANTE', recibo_aluguel:'LOCATÁRIO', quitacao:'DEVEDOR',
    confissao_divida:'DEVEDOR', parcelamento:'DEVEDOR', autonomo:'PRESTADOR',
    estagio:'ESTAGIÁRIO', acordo_socios:'SÓCIO B', parceria:'PARCEIRO B',
    plano_parceria:'PARTE B', notif_extra:'NOTIFICADO', acordo_amigavel:'PARTE B',
    termo_invest:'EMPRESA INVESTIDA', contrato_social:'SÓCIO',
  }
  return r[type] || 'CONTRATADO'
}
