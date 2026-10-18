# Conteúdo e Assets — LOMA

## Imagens Necessárias

### Placeholders Atuais (Substituir por Fotos Oficiais)
| Local | Caminho Sugerido | Dimensões | Descrição |
|-------|------------------|-----------|-----------|
| Hero Home | `/uploads/hero-main.jpg` | 1920×1080 | Foto principal da padaria/ambiente |
| Filosofia | `/uploads/philosophy-kitchen.jpg` | 1200×900 | Cozinha/padeiro trabalhando |
| Cardápio - Padaria | `/uploads/cat-padaria.jpg` | 800×600 | Mesa com pães variados |
| Cardápio - Café | `/uploads/cat-cafe.jpg` | 800×600 | Café da manhã completo |
| Cardápio - Almoço | `/uploads/cat-almoco.jpg` | 800×600 | Prato do almoço |
| Cardápio - Bebidas | `/uploads/cat-bebidas.jpg` | 800×600 | Cafés e sucos |
| Galeria (8+) | `/uploads/gallery-01.jpg` a `/uploads/gallery-08.jpg` | 1200×900 | Ambiente, detalhes, pratos, pães |
| OG Image | `/uploads/og-default.jpg` | 1200×630 | Compartilhamento social (WhatsApp/FB) |
| Favicon | `/public/favicon.ico` | 32×32 / 16×16 | Ícone da aba do navegador |

### Itens do Cardápio (Opcional - uma foto por item)
| Item | Caminho Sugerido |
|------|------------------|
| Pão Fermentação Natural | `/uploads/item-pao-fermentacao.jpg` |
| Croissant Artesanal | `/uploads/item-croissant.jpg` |
| Focaccia | `/uploads/item-focaccia.jpg` |
| Granola com Iogurte | `/uploads/item-granola.jpg` |
| Ovos Beneditinos | `/uploads/item-ovos.jpg` |
| Salada LOMA | `/uploads/item-salada.jpg` |
| Bruschetta | `/uploads/item-bruschetta.jpg` |
| Café Espresso | `/uploads/item-cafe.jpg` |
| Suco Natural | `/uploads/item-suco.jpg` |

## Fontes de Imagens

### ✅ Permitidas
- **Fotos próprias da LOMA** (arquivos originais fornecidos pelo proprietário)
- **Instagram oficial** (@lomacozinha) — **APENAS com autorização por escrito**
- **Fotógrafo contratado** com cessão de direitos

### ❌ Proibidas
- Imagens de outros estabelecimentos (mesmo que "parecidos")
- Fotos de bancos de imagens genéricos (Unsplash, Pexels, etc.) como se fossem da LOMA
- Capturas de tela do Instagram sem permissão
- Imagens com watermarks de terceiros

## Status de Autorização

| Asset | Fonte | Autorizado? | Responsável | Observações |
|-------|-------|-------------|-------------|-------------|
| Hero principal | — | ⏳ Pendente | Proprietário | Foto da fachada/interior |
| Fotos cardápio | — | ⏳ Pendente | Proprietário | Uma por categoria |
| Fotos itens | — | ⏳ Pendente | Proprietário | Opcional mas recomendado |
| Galeria | Instagram | ⏳ Pendente | Proprietário | Selecionar 8+ fotos autorizadas |
| OG Image | — | ⏳ Pendente | Proprietário | Derivada do hero ou foto exclusiva |
| Favicon | Logo vetor | ⏳ Pendente | Proprietário | Gerar a partir do logo oficial |

## Textos Pendentes de Confirmação

| Campo | Valor Atual (Seed) | Precisa Confirmar? | Observação |
|-------|-------------------|-------------------|------------|
| Nome do estabelecimento | LOMA — Cozinha e Padaria Artesanal | ✅ Confirmado | Conforme briefing |
| Descrição da marca | "Somos aficionados..." | ✅ Confirmado | Conforme briefing |
| Endereço | CLN 303, Bloco B, Loja 6... | ✅ Confirmado | Conforme briefing |
| Telefone | +55 61 3326-9714 | ✅ Confirmado | Conforme briefing |
| Instagram | https://www.instagram.com/lomacozinha/ | ✅ Confirmado | Conforme briefing |
| Horários (todos dias) | 07:30–22:00 | ⚠️ Verificar | Confirmar se feriados seguem mesmo horário |
| Área externa | true | ✅ Confirmado | Conforme briefing |
| Opções veganas | true | ✅ Confirmado | Conforme briefing |
| Menu infantil | true | ✅ Confirmado | Conforme briefing |
| SEO Title | LOMA — Cozinha e Padaria Artesanal \| Asa Norte, Brasília | ⏳ Revisar | Otimizar para busca |
| SEO Description | Cozinha e padaria artesanal em Asa Norte... | ⏳ Revisar | Máx. 300 chars |
| Categorias do cardápio | 4 categorias (seed) | ⏳ Substituir | Usar categorias reais |
| Itens do cardápio | 9 itens (seed) | ⏳ Substituir | **Todos marcados [Dados de exemplo]** |
| Preços | Valores de exemplo | ⏳ Substituir | Confirmar preços reais |

