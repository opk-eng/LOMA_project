# Guia do Administrador — LOMA

## Acesso ao Painel

1. Acesse: `https://seu-dominio.com/admin/login` (ou `http://localhost:3000/admin/login` em desenvolvimento)
2. Credenciais iniciais:
   - **Email**: `admin@loma.local`
   - **Senha**: `admin123`
3. **⚠️ IMPORTANTE**: Altere a senha imediatamente após o primeiro login!

## Visão Geral do Dashboard (`/admin`)

O dashboard mostra:
- **Estatísticas**: Total de categorias, itens publicados/rascunhos, imagens
- **Atividade Recente**: Últimas categorias e itens criados/editados
- **Ações Rápidas**: Botões para criar categoria, item, gerenciar mídia, configurar site

## Gerenciar Cardápio (`/admin/menu`)

### Abas
- **Categorias**: Gerencia grupos (ex: "Padaria Artesanal", "Café da Manhã")
- **Itens**: Gerencia produtos individuais

### Categorias

#### Criar Nova Categoria
1. Clique em **"Nova Categoria"**
2. Preencha:
   - **Nome**: Exibido no site (ex: "Padaria Artesanal")
   - **Slug**: URL amigável (ex: `padaria-artesanal`) — apenas letras minúsculas, números e hífens
   - **Descrição**: Texto opcional exibido no cardápio
   - **Ordem**: Número para ordenação (menor = primeiro)
   - **Publicada**: Marque para aparecer no site público
3. Clique em **"Criar categoria"**

#### Editar Categoria
- Clique no ícone ✏️ (editar) na linha da categoria
- Altere os campos desejados
- Clique em **"Salvar alterações"**

#### Publicar/Despublicar
- Clique no ✅ (verde = publicada) ou ❌ (cinza = rascunho)
- **Apenas categorias publicadas aparecem no site público**

#### Excluir Categoria
- Clique no ícone 🗑️ (lixo)
- **Só funciona se a categoria não tiver itens** (proteção de integridade)
- Confirme na modal

#### Reordenar
- Use o ícone ⋮⋮ (arrastar) para mudar a ordem
- A ordem afeta a exibição no cardápio público

---

### Itens do Cardápio

#### Criar Novo Item
1. Clique em **"Novo Item"**
2. Preencha:
   - **Categoria**: Selecione a categoria pai
   - **Nome**: Exibido no cardápio (ex: "Pão de Fermentação Natural")
   - **Slug**: URL amigável única (ex: `pao-fermentacao-natural`)
   - **Descrição**: Detalhes do item (ingredientes, preparo)
   - **Preço (centavos)**: Valor em centavos (ex: `1200` = R$ 12,00)
   - **Imagem (caminho)**: Caminho da foto (ex: `/uploads/pao.jpg`) — faça upload antes em Mídia
   - **Texto alternativo**: Descrição da imagem para acessibilidade (obrigatório se houver imagem)
   - **Ordem**: Ordenação dentro da categoria
   - **Publicado**: Visível no site
   - **Disponível**: Pode ser pedido (se desmarcado, mostra "Indisponível")
   - **Vegano**: Badge 🌱 no cardápio
   - **Infantil**: Badge 👶 no cardápio
3. Clique em **"Criar item"**

#### Editar Item
- Clique no ✏️ na linha do item
- Ajuste os campos
- Clique em **"Salvar alterações"**

#### Publicar/Despublicar Item
- ✅ = Publicado no site | ❌ = Rascunho (apenas admin vê)

#### Disponibilidade
- 👁️ = Disponível | 🚫 = Indisponível (mostra badge no cardápio)
- Útil para itens temporariamente fora de estoque

#### Excluir Item
- 🗑️ + confirmação
- **Ação irreversível**

---

## Gerenciar Mídia (`/admin/media`)

### Upload de Imagem
1. Clique em **"Upload de Imagem"**
2. Selecione arquivo (JPEG, PNG, WebP, AVIF — máx. 5MB)
3. Preencha:
   - **Texto alternativo**: Descrição para leitores de tela (ex: "Pão artesanal na mesa de madeira")
   - **Atribuição/Licença**: Créditos (ex: "Foto por João Silva / LOMA")
4. Clique em **"Enviar"**

