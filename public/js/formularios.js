// ════════════════════════════════════════════════════════════════
//  js/formularios.js — Formulários específicos por tipo
//  Cada tipo de documento tem seus próprios campos
// ════════════════════════════════════════════════════════════════

window.DocFormularios = {

  // Configuração de formulário por tipo
  config: {

    // ── CURRÍCULO ──────────────────────────────────────────────
    curriculo: {
      etapas: 2,
      step2: {
        titulo: 'Seus dados pessoais',
        sub: 'Informações de contato que aparecerão no currículo',
        campos: [
          { id:'p_a_nome', label:'Nome completo *', full:true, placeholder:'Ex: João da Silva Santos' },
          { id:'p_a_prof', label:'Cargo / Área profissional *', placeholder:'Ex: Desenvolvedor Full Stack' },
          { id:'p_a_tel',  label:'Telefone / WhatsApp', placeholder:'(11) 99999-9999' },
          { id:'p_a_email',label:'E-mail profissional', type:'email', placeholder:'joao@email.com' },
          { id:'p_a_end',  label:'Cidade / Estado', placeholder:'Ex: São Paulo, SP' },
          { id:'p_a_doc',  label:'CPF (opcional)', placeholder:'000.000.000-00' },
        ]
      },
      step3: {
        titulo: 'Experiência e formação',
        sub: 'Descreva sua trajetória profissional',
        campos: [
          { id:'obj_desc', label:'Experiência profissional *', type:'textarea', rows:4,
            placeholder:'Descreva suas experiências: empresa, cargo, período e principais atividades...' },
          { id:'obj_obrig_a', label:'Objetivo profissional', type:'textarea', rows:2,
            placeholder:'Ex: Busco oportunidades em empresas de tecnologia para aplicar minha experiência em...' },
          { id:'obj_entregaveis', label:'Formação acadêmica e habilidades', type:'textarea', rows:3,
            placeholder:'Ex: Ciência da Computação — USP (2020)\nHabilidades: JavaScript, React, Python, SQL\nIdiomas: Inglês avançado' },
          { id:'obj_local', label:'LinkedIn / Portfólio (opcional)', placeholder:'linkedin.com/in/seuperfil' },
        ]
      },
      semValores: true, semClauses: true, semJuridico: true, semParteB: true,
    },

    // ── CARTA DE APRESENTAÇÃO ──────────────────────────────────
    carta_apres: {
      etapas: 2,
      step2: {
        titulo: 'Remetente e destinatário',
        sub: 'Seus dados e da empresa para quem está se apresentando',
        campos: [
          { id:'p_a_nome',  label:'Seu nome completo *', full:true, placeholder:'Ex: João da Silva Santos' },
          { id:'p_a_prof',  label:'Seu cargo / área', placeholder:'Ex: Desenvolvedor Full Stack' },
          { id:'p_a_tel',   label:'Seu telefone', placeholder:'(11) 99999-9999' },
          { id:'p_a_email', label:'Seu e-mail', type:'email', placeholder:'joao@email.com' },
          { id:'p_b_nome',  label:'Para: empresa / pessoa *', full:true, placeholder:'Ex: RH da Empresa XYZ Ltda' },
          { id:'p_b_end',   label:'Cidade / Endereço do destinatário', placeholder:'Ex: São Paulo, SP' },
        ]
      },
      step3: {
        titulo: 'Conteúdo da carta',
        sub: 'O que você quer comunicar na apresentação',
        campos: [
          { id:'obj_desc', label:'Vaga ou assunto da carta *', placeholder:'Ex: Candidatura à vaga de Desenvolvedor Sênior' },
          { id:'obj_obrig_a', label:'Suas principais competências *', type:'textarea', rows:3,
            placeholder:'Descreva suas habilidades e experiências mais relevantes para esta oportunidade...' },
          { id:'obj_obrig_b', label:'Por que quer esta oportunidade?', type:'textarea', rows:2,
            placeholder:'Ex: Tenho interesse em contribuir com a equipe por...' },
          { id:'obj_local', label:'Cidade / Data', placeholder:'Ex: São Paulo, abril de 2026' },
        ]
      },
      semValores: true, semClauses: true, semJuridico: false,
    },

    // ── CARTA DE DEMISSÃO ──────────────────────────────────────
    carta_demissao: {
      etapas: 2,
      step2: {
        titulo: 'Seus dados e da empresa',
        sub: 'Informações para a carta de pedido de demissão',
        campos: [
          { id:'p_a_nome', label:'Seu nome completo *', full:true, placeholder:'Ex: João da Silva Santos' },
          { id:'p_a_prof', label:'Seu cargo atual *', placeholder:'Ex: Analista de Marketing Pleno' },
          { id:'p_a_doc',  label:'CPF', placeholder:'000.000.000-00' },
          { id:'p_b_nome', label:'Para: empresa / gestor *', full:true, placeholder:'Ex: Departamento de RH — Empresa ABC' },
        ]
      },
      step3: {
        titulo: 'Dados da demissão',
        sub: 'Informações sobre a saída',
        campos: [
          { id:'obj_desc', label:'Motivo (opcional)', type:'textarea', rows:2,
            placeholder:'Ex: Aceite de nova oportunidade alinhada aos meus objetivos de carreira (opcional)' },
          { id:'obj_local', label:'Cidade / Data', placeholder:'Ex: São Paulo, 13 de abril de 2026' },
        ]
      },
      semValores: true, semClauses: true, semJuridico: false,
      jur_rescisao_label: 'Prazo do aviso prévio',
    },

    // ── DECLARAÇÃO DE RESIDÊNCIA ───────────────────────────────
    decl_residencia: {
      etapas: 1,
      step2: {
        titulo: 'Dados do declarante',
        sub: 'Suas informações para a declaração de residência',
        campos: [
          { id:'p_a_nome', label:'Nome completo *', full:true, placeholder:'Ex: João da Silva Santos' },
          { id:'p_a_doc',  label:'CPF *', placeholder:'000.000.000-00' },
          { id:'p_a_rg',   label:'RG', placeholder:'00.000.000-0' },
          { id:'p_a_end',  label:'Endereço completo de residência *', full:true,
            placeholder:'Ex: Rua das Flores, 123, Apto 45, Bairro Centro, Cidade - UF, CEP 00000-000' },
          { id:'obj_vigencia', label:'Há quanto tempo reside neste endereço', placeholder:'Ex: 2 anos' },
          { id:'obj_local', label:'Cidade / Local da declaração', placeholder:'Ex: São Paulo, SP' },
        ]
      },
      semValores: true, semClauses: true, semJuridico: false, semParteB: true,
    },

    // ── DECLARAÇÃO DE RENDA ────────────────────────────────────
    decl_renda: {
      etapas: 1,
      step2: {
        titulo: 'Dados do declarante',
        sub: 'Informações para a declaração de renda',
        campos: [
          { id:'p_a_nome',  label:'Nome completo *', full:true, placeholder:'Ex: João da Silva Santos' },
          { id:'p_a_doc',   label:'CPF *', placeholder:'000.000.000-00' },
          { id:'p_a_prof',  label:'Profissão / Ocupação *', placeholder:'Ex: Comerciante, Autônomo, Funcionário Público' },
          { id:'obj_desc',  label:'Fonte de renda *', full:true, placeholder:'Ex: Comércio de alimentos (barraca própria), prestação de serviços elétricos' },
          { id:'val_total', label:'Renda mensal aproximada (R$) *', placeholder:'0,00' },
          { id:'obj_local', label:'Cidade / Local da declaração', placeholder:'Ex: Foz do Iguaçu, PR' },
        ]
      },
      semValores: false, semClauses: true, semJuridico: false, semParteB: true,
    },

    // ── DECLARAÇÃO DE TRABALHO INFORMAL ───────────────────────
    decl_informal: {
      etapas: 1,
      step2: {
        titulo: 'Dados do trabalhador informal',
        sub: 'Informações para a declaração de trabalho informal',
        campos: [
          { id:'p_a_nome',  label:'Nome completo *', full:true, placeholder:'Ex: João da Silva Santos' },
          { id:'p_a_doc',   label:'CPF *', placeholder:'000.000.000-00' },
          { id:'p_a_prof',  label:'Tipo de trabalho informal *', placeholder:'Ex: Vendedor ambulante, Diarista, Ajudante de obra' },
          { id:'val_total', label:'Renda mensal aproximada (R$) *', placeholder:'0,00' },
          { id:'obj_local', label:'Cidade / Local da declaração', placeholder:'Ex: Foz do Iguaçu, PR' },
        ]
      },
      semValores: false, semClauses: true, semJuridico: false, semParteB: true,
    },

    // ── DECLARAÇÃO DE UNIÃO ESTÁVEL ────────────────────────────
    decl_uniao: {
      etapas: 1,
      step2: {
        titulo: 'Dados do casal',
        sub: 'Informações de ambos os conviventes para a declaração',
        campos: [
          { id:'p_a_nome', label:'Nome do Companheiro(a) 1 *', full:true, placeholder:'Ex: João da Silva Santos' },
          { id:'p_a_doc',  label:'CPF do Companheiro(a) 1 *', placeholder:'000.000.000-00' },
          { id:'p_a_end',  label:'Endereço comum do casal *', full:true, placeholder:'Rua, nº, Bairro, Cidade - UF' },
          { id:'p_b_nome', label:'Nome do Companheiro(a) 2 *', full:true, placeholder:'Ex: Maria Souza Santos' },
          { id:'p_b_doc',  label:'CPF do Companheiro(a) 2 *', placeholder:'000.000.000-00' },
          { id:'obj_inicio', label:'Data de início da união *', type:'date' },
          { id:'obj_local',  label:'Cidade / Local da declaração', placeholder:'Ex: São Paulo, SP' },
        ]
      },
      semValores: true, semClauses: true, semJuridico: false,
    },

    // ── RECIBO DE PAGAMENTO ────────────────────────────────────
    recibo: {
      etapas: 1,
      step2: {
        titulo: 'Dados do recibo',
        sub: 'Quem recebeu, quem pagou e o motivo do pagamento',
        campos: [
          { id:'p_a_nome',  label:'Recebedor (nome completo) *', full:true, placeholder:'Ex: João da Silva Santos' },
          { id:'p_a_doc',   label:'CPF/CNPJ do recebedor', placeholder:'000.000.000-00' },
          { id:'p_b_nome',  label:'Pagante (nome completo) *', full:true, placeholder:'Ex: Maria Souza' },
          { id:'p_b_doc',   label:'CPF/CNPJ do pagante', placeholder:'000.000.000-00' },
          { id:'val_total', label:'Valor recebido (R$) *', placeholder:'0,00' },
          { id:'val_forma', label:'Forma de pagamento *', type:'select',
            options:['Pix','Dinheiro','Transferência bancária','Cheque','Cartão de débito','Cartão de crédito'] },
          { id:'val_banco', label:'Dados Pix / Banco (opcional)', placeholder:'Ex: Pix: 11.999.999/0001-00' },
          { id:'obj_desc',  label:'Referente a (motivo do pagamento) *', full:true,
            placeholder:'Ex: Prestação de serviços de pintura residencial em novembro de 2026' },
          { id:'obj_inicio', label:'Data do pagamento *', type:'date' },
          { id:'obj_local',  label:'Cidade', placeholder:'Ex: São Paulo, SP' },
        ]
      },
      semValores: false, semClauses: true, semJuridico: false,
    },

    // ── VISTORIA ───────────────────────────────────────────────
    vistoria: {
      etapas: 1,
      step2: {
        titulo: 'Dados da vistoria',
        sub: 'Informações do imóvel e das partes envolvidas',
        campos: [
          { id:'p_a_nome', label:'Proprietário / Locador *', full:true, placeholder:'Ex: João da Silva Santos' },
          { id:'p_a_doc',  label:'CPF/CNPJ do proprietário', placeholder:'000.000.000-00' },
          { id:'p_b_nome', label:'Locatário / Ocupante *', full:true, placeholder:'Ex: Maria Souza' },
          { id:'p_b_doc',  label:'CPF/CNPJ do locatário', placeholder:'000.000.000-00' },
          { id:'obj_desc', label:'Endereço completo do imóvel *', full:true,
            placeholder:'Ex: Rua das Flores, 123, Apto 45, Jardim América, Cidade - UF' },
          { id:'obj_local', label:'Tipo do imóvel', placeholder:'Ex: Residencial — Casa 3 quartos' },
          { id:'obj_inicio', label:'Data da vistoria *', type:'date' },
          { id:'obj_entregaveis', label:'Observações / estado do imóvel', type:'textarea', rows:3,
            placeholder:'Descreva o estado geral: paredes, pisos, janelas, instalações elétricas, hidráulicas...' },
        ]
      },
      semValores: true, semClauses: true, semJuridico: false,
    },
  },

  // Renderiza os campos de um step no container indicado
  renderStep(typeId, stepNum, containerId) {
    const cfg = this.config[typeId];
    if (!cfg) return false; // tipo não tem config especial — usa wizard padrão

    const stepKey = stepNum === 2 ? 'step2' : 'step3';
    const stepCfg = cfg[stepKey];
    if (!stepCfg) return false;

    const container = document.getElementById(containerId);
    if (!container) return false;

    const campos = stepCfg.campos.map(c => {
      if (c.type === 'textarea') {
        return `<div class="field ${c.full ? 'form-full' : ''}">
          <label>${c.label}</label>
          <textarea id="${c.id}" rows="${c.rows || 3}" placeholder="${c.placeholder || ''}"></textarea>
        </div>`;
      }
      if (c.type === 'date') {
        return `<div class="field">
          <label>${c.label}</label>
          <input id="${c.id}" type="date"/>
        </div>`;
      }
      if (c.type === 'select') {
        const opts = c.options.map(o => `<option value="${o}">${o}</option>`).join('');
        return `<div class="field">
          <label>${c.label}</label>
          <select id="${c.id}">${opts}</select>
        </div>`;
      }
      return `<div class="field ${c.full ? 'form-full' : ''}">
        <label>${c.label}</label>
        <input id="${c.id}" type="${c.type || 'text'}" placeholder="${c.placeholder || ''}"/>
      </div>`;
    }).join('');

    container.innerHTML = `
      <div class="wizard-title">${stepCfg.titulo}</div>
      <div class="wizard-subtitle">${stepCfg.sub}</div>
      <div class="form-grid">${campos}</div>
    `;
    return true;
  },

  // Retorna true se o tipo tem formulário específico
  temFormEspecifico(typeId) {
    return !!this.config[typeId];
  },

  // Retorna config do tipo
  getCfg(typeId) {
    return this.config[typeId] || null;
  }
};
