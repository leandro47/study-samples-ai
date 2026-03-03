# Demo Next.js + Better Auth + GitHub + SQLite

Projeto demo simples de autenticação com Next.js App Router, Better Auth, GitHub OAuth e SQLite.

## Configuração

### 1. Variáveis de Ambiente

Configure o arquivo `.env.local` com suas credenciais GitHub OAuth:

```bash
# Better Auth Configuration
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

**Para obter as credenciais GitHub:**
1. Vá para [GitHub Developer Settings](https://github.com/settings/developers)
2. Crie um novo OAuth App
3. Callback URL: `http://localhost:3000/api/auth/callback/github`

### 2. Instalar Dependências

```bash
npm install
```

### 3. Migrar Banco de Dados

```bash
npx @better-auth/cli migrate
```

### 4. Rodar Testes

```bash
npm run test          # Rodar todos os testes
npm run test:ui       # Rodar testes com interface visual
npm run test:report   # Ver relatório dos testes
```

### 5. Rodar Servidor

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Funcionalidades

- ✅ Login com GitHub OAuth
- ✅ Sessão persistente com SQLite
- ✅ Interface simples com Tailwind CSS
- ✅ Estado de autenticação reativo
- ✅ Testes automatizados com Playwright

## Estrutura do Projeto

```
src/
├── lib/
│   ├── auth.ts          # Configuração Better Auth
│   └── auth-client.ts   # Cliente React
├── app/
│   ├── api/auth/[...all]/route.ts  # API routes
│   └── page.tsx         # Página principal
tests/
└── auth.spec.ts         # Testes E2E com Playwright
```
