# DocFácil IA — v2.0

SaaS de geração de documentos profissionais com IA.

## Stack
- React 18 + Vite
- Firebase (Auth + Firestore)
- OpenRouter API (IA)
- TailwindCSS
- Vercel deploy

## Setup rápido

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas chaves

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
```

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `VITE_FIREBASE_API_KEY` | Chave do Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de auth Firebase |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket do Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID Firebase |
| `VITE_FIREBASE_APP_ID` | App ID Firebase |
| `VITE_OPENROUTER_KEY` | Chave da OpenRouter API |

## Obter chave OpenRouter
1. Acesse https://openrouter.ai
2. Crie uma conta
3. Vá em "Keys" e crie uma nova chave
4. Cole no `.env` como `VITE_OPENROUTER_KEY`

## Deploy no Vercel
1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push

## Estrutura

```
src/
├── api/              # Clientes Firebase e OpenRouter
├── components/
│   ├── layout/       # AppLayout, Sidebar, Header
│   └── ui/           # Notif, StatusBadge
├── hooks/            # useAuth, useDocuments, useNotif
├── lib/              # authContext, documentTypes, utils, buildDocHTML, generatePDF
├── pages/
│   ├── auth/         # Login, Register, AuthModal
│   └── app/          # Dashboard, CreateDocument, DocumentView, MyDocuments, AIAssistant, Settings
└── services/         # authService, documentService, aiService, pdfService
```

## Adicionar novos tipos de documento

Edite `src/lib/documentTypes.js` e adicione um novo objeto seguindo o schema:

```js
novo_tipo: {
  id: 'novo_tipo',
  emoji: '📄',
  name: 'Nome do Documento',
  desc: 'Descrição curta',
  category: 'contratos', // ou outra categoria
  steps: [1,2,3,4,5,6],
  parteB: true,
  testemunhas: false,
  labels: { parteA:'Parte A', parteB:'Parte B', step2title:'Partes' },
  fields: {
    step3: [ { id:'obj_desc', label:'Descrição *', type:'textarea', required:true } ],
    step4: [ { id:'val_total', label:'Valor (R$) *', type:'money', required:true } ],
  },
  hints: { desc:'Ex: ...', obrigA:'...', obrigB:'...' },
}
```

O sistema suporta 100+ documentos sem alterar nenhum outro arquivo.
