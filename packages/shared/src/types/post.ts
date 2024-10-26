import { User } from './user';

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  isPremium: boolean;
  status: PostStatus;
  viewCount: number;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostDto {
  title: string;
  content: string;
  excerpt: string;
  isPremium?: boolean;
}

export interface PostsResponse {
  posts: Post[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
