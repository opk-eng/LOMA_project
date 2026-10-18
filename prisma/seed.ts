import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Business Settings (upsert — idempotent)
  await prisma.businessSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      businessName: 'LOMA — Cozinha e Padaria Artesanal',
      brandDescription:
        'Somos aficionados por servir o simples de forma extraordinária. O ingrediente, em sua forma natural e pura, como a natureza nos provê, é criativamente servido de maneira bela e deliciosa.',
      address:
        'CLN 303, Bloco B, Loja 6, Asa Norte, Brasília - DF, CEP 70735-520, Brazil',
      phone: '+55 61 3326-9714',
      instagramUrl: 'https://www.instagram.com/lomacozinha/',
      mondayOpen: '07:30',
      mondayClose: '22:00',
      tuesdayOpen: '07:30',
      tuesdayClose: '22:00',
      wednesdayOpen: '07:30',
      wednesdayClose: '22:00',
      thursdayOpen: '07:30',
      thursdayClose: '22:00',
      fridayOpen: '07:30',
      fridayClose: '22:00',
      saturdayOpen: '07:30',
      saturdayClose: '22:00',
      sundayOpen: '07:30',
      sundayClose: '22:00',
      hasOutdoorSeating: true,
      hasVeganOptions: true,
      hasChildMenu: true,
      seoTitle: 'LOMA — Cozinha e Padaria Artesanal | Asa Norte, Brasília',
      seoDescription:
        'Cozinha e padaria artesanal em Asa Norte, Brasília. Ingredientes naturais servidos de forma extraordinária.',
    },
  })
  console.log('  ✅ Business settings')

  // 2. Default admin user (upsert — idempotent)
  // ⚠️ INITIAL SETUP ONLY: Change this password immediately after first login
  const passwordHash = await bcrypt.hash('admin123', 12)
  await prisma.adminUser.upsert({
    where: { email: 'admin@loma.local' },
    update: {},
    create: {
      email: 'admin@loma.local',
      name: 'Administrador',
      passwordHash,
      role: 'admin',
      active: true,
    },
  })
  console.log('  ✅ Default admin user (admin@loma.local)')

  // 3. Sample categories and menu items (development only)
  // These are clearly marked as sample data for development purposes.
  // In production, the admin should create real menu content via the dashboard.
  if (process.env.NODE_ENV !== 'production') {
    const categories = [
      {
        name: 'Padaria Artesanal',
        slug: 'padaria-artesanal',
        description: 'Pães, croissants e delícias assadas com fermentação natural',
        displayOrder: 1,
        published: true,
      },
      {
        name: 'Café da Manhã',
        slug: 'cafe-da-manha',
        description: 'Opções para começar o dia com sabor e energia',
        displayOrder: 2,
        published: true,
      },
      {
        name: 'Almoço',
        slug: 'almoco',
        description: 'Pratos leves e saborosos para o almoço',
        displayOrder: 3,
        published: true,
      },
      {
        name: 'Bebidas',
        slug: 'bebidas',
        description: 'Cafés, sucos naturais e outras bebidas',
        displayOrder: 4,
        published: true,
      },
    ]

    for (const cat of categories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    }
    console.log('  ✅ Sample categories')

    // Fetch created categories for item association
    const padaria = await prisma.category.findUnique({ where: { slug: 'padaria-artesanal' } })
    const cafe = await prisma.category.findUnique({ where: { slug: 'cafe-da-manha' } })
    const almoco = await prisma.category.findUnique({ where: { slug: 'almoco' } })
    const bebidas = await prisma.category.findUnique({ where: { slug: 'bebidas' } })

    if (padaria && cafe && almoco && bebidas) {
      // ⚠️ SAMPLE DATA — prices and descriptions are illustrative for development only.
      // The business owner must confirm all menu content before production use.
      const items = [
        {
          categoryId: padaria.id,
          name: 'Pão de Fermentação Natural',
          slug: 'pao-fermentacao-natural',
          description: '[Dados de exemplo] Pão artesanal com fermentação longa de 24 horas',
          priceInCents: 1200,
          displayOrder: 1,
          published: true,
        },
        {
          categoryId: padaria.id,
          name: 'Croissant Artesanal',
          slug: 'croissant-artesanal',
          description: '[Dados de exemplo] Croissant folhado com manteiga de qualidade',
          priceInCents: 950,
          displayOrder: 2,
          published: true,
        },
        {
          categoryId: padaria.id,
          name: 'Focaccia',
          slug: 'focaccia',
          description: '[Dados de exemplo] Focaccia com azeite e ervas frescas',
          priceInCents: 1500,
          displayOrder: 3,
          published: true,
        },
        {
          categoryId: cafe.id,
          name: 'Granola com Iogurte e Frutas',
          slug: 'granola-iogurte-frutas',
          description: '[Dados de exemplo] Granola artesanal com iogurte natural e frutas da estação',
          priceInCents: 2200,
          displayOrder: 1,
          published: true,
          isVegan: false,
        },
        {
          categoryId: cafe.id,
          name: 'Ovos Beneditinos',
          slug: 'ovos-beneditinos',
          description: '[Dados de exemplo] Ovos pochê com molho holandês sobre muffin artesanal',
          priceInCents: 2800,
          displayOrder: 2,
          published: true,
        },
        {
          categoryId: almoco.id,
          name: 'Salada LOMA',
          slug: 'salada-loma',
          description: '[Dados de exemplo] Mix de folhas, legumes grelhados e vinagrete da casa',
          priceInCents: 3200,
          displayOrder: 1,
          published: true,
          isVegan: true,
        },
        {
          categoryId: almoco.id,
          name: 'Bruschetta de Tomate',
          slug: 'bruschetta-tomate',
          description: '[Dados de exemplo] Bruschetta com tomates frescos e manjericão sobre pão artesanal',
          priceInCents: 2600,
          displayOrder: 2,
          published: true,
          isVegan: true,
        },
        {
          categoryId: bebidas.id,
          name: 'Café Espresso',
          slug: 'cafe-espresso',
          description: '[Dados de exemplo] Espresso com grãos selecionados',
          priceInCents: 800,
          displayOrder: 1,
          published: true,
        },
        {
          categoryId: bebidas.id,
          name: 'Suco Natural',
          slug: 'suco-natural',
          description: '[Dados de exemplo] Suco de frutas frescas da estação',
          priceInCents: 1400,
          displayOrder: 2,
          published: true,
        },
      ]

      for (const item of items) {
        await prisma.menuItem.upsert({
          where: { slug: item.slug },
          update: {},
          create: item,
        })
      }
      console.log('  ✅ Sample menu items (development only)')
    }
  }

  console.log('🌱 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
