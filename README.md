# LOMA — Cozinha e Padaria Artesanal

Site institucional e painel administrativo para a LOMA, padaria e restaurante artesanal em Asa Norte, Brasília.

## 📋 Visão Geral

Este projeto é uma aplicação full-stack moderna construída com Next.js 16 (App Router), React 19, TypeScript, Prisma ORM e Tailwind CSS v4. Inclui:

- **Site público** responsivo e otimizado para SEO
- **Painel administrativo** protegido por autenticação segura
- **Banco de dados SQLite** (desenvolvimento) / PostgreSQL (produção)
- **Sistema de upload de imagens** com validação
- **Testes automatizados** (unitários, integração, E2E)

## ✨ Funcionalidades Implementadas

### Site Público (`/`)
- **Home**: Hero com filosofia da marca, destaques do cardápio, galeria, CTA para visita
- **Cardápio** (`/cardapio`): Categorias e itens do banco de dados, filtros por categoria, badges vegano/infantil
- **Sobre** (`/sobre`): História, valores, serviços (área externa, vegano, infantil)
- **Galeria** (`/galeria`): Imagens do acervo com lightbox, link para Instagram
- **Visite-nos** (`/visite-nos`): Endereço, horários com status "aberto/fechado" em tempo real, rota no Google Maps, telefone clicável
- **Footer**: Navegação, contatos, horários, copyright automático

### Painel Administrativo (`/admin`)
- **Login seguro** (`/admin/login`): Rate limiting, bcrypt, JWT em cookie HttpOnly
- **Dashboard** (`/admin`): Estatísticas, ações rápidas, atividade recente
- **Cardápio** (`/admin/menu`): CRUD completo de categorias e itens, reordenação, publicação, disponibilidade
- **Mídia** (`/admin/media`): Upload com validação (tipo, tamanho), preview, exclusão, diretrizes de uso
- **Configurações** (`/admin/settings`): Dados do estabelecimento, horários por dia, serviços, SEO, imagem OG

## 🛠 Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16.4.2 (App Router) |
| UI | React 19.3.0, TypeScript |
| Estilização | Tailwind CSS v4 |
| Banco de Dados | Prisma 7.10.1 (SQLite dev / PostgreSQL prod) |
| Validação | Zod v4 |
| Autenticação | JWT (jose) + bcryptjs |
| Imagens | Sharp + upload local (dev) |
| Ícones | Lucide React |
| Testes | Vitest (unit/integration), Playwright (E2E) |
| Lint/Format | ESLint 9, TypeScript strict |

## 📦 Pré-requisitos

- Node.js 20+
- npm 10+ (ou pnpm/yarn/bun)

## 🚀 Instalação e Execução Local

```bash
# 1. Clone e entre no diretório
cd LOMA_project

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env se necessário (JWT_SECRET, DATABASE_URL)

# 4. Inicialize o banco de dados
npx prisma generate
npx prisma db push
npm run db:seed

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse:
- Site público: http://localhost:3000
- Painel admin: http://localhost:3000/admin/login
  - Email: `admin@loma.local`
  - Senha: `admin123` (**altere no primeiro acesso!**)

## 🗄️ Banco de Dados

### Migrações e Seed

```bash
# Gerar cliente Prisma (após mudanças no schema)
npx prisma generate

# Aplicar schema ao banco (desenvolvimento)
npx prisma db push

# Criar migração nomeada (para produção)
npx prisma migrate dev --name nome_da_migracao

# Popular com dados iniciais (idempotente)
npm run db:seed

# Abrir Prisma Studio (GUI)
npx prisma studio
```

### Schema Principal

- **Category**: Categorias do cardápio (nome, slug, ordem, publicado)
- **MenuItem**: Itens (categoria, nome, preço em centavos, imagem, badges vegano/infantil, disponibilidade)
- **MediaAsset**: Imagens uploadadas (caminho, metadados, alt text)
- **BusinessSettings**: Configurações do site (singleton: nome, endereço, horários, SEO, redes sociais)
- **AdminUser**: Administradores (email, hash de senha, role)
- **AuditLog**: Trilha de auditoria (ator, ação, entidade, metadados)

## 🧪 Testes

```bash
# Testes unitários e de integração
npm run test

# Testes E2E (requer servidor rodando)
npm run test:e2e

# Cobertura de testes
npm run test:coverage
```

### Estrutura de Testes
- `tests/unit/` - Validações, formatação, regras de negócio
- `tests/integration/` - Prisma, Server Actions, autenticação
- `tests/e2e/` - Fluxos completos (login, CRUD, navegação pública)

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento (Turbopack)
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # ESLint
npm run typecheck    # TypeScript strict check
npm run db:seed      # Popular banco com dados iniciais
npm run test         # Testes unitários/integração (Vitest)
npm run test:e2e     # Testes E2E (Playwright)
```

