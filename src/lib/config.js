export const FIREBASE_CONFIG = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

export const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_KEY

export const APP_NAME    = 'DocFácil IA'
export const APP_VERSION = '2.0.0'

export const IA_SYSTEM_PROMPT = `Você é o Assistente IA do DocFácil, especialista em documentos jurídicos brasileiros.
Sua função é ajudar usuários a:
- Entender o propósito e estrutura de contratos, declarações e documentos legais
- Orientar sobre como preencher corretamente cada campo
- Sugerir redações adequadas para cláusulas específicas
- Esclarecer dúvidas sobre termos jurídicos em linguagem simples
- Recomendar o tipo de documento mais adequado para cada situação

Você NÃO presta consultoria jurídica. Para situações específicas, oriente o usuário a consultar um profissional habilitado.
Responda sempre em português brasileiro, de forma clara e objetiva.`
