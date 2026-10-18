# Segurança — LOMA

## Modelo de Ameaças (STRIDE)

| Ameaça | Vetor | Mitigação |
|--------|-------|-----------|
| **Spoofing** | Login fraco, session hijacking | bcrypt cost 12, JWT HS256, HttpOnly+Secure+SameSite cookies, rate limit login |
| **Tampering** | SQL injection, XSS, CSRF | Prisma parameterized queries, React auto-escaping, SameSite=Lax, Zod validation |
| **Repudiation** | Ações admin sem rastro | AuditLog imutável (ator, ação, entidade, timestamp, metadata) |
| **Information Disclosure** | Erros expostos, logs sensíveis | Error boundaries, sanitização de logs, nunca logar senhas/tokens |
| **Denial of Service** | Upload grande, brute force | Validação tamanho/tipo upload (5MB), rate limit login (5/15min), CSP |
| **Elevation of Privilege** | Bypass auth, IDOR | Server-side auth em toda Server Action, verificação ownership |

## Autenticação e Sessões

### JWT (jose)
- **Algoritmo**: HS256 (chave simétrica)
- **Claims**: `userId`, `email`, `role`, `iat`, `exp`
- **Expiração**: 8 horas (configurável em `SESSION_MAX_AGE`)
- **Assinatura**: `JWT_SECRET` (mín. 32 chars, rotação manual)

### Cookie de Sessão
```typescript
cookieStore.set('loma_session', token, {
  httpOnly: true,        // Inacessível via JS (XSS protection)
  secure: true,          // Apenas HTTPS (produção)
  sameSite: 'lax',       // CSRF protection (permite navegação normal)
  maxAge: 60 * 60 * 8,   // 8 horas
  path: '/',             // Todo o site
})
```

### Proteção de Rotas Admin
- **Layout `/admin/layout.tsx`**: `getAdminSession()` → redirect se não autenticado
- **Server Actions**: `requireAuth()` no início de cada action
- **Route Handlers**: `requireAdmin()` antes de qualquer query

### Rate Limiting (Login)
- **In-memory**: `Map<email, { count, resetAt }>`
- **Limite**: 5 tentativas / 15 minutos por email
- **Limitação**: Não funciona em múltiplas instâncias → **Use Redis em produção**

### Senhas
- **Hash**: bcrypt cost 12 (padrão OWASP 2024)
- **Nunca**: Armazenar em texto plano, logar, enviar em resposta
- **Seed**: Senha padrão `admin123` apenas para setup inicial — **trocar obrigatoriamente**

## Validação de Entrada

### Zod em Todas as Server Actions
```typescript
const parsed = schema.safeParse(raw)
if (!parsed.success) {
  return { success: false, error: 'Dados inválidos.', issues }
}
```

### Schemas Principais
- `loginSchema`: email + password
- `categorySchema`: name, slug (regex), description, displayOrder, published
- `menuItemSchema`: categoryId (FK), name, slug, priceInCents, etc.
- `businessSettingsSchema`: todos os campos do site

### Sanitização
- **Slugs**: Regex `^[a-z0-9-]+$` — sem caracteres especiais
- **HTML**: React escapa automaticamente em `{variable}`
- **URLs**: `z.url()` valida Instagram, site
- **Preços**: Inteiro (centavos) — sem float

## Upload de Arquivos

### Validações Servidor
```typescript
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
```

### Nomes Seguros
```typescript
function generateSafeFileName(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg'
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${ext}`
}
```

### Armazenamento
- **Desenvolvimento**: `public/uploads/` (fora do `src`, servido estaticamente)
- **Produção**: **Obrigatório** S3/Cloudinary — `public/` é efêmero em serverless

### Prevenção de Execução
- Arquivos servidos como estáticos (não executados)
- MIME type validado no upload
- Extensão preservada mas nome randomizado
- **Nunca** servir uploads com `Content-Type: application/octet-stream` sem validação

## Headers de Segurança

### next.config.ts
```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js precisa
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}
```

### CSP Considerações
- Next.js 16 requer `'unsafe-inline'` e `'unsafe-eval'` para scripts inline
- Fonts Google: `fonts.googleapis.com` + `fonts.gstatic.com`
- Imagens: `data:`, `https:`, `blob:` (para uploads/previews)
- Ajustar conforme integrações externas

## Proteção de Dados Sensíveis

### Nunca Logar/Expor
- `password`, `passwordHash`, `token`, `secret`, `key`
- JWT completo
- Dados pessoais desnecessários (LGPD)

### Logs Seguros
```typescript
// ✅ Bom
console.log('User login', { email, userId })

// ❌ Ruim
console.log('Login', { email, password, token })
```

### Variáveis de Ambiente
- **Nunca** commitar `.env` com segredos reais
- `.env.example` apenas com placeholders
- Produção: configurar no painel do provedor (Vercel, Railway, etc.)

## LGPD (Lei Geral de Proteção de Dados)

### Dados Coletados
| Dado | Finalidade | Base Legal | Retenção |
|------|------------|------------|----------|
| Admin email + hash | Autenticação | Legítimo interesse / Contrato | Enquanto conta ativa |
| AuditLog (email, ação) | Auditoria/Segurança | Legítimo interesse | 2 anos (configurável) |
| Imagens (alt text) | Acessibilidade/SEO | Consentimento (upload admin) | Enquanto publicada |

### Direitos do Titular
- **Acesso**: Admin vê seus próprios logs
- **Retificação**: Atualizar email/nome no banco
- **Exclusão**: Desativar conta (soft delete `active: false`)
- **Portabilidade**: Exportar dados via script

### Não se Aplica
- **Não há dados de clientes** (sem cadastro, pedido, avaliação)
- **Não há analytics/tracking** por padrão
- **Cookies**: Apenas sessão admin (essencial)

## Dependências e Vulnerabilidades

### Auditoria Contínua
```bash
# Verificar vulnerabilidades conhecidas
npm audit

# Corrigir automaticamente (cuidado com breaking changes)
npm audit fix

# Verificar outdated
npm outdated
```

### Políticas
- Atualizar dependências mensalmente
- `npm audit` no CI/CD (falhar em `high`/`critical`)
- `dependabot` ou `renovate` configurado

## Limitações Conhecidas

| Limitação | Impacto | Mitigação Futura |
|-----------|---------|------------------|
| Rate limit in-memory | Falha em multi-instância | Redis + `rate-limiter-flexible` |
| Sem 2FA | Credencial comprometida = acesso total | Adicionar TOTP (speakeasy) |
| Sem rotação JWT | Chave comprometida = todos tokens válidos | Implementar key rotation + revogação |
| Upload local | Não persiste em serverless | S3/Cloudinary (documentado) |
| Sem WAF | Ataques L7 possíveis | Cloudflare WAF / Vercel Edge Middleware |
| Logs básicos | Detecção tardia de anomalias | Structured logging + SIEM |

## Checklist de Hardening (Pré-Produção)

- [ ] `JWT_SECRET` ≥ 32 chars aleatórios (`openssl rand -base64 32`)
- [ ] `NODE_ENV=production`
- [ ] HTTPS forçado (HSTS)
- [ ] Cookies `Secure: true`
- [ ] CSP configurado e testado
- [ ] Rate limit Redis em produção
- [ ] Upload → S3/Cloudinary
- [ ] PostgreSQL com SSL (`sslmode=require`)
- [ ] Backup automático testado
- [ ] Logs sem segredos
- [ ] `npm audit` sem `high`/`critical`
- [ ] Health check funcional
- [ ] Alertas de uptime/erro configurados
- [ ] Documentação de incidentes (runbook)