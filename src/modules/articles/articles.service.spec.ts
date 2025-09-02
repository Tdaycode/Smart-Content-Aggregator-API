import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ArticlesService } from './articles.service';
import { Article } from './schemas/article.schema';
import { AiSummaryService } from '../ai-summary/ai-summary.service';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let mockArticleModel: any;
  let mockAiSummaryService: any;

  beforeEach(async () => {
    mockArticleModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      countDocuments: jest.fn(),
      exec: jest.fn(),
    };

    mockAiSummaryService = {
      generateSummary: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getModelToken(Article.name),
          useValue: mockArticleModel,
        },
        {
          provide: AiSummaryService,
          useValue: mockAiSummaryService,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should generate AI summary when not provided', async () => {
      const createDto = {
        title: 'Test Article',
        content: 'Test content for the article',
        author: 'Test Author',
      };

      const expectedSummary = 'AI generated summary';
      mockAiSummaryService.generateSummary.mockResolvedValue(expectedSummary);

      const mockSave = jest.fn().mockResolvedValue({
        ...createDto,
        summary: expectedSummary,
        isAiGenerated: true,
      });

      mockArticleModel.mockImplementation(() => ({
        save: mockSave,
      }));

      const result = await service.create(createDto);

      expect(mockAiSummaryService.generateSummary).toHaveBeenCalledWith(
        createDto.content,
        createDto.title,
      );
      expect(result.summary).toBe(expectedSummary);
      expect(result.isAiGenerated).toBe(true);
    });
  });
});