# .aidigestignore

```
# Generated JavaScript files (when TypeScript is used)
**/*.js
!next.config.js
!postcss.config.js
!tailwind.config.js

# Build info and cache
**/*.tsbuildinfo
.next/
dist/
build/

# Debug files
**/*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Package manager files
pnpm-lock.yaml
package-lock.json
yarn.lock
.pnpm-store/

# Local environment files
.env*
!.env.example

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Test and coverage files
coverage/
**/__tests__/**
**/*.test.*
**/*.spec.*
jest.config.*

# Type definition files
**/*.d.ts
next-env.d.ts

# Documentation
*.md
!README.md

# Configuration files
.eslintrc*
.prettierrc*
.babelrc*
tsconfig*.json
postcss.config.*
tailwind.config.*
next.config.*
nest-cli.json

# Temporary files
*.tmp
*.temp
.cache/

# Docker related
Dockerfile
docker-compose*.yml

# Asset files
**/*.svg
**/*.png
**/*.jpg
**/*.jpeg
**/*.gif
**/*.ico
**/*.woff
**/*.woff2
**/*.eot
**/*.ttf
**/*.otf

codebase.md
```

# .gitignore

```
# Dependencies
node_modules
.pnpm-store

# Build outputs
dist
build
.next

# Environment
.env
.env.*
!.env.example

# System files
.DS_Store

# Logs
*.log
npm-debug.log*

# IDE
.idea
.vscode
```

# apps/api/package.json

```json
{
  "name": "api",
  "version": "1.0.0",
  "scripts": {
    "prebuild": "rimraf dist",
    "build": "nest build --webpack",
    "format": "prettier --write \"src/**/*.ts\"",
    "start": "nest start",
    "start:dev": "NODE_ENV=development nest start --webpack --watch",
    "dev": "NODE_ENV=development nest start --webpack --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\"",
    "test": "jest",
    "clean": "rimraf dist"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "bcrypt": "^5.1.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.1",
    "pg": "^8.11.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "slugify": "^1.6.6",
    "typeorm": "^0.3.0",
    "shared": "workspace:*"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^3.0.9",
    "rimraf": "^5.0.0",
    "source-map-support": "^0.5.21",
    "ts-loader": "^9.4.3",
    "ts-node": "^10.9.1",
    "tsconfig-paths": "^4.2.0",
    "typescript": "^5.1.3"
  }
}

```

# apps/api/src/app.module.ts

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { User } from './modules/users/user.entity';
import { Post } from './modules/posts/entities/post.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Post],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    PostsModule,
  ],
})
export class AppModule {}

```

# apps/api/src/main.ts

```ts
// apps/api/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    app.enableCors({
      origin: ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    });
    
    app.useGlobalPipes(new ValidationPipe());
    
    const port = process.env.PORT || 4000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();

```

# apps/api/src/modules/auth/auth.controller.ts

```ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, AuthResponse } from '@shared/types/user';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }
}

```

# apps/api/src/modules/auth/auth.module.ts

```ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

```

# apps/api/src/modules/auth/auth.service.ts

```ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto, LoginDto, AuthResponse } from '@shared/types/user';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    
    const user = await this.usersService.create(createUserDto, hashedPassword);
    const accessToken = this.jwtService.sign({ sub: user.id });
    
    const { hashedPassword: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.hashedPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwtService.sign({ sub: user.id });
    
    const { hashedPassword: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      accessToken,
    };
  }
}

```

# apps/api/src/modules/auth/guards/jwt-auth.guard.ts

```ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

# apps/api/src/modules/auth/jwt.strategy.ts

```ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: { sub: string }) {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

```

# apps/api/src/modules/posts/dto/create-post.dto.ts

```ts
import { IsString, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(200)
  excerpt!: string;

  @IsBoolean()
  @IsOptional()
  isPremium: boolean = false;
}

```

# apps/api/src/modules/posts/entities/post.entity.ts

