// ════════════════════════════════════════════════════════════════
//  js/wizard.js — Wizard de criação de documentos
//  Gerencia os steps, validações e configurações por tipo
// ════════════════════════════════════════════════════════════════

function filterCategory(btn, cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  buildTypeCards(cat);
}

function buildTypeCards(cat) {
  const types = DOC_TYPES[cat] || [];
  const g     = document.getElementById('types-grid');
  if (!types.length) {
    g.innerHTML = '<p style="color:var(--text3);padding:20px;">Nenhum tipo nesta categoria.</p>';
    return;
  }
  g.innerHTML = types.map(t => `
    <div class="type-card" id="tc-${t.id}" onclick="selectType('${t.id}')">
      <div class="type-card-check">✓</div>
      <div class="type-emoji">${t.emoji}</div>
      <div class="type-name">${t.name}</div>
      <div class="type-desc">${t.desc}</div>
    </div>`).join('');
}

function selectType(id) {
  selectedType = id;
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('tc-' + id)?.classList.add('selected');
  // applyWizardRules já cuida de injetar formulários e limpar containers
  applyWizardRules(id);
  updateStep3Hints(id);
}

// ════════════════════════════════════════════════════════════════
//  HINTS DO STEP 3
// ════════════════════════════════════════════════════════════════

