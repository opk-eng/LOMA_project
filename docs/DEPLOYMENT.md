# Deploy em Produção — LOMA

## Checklist de Preparação

### 1. Variáveis de Ambiente (Obrigatórias)

Configure no provedor de hospedagem (Vercel, Railway, Render, etc.):

```env
# Banco de Dados (PostgreSQL em produção)
DATABASE_URL="postgresql://user:password@host:5432/loma?schema=public&connection_limit=10"

# JWT Secret - MÍNIMO 32 CARACTERES
# Gere com: openssl rand -base64 32
JWT_SECRET="sua-chave-super-secreta-com-pelo-menos-32-caracteres"

# URL Canônica do Site (HTTPS obrigatório em produção)
NEXT_PUBLIC_SITE_URL="https://loma.com.br"

# Ambiente
NODE_ENV="production"
```

### 2. Banco de Dados PostgreSQL

**Opções recomendadas**:
- **Vercel Postgres** / **Neon** / **Supabase** (serverless, auto-scaling)
- **Railway PostgreSQL** / **Render PostgreSQL** (gerenciado)
- **AWS RDS** / **Google Cloud SQL** / **Azure Database** (enterprise)

**Provisionamento**:
1. Crie banco `loma`
2. Anote connection string
3. Configure `DATABASE_URL` no provedor de deploy

**Migrações**:
```bash
# Local (após configurar DATABASE_URL de produção)
npx prisma migrate deploy

# Ou no CI/CD pipeline
npx prisma generate
npx prisma migrate deploy
```

### 3. Armazenamento de Imagens (Produção)

**O upload local (`public/uploads/`) NÃO persiste** em deploys serverless/ephemeral.

**Configure um provider**:

#### AWS S3 (Recomendado)
```typescript
// src/actions/media.ts - Substituir implementação
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({ region: process.env.AWS_REGION })
const BUCKET = process.env.AWS_S3_BUCKET

export async function uploadImageAction(...) {
  // ... validação ...
  const key = `uploads/${generateSafeFileName(file.name)}`
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ACL: 'public-read' // ou use CloudFront signed URLs
  }))
  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  // ... salvar no DB com url ...
}
```

**Variáveis S3**:
```env
AWS_S3_BUCKET="loma-media"
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
```

#### Cloudinary (Alternativa)
```typescript
// npm install cloudinary
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload
const result = await cloudinary.uploader.upload_stream(...)
```

### 4. HTTPS e Domínio

- **Domínio próprio**: `loma.com.br` (configure DNS A/AAAA + CNAME www)
- **SSL**: Automático na Vercel, Railway, Render, Cloudflare
- **HSTS**: Configure no provedor ou via `next.config.ts` headers
- **Cookies Secure**: `JWT_SECRET` exige HTTPS (cookie `Secure`)

### 5. Build e Deploy

```bash
# Build local para testar
npm run build
npm run start

# Deploy Vercel (recomendado para Next.js)
npx vercel --prod

# Deploy Railway
railway up

# Deploy Render
# Conecte repo GitHub → Auto-deploy

# Docker (qualquer VPS)
docker build -t loma .
docker run -p 3000:3000 --env-file .env.production loma
```

**Dockerfile** (criar na raiz):
```dockerfile
FROM node:20-alpine AS base
WORKDIR /app

# Dependencies
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Runner
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["node", "server.js"]
```

**next.config.ts** (adicionar `output: 'standalone'`):
```typescript
const nextConfig: NextConfig = {
  output: 'standalone',
  // ... resto da config
}
```

## Pipeline CI/CD (GitHub Actions)

