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
import { InteractionsService } from './interactions.service';
import { CreateInteractionDto } from './dto/create-interaction.dto';
import { InteractionResponseDto } from './dto/interaction-response.dto';


@ApiTags('Interactions')
@Controller('interactions')
@UseInterceptors(ClassSerializerInterceptor)
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a user interaction with an article' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Interaction recorded successfully',
    type: InteractionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Interaction already exists',
  })
  async create(
    @Body() createInteractionDto: CreateInteractionDto,
  ): Promise<InteractionResponseDto> {
    const interaction = await this.interactionsService.create(createInteractionDto);
    return new InteractionResponseDto(interaction);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get interactions for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ 
    name: 'interactionType', 
    required: false, 
    enum: ['view', 'like', 'share', 'bookmark'],
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of user interactions',
    type: [InteractionResponseDto],
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query('interactionType') interactionType?: string,
  ): Promise<InteractionResponseDto[]> {
    const interactions = await this.interactionsService.findByUser(
      userId,
      interactionType,
    );
    return interactions.map(i => new InteractionResponseDto(i));
  }

  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get interactions for a specific article' })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of article interactions',
    type: [InteractionResponseDto],
  })
  async findByArticle(
    @Param('articleId') articleId: string,
  ): Promise<InteractionResponseDto[]> {
    const interactions = await this.interactionsService.findByArticle(articleId);
    return interactions.map(i => new InteractionResponseDto(i));
  }
}