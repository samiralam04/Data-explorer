import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { ScrapeService } from '../src/scrape/scrape.service';

describe('ScrapeController (e2e)', () => {
    let app: INestApplication;
    let scrapeService: ScrapeService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        scrapeService = moduleFixture.get<ScrapeService>(ScrapeService);
    });

    afterAll(async () => {
        await app.close();
    });

    it('/scrape/category (POST) should trigger a scrape job', async () => {
        // We mock addJob to avoid polluting DB or running crawler if we want pure controller test
        // But for E2E we usually want full stack.
        // However, ScrapeService.addJob waits for DB.
        // Let's spyOn it to ensure it was called, effectively integration testing just the controller wiring
        // OR we let it run and assert response structure.

        // Let's rely on the Real service but we can suppress the actual crawling in ScrapeQueue if we want, 
        // but the Controller only adds to Queue. The Worker picks it up. 
        // So the Controller return value is just the job object.

        const response = await request(app.getHttpServer())
            .post('/scrape/category')
            .send({ url: 'https://www.worldofbooks.com/en-gb/category/test-e2e' })
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('status', 'PENDING');
        expect(response.body.target_url).toEqual('https://www.worldofbooks.com/en-gb/category/test-e2e');
    });
});
