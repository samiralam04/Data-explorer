import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // 1. Insert/Upsert Navigation
  const nav = await prisma.navigation.upsert({
    where: { slug: 'books' },
    update: {},
    create: {
      title: 'Books',
      slug: 'books',
      last_scraped_at: new Date(),
    },
  });

  console.log(`Created Navigation: ${nav.title}`);

  // 2. Insert/Upsert Category
  const category = await prisma.category.upsert({
    where: { slug: 'fiction-books' },
    update: {},
    create: {
      title: 'Fiction Books',
      slug: 'fiction-books',
      navigation_id: nav.id,
      source_url: 'https://www.worldofbooks.com/en-gb/collections/fiction-books',
      product_count: 3,
      last_scraped_at: new Date(),
    },
  });

  console.log(`Created Category: ${category.title}`);

  // 3. Insert/Upsert Products
  const products = [
    {
      source_id: 'BOOK-1',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      price: 10.99,
      image_url: 'https://images.worldofbooks.com/en-gb/9781853260414.jpg', // Placeholder or real
      source_url: 'https://www.worldofbooks.com/en-gb/books/f-scott-fitzgerald/great-gatsby/GOR001222444',
      slug: 'the-great-gatsby-GOR001222444',
      category_id: category.id,
    },
    {
      source_id: 'BOOK-2',
      title: '1984',
      author: 'George Orwell',
      price: 8.99,
      image_url: 'https://images.worldofbooks.com/en-gb/9780141036144.jpg',
      source_url: 'https://www.worldofbooks.com/en-gb/books/george-orwell/1984/GOR001662555',
      slug: '1984-GOR001662555',
      category_id: category.id,
    },
    {
      source_id: 'BOOK-3',
      title: 'Brave New World',
      author: 'Aldous Huxley',
      price: 9.50,
      image_url: 'https://images.worldofbooks.com/en-gb/9780099518471.jpg',
      source_url: 'https://www.worldofbooks.com/en-gb/books/aldous-huxley/brave-new-world/GOR002773666',
      slug: 'brave-new-world-GOR002773666',
      category_id: category.id,
    }
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        product_detail: {
          create: {
            description: `Description for ${p.title}. This is a seeded product.`,
            specs: { publisher: 'Penguin', bindings: 'Paperback' },
            ratings_avg: 4.5,
            reviews_count: 10
          }
        }
      },
    });
    console.log(`Created Product: ${product.title}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
