import { useState } from 'react'
import AuthModal from './auth/AuthModal'

const FEATURES = [
  { icon:'🤖', title:'Assistente de Escrita IA', desc:'Tire dúvidas sobre como preencher seus documentos, entenda o significado de cada campo e receba sugestões de redação' },
  { icon:'📄', title:'40+ Modelos de Documentos', desc:'Contratos, declarações, recibos, acordos — modelos de referência com estrutura profissional completa' },
  { icon:'⚡', title:'Geração em Segundos', desc:'Preencha os dados e gere o documento formatado automaticamente em segundos, pronto para assinar' },
  { icon:'📱', title:'Funciona em Qualquer Dispositivo', desc:'Acesse pelo celular, tablet ou computador. Seus documentos ficam salvos na nuvem com segurança' },
  { icon:'📑', title:'Download em PDF', desc:'Baixe seu documento como PDF profissional, pronto para imprimir ou assinar digitalmente' },
  { icon:'🔒', title:'Seus Dados Protegidos', desc:'Autenticação segura com Firebase. Apenas você tem acesso aos seus documentos' },
]

const DOC_SAMPLES = [
  { icon:'🛠️', name:'Prestação de Serviços' }, { icon:'🏠', name:'Aluguel Residencial' },
  { icon:'💻', name:'Freelancer' },            { icon:'🧾', name:'Recibo de Pagamento' },
  { icon:'🔒', name:'NDA / Confidencialidade'},{ icon:'📋', name:'Declaração de Residência' },
  { icon:'💳', name:'Confissão de Dívida' },   { icon:'📜', name:'Contrato Social' },
  { icon:'🎓', name:'Termo de Estágio' },      { icon:'💰', name:'Acordo de Parcelamento' },
  { icon:'📱', name:'Contrato Influenciador' },{ icon:'⚖️', name:'Notificação Extrajudicial' },
]