### Visualização e Exclusão
- Grade com thumbnails
- Passe o mouse para ver botão de exclusão (🗑️)
- Clique para confirmar exclusão (remove arquivo + registro no banco)

### ⚠️ Diretrizes Importantes
- **Use apenas fotos autorizadas da LOMA** (Instagram oficial com permissão OU arquivos próprios)
- **NÃO use imagens de outros estabelecimentos** como se fossem da LOMA
- **Preencha sempre o texto alternativo** (acessibilidade)
- **Para produção**: Configure armazenamento persistente (S3, Cloudinary) — o local `public/uploads/` não persiste em deploys serverless

---

## Configurações do Site (`/admin/settings`)

### Informações Básicas
- **Nome do Estabelecimento**: Título do site, SEO, footer
- **Descrição da Marca**: Texto institucional (footer, página Sobre)
- **Endereço Completo**: Exibido no rodapé, página "Visite-nos", Schema.org
- **Telefone**: Link `tel:` clicável no header, footer, página de visita
- **Instagram URL**: Link para `@lomacozinha` (abre em nova aba)

### Horário de Funcionamento
- Configure **abertura e fechamento** para cada dia da semana (formato HH:MM, 24h)
- Exemplo: `07:30` / `22:00`
- **Status "Aberto/Fechado" na página Visite-nos** calcula automaticamente pelo horário de Brasília (UTC-3)

### Serviços (Badges no site)
- **Área externa**: Mesas ao ar livre
- **Opções veganas**: Pratos 100% vegetais
- **Menu infantil**: Opções para crianças

### SEO e Compartilhamento Social
- **Título SEO** (meta title): Máx. 200 chars — aparece no Google
- **Descrição SEO** (meta description): Máx. 300 chars — snippet no Google
- **Imagem Open Graph**: Foto para compartilhamento no WhatsApp, Facebook, LinkedIn
  - Recomendado: **1200×630px**, JPEG/PNG/WebP, máx. 5MB
  - Faça upload via botão "Atualizar"

### Salvar
- Clique em **"Salvar Configurações"** no final da página
- Mensagem de sucesso/erro aparece no topo

---

## Fluxo de Trabalho Recomendado

### Para Atualizar o Cardápio
1. **Mídia** → Upload das fotos dos novos itens
2. **Cardápio → Categorias** → Criar/ajustar categorias (marcar "Publicada")
3. **Cardápio → Itens** → Criar itens, vincular categoria e imagem, marcar "Publicado" e "Disponível"
4. Verificar no site público (`/cardapio`)

### Para Atualizar Horários
1. **Configurações** → Ajustar horários por dia
2. Salvar
3. Verificar status "Aberto/Fechado" na página "Visite-nos"

### Para Mudar Foto de Compartilhamento (WhatsApp/Facebook)
1. **Configurações** → SEO → Upload nova imagem OG
2. Testar compartilhando link do site no WhatsApp

---

## Solução de Problemas Comuns

| Problema | Causa Provável | Solução |
|----------|----------------|---------|
| "Slug já existe" | Categoria/item com mesmo slug | Use slug diferente (adicione sufixo: `pao-2`) |
| "Categoria possui itens" ao excluir | Itens vinculados à categoria | Mova ou exclua os itens primeiro |
| Imagem não aparece no cardápio | Caminho incorreto ou upload não feito | Verifique em Mídia; use caminho exato `/uploads/arquivo.jpg` |
| "Não autenticado" no admin | Sessão expirou (8h) | Faça login novamente |
| Horário "Aberto" incorreto | Fuso horário do servidor | Servidor deve estar em UTC-3 (Brasília) |
| Erro 500 ao salvar | Dados inválidos ou bug | Verifique campos obrigatórios; veja logs do servidor |

---

## Segurança

- **Nunca compartilhe** credenciais de admin
- **Altere a senha padrão** no primeiro acesso
- **Use HTTPS** em produção (cookies `Secure` exigem)
- **Logout** ao sair de computadores compartilhados
- **Auditoria**: Todas as ações ficam registradas (logs internos)

---

## Contato Técnico

Para dúvidas não cobertas aqui, consulte:
- `docs/ARCHITECTURE.md` — Arquitetura técnica
- `docs/API.md` — Contratos das Server Actions
- `docs/DEPLOYMENT.md` — Deploy e configuração de produção