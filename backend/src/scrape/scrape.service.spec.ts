import { Test, TestingModule } from '@nestjs/testing';
import { ScrapeService } from './scrape.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  scrapeJob: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('ScrapeService', () => {
  let service: ScrapeService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScrapeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ScrapeService>(ScrapeService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addJob', () => {
    it('should create a new job if one does not exist', async () => {
      prisma.scrapeJob.findFirst.mockResolvedValue(null);
      prisma.scrapeJob.create.mockResolvedValue({
        id: '123',
        target_url: 'http://example.com',
        target_type: 'CATEGORY',
        status: 'PENDING',
      });

      const result = await service.addJob('http://example.com', 'CATEGORY');

      expect(prisma.scrapeJob.findFirst).toHaveBeenCalledWith({
        where: {
          target_url: 'http://example.com',
          status: { in: ['PENDING', 'RUNNING'] },
        },
      });
      expect(prisma.scrapeJob.create).toHaveBeenCalled();
      expect(result.id).toBe('123');
      expect(result.status).toBe('PENDING');
    });

    it('should return existing job if one is pending', async () => {
      const existingJob = {
        id: '123',
        target_url: 'http://example.com',
        target_type: 'CATEGORY',
        status: 'PENDING',
      };
      prisma.scrapeJob.findFirst.mockResolvedValue(existingJob);

      const result = await service.addJob('http://example.com', 'CATEGORY');

      expect(prisma.scrapeJob.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingJob);
    });
  });

  describe('getJobStatus', () => {
    it('should return the job status', async () => {
      const job = { id: '123', status: 'DONE' };
      prisma.scrapeJob.findUnique.mockResolvedValue(job);

      const result = await service.getJobStatus('123');
      expect(result).toEqual(job);
      expect(prisma.scrapeJob.findUnique).toHaveBeenCalledWith({ where: { id: '123' } });
    });
  });
});