function updateStep3Hints(id) {
  const hints = {
    aluguel_res:  { desc: 'Ex: Apartamento 2 quartos, Rua das Flores 123, Apto 45, Bairro Centro - Cidade/UF, CEP 00000-000', obrigA: 'Ex: Entregar o imóvel limpo e em boas condições, realizar reparos necessários antes da entrega', obrigB: 'Ex: Pagar o aluguel até o dia acordado, conservar o imóvel e devolvê-lo nas mesmas condições' },
    aluguel_com:  { desc: 'Ex: Sala comercial 80m², Av. Brasil 500, Sala 12, Centro Empresarial - Cidade/UF', obrigA: 'Ex: Entregar o imóvel em condições de uso comercial, garantir acesso e funcionamento', obrigB: 'Ex: Pagar o aluguel e taxas condominiais, usar o imóvel apenas para fins comerciais' },
    locacao_simples: { desc: 'Ex: Casa 3 quartos, Rua das Palmeiras 45, Jardim América - Cidade/UF', obrigA: 'Ex: Entregar o imóvel em boas condições e garantir a posse tranquila', obrigB: 'Ex: Pagar o aluguel pontualmente e conservar o imóvel' },
    compravenda:  { desc: 'Ex: Veículo Fiat Uno 2018, placa ABC-1234, cor branca, RENAVAM 00000000000', obrigA: 'Ex: Entregar o bem livre de dívidas, transferir a propriedade e fornecer todos os documentos', obrigB: 'Ex: Efetuar o pagamento conforme acordado e receber o bem nas condições descritas' },
    servico:      { desc: 'Ex: Desenvolvimento de site institucional com até 10 páginas, painel administrativo e integração com redes sociais', obrigA: 'Ex: Efetuar os pagamentos nos prazos acordados e fornecer as informações e materiais necessários', obrigB: 'Ex: Executar os serviços com qualidade e nos prazos acordados, manter o contratante informado do andamento' },
    freelancer:   { desc: 'Ex: Criação de identidade visual completa (logo, paleta de cores, tipografia e manual de marca)', obrigA: 'Ex: Pagar os honorários no prazo, fornecer briefing completo e aprovar ou solicitar revisões em até 5 dias úteis', obrigB: 'Ex: Entregar os arquivos nos formatos acordados, realizar até 3 rodadas de revisão e manter sigilo sobre o projeto' },
    trabalho_pj:  { desc: 'Ex: Prestação de serviços de consultoria em gestão financeira, incluindo análise de balanços e relatórios mensais', obrigA: 'Ex: Efetuar o pagamento da nota fiscal no prazo, fornecer acesso às informações e sistemas necessários', obrigB: 'Ex: Emitir nota fiscal, cumprir os prazos, manter sigilo e pagar seus próprios impostos e contribuições' },
    autonomo:     { desc: 'Ex: Serviços de eletricidade residencial, incluindo instalação de tomadas, interruptores e quadro de distribuição', obrigA: 'Ex: Efetuar o pagamento após conclusão dos serviços e fornecer os materiais necessários', obrigB: 'Ex: Executar os serviços com qualidade, usar EPI adequado e responsabilizar-se pelos materiais em sua posse' },
    parceria:     { desc: 'Ex: Parceria para operação de loja de cosméticos na cidade de Foz do Iguaçu/PR', obrigA: 'Ex: Fornecer o capital inicial, espaço físico e gestão administrativa da parceria', obrigB: 'Ex: Realizar as vendas, atender os clientes e executar as operações diárias do negócio' },
    plano_parceria: { desc: 'Ex: Parceria para desenvolvimento e comercialização de software de gestão para pequenas empresas', obrigA: 'Ex: Desenvolver o produto, fornecer suporte técnico e realizar atualizações', obrigB: 'Ex: Realizar a prospecção de clientes, vendas e relacionamento comercial' },
    influenciador: { desc: 'Ex: Criação e publicação de 4 posts no Instagram e 2 Reels por mês divulgando a marca X', obrigA: 'Ex: Fornecer os produtos, briefing criativo e aprovar os conteúdos antes da publicação', obrigB: 'Ex: Criar conteúdo autêntico, publicar nas datas acordadas e informar as métricas mensalmente' },
    nda:          { desc: 'Ex: Informações sobre o projeto de desenvolvimento do aplicativo XYZ, incluindo código-fonte, base de clientes', obrigA: 'Ex: Compartilhar as informações necessárias para a avaliação do projeto de parceria', obrigB: 'Ex: Manter sigilo absoluto sobre todas as informações recebidas e utilizá-las apenas para avaliação da parceria' },
    comissao:     { desc: 'Ex: Venda de planos de internet corporativa da empresa XYZ Telecom na região sul do Brasil', obrigA: 'Ex: Fornecer materiais de vendas, treinamento e pagar as comissões no prazo', obrigB: 'Ex: Prospectar clientes ativamente, apresentar os produtos com precisão e não representar concorrentes' },
    estagio:      { desc: 'Ex: Estágio no setor de Marketing Digital, com atividades de criação de conteúdo, gestão de redes sociais e análise de métricas', obrigA: 'Ex: Designar supervisor, oferecer atividades compatíveis com a área de formação e conceder recesso remunerado', obrigB: 'Ex: Cumprir o horário, realizar as atividades com dedicação e manter sigilo sobre informações da empresa' },
    recibo:       { desc: 'Ex: Pagamento referente à prestação de serviços de pintura residencial realizados em novembro de 2026', obrigA: '', obrigB: '' },
    recibo_aluguel: { desc: 'Ex: Aluguel referente ao mês de novembro de 2026 do imóvel situado na Rua das Flores, 123 - Apto 45', obrigA: '', obrigB: '' },
    confissao_divida: { desc: 'Ex: Valor referente a empréstimo pessoal concedido em outubro de 2026, acrescido de juros acordados', obrigA: '', obrigB: '' },
    parcelamento: { desc: 'Ex: Saldo devedor de aluguel dos meses de setembro, outubro e novembro de 2026', obrigA: '', obrigB: '' },
    quitacao:     { desc: 'Ex: Pagamento integral do contrato de prestação de serviços firmado em janeiro de 2026', obrigA: '', obrigB: '' },
    contrato_social: { desc: 'Ex: Nome da empresa: XYZ Comércio e Serviços Ltda | Atividade: comércio varejista de artigos de vestuário', obrigA: 'Ex: Integralizar R$ X correspondente a X% do capital social e assumir a função de administrador', obrigB: 'Ex: Integralizar R$ X correspondente a X% do capital social e participar das decisões societárias' },
    acordo_socios: { desc: 'Ex: Regulamentação das relações societárias da empresa XYZ Ltda, CNPJ 00.000.000/0001-00', obrigA: 'Ex: Responder pela gestão administrativa e financeira da empresa', obrigB: 'Ex: Responder pela área comercial e de relacionamento com clientes' },
    termo_invest:  { desc: 'Ex: Desenvolvimento e lançamento de plataforma de e-commerce para o segmento de moda', obrigA: 'Ex: Aportar os recursos em 2 parcelas e acompanhar mensalmente os relatórios de desempenho', obrigB: 'Ex: Apresentar relatório mensal de uso dos recursos, metas atingidas e projeções para o período seguinte' },
    vistoria:     { desc: 'Ex: Imóvel residencial - Casa 3 quartos, Rua das Flores 123, Jardim América - Cidade/UF', obrigA: '', obrigB: '' },
    notif_desocupacao: { desc: 'Ex: Imóvel situado na Rua das Palmeiras 45, Jardim América - Cidade/UF, CEP 00000-000', obrigA: 'Ex: Aguardar a desocupação no prazo e realizar vistoria final na entrega das chaves', obrigB: '' },
    acordo_inadimpl: { desc: 'Ex: Aluguéis em atraso dos meses de setembro e outubro de 2026 do imóvel na Rua das Flores 123', obrigA: '', obrigB: '' },
    notif_extra:  { desc: 'Ex: Cobrança de valores em atraso no montante de R$ X referentes a serviços prestados e não pagos', obrigA: 'Ex: Aguardar a regularização da situação no prazo estipulado e dar quitação após o cumprimento', obrigB: 'Ex: Regularizar a situação descrita nesta notificação no prazo estabelecido e comunicar o cumprimento' },
    acordo_amigavel: { desc: 'Ex: Resolução amigável de divergência sobre o contrato de prestação de serviços firmado em janeiro de 2026', obrigA: 'Ex: Aceitar as condições acordadas e dar quitação após o cumprimento integral', obrigB: 'Ex: Cumprir as obrigações acordadas no prazo estabelecido e comunicar eventuais dificuldades' },
    lgpd_termo:   { desc: 'Ex: Tratamento de dados pessoais (nome, e-mail, CPF e telefone) para fins de cadastro e prestação de serviços', obrigA: '', obrigB: '' },
    politica_priv: { desc: 'Ex: Política de privacidade do site/aplicativo XYZ, incluindo dados coletados, finalidade e direitos dos usuários', obrigA: '', obrigB: '' },
    termo_uso:    { desc: 'Ex: Termos de uso da plataforma XYZ para acesso e utilização dos serviços de gestão financeira', obrigA: '', obrigB: '' },
    abertura_empresa: { desc: 'Ex: Nome da empresa: XYZ Serviços Ltda | Atividade: consultoria em tecnologia da informação | Capital: R$ 10.000,00', obrigA: '', obrigB: '' },
    // Currículo usa formulário custom — hints não aplicáveis
    curriculo:    { desc: '', obrigA: '', obrigB: '' },
    carta_apres:  { desc: 'Ex: Assunto da carta de apresentação ou vaga/oportunidade de interesse', obrigA: 'Ex: Principais competências e experiências relevantes para a vaga', obrigB: 'Ex: Empresa ou pessoa para quem está se apresentando' },
    carta_demissao: { desc: 'Ex: Pedido de demissão do cargo de Analista de Marketing', obrigA: '', obrigB: '' },
    decl_experiencia: { desc: 'Ex: Cargo/função exercida: Gerente de Vendas | Período: janeiro de 2022 a outubro de 2026', obrigA: 'Ex: Principais atividades realizadas: gestão de equipe, prospecção de clientes, elaboração de relatórios', obrigB: '' },
  };

  const hint = hints[id];
  if (!hint) return;

  const descEl   = document.getElementById('obj_desc');
  const obrigAEl = document.getElementById('obj_obrig_a');
  const obrigBEl = document.getElementById('obj_obrig_b');

  if (descEl && hint.desc)   descEl.placeholder   = hint.desc;
  if (obrigAEl && hint.obrigA !== undefined) obrigAEl.placeholder = hint.obrigA || 'O que a Parte A deve fazer ou fornecer...';
  if (obrigBEl && hint.obrigB !== undefined) obrigBEl.placeholder = hint.obrigB || 'O que a Parte B deve executar ou entregar...';
}

