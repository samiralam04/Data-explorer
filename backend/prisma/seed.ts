import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clear existing data (optional, be careful in prod)

  // 2. Default Navigation Items (based on WOB typical nav)
  const navItems = [
    { title: 'Books', slug: 'books' },
    { title: 'Rare Books', slug: 'rare-books' },
    { title: 'Media', slug: 'media' },
  ];

  for (const item of navItems) {
    const nav = await prisma.navigation.upsert({
      where: { slug: item.slug },
      update: {},
      create: {
        title: item.title,
        slug: item.slug,
      },
    });
    console.log(`Created Navigation: ${nav.title}`);
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
