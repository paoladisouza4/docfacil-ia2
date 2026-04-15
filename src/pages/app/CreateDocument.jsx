import { useState, useEffect, useCallback } from 'react'
import { CATEGORIES, CLAUSES, getTypesByCategory, getDocType, getDocTitle, getRoleA, getRoleB } from '../../lib/documentTypes'
import { buildDocHTML, buildExtraClause } from '../../lib/buildDocHTML'
import { generateDocId, formatDate, formatCurrency, parseCurrency, valorExtenso } from '../../lib/utils'

// ── Helper: read field value ────────────────────────────────
const V = (fields, id) => (fields[id] || '').trim()

// ── Wizard steps labels ─────────────────────────────────────
const STEP_LABELS = ['Tipo','Partes','Objeto','Valores','Cláusulas','Jurídico']

export default function CreateDocument({ onDocumentCreated, quickTypeId }) {
  const [step,         setStep]         = useState(1)
  const [selectedType, setSelectedType] = useState('')
  const [selectedCat,  setSelectedCat]  = useState('contratos')
  const [schema,       setSchema]       = useState(null)
  const [fields,       setFields]       = useState({})
  const [clauses,      setClauses]      = useState([])
  const [testemunhas,  setTestemunhas]  = useState(false)

  // Auto-select quick type
  useEffect(() => {
    if (quickTypeId) {
      const t = getDocType(quickTypeId)
      if (t) {
        setSelectedCat(t.category)
        selectType(quickTypeId)
      }
    }
  }, [quickTypeId])

  const selectType = useCallback((id) => {
    const t = getDocType(id)
    if (!t) return
    setSelectedType(id)
    setSchema(t)
    setFields({ obj_inicio: new Date().toISOString().split('T')[0] })
    setClauses([])
    setTestemunhas(false)
  }, [])

  const activeSteps = schema?.steps || [1,2,3,4,5,6]

  function nextStep() {
    if (step === 1 && !selectedType) return
    const idx = activeSteps.indexOf(step)
    if (idx === activeSteps.length - 1) { generate(); return }
    setStep(activeSteps[idx + 1])
  }

  function prevStep() {
    const idx = activeSteps.indexOf(step)
    if (idx > 0) setStep(activeSteps[idx - 1])
  }

  function setField(id, val) {
    setFields(f => ({ ...f, [id]: val }))
  }

  // Auto-fill foro from obj_local
  useEffect(() => {
    if (step === 3 && fields.obj_local && !fields.jur_foro) {
      setFields(f => ({ ...f, jur_foro: f.obj_local, jur_local: f.obj_local }))
    }
  }, [step])

  function toggleClause(id) {
    setClauses(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  function buildParty(prefix) {
    return {
      nome:  V(fields, `${prefix}_nome`) || (prefix === 'p_a' ? 'CONTRATANTE' : 'CONTRATADO'),
      doc:   V(fields, `${prefix}_doc`),
      rg:    V(fields, `${prefix}_rg`),
      nac:   V(fields, `${prefix}_nac`) || 'Brasileiro(a)',
      est:   V(fields, `${prefix}_est`) || 'solteiro(a)',
      prof:  V(fields, `${prefix}_prof`),
      end:   V(fields, `${prefix}_end`),
      tel:   V(fields, `${prefix}_tel`),
      email: V(fields, `${prefix}_email`),
    }
  }

  function generate() {
    const now     = new Date()
    const dateStr = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })
    const num     = generateDocId()
    const type    = selectedType
    const typeInfo = getDocType(type)

    const pa = buildParty('p_a')
    const pb = schema?.parteB ? buildParty('p_b') : { nome:'', doc:'', nac:'', est:'', prof:'', end:'', tel:'', email:'', rg:'' }
    const t1 = testemunhas ? { nome: V(fields,'test1_nome') || '___________________________', doc: V(fields,'test1_doc') || '___________________' } : { nome:null, doc:null }
    const t2 = testemunhas ? { nome: V(fields,'test2_nome') || '___________________________', doc: V(fields,'test2_doc') || '___________________' } : { nome:null, doc:null }

    const obj = {
      desc:        V(fields,'obj_desc')        || 'objeto conforme acordado entre as partes',
      inicio:      V(fields,'obj_inicio')      ? formatDate(V(fields,'obj_inicio')) : dateStr,
      fim:         V(fields,'obj_fim')         ? formatDate(V(fields,'obj_fim'))    : 'indeterminado',
      local:       V(fields,'obj_local'),
      obrig_a:     V(fields,'obj_obrig_a'),
      obrig_b:     V(fields,'obj_obrig_b'),
      entregaveis: V(fields,'obj_entregaveis'),
    }

    const val = {
      total:    V(fields,'val_total') || '0,00',
      forma:    V(fields,'val_forma') || 'à vista',
      venc:     V(fields,'val_venc')  || 'na data acordada',
      banco:    V(fields,'val_banco'),
      reajuste: V(fields,'val_reajuste'),
      multa:    V(fields,'val_multa')  || '2%',
      juros:    V(fields,'val_juros')  || '1% ao mês',
      cond:     V(fields,'val_cond'),
    }

    const jur = {
      foro:       V(fields,'jur_foro')       || 'Comarca do domicílio das partes',
      rescisao:   V(fields,'jur_rescisao')   || '30 dias',
      multa_resc: V(fields,'jur_multa_resc') || '10% sobre o valor total do contrato',
      resolucao:  V(fields,'jur_resolucao')  || 'pelo Poder Judiciário',
      local:      V(fields,'jur_local'),
      extra:      V(fields,'jur_extra'),
    }

    const roleA    = getRoleA(type)
    const roleB    = getRoleB(type)
    const docTitle = getDocTitle(type)

    const vigText = obj.fim !== 'indeterminado'
      ? `de ${obj.inicio} a ${obj.fim}`
      : `a partir de ${obj.inicio}`

    let clausN = 4
    const selectedClauses = CLAUSES.filter(c => clauses.includes(c.id))
    const extraClauses = selectedClauses.map(c => buildExtraClause(c, ++clausN, pa, pb)).join('')

    const html = buildDocHTML({
      type, num, docTitle, dateStr,
      pa, pb, t1, t2, obj, val, jur,
      roleA, roleB, vigText,
      extraClauses, finalClauseN: clausN + 1,
      typeInfo,
    })

    const docObj = {
      id: num, type, typeInfo,
      title: `${typeInfo?.name || docTitle} — ${pa.nome}`,
      pa, pb, val, obj, jur,
      html,
      status: 'rascunho',
      createdAt: new Date().toISOString(),
    }

    onDocumentCreated(docObj)
  }

  // ── Render ─────────────────────────────────────────────────
  const types  = getTypesByCategory(selectedCat)
  const curIdx = activeSteps.indexOf(step)
  const isLast = curIdx === activeSteps.length - 1

  const renderField = (f) => {
    const val = fields[f.id] || ''
    const onChange = (e) => setField(f.id, e.target.value)
    const common = { id:f.id, value:val, onChange, className:'field-input', required:f.required }

    let input
    if (f.type === 'textarea') {
      input = <textarea {...common} rows={3} placeholder={f.placeholder || ''} className="field-input field-textarea" />
    } else if (f.type === 'date') {
      input = <input type="date" {...common} />
    } else if (f.type === 'money') {
      input = <input type="text" {...common} inputMode="decimal" placeholder="0,00"
        onChange={e => {
          let v = e.target.value.replace(/\D/g,'')
          v = (parseInt(v||'0')/100).toFixed(2).replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.')
          setField(f.id, v)
        }} />
    } else if (f.type === 'select') {
      input = (
        <select {...common}>
          <option value="">Selecione...</option>
          {(f.options||[]).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    } else {
      input = <input type="text" {...common} placeholder={f.placeholder || ''} />
    }

    return (
      <div key={f.id} className={`field${f.type === 'textarea' ? ' form-full' : ''}`}>
        <label htmlFor={f.id}>
          {f.label}{f.required && <span className="req"> *</span>}
        </label>
        {input}
      </div>
    )
  }

  const partyFields = (prefix, label) => (
    <div style={{ marginBottom:24 }}>
      <div className="section-label">{label}</div>
      <div className="form-grid">
        {[
          { id:`${prefix}_nome`, label:'Nome completo *', type:'text', required:true },
          { id:`${prefix}_doc`,  label:'CPF / CNPJ',      type:'text' },
          { id:`${prefix}_rg`,   label:'RG (opcional)',   type:'text' },
          { id:`${prefix}_nac`,  label:'Nacionalidade',   type:'text' },
          { id:`${prefix}_est`,  label:'Estado civil',    type:'text' },
          { id:`${prefix}_prof`, label:'Profissão',       type:'text' },
          { id:`${prefix}_end`,  label:'Endereço completo', type:'text' },
          { id:`${prefix}_tel`,  label:'Telefone',        type:'text' },
          { id:`${prefix}_email`,label:'E-mail',          type:'text' },
        ].map(f => renderField(f))}
      </div>
    </div>
  )

  return (
    <div className="page active">
      <div className="page-header">
        <div className="page-title">Criar Documento</div>
        <div className="page-subtitle">Escolha o tipo e preencha os dados</div>
      </div>

      {/* Progress bar */}
      <div className="wizard-steps">
        {activeSteps.map((s, i) => (
          <React.Fragment key={s}>
            <div className={`wizard-step${step === s ? ' active' : ''}${step > s ? ' done' : ''}`}>
              <div className="step-num">{step > s ? '✓' : i + 1}</div>
              <div className="step-label">{STEP_LABELS[s - 1]}</div>
            </div>
            {i < activeSteps.length - 1 && (
              <div className={`step-connector${step > s ? ' done' : ''}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1 — Tipo */}
      {step === 1 && (
        <div className="wizard-body">
          <div className="wizard-title">Selecione o tipo de documento</div>
          <div className="wizard-subtitle">Escolha entre os modelos profissionais disponíveis</div>
          <div className="cat-tabs">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button key={key}
                className={`cat-tab${selectedCat === key ? ' active' : ''}`}
                onClick={() => setSelectedCat(key)}>
                {cat.label}
              </button>
            ))}
          </div>
          <div className="types-grid">
            {types.map(t => (
              <div key={t.id}
                className={`type-card${selectedType === t.id ? ' selected' : ''}`}
                onClick={() => selectType(t.id)}>
                <div className="type-card-check">✓</div>
                <div className="type-emoji">{t.emoji}</div>
                <div className="type-name">{t.name}</div>
                <div className="type-desc">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — Partes */}
      {step === 2 && schema && (
        <div className="wizard-body">
          <div className="wizard-title">Dados das Partes</div>
          <div className="wizard-subtitle">Informe os dados de: {schema.labels?.step2title || 'ambas as partes'}</div>
          {partyFields('p_a', `Parte A — ${schema.labels?.parteA || 'Contratante'}`)}
          {schema.parteB && partyFields('p_b', `Parte B — ${schema.labels?.parteB || 'Contratado'}`)}
          {/* Campos extras (fiador, etc.) */}
          {schema.fields?.step2Extra?.length > 0 && (
            <div>
              <div className="section-label">Dados adicionais</div>
              <div className="form-grid">{schema.fields.step2Extra.map(renderField)}</div>
            </div>
          )}
          {/* Testemunhas */}
          {schema.testemunhas && (
            <div id="testemunhas-section" style={{ marginTop:24 }}>
              <div className="section-label">Testemunhas</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <button
                  type="button"
                  className={`cat-tab${testemunhas ? ' active' : ''}`}
                  style={{ padding:'6px 14px', fontSize:12 }}
                  onClick={() => setTestemunhas(t => !t)}>
                  {testemunhas ? '✓ Incluir no documento' : 'Não incluir'}
                </button>
              </div>
              {testemunhas && (
                <div className="form-grid">
                  {[
                    { id:'test1_nome', label:'Testemunha 1 — Nome', type:'text' },
                    { id:'test1_doc',  label:'Testemunha 1 — CPF',  type:'text' },
                    { id:'test2_nome', label:'Testemunha 2 — Nome', type:'text' },
                    { id:'test2_doc',  label:'Testemunha 2 — CPF',  type:'text' },
                  ].map(renderField)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Objeto */}
      {step === 3 && schema && (
        <div className="wizard-body">
          <div className="wizard-title">Objeto do Documento</div>
          <div className="wizard-subtitle">Descreva detalhadamente o que está sendo contratado</div>
          <div className="form-grid">
            {(schema.fields?.step3 || []).map(f => {
              // inject hints as placeholders
              const hints = schema.hints || {}
              let ff = { ...f }
              if (f.id === 'obj_desc'    && hints.desc)   ff.placeholder = hints.desc
              if (f.id === 'obj_obrig_a' && hints.obrigA) ff.placeholder = hints.obrigA
              if (f.id === 'obj_obrig_b' && hints.obrigB) ff.placeholder = hints.obrigB
              return renderField(ff)
            })}
          </div>
        </div>
      )}

      {/* Step 4 — Valores */}
      {step === 4 && schema && (
        <div className="wizard-body">
          <div className="wizard-title">Valores e Pagamento</div>
          <div className="wizard-subtitle">Defina as condições financeiras</div>
          <div className="form-grid">
            {(schema.fields?.step4 || []).map(renderField)}
          </div>
        </div>
      )}

      {/* Step 5 — Cláusulas */}
      {step === 5 && (
        <div className="wizard-body">
          <div className="wizard-title">Cláusulas Adicionais</div>
          <div className="wizard-subtitle">Adicione proteções extras ao seu documento</div>
          <div className="checkbox-group">
            {CLAUSES.map(c => (
              <div key={c.id}
                className={`checkbox-item${clauses.includes(c.id) ? ' checked' : ''}`}
                onClick={() => toggleClause(c.id)}>
                <div className="check-box">{clauses.includes(c.id) ? '✓' : ''}</div>
                <div>
                  <div className="check-text">{c.name}</div>
                  <div className="check-desc">{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 6 — Jurídico */}
      {step === 6 && (
        <div className="wizard-body">
          <div className="wizard-title">Dados Jurídicos Finais</div>
          <div className="wizard-subtitle">Informações legais e foro competente</div>
          <div className="form-grid">
            {[
              { id:'jur_foro',     label:'Foro competente',        type:'text' },
              { id:'jur_local',    label:'Cidade / Local da assinatura', type:'text' },
              { id:'jur_rescisao', label:'Prazo para rescisão',    type:'select',
                options:['30 dias','15 dias','60 dias','90 dias'] },
              { id:'jur_multa_resc', label:'Multa por rescisão',   type:'select',
                options:['10% sobre o valor total do contrato','20% sobre o valor total do contrato','equivalente a 1 (um) mês de contrato','sem multa rescisória'] },
              { id:'jur_resolucao', label:'Resolução de conflitos', type:'select',
                options:['pelo Poder Judiciário','por Câmara de Arbitragem, nos termos da Lei nº 9.307/1996','por mediação extrajudicial'] },
            ].map(renderField)}
            {(schema?.fields?.step6Extra || []).map(renderField)}
            {renderField({ id:'jur_extra', label:'Disposições adicionais (opcional)', type:'textarea' })}
          </div>
          <div className="info-box">
            <div style={{ fontSize:13, fontWeight:600, color:'var(--accent)', marginBottom:4 }}>✦ Tudo pronto para gerar!</div>
            <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6 }}>Clique em <strong>Gerar Documento</strong> para criar seu documento completo.</div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="wizard-nav">
        <button className="btn-back"
          style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
          onClick={prevStep}>← Voltar</button>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:12, color:'var(--text3)' }}>
            Etapa {curIdx + 1} de {activeSteps.length}
          </span>
          <button className="btn-next"
            style={{ background: isLast ? 'var(--green)' : 'var(--accent)' }}
            onClick={nextStep}
            disabled={step === 1 && !selectedType}>
            {isLast ? '✨ Gerar Documento' : 'Próximo →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Need React import for Fragment
import React from 'react'
