# Banco de Dados — LOMA

## Diagrama Entidade-Relacionamento (Mermaid)

```mermaid
erDiagram
    Category ||--o{ MenuItem : "has"
    AdminUser ||--o{ AuditLog : "performs"
    BusinessSettings ||--o{ AuditLog : "logged_in"

    Category {
        string id PK "cuid()"
        string name "Nome da categoria"
        string slug UK "URL-friendly"
        string description "Opcional"
        int displayOrder "Ordenação"
        boolean published "Visível no site"
        datetime createdAt
        datetime updatedAt
    }

    MenuItem {
        string id PK "cuid()"
        string categoryId FK "Category.id"
        string name "Nome do item"
        string slug UK "URL-friendly"
        string description "Opcional"
        int priceInCents "Preço em centavos"
        string imagePath "Caminho da imagem"
        string imageAlt "Texto alternativo"
        int displayOrder "Ordenação na categoria"
        boolean published "Visível no site"
        boolean available "Disponível para venda"
        boolean isVegan "Badge vegano"
        boolean isChildFriendly "Badge infantil"
        datetime createdAt
        datetime updatedAt
    }

    MediaAsset {
        string id PK "cuid()"
        string storagePath "Caminho no filesystem/S3"
        string fileName "Nome original"
        string mimeType "image/jpeg, png, webp, avif"
        int fileSize "Bytes"
        string altText "Acessibilidade"
        string attribution "Créditos/licença"
        datetime createdAt
        datetime updatedAt
    }

    BusinessSettings {
        string id PK "main" "Singleton"
        string businessName
        string brandDescription
        string address
        string phone
        string instagramUrl
        string mondayOpen "HH:MM"
        string mondayClose "HH:MM"
        string tuesdayOpen "HH:MM"
        string tuesdayClose "HH:MM"
        string wednesdayOpen "HH:MM"
        string wednesdayClose "HH:MM"
        string thursdayOpen "HH:MM"
        string thursdayClose "HH:MM"
        string fridayOpen "HH:MM"
        string fridayClose "HH:MM"
        string saturdayOpen "HH:MM"
        string saturdayClose "HH:MM"
        string sundayOpen "HH:MM"
        string sundayClose "HH:MM"
        boolean hasOutdoorSeating
        boolean hasVeganOptions
        boolean hasChildMenu
        string seoTitle
        string seoDescription
        string ogImagePath
        datetime updatedAt
    }

    AdminUser {
        string id PK "cuid()"
        string email UK
        string name "Opcional"
        string passwordHash "bcrypt cost 12"
        string role "admin"
        boolean active
        datetime createdAt
        datetime updatedAt
    }

    AuditLog {
        string id PK "cuid()"
        string actorId FK "AdminUser.id"
        string actorEmail "Snapshot"
        string action "CREATE, UPDATE, DELETE, PUBLISH, UNPUBLISH, LOGIN, LOGOUT, REORDER"
        string entityType "Category, MenuItem, MediaAsset, BusinessSettings, AdminUser"
        string entityId "Opcional"
        string metadata "JSON minimal"
        datetime createdAt
    }
```

## Entidades e Relacionamentos

### Category ↔ MenuItem (One-to-Many)
- **Regra**: `onDelete: Restrict` — não permite excluir categoria com itens associados
- **Índices**: `displayOrder`, `published`, `slug` (unique)
- **Ordenação**: `displayOrder ASC` (categorias), depois `displayOrder ASC` (itens)

### AdminUser → AuditLog (One-to-Many)
- **Regra**: Log preserva `actorEmail` como snapshot (caso usuário seja excluído)
- **Índices**: `actorId`, `entityType`, `createdAt`

### BusinessSettings (Singleton)
- **PK fixa**: `id = "main"` — garante única linha
- **Upsert** no seed garante idempotência

## Índices e Constraints

| Tabela | Índice/Constraint | Propósito |
|--------|-------------------|-----------|
| Category | `@@unique([slug])` | URL amigável única |
| Category | `@@index([displayOrder])` | Ordenação eficiente |
| Category | `@@index([published])` | Filtro público rápido |
| MenuItem | `@@unique([slug])` | URL amigável única |
| MenuItem | `@@index([categoryId])` | Join + filtro por categoria |
| MenuItem | `@@index([displayOrder])` | Ordenação dentro da categoria |
| MenuItem | `@@index([published])` | Filtro público rápido |
| MenuItem | `@@index([slug])` | Lookup por slug |
| AdminUser | `@@unique([email])` | Login único |
| AdminUser | `@@index([email])` | Lookup login |
| AuditLog | `@@index([actorId])` | Logs por usuário |
| AuditLog | `@@index([entityType])` | Logs por entidade |
| AuditLog | `@@index([createdAt])` | Ordenação temporal |

