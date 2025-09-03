import { 
  Injectable, 
  ConflictException, 
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { ExceptionHelper } from '@/common/helpers/error-handler';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      this.logger.log('Creating new user',  createUserDto);
      const existingUser = await this.checkUserExists(createUserDto.username);
      if (existingUser) {
        throw new ConflictException('Username already exists');
      }
      const createdUser = await this.userModel.create(createUserDto);

      return createdUser;
    } catch (error) {
      this.logger.error('User creation failed', error);
      ExceptionHelper.handleException(error);
    }
  }



  async findOne(id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(id).exec();
    
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    
      return user.toObject();
    } catch (error) {
      ExceptionHelper.handleException(error);
    }
  }

  async findAll(): Promise<UserDocument[]> {
    try {
      return await this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();
    } catch (error) {
      ExceptionHelper.handleException(error);
    }
  }

  async findByUsername(username: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ username }).exec();
    
      if (!user) {
        throw new NotFoundException(`User with username ${username} not found`);
      }
    
      return user.toObject();
    } catch (error) {
      ExceptionHelper.handleException(error);
    }
  }

  async incrementArticleCount(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { articleCount: 1 } },
      );
    } catch (error) {
      ExceptionHelper.handleException(error);
    }
  }

  async incrementInteractionCount(userId: string): Promise<void> {
    try {
      await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { interactionCount: 1 } },
      );
    } catch (error) {
      ExceptionHelper.handleException(error);
    }
  }

  private async checkUserExists(username: string): Promise<User> {
    try {
      const user = await this.userModel.findOne({ username }).exec();
      return user;
    } catch (error) {
      ExceptionHelper.handleException(error);
    }
  }
}