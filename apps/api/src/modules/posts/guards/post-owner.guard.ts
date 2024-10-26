import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class PostOwnerGuard implements CanActivate {
  constructor(private postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const postId = request.params.id;

    const post = await this.postsService.findById(postId);
    
    if (post.author.id !== user.id) {
      throw new ForbiddenException('You are not authorized to modify this post');
    }

    return true;
  }
}