## Representação Monetária

**Preços armazenados como `Int` (centavos)**

| Valor Real | Armazenado (priceInCents) | Exibição |
|------------|---------------------------|----------|
| R$ 12,00   | 1200                      | `formatPrice(1200)` → "12,00" |
| R$ 9,50    | 950                       | `formatPrice(950)` → "9,50" |
| R$ 32,00   | 3200                      | `formatPrice(3200)` → "32,00" |

**Vantagens**:
- Zero erros de ponto flutuante
- Operações aritméticas exatas (soma, média, desconto)
- Compatível com gateways de pagamento (todos usam centavos)
- `formatPrice()` usa `Intl.NumberFormat('pt-BR')` para exibição

## Migrações

### Desenvolvimento (SQLite)
```bash
# Aplica schema diretamente (não cria arquivo de migração)
npx prisma db push

# Ou cria migração nomeada (recomendado antes de commit)
npx prisma migrate dev --name descricao_da_mudanca
```

### Produção (PostgreSQL)
```bash
# Gera SQL de migração (não executa)
npx prisma migrate deploy

# Ou aplica migrações pendentes
npx prisma migrate deploy
```

### Histórico de Migrações
Arquivos em `prisma/migrations/` — versionados no Git.

## Inicialização e Seed

### Seed Idempotente (`prisma/seed.ts`)
```bash
npm run db:seed
```

**Características**:
- `upsert` em todas as entidades (não duplica)
- BusinessSettings: cria/atualiza singleton `id: "main"`
- AdminUser: cria `admin@loma.local` com senha `admin123` (bcrypt)
- Categorias/Itens: **apenas em desenvolvimento** (`NODE_ENV !== 'production'`)
- Itens de exemplo marcados com `[Dados de exemplo]` na descrição

### Primeiro Acesso Administrativo
1. Acesse `/admin/login`
2. Email: `admin@loma.local`
3. Senha: `admin123`
4. **ALTERE A SENHA IMEDIATAMENTE** no banco ou crie novo admin

## Backup e Restauração

### SQLite (Desenvolvimento)
```bash
# Backup (copia arquivo)
cp prisma/dev.db prisma/dev.db.backup.$(date +%F)

# Restauração
cp prisma/dev.db.backup.2024-01-15 prisma/dev.db
```

### PostgreSQL (Produção)
```bash
# Backup completo
pg_dump -h <host> -U <user> -d loma > backup_$(date +%F).sql

# Backup apenas dados (sem schema)
pg_dump -h <host> -U <user> -d loma --data-only > backup_data_$(date +%F).sql

# Restauração
psql -h <host> -U <user> -d loma < backup_2024-01-15.sql
```

### Automação Recomendada (Produção)
- **Diário**: `pg_dump` comprimido para S3/bucket com retenção 30 dias
- **Semanal**: Teste de restauração em staging
- **Point-in-time recovery**: Habilitar WAL archiving no PostgreSQL

## Precauções para Mudanças de Schema em Produção

### ❌ NUNCA FAÇA
- `DROP COLUMN` ou `DROP TABLE` sem migração em duas fases
- Renomear colunas/tabelas diretamente (quebra código)
- Mudar tipo de coluna sem `CAST` explícito
- Remover constraints sem verificar dados existentes

### ✅ FAÇA SEMPRE
1. **Migração aditiva primeiro**: Adicione coluna nova nullable
2. **Backfill**: Popule dados na nova coluna (script separado)
3. **Migração restritiva**: Torne NOT NULL, adicione constraints
4. **Cleanup**: Remova coluna antiga em migração posterior

### Exemplo Seguro: Renomear `phone` → `telephone`
```sql
-- Migração 1: Add
ALTER TABLE "BusinessSettings" ADD COLUMN "telephone" TEXT;

-- Script: Backfill
UPDATE "BusinessSettings" SET "telephone" = "phone";

-- Migração 2: Restrict
ALTER TABLE "BusinessSettings" ALTER COLUMN "telephone" SET NOT NULL;

-- Migração 3: Cleanup (após deploy confirmado)
ALTER TABLE "BusinessSettings" DROP COLUMN "phone";
```

## Monitoramento de Saúde

### Queries Úteis
```sql
-- Tamanho das tabelas
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname = 'public';

-- Índices não utilizados
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- Queries lentas (pg_stat_statements)
SELECT query, calls, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

### Alertas Recomendados
- Tamanho DB > 80% do disco
- Conexões > 80% do pool
- Queries > 1s (p95)
- Replication lag > 30s (se replica)