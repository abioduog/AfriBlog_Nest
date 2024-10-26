import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    ForbiddenException,
    Delete,
    Put,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Post as BlogPost, PostStatus } from './entities/post.entity';
import { PostOwnerGuard } from './guards/post-owner.guard';
import { User } from '../users/user.entity';  // Updated import path

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}
  
    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createPostDto: CreatePostDto, @Request() req: Request & { user: User }) {
      return this.postsService.create(createPostDto, req.user);
    }
  
    @Get()
    async findAll(
      @Query('page') page = 1,
      @Query('limit') limit = 10,
      @Query('premium') premium = false,
      @Request() req: Request & { user?: User },
    ) {
      const includePremium = premium && req.user?.isPremiumUser;
      return this.postsService.findAll(page, limit, includePremium);
    }
  
    @Get(':slug')
    async findOne(@Param('slug') slug: string, @Request() req: Request & { user?: User }) {
      const post = await this.postsService.findBySlug(slug);
      
      if (post.isPremium && !req.user?.isPremiumUser) {
        throw new ForbiddenException('Premium content requires subscription');
      }
  
      await this.postsService.incrementViewCount(post.id);
      return post;
    }
  
    @Put(':id')
    @UseGuards(JwtAuthGuard, PostOwnerGuard)
    async update(
      @Param('id') id: string,
      @Body() updatePostDto: CreatePostDto,
    ) {
      return this.postsService.update(id, updatePostDto);
    }
  
    @Delete(':id')
    @UseGuards(JwtAuthGuard, PostOwnerGuard)
    async remove(@Param('id') id: string) {
      return this.postsService.remove(id);
    }
  
    @Post(':id/publish')
    @UseGuards(JwtAuthGuard, PostOwnerGuard)
    async publish(@Param('id') id: string) {
      return this.postsService.updateStatus(id, PostStatus.PUBLISHED);
    }
  }
