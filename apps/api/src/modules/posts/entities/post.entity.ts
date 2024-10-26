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
