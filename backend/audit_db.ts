
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const totalCategories = await prisma.category.count();
    const categoriesWithSource = await prisma.category.count({ where: { source_url: { not: null } } });

    const totalProducts = await prisma.product.count();
    const unknownTitleProducts = await prisma.product.count({ where: { title: 'Unknown Title' } });

    console.log('--- DB Audit ---');
    console.log(`Total Categories: ${totalCategories}`);
    console.log(`Categories with source_url: ${categoriesWithSource}`);

    const fictionCat = await prisma.category.findUnique({
        where: { slug: 'fiction' }
    });
    console.log('Fiction Category:', fictionCat);

    const fictionBooksCat = await prisma.category.findUnique({
        where: { slug: 'fiction-books' }
    });
    console.log('Fiction Books Category:', fictionBooksCat);

    console.log(`Total Products: ${totalProducts}`);
    console.log(`Products with Unknown Title: ${unknownTitleProducts}`);


    const badProducts = await prisma.product.findMany({
        where: { title: 'Unknown Title' },
        take: 5,
        include: { category: true }
    });

    console.log('--- Bad Products Sample ---');
    badProducts.forEach(p => {
        console.log(`[${p.category?.slug}] ${p.source_url} (ID: ${p.id})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