// ════════════════════════════════════════════════════════════════
//  RESET DO WIZARD
//  FIX Bug 3: limpa TODOS os inputs e textareas do wizard,
//  não apenas o visual dos steps. Impede valores do documento
//  anterior de vazar para o próximo.
// ════════════════════════════════════════════════════════════════

function resetWizard() {
  currentStep  = 1;
  selectedType = '';

  // Reset steps ativos para padrão completo
  window._activeSteps  = [1,2,3,4,5,6];
  window._docTemParteB = true;

  // ── Limpa TODOS os campos do formulário wizard ──
  // Parte A
  ['p_a_nome','p_a_doc','p_a_rg','p_a_nac','p_a_est','p_a_prof','p_a_end','p_a_tel','p_a_email',
   'p_a_prof','p_a_rg','p_a_nac','p_a_est'
  ].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  // Parte B
  ['p_b_nome','p_b_doc','p_b_rg','p_b_nac','p_b_est','p_b_prof','p_b_end','p_b_tel','p_b_email'
  ].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  // Objeto
  ['obj_desc','obj_obrig_a','obj_obrig_b','obj_entregaveis','obj_local','obj_inicio','obj_fim','obj_vigencia'
  ].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  // Valores
  ['val_total','val_forma','val_venc','val_banco','val_reajuste','val_multa','val_juros','val_cond'
  ].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  // Jurídico
  ['jur_foro','jur_rescisao','jur_multa_resc','jur_resolucao','jur_local','jur_extra'
  ].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  // ── Limpa containers de formulários custom (FIX Bug 3, causa 2) ──
  const s2custom = document.getElementById('step-2-custom-content');
  const s3custom = document.getElementById('step-3-custom-content');
  if (s2custom) s2custom.innerHTML = '';
  if (s3custom) s3custom.innerHTML = '';

  // Restaura visibilidade padrão dos containers
  const s2default = document.getElementById('step-2-default-content');
  const s3default = document.getElementById('step-3-default-content');
  if (s2default) { s2default.style.display = ''; }
  if (s2custom)  { s2custom.style.display  = 'none'; }
  if (s3default) { s3default.style.display = ''; }
  if (s3custom)  { s3custom.style.display  = 'none'; }

  // Restaura seções opcionais
  const pb = document.getElementById('parte-b-section');
  const ts = document.getElementById('testemunhas-section');
  const pf = document.getElementById('prazo-fields');
  if (pb) pb.style.display = '';
  if (ts) ts.style.display = '';
  if (pf) pf.style.display = '';

  ['obj_obrig_a','obj_obrig_b','obj_entregaveis'].forEach(id => {
    const el = document.getElementById(id)?.closest('.field');
    if (el) el.style.display = '';
  });

  // Reseta barra de progresso
  for (let i = 1; i <= 6; i++) {
    const ws = document.getElementById('ws-' + i);
    const wc = document.getElementById('wc-' + i);
    if (ws) { ws.style.display = ''; ws.classList.remove('active','done'); }
    if (wc) wc.style.display = i < 6 ? '' : 'none';
  }

  updateWizardUI();

  // Deseleciona type cards e checkboxes
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.checkbox-item').forEach(c => c.classList.remove('checked'));
  document.querySelectorAll('.checkbox-item input[type=checkbox]').forEach(c => c.checked = false);
  document.querySelectorAll('.checkbox-item .check-box').forEach(c => c.textContent = '');

  // Reset testemunhas toggle
  testemunhasAtivas = false;
  const tf = document.getElementById('test-fields');
  const tl = document.getElementById('test-toggle-label');
  const tt = document.getElementById('test-toggle');
  if (tf) tf.style.display = 'none';
  if (tl) tl.textContent  = 'Não incluir';
  if (tt) tt.classList.remove('active');
  ['test1_nome','test1_doc','test2_nome','test2_doc'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
}

// ════════════════════════════════════════════════════════════════
//  NAVEGAÇÃO DO WIZARD
//  FIX Bug 3 (validação step 2): quando o tipo tem formulário custom
//  (ex: currículo), p_a_nome é preenchido no container custom e a
//  validação agora respeita isso — não bloqueia com dados antigos.
// ════════════════════════════════════════════════════════════════

function wizardNext() {
  if (currentStep === 1 && !selectedType) {
    showNotif('Selecione um tipo de documento', '⚠️'); return;
  }

  if (currentStep === 2) {
    // FIX Bug 3 (causa 4): para tipos com formulário custom, valida
    // somente se p_a_nome foi realmente preenchido AGORA (não herdado).
    const nomeEl = document.getElementById('p_a_nome');
    if (!nomeEl || !nomeEl.value.trim()) {
      showNotif('Preencha o nome / nome completo', '⚠️'); return;
    }
    if (window._docTemParteB !== false) {
      const nomeBEl = document.getElementById('p_b_nome');
      if (!nomeBEl || !nomeBEl.value.trim()) {
        showNotif('Preencha o nome da outra parte', '⚠️'); return;
      }
    }
  }

  if (currentStep === 3) {
    // Para tipos com formulário específico, obj_desc pode ser opcional
    const hasCustom = window.DocFormularios?.temFormEspecifico(selectedType);
    if (!hasCustom && !V('obj_desc')) {
      showNotif('Preencha a descrição do documento', '⚠️'); return;
    }
  }

  // Auto-preenche Foro e Local com cidade do step 3
  if (currentStep === 3) {
    const localExec  = V('obj_local');
    const foroEl     = document.getElementById('jur_foro');
    const jurLocalEl = document.getElementById('jur_local');
    if (localExec && foroEl     && !foroEl.value)     foroEl.value     = localExec;
    if (localExec && jurLocalEl && !jurLocalEl.value) jurLocalEl.value = localExec;
  }

  if (currentStep === 1 && selectedType.startsWith('gen_')) { openIAModal(); return; }

  // Avança para próximo step ativo
  const activeSteps = window._activeSteps || [1,2,3,4,5,6];
  const curIdx = activeSteps.indexOf(currentStep);
  if (curIdx === activeSteps.length - 1) { generateDocument(); return; }
  currentStep = activeSteps[curIdx + 1];
  updateWizardUI();
}

function wizardBack() {
  const activeSteps = window._activeSteps || [1,2,3,4,5,6];
  const curIdx = activeSteps.indexOf(currentStep);
  if (curIdx > 0) { currentStep = activeSteps[curIdx - 1]; updateWizardUI(); }
}

function updateWizardUI() {
  const activeSteps = window._activeSteps || [1,2,3,4,5,6];

  // Mostra/oculta bodies dos steps
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById('step-' + i);
    if (el) el.style.display = i === currentStep ? '' : 'none';
  }

  // Atualiza barra de progresso
  for (let i = 1; i <= 6; i++) {
    const ws = document.getElementById('ws-' + i);
    if (!ws) continue;
    const isActive = activeSteps.includes(i);
    ws.style.display = isActive ? '' : 'none';
    ws.classList.remove('active', 'done');
    if (i === currentStep) ws.classList.add('active');
    if (i < currentStep && isActive) ws.classList.add('done');
    const wc = document.getElementById('wc-' + i);
    if (wc) {
      const nextActive = activeSteps.includes(i + 1);
      wc.style.display = (isActive && nextActive) ? '' : 'none';
      wc.classList.toggle('done', i < currentStep);
    }
  }

  document.getElementById('btn-back').style.visibility = currentStep > 1 ? 'visible' : 'hidden';

  const curIdx = activeSteps.indexOf(currentStep);
  const isLast = curIdx === activeSteps.length - 1;
  const indEl  = document.getElementById('step-indicator');
  if (indEl) indEl.textContent = `Etapa ${curIdx + 1} de ${activeSteps.length}`;

  const btn = document.getElementById('btn-next');
  btn.innerHTML    = isLast ? '✨ Gerar Documento' : 'Próximo →';
  btn.style.background = isLast ? 'var(--green)' : 'var(--accent)';
}