```ts
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    BeforeInsert,
    BeforeUpdate
  } from 'typeorm';
  import { User } from '../../users/user.entity';
  import slugify from 'slugify';
  
  export enum PostStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published'
  }
  
  @Entity('posts')
  export class Post {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column()
    title!: string;
  
    @Column('text')
    content!: string;
  
    @Column()
    excerpt!: string;
  
    @Column({ unique: true })
    slug!: string;
  
    @Column({ name: 'is_premium', default: false })
    isPremium: boolean = false;
  
    @Column({
      type: 'enum',
      enum: PostStatus,
      default: PostStatus.DRAFT
    })
    status: PostStatus = PostStatus.DRAFT;
  
    @Column({ name: 'view_count', default: 0 })
    viewCount: number = 0;
  
    @ManyToOne(() => User, user => user.posts)
    author!: User;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
  
    @BeforeInsert()
    @BeforeUpdate()
    generateSlug() {
      if (this.title) {
        this.slug = slugify(this.title, {
          lower: true,
          strict: true,
          trim: true
        });
      }
    }
  }

```

# apps/api/src/modules/posts/guards/post-owner.guard.ts

```ts
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
```

# apps/api/src/modules/posts/posts.controller.ts

```ts
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

```

# apps/api/src/modules/posts/posts.module.ts

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from './entities/post.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UsersModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

# apps/api/src/modules/posts/posts.service.ts

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from './entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../users/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  /**
   * Create a new blog post
   */
  async create(createPostDto: CreatePostDto, author: User): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      author,
    });
    return this.postsRepository.save(post);
  }

  /**
   * Get all posts with pagination
   */
  async findAll(page = 1, limit = 10, includePremium = false) {
    const query = this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: PostStatus.PUBLISHED });

    if (!includePremium) {
      query.andWhere('post.isPremium = :isPremium', { isPremium: false });
    }

    const [posts, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      posts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single post by slug
   */
  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { slug },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<void> {
    await this.postsRepository.increment({ id }, 'viewCount', 1);
  }

  /**
   * Update post status
   */
  async updateStatus(id: string, status: PostStatus): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    post.status = status;
    return this.postsRepository.save(post);
  }

  /**
   * Find a post by id
   */
  async findById(id: string): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: string, updatePostDto: CreatePostDto): Promise<Post> {
    const post = await this.findById(id);
    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async remove(id: string): Promise<void> {
    const post = await this.findById(id);
    await this.postsRepository.remove(post);
  }
}

```

# apps/api/src/modules/users/user.entity.ts

```ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'hashed_password' })
  hashedPassword!: string;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean = false;

  @Column({ name: 'is_premium_user', default: false })
  isPremiumUser: boolean = false;

  @OneToMany(() => Post, post => post.author)
  posts!: Post[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.hashedPassword);
  }
}

```

# apps/api/src/modules/users/users.module.ts

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

# apps/api/src/modules/users/users.service.ts

```ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from '@shared/types/user';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, hashedPassword: string): Promise<User> {
    const user = this.usersRepository.create({
      ...createUserDto,
      hashedPassword,
    });
    
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}

```

# apps/web/.gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.*
.yarn/*
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/versions

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files (can opt-in for commiting if needed)
.env*

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

```

# apps/web/package.json

```json
{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rimraf .next"
  },
  "dependencies": {
    "@heroicons/react": "^2.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.330.0",
    "next": "^14.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^20.17.1",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^8",
    "eslint-config-next": "15.0.1",
    "postcss": "^8.4.47",
    "rimraf": "^6.0.1",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3"
  }
}

```

# apps/web/README.md

```md
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```

# apps/web/src/app/auth/login/page.tsx

```tsx
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <LoginForm />
    </main>
  );
}
```

# apps/web/src/app/auth/register/page.tsx

```tsx
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <RegisterForm />
    </main>
  );
}
```

# apps/web/src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: Arial, Helvetica, sans-serif;
}

