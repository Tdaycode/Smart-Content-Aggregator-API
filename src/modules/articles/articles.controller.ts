import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';


import { PaginationDto } from '../../common/dto/pagination.dto';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { ArticleResponseDto } from './dto/article-response.dto';
import { SuccessResponse } from '@/common/helpers/successResponse';

@ApiTags('Articles')
@Controller('articles')
@UseInterceptors(ClassSerializerInterceptor)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new article with optional AI-powered summary' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Article created successfully',
    type: ArticleResponseDto,
  })
  async create(@Body() createArticleDto: CreateArticleDto) {
    const article = await this.articlesService.create(createArticleDto);
    console.log('article');
    return new SuccessResponse(
      'Article Created Successfully',
      article,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of articles' })
  @ApiPaginatedResponse(ArticleResponseDto)
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of items per page' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of items to skip' })
  @ApiQuery({ name: 'tags', required: false, type: String, description: 'Filter by tags (comma-separated)' })
  @ApiQuery({ name: 'author', required: false, type: String, description: 'Filter by author' })
  async findAll(@Query() paginationDto: PaginationDto) {
    const articles = await this.articlesService.findAll(paginationDto);
    return new SuccessResponse(
      'Articles Found Successfully',
      articles,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({ name: 'id', description: 'Article ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Article found',
    type: ArticleResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Article not found',
  })
  async findOne(@Param('id') id: string) {
    const article = await this.articlesService.findOne(id);
    return new SuccessResponse(
      'Article Found Successfully',
      article,
    );
  }
}