## Como Adicionar Fotografias

### Via Painel Admin (Recomendado)
1. Acesse `/admin/media`
2. Clique em "Upload de Imagem"
3. Selecione arquivo (JPEG/PNG/WebP/AVIF, máx. 5MB)
4. Preencha **Texto alternativo** (obrigatório para acessibilidade)
5. Preencha **Atribuição/Licença** (ex: "Foto por João Silva / LOMA")
5. Clique em "Enviar"
6. Copie o caminho gerado (ex: `/uploads/20241201-abc123.jpg`)
7. Use em **Configurações → SEO → Imagem Open Graph** ou em itens/categorias

### Via Sistema de Arquivos (Desenvolvimento)
```bash
# Colocar arquivos em:
public/uploads/

# Referenciar em:
- Configurações (OG Image)
- Itens do cardápio (campo "Imagem (caminho)")
- Categorias (futuro: campo de imagem)
```

### Naming Convention
```
{categoria}-{descritivo}-{data}.{ext}
Exemplos:
hero-main-20241201.jpg
cat-padaria-20241201.jpg
item-pao-fermentacao-20241201.jpg
gallery-ambiente-01-20241201.jpg
og-default-20241201.jpg
```

## Otimização de Imagens

### Requisitos Técnicos
- **Formatos**: JPEG (fotos), PNG (transparência), WebP/AVIF (moderno, menor)
- **Máximo**: 5MB por arquivo (validação no upload)
- **Dimensões**: 
  - Hero/OG: 1920×1080 / 1200×630
  - Cardápio/Galeria: 1200×900 (4:3)
  - Thumbnails: gerados automaticamente pelo Sharp no upload

### Sharp (Já Configurado)
O `sharp` processa no upload:
- Redimensiona se > 1920px largura
- Converte para WebP (opcional, configurável)
- Otimiza qualidade (80% JPEG, lossless WebP)
- Preserva EXIF orientation

### Para Produção: CDN de Imagens
Configure `src/actions/media.ts` para upload direto ao S3/Cloudinary com transformações on-the-fly:
```typescript
// Exemplo Cloudinary
const result = await cloudinary.uploader.upload(filePath, {
  folder: 'loma',
  transformation: [
    { width: 1920, crop: 'limit' },
    { quality: 'auto', fetch_format: 'auto' }
  ]
})
```

## Checklist de Entrega de Assets

### Antes do Launch
- [ ] Hero principal (1920×1080) autorizado e uploadado
- [ ] OG Image (1200×630) autorizada e configurada em Settings
- [ ] 4+ fotos de categoria (1200×900) para cardápio
- [ ] 8+ fotos para galeria (1200×900)
- [ ] Favicon (32×32, 16×16) gerado do logo vetorial
- [ ] Todos os textos confirmados pelo proprietário
- [ ] Preços reais inseridos no admin (centavos)
- [ ] Itens de exemplo **[Dados de exemplo]** despublicados ou excluídos
- [ ] Categorias reais criadas e publicadas
- [ ] Alt texts preenchidos em todas as imagens
- [ ] Atribuições/licenças registradas

### Pós-Launch
- [ ] Testar compartilhamento no WhatsApp (OG image)
- [ ] Validar Schema.org (Google Rich Results Test)
- [ ] Verificar Core Web Vitals (PageSpeed Insights)
- [ ] Confirmar horários "Aberto/Fechado" corretos
- [ ] Backup das imagens originais em local seguro

## Licenças e Atribuições

### Fontes (Google Fonts - SIL Open Font License)
- **Playfair Display** — Headings (editorial serif)
- **Inter** — Body/UI (sans-serif legível)
- **JetBrains Mono** — Code/mono

### Ícones (Lucide React — ISC License)
- Todos os ícones da interface

### Bibliotecas JS (MIT/BSD/Apache-2.0)
- Ver `package.json` para lista completa

### Imagens LOMA
- **Propriedade exclusiva da LOMA** ou licenciada para uso
- **Nunca** redistribuir ou usar fora do site oficial

## Atualização de Conteúdo

### Fluxo Recomendado
1. **Proprietário** fornece fotos/textos aprovados
2. **Admin** faz upload em `/admin/media` com alt text
3. **Admin** atualiza itens/categorias em `/admin/menu` vinculando imagens
4. **Admin** atualiza textos em `/admin/settings`
5. **Verificação** no site público (`/cardapio`, `/`, `/visite-nos`)

### Versionamento de Conteúdo
- AuditLog rastreia todas as mudanças
- Para rollback: ver logs → reverter manualmente
- Futuro: implementar histórico de versões por entidade