```

# apps/web/src/app/layout.tsx

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthNav } from '@/components/navigation/AuthNav';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Home, BookOpen, PenTool } from 'lucide-react';
import Link from 'next/link';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AfriBlog - African Stories & Insights",
  description: "Discover amazing stories and insights from African writers around the world",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}>
        <ThemeProvider>
          <AuthProvider>
            <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-8">
                    <Link 
                      href="/" 
                      className="text-2xl font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-2"
                    >
                      <PenTool className="w-6 h-6" />
                      AfriBlog
                    </Link>
                    <div className="hidden md:flex items-center space-x-6">
                      <Link href="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <Home className="w-4 h-4" />
                        Home
                      </Link>
                      <Link href="/posts" className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                        <BookOpen className="w-4 h-4" />
                        Posts
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <ThemeToggle />
                    <AuthNav />
                  </div>
                </div>
              </div>
            </nav>
            <div className="min-h-screen">
              {children}
            </div>
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
              <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
                © 2024 AfriBlog. All rights reserved.
              </div>
            </footer>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

```

# apps/web/src/app/page.tsx

```tsx
import { PostsResponse } from 'shared/types/post';
import Link from 'next/link';

async function getFeaturedPosts(): Promise<PostsResponse> {
  try {
    const res = await fetch('http://localhost:4000/posts?limit=3', {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { 
        revalidate: 60,
        tags: ['posts']
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: [],
      meta: {
        page: 1,
        limit: 3,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export default async function Home() {
  const { posts } = await getFeaturedPosts();

  return (
    <main>
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Welcome to AfriBlog
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover amazing stories and insights from African writers around the world
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/auth/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Writing
              </Link>
              <Link
                href="/posts"
                className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Explore Posts
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Featured Posts
        </h2>
        {posts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article 
                key={post.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      By {post.author.fullName}
                    </span>
                    <Link
                      href={`/posts/${post.slug}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">No posts available at the moment.</p>
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Be the first to write a post →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

```

# apps/web/src/app/posts/[slug]/config.ts

```ts
export const dynamic = 'force-dynamic';
export const revalidate = 60;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
```

# apps/web/src/app/posts/[slug]/page.tsx

```tsx
import { Post } from 'shared/types/post';
import { notFound } from 'next/navigation';