`.github/workflows/deploy.yml`:
```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npx prisma generate
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Variáveis de Segredo (GitHub/Provedor)

| Segredo | Descrição |
|---------|-----------|
| `DATABASE_URL` | Connection string PostgreSQL |
| `JWT_SECRET` | 32+ chars aleatórios |
| `NEXT_PUBLIC_SITE_URL` | `https://loma.com.br` |
| `AWS_S3_BUCKET` / `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Se usar S3 |
| `CLOUDINARY_*` | Se usar Cloudinary |
| `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` | Se deploy Vercel via Actions |

## Health Checks

**Endpoint**: `GET /api/health` (criar se necessário)

```typescript
// src/app/api/health/route.ts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ status: 'ok', timestamp: new Date().toISOString() })
  } catch {
    return Response.json({ status: 'error' }, { status: 503 })
  }
}
```

**Monitoramento**: UptimeRobot, Better Uptime, Datadog, ou nativo do provedor.

## Backup e Restauração

### Automático (Produção)
- **Diário**: `pg_dump` comprimido → S3/bucket com retenção 30 dias
- **Semanal**: Teste de restauração em staging
- **Point-in-time**: Habilitar WAL archiving no PostgreSQL

### Manual
```bash
# Backup
pg_dump -h $HOST -U $USER -d loma | gzip > backup_$(date +%F).sql.gz

# Restauração
gunzip -c backup_2024-01-15.sql.gz | psql -h $HOST -U $USER -d loma
```

## Rollback

### Vercel
- Dashboard → Deployments → "Redeploy" versão anterior
- Ou `vercel rollback <deployment-url>`

### Docker
```bash
docker tag loma:current loma:rollback-$(date +%s)
docker pull loma:previous-tag
docker stop loma && docker run -d --name loma loma:previous-tag
```

### Database (Cuidado!)
- **Migrações são irreversíveis** sem down migration
- Para rollback de schema: `prisma migrate resolve --rolled-back <migration_name>` + deploy anterior
- Sempre teste rollback em staging primeiro

## Checklist Pós-Deploy

- [ ] Site carrega em `https://loma.com.br`
- [ ] `/admin/login` funciona (HTTPS, cookies Secure)
- [ ] Login com credenciais de produção
- [ ] Cardápio público mostra dados do banco
- [ ] Upload de imagem funciona (S3/Cloudinary)
- [ ] Imagem OG aparece ao compartilhar no WhatsApp
- [ ] Horários "Aberto/Fechado" corretos (fuso UTC-3)
- [ ] Schema.org validado (Google Rich Results Test)
- [ ] Core Web Vitals aceitáveis (PageSpeed Insights)
- [ ] Logs sem erros 500
- [ ] Backup automático configurado e testado
- [ ] Alertas de uptime ativos

## Diferenças: Local vs Preview vs Produção

| Aspecto | Local | Preview (Vercel) | Produção |
|---------|-------|------------------|----------|
| Banco | SQLite (`file:./dev.db`) | PostgreSQL (preview branch) | PostgreSQL (main) |
| Imagens | `public/uploads/` (persiste) | Ephemeral (S3 se configurado) | S3/Cloudinary |
| Cookies | `Secure: false` (HTTP) | `Secure: true` (HTTPS) | `Secure: true` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://branch-preview.vercel.app` | `https://loma.com.br` |
| Seed | Itens de exemplo | Sem seed / seed limpo | Apenas seed de config |
| Logs | Console | Vercel Logs / Railway Logs | Provedor + observabilidade |

## Primeiro Administrador em Produção

**Opção 1: Seed com senha forte**
```bash
# Edite prisma/seed.ts com senha forte antes do deploy
# Ou crie script separado:
npx tsx scripts/create-admin.ts
```

**Opção 2: Interface (após deploy)**
1. Acesse `/admin/login`
2. Use credenciais do seed (`admin@loma.local` / senha do seed)
3. **Altere senha imediatamente** via SQL ou crie novo admin e desative o antigo

**Script `scripts/create-admin.ts`**:
```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@loma.com.br'
  const password = process.env.ADMIN_PASSWORD // Defina no ambiente!
  const name = process.env.ADMIN_NAME || 'Administrador'

  if (!password || password.length < 12) {
    throw new Error('ADMIN_PASSWORD deve ter 12+ caracteres')
  }

  const hash = await bcrypt.hash(password, 12)

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: hash, active: true },
    create: { email, name, passwordHash: hash, role: 'admin', active: true },
  })

  console.log(`Admin criado/atualizado: ${email}`)
}

main().finally(() => prisma.$disconnect())
```

Execute: `ADMIN_EMAIL=admin@loma.com.br ADMIN_PASSWORD="senha-forte-123" npx tsx scripts/create-admin.ts`