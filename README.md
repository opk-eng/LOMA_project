# LOMA — Cozinha e Padaria Artesanal

<p align="center">
  <strong>Uma experiência digital para uma cozinha artesanal.</strong>
  <br />
  Site institucional e painel administrativo para a LOMA, em Asa Norte, Brasília.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" alt="Prisma" />
</p>

---

## 📑 Índice

- [Visão geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e execução local](#-instalação-e-execução-local)
- [Banco de dados](#️-banco-de-dados)
- [Testes](#-testes)
- [Scripts disponíveis](#-scripts-disponíveis)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Segurança](#-segurança)
- [Documentação adicional](#-documentação-adicional)
- [Deploy em produção](#-deploy-em-produção)
- [Pendências e limitações](#️-pendências-e-limitações-conhecidas)
- [Licença](#-licença)

---

## 🌿 Visão geral

A **LOMA — Cozinha e Padaria Artesanal** é uma aplicação full-stack desenvolvida para apresentar a identidade da marca, disponibilizar seu cardápio e facilitar a administração do estabelecimento.

O projeto combina uma interface pública responsiva com um painel administrativo protegido, permitindo gerenciar produtos, categorias, imagens e informações institucionais.

### Principais recursos

- 🌐 **Site público:** páginas institucionais responsivas e otimizadas para SEO.
- 🔐 **Painel administrativo:** autenticação e gerenciamento de conteúdo.
- 🗄️ **Banco de dados:** SQLite para desenvolvimento e PostgreSQL para produção.
- 🖼️ **Gestão de mídia:** upload de imagens com validação.
- 🧪 **Testes automatizados:** testes unitários, de integração e E2E.
- 🛡️ **Segurança:** validação de dados, controle de acesso e registro de atividades administrativas.

## ✨ Funcionalidades

### 🌐 Site público

| Página | Funcionalidades |
|---|---|
| **Home** (`/`) | Hero com a filosofia da marca, destaques do cardápio, galeria e chamada para visita. |
| **Cardápio** (`/cardapio`) | Categorias e produtos carregados do banco de dados, filtros por categoria e indicadores para opções veganas e infantis. |
| **Sobre** (`/sobre`) | História, valores e serviços, incluindo área externa e opções veganas e infantis. |
| **Galeria** (`/galeria`) | Galeria de imagens com lightbox e link para o Instagram. |
| **Visite-nos** (`/visite-nos`) | Endereço, horários com status de abertura em tempo real, rota no Google Maps e telefone clicável. |
| **Footer** | Navegação, contatos, horários e copyright automático. |

### 🔐 Painel administrativo

| Área | Funcionalidades |
|---|---|
| **Login** (`/admin/login`) | Autenticação com bcrypt, JWT em cookie HttpOnly e limitação de tentativas. |
| **Dashboard** (`/admin`) | Estatísticas, ações rápidas e atividade recente. |
| **Cardápio** (`/admin/menu`) | CRUD completo de categorias e itens, reordenação, publicação e controle de disponibilidade. |
| **Mídia** (`/admin/media`) | Upload com validação de tipo e tamanho, pré-visualização, exclusão e diretrizes de uso. |
| **Configurações** (`/admin/settings`) | Dados do estabelecimento, horários por dia, serviços, SEO e imagem Open Graph. |

## 🛠️ Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.4.2 — App Router |
| Interface | React 19.3.0 |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS v4 |
| ORM e banco de dados | Prisma 7.10.1 — SQLite em desenvolvimento e PostgreSQL em produção |
| Validação | Zod v4 |
| Autenticação | JWT (`jose`) + `bcryptjs` |
| Processamento de imagens | Sharp |
| Upload de arquivos | Armazenamento local em desenvolvimento |
| Ícones | Lucide React |
| Testes unitários e de integração | Vitest |
| Testes end-to-end | Playwright |
| Lint e formatação | ESLint 9 + TypeScript strict |

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) 20 ou superior.
- npm 10 ou superior. Alternativamente, pnpm, Yarn ou Bun.

## 🚀 Instalação e execução local

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd LOMA_project
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário, configurando variáveis como `JWT_SECRET` e `DATABASE_URL`.

### 4. Inicialize o banco de dados

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

### Acesso à aplicação

| Recurso | Endereço |
|---|---|
| Site público | http://localhost:3000 |
| Login administrativo | http://localhost:3000/admin/login |

**Credenciais de desenvolvimento**

- E-mail: `admin@loma.local`
- Senha: `admin123`

> ⚠️ **Importante:** essas credenciais são destinadas ao ambiente local. Altere a senha antes de utilizar o sistema em qualquer ambiente compartilhado e nunca utilize credenciais padrão em produção.

## 🗄️ Banco de dados

O projeto utiliza Prisma ORM para gerenciar o acesso aos dados, com SQLite no desenvolvimento e PostgreSQL como banco de dados recomendado para produção.

### Migrações e seed

```bash
# Gerar o cliente Prisma após alterações no schema
npx prisma generate

# Aplicar o schema ao banco durante o desenvolvimento
npx prisma db push

# Criar uma migração nomeada para o histórico do banco
npx prisma migrate dev --name nome_da_migracao

# Popular o banco com dados iniciais
npm run db:seed

# Abrir o Prisma Studio
npx prisma studio
```

> 💡 O comando `npm run db:seed` utiliza um seed idempotente, permitindo executar a população inicial sem duplicar os dados previstos pelo processo.

### Modelos principais

| Modelo | Responsabilidade |
|---|---|
| `Category` | Categorias do cardápio: nome, slug, ordem e publicação. |
| `MenuItem` | Itens do cardápio: categoria, nome, preço em centavos, imagem, indicadores vegano/infantil e disponibilidade. |
| `MediaAsset` | Imagens enviadas: caminho, metadados e texto alternativo. |
| `BusinessSettings` | Configurações do site: nome, endereço, horários, SEO e redes sociais. |
| `AdminUser` | Administradores: e-mail, hash da senha e função. |
| `AuditLog` | Registro de auditoria: responsável, ação, entidade e metadados. |

## 🧪 Testes

A aplicação conta com uma estrutura de testes dividida por finalidade.

### Executar os testes

```bash
# Testes unitários e de integração
npm run test

# Testes end-to-end (E2E)
npm run test:e2e

# Relatório de cobertura
npm run test:coverage
```

Os testes E2E exigem que o ambiente necessário para sua execução esteja configurado, incluindo o servidor quando aplicável.

### Estrutura de testes

| Diretório | Objetivo |
|---|---|
| `tests/unit/` | Validações, formatação e regras de negócio. |
| `tests/integration/` | Prisma, Server Actions e autenticação. |
| `tests/e2e/` | Fluxos completos, incluindo login, CRUD e navegação pública. |

## 🔧 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com Turbopack. |
| `npm run build` | Gera o build de produção. |
| `npm run start` | Inicia o servidor de produção. |
| `npm run lint` | Executa o ESLint. |
| `npm run typecheck` | Verifica os tipos TypeScript em modo strict. |
| `npm run db:seed` | Popula o banco com dados iniciais. |
| `npm run test` | Executa os testes unitários e de integração com Vitest. |
| `npm run test:e2e` | Executa os testes E2E com Playwright. |

## 📁 Estrutura do projeto

```text
LOMA_project/
├── src/
│   ├── app/
│   │   ├── api/                  # Route Handlers (API)
│   │   ├── admin/                # Painel administrativo protegido
│   │   │   ├── login/            # Autenticação
│   │   │   ├── menu/             # Gerenciamento do cardápio
│   │   │   ├── media/            # Gestão de imagens
│   │   │   └── settings/         # Configurações do site
│   │   ├── cardapio/             # Cardápio público
│   │   ├── sobre/                # Página institucional
│   │   ├── galeria/              # Galeria pública
│   │   ├── visite-nos/           # Informações para visitantes
│   │   ├── globals.css           # Design tokens e Tailwind
│   │   ├── layout.tsx            # Layout raiz, metadata e Schema.org
│   │   └── page.tsx              # Página inicial
│   ├── actions/                  # Server Actions
│   │   ├── auth.ts               # Login e logout
│   │   ├── categories.ts         # CRUD de categorias
│   │   ├── menuItems.ts          # CRUD de itens
│   │   ├── media.ts              # Upload e exclusão de imagens
│   │   └── settings.ts           # Configurações do site
│   ├── components/
│   │   ├── ui/                   # Componentes base
│   │   ├── Header.tsx            # Cabeçalho público
│   │   └── Footer.tsx            # Rodapé público
│   ├── lib/
│   │   ├── auth.ts               # Gerenciamento de sessões JWT
│   │   ├── db.ts                 # Instância singleton do Prisma
│   │   ├── public-data.ts        # Busca de dados para Server Components
│   │   ├── validations.ts        # Schemas Zod e helpers
│   │   └── utils.ts              # Utilitários, incluindo cn
│   └── types/                    # Tipos TypeScript adicionais
├── prisma/
│   ├── schema.prisma             # Schema do banco
│   └── seed.ts                   # Seed idempotente
├── tests/
│   ├── unit/                     # Testes unitários
│   ├── integration/              # Testes de integração
│   └── e2e/                      # Testes end-to-end
└── docs/                         # Documentação técnica
```

## 🔐 Segurança

A segurança é considerada em diferentes camadas da aplicação.

| Recurso | Implementação |
|---|---|
| Autenticação | JWT assinado com HS256 e sessões com expiração de 8 horas. |
| Cookies | HttpOnly, Secure e SameSite=Lax, conforme o ambiente. |
| Autorização | Verificações nas Server Actions e no layout administrativo. |
| Rate limiting | Limite de 5 tentativas de login por e-mail a cada 15 minutos. |
| Validação | Schemas Zod nas entradas e saídas das Server Actions. |
| Upload | Validação de MIME type, limite de 5 MB, nomes seguros e armazenamento fora da raiz pública da aplicação. |
| Headers HTTP | CSP, X-Frame-Options e Referrer-Policy via `next.config.ts`. |
| Senhas | Hash com bcrypt e fator de custo 12. |
| Auditoria | Registro de ações administrativas sensíveis. |

> 🔒 **Nota para produção:** utilize segredos fortes, configure HTTPS, proteja as credenciais administrativas e valide as configurações de cookies, armazenamento e banco de dados antes da publicação.

## 📚 Documentação adicional

A documentação técnica está organizada no diretório `docs/`.

| Documento | Conteúdo |
|---|---|
| [Arquitetura](docs/ARCHITECTURE.md) | Diagramas, decisões arquiteturais e fluxo de dados. |
| [Banco de dados](docs/DATABASE.md) | Diagrama ER, migrações e backup. |
| [API](docs/API.md) | Contratos das Server Actions e Route Handlers. |
| [Guia administrativo](docs/ADMIN_GUIDE.md) | Instruções de utilização do painel. |
| [Deploy](docs/DEPLOYMENT.md) | Preparação e publicação em produção. |
| [Segurança](docs/SECURITY.md) | Modelo de ameaças e controles de segurança. |
| [Testes](docs/TESTING.md) | Estratégia e execução dos testes. |
| [Conteúdo e assets](docs/CONTENT_AND_ASSETS.md) | Imagens, placeholders e aprovações. |

## 🚀 Deploy em produção

Antes de publicar a aplicação, prepare o banco de dados, as variáveis de ambiente, o armazenamento de imagens e o ambiente de execução.

### Checklist pré-deploy

**1. Configure as variáveis de ambiente**

Exemplo de configuração:

```env
DATABASE_URL="postgresql://user:pass@host:5432/loma?schema=public"
JWT_SECRET="<segredo-forte-com-pelo-menos-32-caracteres>"
NEXT_PUBLIC_SITE_URL="https://seu-dominio.com.br"
NODE_ENV="production"
```

Gere um segredo seguro, por exemplo, com `openssl rand -base64 32`, e configure as variáveis diretamente no provedor de hospedagem. Não versione arquivos `.env` com segredos reais.

**2. Prepare o banco de dados**

- Provisione uma instância PostgreSQL.
- Configure a conexão e verifique sua disponibilidade.
- Prepare as migrações para o ambiente de produção.

**3. Configure o armazenamento de imagens**

O upload local utilizado no desenvolvimento deve ser adaptado para armazenamento persistente em produção.

Opções possíveis incluem S3 e Cloudinary. Atualize a implementação em `src/actions/media.ts` conforme o serviço escolhido.

**4. Habilite HTTPS**

HTTPS é obrigatório para a utilização correta de cookies com o atributo `Secure` em produção.

**5. Gere o build e aplique as migrações**

```bash
npm run build
npx prisma migrate deploy
```

> ⚠️ Antes de executar as migrações em produção, confirme a configuração do banco, faça backup e valide o processo de publicação.

### Plataformas recomendadas

- **[Vercel](https://vercel.com/)** — hospedagem com suporte nativo a Next.js, combinada com PostgreSQL gerenciado.
- **[Neon](https://neon.tech/)** ou **[Supabase](https://supabase.com/)** — opções de PostgreSQL gerenciado.
- **[Railway](https://railway.com/)**, **[Render](https://render.com/)** ou **[Fly.io](https://fly.io/)** — alternativas para hospedar a aplicação e seus serviços.
- **VPS com Docker, Nginx e PostgreSQL** — opção para quem deseja administrar a própria infraestrutura.

## ⚠️ Pendências e limitações conhecidas

| Item | Status | Observações |
|---|---|---|
| Imagens oficiais da LOMA | ⏳ Pendente | Substituir placeholders por fotografias autorizadas. |
| Confirmação dos dados pelo proprietário | ⏳ Pendente | Validar horários, endereço, telefone e descrição. |
| Armazenamento persistente de imagens | 📋 Documentado | Adaptar `src/actions/media.ts` para S3, Cloudinary ou serviço equivalente. |
| Recuperação de senha por e-mail | 🚫 Não implementado | Requer integração com um provedor SMTP real. |
| Testes E2E completos | 🔄 Parcial | Playwright configurado, com cenários básicos implementados. |
| Analytics e LGPD | 🚫 Não implementado | Adicionar mecanismos de análise e adequação à LGPD, conforme necessário. |
| Backup automatizado | 📋 Documentado | Consultar `docs/DEPLOYMENT.md`. |

## 📝 Licença

Projeto privado destinado ao uso exclusivo da **LOMA — Cozinha e Padaria Artesanal**.

---

<p align="center">
  Desenvolvido com cuidado, priorizando acessibilidade, SEO, performance e segurança.
  <br /><br />
  <strong>LOMA — Cozinha e Padaria Artesanal</strong>
  <br />
  Brasília, DF · Brasil
</p>