export default function Landing() {
  const [authTab,    setAuthTab]    = useState(null)
  const [navOpen,    setNavOpen]    = useState(false)
  const [modalOpen,  setModalOpen]  = useState(false)
  const [activeModal,setActiveModal]= useState(null)

  const openAuth = (tab) => { setAuthTab(tab); setModalOpen(true); setNavOpen(false) }
  const closeAuth = () => setModalOpen(false)

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="land-nav">
        <div className="land-logo">DocFácil <span>IA</span></div>
        <div className="land-nav-links">
          <a href="#features">Funcionalidades</a>
          <a href="#docs">Documentos</a>
          <button onClick={() => setActiveModal('sobre')} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>Sobre</button>
          <button onClick={() => setActiveModal('faq')} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontSize:14, fontFamily:'inherit' }}>FAQ</button>
          <button className="land-btn-login" onClick={() => openAuth('login')}>Entrar</button>
          <button className="land-btn-cta" onClick={() => openAuth('register')}>Criar conta grátis</button>
        </div>
        <button className="land-hamburger" onClick={() => setNavOpen(o => !o)} style={{ display:'flex' }}>
          {navOpen ? '✕' : '☰'}
        </button>
      </nav>

      {navOpen && (
        <>
          <div className="land-mobile-nav">
            <a href="#features" onClick={() => setNavOpen(false)}>Funcionalidades</a>
            <a href="#docs" onClick={() => setNavOpen(false)}>Documentos</a>
            <button onClick={() => { setActiveModal('sobre'); setNavOpen(false) }}>Sobre</button>
            <button onClick={() => { setActiveModal('faq'); setNavOpen(false) }}>FAQ</button>
            <button onClick={() => openAuth('login')}>Entrar</button>
            <button className="land-btn-cta" onClick={() => openAuth('register')}>Criar conta grátis</button>
          </div>
          <div style={{ position:'fixed', inset:0, zIndex:88 }} onClick={() => setNavOpen(false)} />
        </>
      )}

      {/* Hero */}
      <section className="land-hero" style={{ paddingTop:120 }}>
        <div className="land-hero-badge">🤖 Com Inteligência Artificial</div>
        <h1 className="land-hero-title">
          Modelos de documentos<br /><span>profissionais em segundos</span>
        </h1>
        <p className="land-hero-sub">
          Contratos, declarações, recibos e muito mais.<br />
          Gere, edite e baixe em PDF gratuitamente.
        </p>
        <div className="land-hero-btns">
          <button className="land-btn-cta large" onClick={() => openAuth('register')}>
            Começar agora — É grátis
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button className="land-btn-ghost" onClick={() => openAuth('login')}>Já tenho conta</button>
        </div>
        <div className="land-hero-stats">
          <div className="land-stat"><strong>40+</strong><span>Tipos de documentos</span></div>
          <div className="land-stat-div" />
          <div className="land-stat"><strong>100%</strong><span>Gratuito</span></div>
          <div className="land-stat-div" />
          <div className="land-stat"><strong>IA</strong><span>Assistente IA</span></div>
          <div className="land-stat-div" />
          <div className="land-stat"><strong>PDF</strong><span>Download imediato</span></div>
        </div>
      </section>

      {/* Features */}
      <section className="land-section" id="features">
        <div className="land-section-tag">Funcionalidades</div>
        <h2 className="land-section-title">Tudo que você precisa num só lugar</h2>
        <div className="land-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="land-feature">
              <div className="land-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Doc types */}
      <section className="land-section" id="docs" style={{ paddingTop:0 }}>
        <div className="land-section-tag">Documentos</div>
        <h2 className="land-section-title">40+ modelos profissionais prontos</h2>
        <div className="land-docs-grid">
          {DOC_SAMPLES.map((d, i) => (
            <div key={i} className="land-doc-card" onClick={() => openAuth('register')}>
              <div className="land-doc-card-icon">{d.icon}</div>
              <div className="land-doc-card-name">{d.name}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center', marginTop:24 }}>
          <button className="land-btn-cta" style={{ padding:'12px 28px' }} onClick={() => openAuth('register')}>
            Ver todos os modelos →
          </button>
        </div>
      </section>

      {/* CTA section */}
      <section style={{ background:'var(--surface)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'64px 40px', textAlign:'center' }}>
        <div style={{ maxWidth:600, margin:'0 auto' }}>
          <div className="land-section-tag" style={{ display:'inline-block', marginBottom:16 }}>Comece agora</div>
          <h2 style={{ fontFamily:"'DM Serif Display',serif", fontSize:'clamp(24px,4vw,40px)', color:'var(--text)', marginBottom:16, lineHeight:1.2 }}>
            Crie seu primeiro documento<br />em menos de 2 minutos
          </h2>
          <p style={{ fontSize:15, color:'var(--text2)', marginBottom:28, lineHeight:1.7 }}>
            Sem cartão de crédito, sem assinatura. Crie sua conta gratuita e comece a gerar documentos profissionais agora.
          </p>
          <button className="land-btn-cta large" onClick={() => openAuth('register')}>
            Criar conta grátis — É gratuito
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="land-footer">
        <div className="land-footer-logo">DocFácil <span>IA</span></div>
        <div className="land-footer-links">
          <button onClick={() => setActiveModal('termos')}>Termos de Uso</button>
          <button onClick={() => setActiveModal('privacidade')}>Privacidade</button>
          <button onClick={() => setActiveModal('sobre')}>Sobre</button>
          <button onClick={() => setActiveModal('faq')}>FAQ</button>
        </div>
        <div className="land-footer-copy">© {new Date().getFullYear()} DocFácil IA</div>
      </footer>

      {/* Auth Modal */}
      {modalOpen && <AuthModal initialTab={authTab} onClose={closeAuth} />}

      {/* Institutional modals */}
      {activeModal && (
        <div className="inst-overlay" onClick={e => { if (e.target === e.currentTarget) setActiveModal(null) }}>
          <div className="inst-modal">
            <button className="inst-close" onClick={() => setActiveModal(null)}>✕</button>
            {activeModal === 'sobre' && <SobreModal />}
            {activeModal === 'faq'   && <FAQModal />}
            {activeModal === 'termos' && <TermosModal />}
            {activeModal === 'privacidade' && <PrivacidadeModal />}
          </div>
        </div>
      )}
    </div>
  )
}

function SobreModal() {
  return <>
    <div className="inst-icon">📋</div>
    <h2>Sobre o DocFácil</h2>
    <p>O DocFácil IA é uma plataforma de geração de modelos de documentos que usa inteligência artificial para ajudar pessoas e pequenas empresas a criar contratos, declarações e documentos profissionais com facilidade.</p>
    <h3>Nossa missão</h3>
    <p>Democratizar o acesso a modelos de documentos profissionais, tornando o processo simples, rápido e acessível para todos — sem necessidade de conhecimento jurídico avançado.</p>
    <h3>O que oferecemos</h3>
    <ul>
      <li>40+ tipos de documentos em 7 categorias</li>
      <li>Assistente IA para tirar dúvidas</li>
      <li>Download em PDF profissional</li>
      <li>Armazenamento seguro na nuvem</li>
      <li>100% gratuito, sem assinatura</li>
    </ul>
    <div className="inst-disclaimer">⚠️ O DocFácil gera modelos de referência e não presta assessoria ou consultoria de qualquer natureza.</div>
  </>
}

function FAQModal() {
  const faqs = [
    ['Os documentos gerados têm validade legal?', 'Os modelos gerados pelo DocFácil são instrumentos particulares que podem ter validade legal quando assinados pelas partes. Para situações que exigem registro em cartório ou validade específica, consulte um profissional habilitado.'],
    ['O sistema é realmente gratuito?', 'Sim! O DocFácil é 100% gratuito. Você cria conta, gera documentos e baixa PDFs sem pagar nada.'],
    ['Meus dados ficam seguros?', 'Sim. Utilizamos Firebase Authentication e Firestore do Google, com criptografia de ponta a ponta. Apenas você tem acesso aos seus documentos.'],
    ['Posso editar o documento depois de gerado?', 'Sim! Após gerar o documento, clique em "Editar" para modificar qualquer campo diretamente no documento. As alterações ficam salvas automaticamente.'],
    ['Como assinar o documento depois de baixar?', 'Após baixar o PDF, você pode: imprimir e assinar fisicamente, usar apps de assinatura digital como DocuSign, AutentiCar ou Gov.br, ou reconhecer em cartório caso necessário.'],
    ['O DocFácil presta consultoria?', 'Não. O DocFácil é uma ferramenta de geração de modelos de documentos. Não prestamos assessoria, consultoria ou orientação de qualquer natureza.'],
  ]
  const [open, setOpen] = useState(null)
  return <>
    <div className="inst-icon">❓</div>
    <h2>Perguntas Frequentes</h2>
    <div className="inst-faq">
      {faqs.map(([q, a], i) => (
        <div key={i} className="inst-faq-item" onClick={() => setOpen(open === i ? null : i)}>
          <div className="inst-faq-q">{q} <span>{open === i ? '−' : '+'}</span></div>
          {open === i && <div className="inst-faq-a">{a}</div>}
        </div>
      ))}
    </div>
  </>
}

function TermosModal() {
  return <>
    <div className="inst-icon">📋</div>
    <h2>Termos de Uso</h2>
    <p><strong>Última atualização:</strong> Abril de 2026</p>
    <h3>1. Aceitação dos Termos</h3>
    <p>Ao utilizar o DocFácil, você concorda com estes Termos de Uso.</p>
    <h3>2. Descrição do Serviço</h3>
    <p>O DocFácil é uma plataforma digital que oferece modelos de documentos para download. Os modelos são de referência e não constituem assessoria, consultoria ou orientação de qualquer natureza.</p>
    <h3>3. Responsabilidades do Usuário</h3>
    <p>O usuário é responsável por: (a) verificar a adequação do modelo à sua situação; (b) preencher os dados corretamente; (c) consultar um profissional habilitado quando necessário; (d) não utilizar a plataforma para fins ilícitos.</p>
    <h3>4. Limitação de Responsabilidade</h3>
    <p>O DocFácil não se responsabiliza por danos decorrentes do uso dos modelos sem revisão profissional ou por informações incorretas inseridas pelo usuário.</p>
    <h3>5. Propriedade Intelectual</h3>
    <p>Os modelos gerados a partir dos dados do usuário pertencem ao próprio usuário. A plataforma, seu código e design são propriedade do DocFácil.</p>
    <div className="inst-disclaimer">Dúvidas? Entre em contato: contato@docfacil.app</div>
  </>
}

function PrivacidadeModal() {
  return <>
    <div className="inst-icon">🔒</div>
    <h2>Política de Privacidade</h2>
    <p><strong>Última atualização:</strong> Abril de 2026</p>
    <h3>1. Dados Coletados</h3>
    <p>Coletamos: nome, e-mail e dados inseridos nos modelos de documentos. Não coletamos dados de pagamento.</p>
    <h3>2. Uso dos Dados</h3>
    <p>Seus dados são usados exclusivamente para: autenticação na plataforma, armazenamento dos seus documentos e comunicações relacionadas ao serviço.</p>
    <h3>3. Compartilhamento</h3>
    <p>Não vendemos, alugamos ou compartilhamos seus dados com terceiros para fins comerciais. Utilizamos o Firebase (Google) para autenticação e armazenamento.</p>
    <h3>4. Segurança</h3>
    <p>Utilizamos Firebase Authentication com criptografia. Apenas você tem acesso aos seus documentos.</p>
    <h3>5. Seus Direitos (LGPD)</h3>
    <p>Nos termos da Lei nº 13.709/2018, você tem direito a acessar, corrigir e excluir seus dados a qualquer momento nas configurações da conta.</p>
    <div className="inst-disclaimer">Contato do DPO: contato@docfacil.app</div>
  </>
}
