
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing ScrapeJobs...');
    const deleted = await prisma.scrapeJob.deleteMany({});
    console.log(`Deleted ${deleted.count} jobs.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