async function getPost(slug: string): Promise<Post> {
  try {
    const res = await fetch(`http://localhost:4000/posts/${slug}`, {
      next: { 
        revalidate: 60,
        tags: ['posts']
      }
    });
    
    if (!res.ok) {
      if (res.status === 404) notFound();
      throw new Error('Failed to fetch post');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
}

export default async function PostPage({
  params: { slug },
}: {
  params: { slug: string };
}) {
  const post = await getPost(slug);

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex justify-between items-center text-gray-600">
            <span>By {post.author.fullName}</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </header>
        <div className="prose max-w-none">
          {post.content}
        </div>
      </article>
    </main>
  );
}

```

# apps/web/src/app/posts/page.tsx

```tsx
import Link from 'next/link';
import { PostsResponse } from 'shared/types/post';

async function getPosts(): Promise<PostsResponse> {
  try {
    const res = await fetch('http://localhost:4000/posts', {
      next: { 
        revalidate: 60,
        tags: ['posts']
      }
    });
    
    if (!res.ok) throw new Error('Failed to fetch posts');
    return res.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    return {
      posts: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export default async function PostsPage() {
  const { posts } = await getPosts();

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.excerpt}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>By {post.author.fullName}</span>
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <Link
              href={`/posts/${post.slug}`}
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}

```

# apps/web/src/components/auth/LoginForm.tsx

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }

      const data = await response.json();
      login(data);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/auth/register" className="text-blue-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

```

# apps/web/src/components/auth/RegisterForm.tsx

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      const data = await response.json();
      login(data);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create an Account</h2>
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            required
            minLength={6}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-blue-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
```

# apps/web/src/components/navigation/AuthNav.tsx

```tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

export function AuthNav() {
  const { user, logout } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-gray-700">
          Welcome, {user.fullName}
        </span>
        <button
          onClick={logout}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/auth/login"
        className="text-gray-600 hover:text-gray-900 font-medium"
      >
        Sign in
      </Link>
      <Link
        href="/auth/register"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Get Started
      </Link>
    </div>
  );
}
```

# apps/web/src/components/navigation/NavBar.tsx

```tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';

export function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            AfriBlog
          </Link>
          <div className="space-x-4">
            <Link href="/posts" className="hover:text-blue-600">
              Blog
            </Link>
            {user ? (
              <>
                <span className="text-gray-600">{user.fullName}</span>
                <button
                  onClick={logout}
                  className="hover:text-blue-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hover:text-blue-600">
                  Login
                </Link>
                <Link href="/auth/register" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

```

# apps/web/src/components/providers/AuthProvider.tsx

```tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from 'shared/types/user';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (response: AuthResponse) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const { user, accessToken } = JSON.parse(storedAuth);
      setUser(user);
      setAccessToken(accessToken);
    }
    setIsLoading(false);
  }, []);

  const login = (response: AuthResponse) => {
    setUser(response.user);
    setAccessToken(response.accessToken);
    localStorage.setItem('auth', JSON.stringify(response));
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

# apps/web/src/components/theme/ThemeProvider.tsx

```tsx
// apps/web/src/components/theme/ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(stored || (prefersDark ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

# apps/web/src/components/theme/ThemeToggle.tsx

```tsx
// apps/web/src/components/theme/ThemeToggle.tsx
'use client';

import { useTheme } from './ThemeProvider';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
}
```

# apps/web/src/contexts/auth.context.tsx

```tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthResponse } from 'shared/types/user';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (response: AuthResponse) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      const { user, accessToken } = JSON.parse(storedAuth);
      setUser(user);
      setAccessToken(accessToken);
    }
    setIsLoading(false);
  }, []);

  const login = (response: AuthResponse) => {
    setUser(response.user);
    setAccessToken(response.accessToken);
    localStorage.setItem('auth', JSON.stringify(response));
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

# docker/postgres/init.sql

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_premium_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create posts table if not exists
CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

```

# docker/postgres/reset.sql

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO public;
GRANT ALL ON SCHEMA public TO afriblog;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_premium_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'draft',
    view_count INTEGER DEFAULT 0,
    author_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

# docker/redis/redis.conf

```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

# package.json

```json
{
  "name": "afriblog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "clean": "pnpm -r exec rimraf dist .next",
    "clean:all": "pnpm -r exec rimraf dist node_modules .next",
    "setup": "pnpm install && pnpm run build:shared",
    "build": "pnpm run clean && pnpm -r run build",
    "build:shared": "cd packages/shared && pnpm run build",
    "dev:api": "cd apps/api && NODE_ENV=development pnpm run dev",
    "dev:web": "cd apps/web && pnpm run dev",
    "dev": "pnpm run setup && concurrently \"pnpm run dev:api\" \"pnpm run dev:web\""
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "concurrently": "^8.2.2",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "rimraf": "^6.0.1",
    "typescript": "^5.0.0"
  }
}

```

# packages/shared/package.json

```json
{
  "name": "shared",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "clean": "rimraf dist && rimraf src/**/*.js",
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "devDependencies": {
    "@types/node": "^22.8.1",
    "rimraf": "^6.0.1",
    "typescript": "^5.6.3"
  }
}

```

# packages/shared/src/index.ts

```ts
export * from './types/user';
export * from './types/post';
```

# packages/shared/src/types/post.ts

```ts
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

```

# packages/shared/src/types/user.ts

```ts
export interface User {
  id: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  isPremiumUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithPassword extends User {
  hashedPassword: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

```

# pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'

```