function quickCreate(typeId) {
  gotoPage('create');
  setTimeout(() => {
    for (const [cat, types] of Object.entries(DOC_TYPES)) {
      if (types.find(t => t.id === typeId)) {
        const cats = Object.keys(DOC_TYPES);
        const btns = document.querySelectorAll('.cat-tab');
        const idx  = cats.indexOf(cat);
        if (btns[idx]) filterCategory(btns[idx], cat);
        break;
      }
    }
    setTimeout(() => {
      selectType(typeId);
      document.getElementById('tc-' + typeId)?.scrollIntoView({ behavior:'smooth', block:'center' });
    }, 100);
  }, 200);
}

function buildClauseCards() {
  const g = document.getElementById('clauses-group');
  if (!g) return;
  g.innerHTML = CLAUSES.map(c => `
    <div class="checkbox-item" id="ci-${c.id}" onclick="toggleClause(this,'${c.id}')">
      <input type="checkbox" id="cb-${c.id}"/>
      <div class="check-box" id="chk-${c.id}"></div>
      <div><div class="check-text">${c.name}</div><div class="check-desc">${c.desc}</div></div>
    </div>`).join('');
}

function toggleClause(el, id) {
  el.classList.toggle('checked');
  const box = document.getElementById('chk-' + id);
  const cb  = document.getElementById('cb-'  + id);
  if (el.classList.contains('checked')) { box.textContent = '✓'; cb.checked = true; }
  else { box.textContent = ''; cb.checked = false; }
}