## 📁 Estrutura de Diretórios

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Route Handlers (API)
│   ├── admin/             # Painel administrativo (protegido)
│   │   ├── login/         # Login
│   │   ├── menu/          # CRUD cardápio
│   │   ├── media/         # Gestão de imagens
│   │   └── settings/      # Configurações do site
│   ├── cardapio/          # Página pública do cardápio
│   ├── sobre/             # Página Sobre
│   ├── galeria/           # Galeria pública
│   ├── visite-nos/        # Página de visita
│   ├── globals.css        # Design tokens + Tailwind
│   ├── layout.tsx         # Root layout + metadata + Schema.org
│   └── page.tsx           # Home page
├── actions/               # Server Actions (mutations)
│   ├── auth.ts            # Login/logout
│   ├── categories.ts      # CRUD categorias
│   ├── menuItems.ts       # CRUD itens
│   ├── media.ts           # Upload/exclusão imagens
│   └── settings.ts        # Configurações do site
├── components/
│   ├── ui/                # Componentes base (Button, Input, Textarea)
│   ├── Header.tsx         # Header público
│   └── Footer.tsx         # Footer público
├── lib/
│   ├── auth.ts            # JWT session management
│   ├── db.ts              # Prisma singleton
│   ├── public-data.ts     # Server Components data fetching
│   ├── validations.ts     # Zod schemas + helpers
│   └── utils.ts           # Utilitários (cn)
├── types/                 # TypeScript types (se necessário)
prisma/
├── schema.prisma          # Schema do banco
└── seed.ts                # Seed idempotente
tests/                     # Testes automatizados
docs/                      # Documentação técnica
```

## 🔐 Segurança

- **Autenticação**: JWT assinado (HS256), cookie HttpOnly + Secure + SameSite=Lax, expiração 8h
- **Autorização**: Middleware em Server Actions + layout admin verifica sessão
- **Rate Limit**: Login limitado a 5 tentativas/15min por email
- **Validação**: Zod em todas as Server Actions (input + output)
- **Upload**: Validação MIME type, tamanho (5MB), nomes seguros, armazenamento fora do web root
- **Headers**: CSP, X-Frame-Options, Referrer-Policy via next.config.ts
- **Senhas**: bcrypt com cost 12
- **Auditoria**: Log de ações administrativas sensíveis

## 📚 Documentação Adicional

- [Arquitetura](docs/ARCHITECTURE.md) - Diagramas, decisões, fluxo de dados
- [Banco de Dados](docs/DATABASE.md) - ER diagram, migrações, backup
- [API](docs/API.md) - Contratos de Server Actions e Route Handlers
- [Guia do Admin](docs/ADMIN_GUIDE.md) - Como usar o painel
- [Deploy](docs/DEPLOYMENT.md) - Preparação para produção
- [Segurança](docs/SECURITY.md) - Modelo de ameaças, controles
- [Testes](docs/TESTING.md) - Estratégia e execução
- [Conteúdo e Assets](docs/CONTENT_AND_ASSETS.md) - Imagens, placeholders, aprovações

## 🚀 Deploy em Produção

### Checklist Pré-Deploy

1. **Variáveis de ambiente** (configure no provedor de hospedagem):
   ```env
   DATABASE_URL="postgresql://user:pass@host:5432/loma?schema=public"
   JWT_SECRET="<32+ chars gerado com openssl rand -base64 32>"
   NEXT_PUBLIC_SITE_URL="https://seu-dominio.com.br"
   NODE_ENV="production"
   ```

2. **Banco de dados PostgreSQL** provisionado e acessível

3. **Storage de imagens** configurado (S3, Cloudinary, etc.) - atualize `src/actions/media.ts`

4. **HTTPS** obrigatório (cookies Secure)

5. **Build e migrações**:
   ```bash
   npm run build
   npx prisma migrate deploy
   ```

### Plataformas Recomendadas
- **Vercel** (nativo Next.js) + **Vercel Postgres** / **Neon** / **Supabase**
- **Railway** / **Render** / **Fly.io** + PostgreSQL gerenciado
- **VPS** com Docker + Nginx + PostgreSQL

## ⚠️ Pendências e Limitações Conhecidas

| Item | Status | Notas |
|------|--------|-------|
| Imagens oficiais da LOMA | ⏳ Pendente | Substituir placeholders por fotos autorizadas |
| Confirmação de dados pelo proprietário | ⏳ Pendente | Horários, endereço, telefone, descrição |
| Storage persistente de imagens (produção) | 📋 Documentado | Atualizar `src/actions/media.ts` para S3/Cloudinary |
| Email de recuperação de senha | 🚫 Não implementado | Requer provedor SMTP real |
| Testes E2E completos | 🔄 Parcial | Playwright configurado, cenários básicos |
| Analytics / LGPD | 🚫 Não implementado | Adicionar se necessário |
| Backup automatizado | 📋 Documentado | Ver `docs/DEPLOYMENT.md` |

## 📝 Licença

Projeto privado para uso exclusivo da LOMA — Cozinha e Padaria Artesanal.

---

**Desenvolvido com cuidado** seguindo as melhores práticas de acessibilidade, SEO, performance e segurança.#   L O M A _ p r o j e c t  
 #   L O M A _ p r o j e c t  
 